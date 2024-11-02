import {
  BadRequestException,
  Body,
  ConflictException,
  Controller,
  Get,
  Patch,
  Post,
  Res,
  Headers,
  Query,
  UnauthorizedException,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { SessionsService } from './sessions.service';
import { EmailService } from '../email/email.service';
import { createJsonWebToken, validateJsonWebToken } from '../../utils/jwt';
import { IsAuthenticated } from '../../guards/auth.guard';
import { CurrentUser } from '../../decorators/user';
import { User } from '../../entities/user';
import {
  CreateUserDTO,
  LoginUserDTO,
  UpdateUserDTO,
  UserDTO,
} from '@repo/dtos';
import { Serialize } from '../../interceptors/serialize';
import { ApiCookieAuth } from '@nestjs/swagger';
import { UserSession } from '../../decorators';
import { Session } from '../../entities';
import { errors } from '../../errors';
import type { Response } from 'express';
import { createHmacSignature, verifyHmacSignature } from 'src/utils/hmac';
import { wsServer } from 'src/main';
import axios from 'axios';

@Controller('users')
export class UsersController {
  constructor(
    private userService: UsersService,
    private sessionService: SessionsService,
    private emailService: EmailService,
  ) {}

  @Post()
  @Serialize(UserDTO)
  async createNewUser(@Body() body: CreateUserDTO) {
    const { email, password } = body;
    const _userExists = await this.userService.findOne({ email });
    if (_userExists) throw new BadRequestException('email already exists');

    const user = await this.userService.create({
      email,
      password,
    });
    return user;
  }

  @Get()
  async getUser(@CurrentUser() user: User) {
    if (user) {
      return user;
    } else {
      throw new UnauthorizedException('Not logged in.');
    }
  }

  @Post('/login')
  async loginUser(@Body() body: LoginUserDTO) {
    const { email, password } = body;
    const user = await this.userService.findOne({ email });
    if (!(await user.verifyPassword(password))) throw new BadRequestException();
    return {
      token: createJsonWebToken({ scope: 'auth', userId: user.id }, '1y'),
    };
  }

  @Patch()
  @IsAuthenticated()
  @ApiCookieAuth()
  async patchCurrentUser(
    @CurrentUser() user: User,
    @Body() body: Partial<User>,
  ) {
    return await this.userService.findByIdAndUpdate(user.id, body);
  }

  @Get('/')
  @IsAuthenticated()
  @ApiCookieAuth()
  async getCurrentUser(@CurrentUser() user: User) {
    return {
      ...user,
    };
  }

  @Get('/session')
  async getCurrentSessionInfo(
    @UserSession() session: Session,
    @CurrentUser() user: User,
  ) {
    return { session, user };
  }

  @Get('/idv')
  async attemptVerification(
    @CurrentUser() user: User,
    @UserSession() session: Session,
    @Query('override') override: 'user' | 'session' | null,
  ) {
    let vendorData: string;

    if (user && override !== 'session') {
      vendorData = `user::${session.id}::${user.id}`;
    } else {
      vendorData = `session::${session.id}::null`;
    }
    const veriffBody = {
      verification: {
        vendorData,
      },
    };
    const signature = createHmacSignature(
      veriffBody,
      process.env.VERIFF_HMAC_KEY,
    );
    const { data: veriffSession } = await axios.post(
      'https://stationapi.veriff.com/v1/sessions',
      veriffBody,
      {
        headers: {
          'X-HMAC-SIGNATURE': signature,
          'X-AUTH-CLIENT': process.env.PUBLIC_VERIFF_KEY,
        },
      },
    );
    return veriffSession;
  }

  @Post('/idv')
  async identityVerificationWebhook(
    @Headers('X-HMAC-SIGNATURE') signature: string,
    @Body() body: Record<string, any>,
  ) {
    const stateIdentifier = body.vendorData;
    if (!verifyHmacSignature(body, signature, process.env.VERIFF_HMAC_KEY))
      throw new BadRequestException();
    const [type, sessionId, userId] = stateIdentifier.split('::');
    console.log(type, sessionId, userId);
    console.log(body.data);
    let approved = body.data.verification.decision === 'approved';
    if (type === 'user') {
      await this.userService.findByIdAndUpdate(userId, { verified: approved });
    } else {
      await this.sessionService.findByIdAndUpdate(sessionId, {
        isValid: approved,
      });
    }

    wsServer.broadcast(sessionId, { idVerified: approved });
  }

  @IsAuthenticated()
  @ApiCookieAuth()
  @Post('verify-email')
  async verifyEmailToken(
    @Body() body: { token: string },
    @CurrentUser() user: User,
  ) {
    const { payload, expired } = validateJsonWebToken(body.token);
    if (expired) throw new BadRequestException(errors.users.EXPIRED_TOKEN);
    if (payload.scope !== 'email-verification')
      throw new BadRequestException(errors.users.INVALID_SCOPE);
    if (payload.context !== 'user')
      throw new BadRequestException(errors.users.INVALID_CONTEXT);
    if (payload.userId !== user.id)
      throw new BadRequestException(errors.users.BAD_EMAIL_VERIFICATION);

    await this.userService.findByIdAndUpdate(user.id, {
      emailVerified: true,
    });
  }

  @Serialize(UserDTO)
  async updateUser(@CurrentUser() user: User, @Body() body: UpdateUserDTO) {
    const { password, oldPassword } = body;
    const isValidPassword = await user.verifyPassword(oldPassword);
    if (!isValidPassword) throw new BadRequestException();
    const updated = await this.userService.findByIdAndUpdate(user.id, {
      password,
    });
    return updated;
  }
}
