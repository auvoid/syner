import {
  Body,
  ConflictException,
  Controller,
  ForbiddenException,
  Get,
  InternalServerErrorException,
  NotFoundException,
  Param,
  Post,
  UnauthorizedException,
} from '@nestjs/common';
import {
  ApiBody,
  ApiExcludeController,
  ApiInternalServerErrorResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiTags,
} from '@nestjs/swagger';
import { wsServer } from '../../main';
import { IdentityService } from '../../services/identity.service';
import { UserSession } from '../../decorators/UserSession';
import { Session, User } from '../../entities';
import { SiopOfferService } from './siopOffer.service';
import { CredOfferService } from './credOffer.service';
import { UsersService } from '../users/users.service';
import { SessionsService } from '../users/sessions.service';
import {
  SiopOfferDTO,
  TokenResponseDTO,
  TokenRequestDTO,
  CredOfferDTO,
  BaseCredOfferDTO,
  SiopRequestDTO,
} from '@repo/dtos';
import { DataSource } from 'typeorm';
import { Serialize } from '../../middlewares/interceptors/serialize.interceptors';
import { PresentationDefinitionV2 } from '@sphereon/pex-models';
import { ContainersService } from '../container/container.service';
import { v4 as uuidv4 } from 'uuid';
import { SignatureService } from './signature.service';
import { CurrentUser } from '../../decorators';
import { validateJsonWebToken } from '../../utils/jwt';
import { EmailService } from '../email/email.service';
@ApiTags('OpenID')
@ApiExcludeController()
@Controller('oid4vc')
export class Oid4vcController {
  constructor(
    private identityService: IdentityService,
    private siopOfferService: SiopOfferService,
    private containersService: ContainersService,
    private signatureService: SignatureService,
    private emailService: EmailService,
  ) {}

  @Serialize(SiopOfferDTO)
  @ApiOkResponse({ type: SiopOfferDTO })
  @Post('/signature-session')
  async newSiopRequest(
    @UserSession() session: Session,
    @CurrentUser() user: User,
    @Body('containerId') containerId: string,
    @Body('accessToken') accessToken: string,
  ) {
    const id = uuidv4();
    let state: string;

    if (!user && !accessToken) throw new UnauthorizedException();
    if (accessToken && containerId) {
      const { payload, expired } = validateJsonWebToken(accessToken);
      if (!payload || expired) throw new UnauthorizedException();
      if (payload.scope !== 'email-signer') throw new UnauthorizedException();
      if (!session.isValid)
        throw new UnauthorizedException(
          'Your IDentity has not been verified yet',
        );
      state = containerId + '::' + session.id + '::' + payload.email;
    } else {
      if (!user.verified)
        throw new UnauthorizedException(
          'Your IDentity has not been verified yet',
        );
      state = containerId + '::' + session.id + '::' + user.email;
    }
    console.log('created state:', state);

    const siopRequest = await (
      await this.identityService.getAdminDid()
    ).rp.createRequest({
      state,
      requestBy: 'reference',
      requestUri: new URL(
        `/api/oid4vc/siop/${id}`,
        process.env.PUBLIC_BASE_URI,
      ).toString(),
      responseType: 'id_token',
    });

    const container = await this.containersService.findById(containerId, {
      ownedBy: true,
    });

    const email = state.split('::').slice(-1)[0];

    const signatureAlreadyExists = await this.signatureService.findOne({
      email,
      container: { id: container.id },
    });

    if (signatureAlreadyExists) {
      throw new ConflictException('Document has already been signed');
    }

    if (
      !container.invitees.includes(email) &&
      container.ownedBy.email !== email
    ) {
      throw new ForbiddenException('You are not allowed to sign this document');
    }

    const offerExists = await this.siopOfferService.findById(id);
    if (offerExists) {
      await this.siopOfferService.findByIdAndUpdate(id, {
        request: siopRequest.request,
      });
    } else {
      await this.siopOfferService.create({
        id,
        request: siopRequest.request,
      });
    }
    return siopRequest;
  }

  @ApiOkResponse({ type: String })
  @ApiNotFoundResponse({ type: NotFoundException })
  @Get('/siop/:id')
  async getSiopRequestById(@Param('id') id: string) {
    const { request } = await this.siopOfferService.findById(id);
    return request;
  }

  @Serialize(TokenResponseDTO)
  @Post('/:identity/token')
  @ApiOkResponse({ type: TokenResponseDTO })
  @ApiNotFoundResponse({ type: NotFoundException })
  @ApiInternalServerErrorResponse({ type: InternalServerErrorException })
  async tokenEndpoint(
    @Param('identity') identity: string,
    @Body() body: TokenRequestDTO,
  ) {
    const { issuer } = await this.identityService.getAdminDid();
    const response = await issuer.createTokenResponse(body);
    return response;
  }

  @ApiBody({ type: SiopRequestDTO })
  @Post('/auth')
  async verifyAuthResponse(@Body() body: SiopRequestDTO) {
    const { id_token: idToken, vp_token: vpToken } = body;
    if (idToken) {
      const { rp } = await this.identityService.getAdminDid();
      await rp.verifyAuthResponse(body);
      const jwt = await rp.validateJwt(idToken);
      const { state } = jwt;
      // session id = where to stream events to with websockets
      // CID used to actually find the container to attach a singature to it
      // idToken = signed JWT proof
      const [containerId, sessionId, email] = (state as string).split('::');
      console.log(state);
      const container = await this.containersService.findById(containerId, {
        signatures: true,
        ownedBy: true,
      });

      const signatureAleadyExists = await this.signatureService.findOne({
        container: { id: containerId },
        email: email,
      });

      if (!signatureAleadyExists) {
        await this.signatureService.create({
          email,
          signature: idToken,
          container,
        });

        const signedContainer = await this.containersService.findById(
          containerId,
          {
            files: true,
            signatures: true,
            ownedBy: true,
          },
        );

        const currentSigners = container.signatures.map(
          (signer) => signer.email,
        );
        const actualSigners = currentSigners.concat([email]).sort().toString();

        const invitedSigners = [...container.invitees, container.ownedBy.email]
          .sort()
          .toString();

        console.log();

        if (actualSigners === invitedSigners) {
          this.emailService.docSignedNotif({
            containerId: container.id,
            emails: container.invitees,
          });
        }

        wsServer.broadcast(sessionId, { container: signedContainer });
      } else {
        wsServer.broadcast(sessionId, { error: 'conflict', container: null });
      }
    }
  }
}
