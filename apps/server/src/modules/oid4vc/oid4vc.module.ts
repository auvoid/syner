import { forwardRef, Module } from '@nestjs/common';
import { Oid4vcController } from './oid4vc.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CredOffer, Signature, SiopOffer } from '../../entities';
import { SiopOfferService } from './siopOffer.service';
import { CredOfferService } from './credOffer.service';
import { UsersModule } from '../users/users.module';
import { ContainerModule } from '../container/container.module';
import { SignatureService } from './signature.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([SiopOffer, CredOffer, Signature]),
    forwardRef(() => UsersModule),
    forwardRef(() => ContainerModule),
  ],
  controllers: [Oid4vcController],
  providers: [SiopOfferService, CredOfferService, SignatureService],
  exports: [SiopOfferService, CredOfferService, SignatureService],
})
export class Oid4vcModule {}
