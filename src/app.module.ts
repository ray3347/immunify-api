import { Module } from '@nestjs/common';
import { AuthModule } from './model/modules/AuthModule';
import { UserModule } from './model/modules/UserModule';
import { WikiModule } from './model/modules/WikiModule';
import { ClinicModule } from './model/modules/ClinicModule';

@Module({
  imports: [AuthModule, UserModule, WikiModule, ClinicModule]
})
export class AppModule {}
