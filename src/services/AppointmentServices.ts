import {
    Body,
  Controller,
  Get,
  HttpStatus,
  Param,
  Post,
  Res,
  UseGuards,
} from '@nestjs/common';
import { AppointmentHelper } from 'src/helper/AppointmentHelper';
import { AuthGuard } from './AuthGuard';
import { IBookAppointmentRequestDTO } from 'src/model/interfaces/requests/IBookAppointmentRequestDTO';

@Controller('appointment')
export class AppointmentServices {
  constructor(private readonly helper: AppointmentHelper) {}

  @UseGuards(AuthGuard)
  @Get('get/available/time')
  async getClinicAvailableTime(
    @Res() response,
    @Param('clinicId') clinicId: string,
    @Param('selectedDate') selectedDate: Date,
  ) {
    try {
      const dtoData = await this.helper.getClinicAvailableTime(
        clinicId,
        selectedDate,
      );

      return response.status(HttpStatus.OK).json({
        data: dtoData,
      });
    } catch (ex) {
      return response.status(ex.status).json(ex.response);
    }
  }

  @UseGuards(AuthGuard)
  @Post('book')
  async bookAppointment(
    @Res() response,
    @Body('accountId') accountId: string,
    @Body('dto') dto: IBookAppointmentRequestDTO
  ) {
    try {
      const dtoData = await this.helper.bookAppointment(accountId, dto);

      return response.status(HttpStatus.OK).json({
        data: dtoData,
      });
    } catch (ex) {
      return response.status(ex.status).json(ex.response);
    }
  }
}
