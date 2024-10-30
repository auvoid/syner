import { Module } from '@nestjs/common';
import { ContainersController } from './container.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Container } from '../../entities/container';
import { ContainersService } from './container.service';
import { UploadModule } from '../upload/upload.module';
import { EmailModule } from '../email/email.module';

@Module({
  imports: [TypeOrmModule.forFeature([Container]), UploadModule, EmailModule],
  providers: [ContainersService],
  controllers: [ContainersController],
  exports: [ContainersService],
})
export class ContainerModule {}
