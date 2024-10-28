import { Module } from '@nestjs/common';
import { ContainersController } from './container.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Container } from '../../entities/container';
import { ContainersService } from './container.service';
import { UploadModule } from '../upload/upload.module';

@Module({
  imports: [TypeOrmModule.forFeature([Container]), UploadModule],
  providers: [ContainersService],
  controllers: [ContainersController],
})
export class ContainerModule {}
