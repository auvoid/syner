import {
  BadRequestException,
  Body,
  ConflictException,
  Controller,
  Get,
  NotFoundException,
  Param,
  Patch,
  Post,
  Res,
  UnauthorizedException,
} from '@nestjs/common';
import { ContainersService } from './container.service';
import { IsAuthenticated } from '../../guards/auth.guard';
import { User } from '../../entities/user';
import { CurrentUser } from '../../decorators';
import { CreateContainerDTO, ContainerDTO } from '@repo/dtos';
import { FilesService } from '../upload/files.service';
import { Serialize } from 'src/interceptors/serialize';
import { validateJsonWebToken } from '../../utils/jwt';
import { EmailService } from '../email/email.service';

@Controller('container')
export class ContainersController {
  constructor(
    private readonly containersService: ContainersService,
    private readonly filesService: FilesService,
    private readonly emailService: EmailService,
  ) {}

  @Get()
  @IsAuthenticated()
  async getAllContainers(@CurrentUser() user: User) {
    const containers = await this.containersService.findMany(
      {
        ownedBy: { id: user.id },
      },
      {
        files: true,
        signatures: true,
      },
    );
    return containers;
  }

  @Get(':id')
  @IsAuthenticated()
  async getContainerById(@Param('id') id: string, @CurrentUser() user: User) {
    const container = await this.containersService.findById(id, {
      ownedBy: true,
      signatures: true,
      files: true,
    });
    if (container.ownedBy.id !== user.id) throw new UnauthorizedException();
    return container;
  }

  @Post()
  @Serialize(ContainerDTO)
  @IsAuthenticated()
  async createNewSignatureContainer(
    @CurrentUser() user: User,
    @Body() body: CreateContainerDTO,
  ) {
    const { fileId } = body;
    const file = await this.filesService.findById(fileId, { user: true });
    if (!file || !file.user || (!file && file.user.id !== user.id))
      throw new NotFoundException();
    const container = await this.containersService.create({
      name: body.name,
      invitees: body.invitees,
      files: [file],
      ownedBy: user,
    });

    container.invitees.forEach(async (invitee) => {
      await this.emailService.sendSignerInvite({
        containerId: container.id,
        email: invitee,
      });
    });

    return container;
  }

  @Post('/external-signer')
  async tokenToDoc(@Body() body: { token: string }) {
    const { payload, expired } = validateJsonWebToken<{
      containerId: string;
      email: string;
    } | null>(body.token);
    if (expired) {
      throw new Error('Token expired');
    }
    const container = await this.containersService.findById(
      payload.containerId,
      {
        files: true,
        signatures: true,
        ownedBy: true,
      },
    );
    if (!container.invitees.includes(payload.email)) {
      throw new Error('You are not suppsed to be here');
    }
    return container;
  }
}
