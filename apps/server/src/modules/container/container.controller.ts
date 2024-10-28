import {
  BadRequestException,
  Body,
  ConflictException,
  Controller,
  Get,
  NotFoundException,
  Patch,
  Post,
  Res,
} from '@nestjs/common';
import { ContainersService } from './container.service';
import { IsAuthenticated } from '../../guards/auth.guard';
import { User } from '../../entities/user';
import { CurrentUser } from '../../decorators';
import { CreateContainerDTO } from '@repo/dtos';
import { FilesService } from '../upload/files.service';

@Controller('container')
export class ContainersController {
  constructor(
    private readonly containersService: ContainersService,
    private readonly filesService: FilesService,
  ) {}

  @Post()
  @IsAuthenticated()
  async createNewSignatureContainer(
    @CurrentUser() user: User,
    @Body() body: CreateContainerDTO,
  ) {
    const { fileId } = body;
    const file = await this.filesService.findById(fileId, { user: true });
    if (!file || !file.user || (!file && file.user.id !== user.id))
      throw new NotFoundException();
    const container = this.containersService.create({
      invitees: body.invitees,
      files: [file],
      ownedBy: user,
    });

    return container;
  }
}
