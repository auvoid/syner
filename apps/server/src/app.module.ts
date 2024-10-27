import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { dataSourceOptions } from './db/data-source';
import { UsersModule } from './modules/users/users.module';
import { PdfModule } from './modules/pdf/pdf.module';

@Module({
  imports: [TypeOrmModule.forRoot(dataSourceOptions), UsersModule, PdfModule],
  controllers: [],
  providers: [],
})
export class AppModule {}
