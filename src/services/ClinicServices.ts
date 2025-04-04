import {
  Body,
  Controller,
  Get,
  HttpStatus,
  Res,
  UseGuards,
} from '@nestjs/common';
import { ClinicHelper } from 'src/helper/ClinicHelper';
import { AuthGuard } from './AuthGuard';
import { IClinicFilterRequestDTO } from 'src/model/interfaces/requests/IClinicFilterRequestDTO';

@Controller('clinic')
export class ClinicServices {
  constructor(private readonly helper: ClinicHelper) {}

  @UseGuards(AuthGuard)
  @Get('get')
  async get(@Res() response, @Body('dto') dto: IClinicFilterRequestDTO) {
    try {
      const dtoData = await this.helper.getClinic(dto);

      return response.status(HttpStatus.OK).json({
        data: dtoData,
      });
    } catch (ex) {
      return response.status(ex.status).json(ex.response);
    }
  }
}
