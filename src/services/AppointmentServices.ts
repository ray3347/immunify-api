import {
    Body,
  Controller,
  Get,
  HttpStatus,
  Param,
  Post,
  Query,
  Res,
  UseGuards,
} from '@nestjs/common';
import { AuthGuard } from './AuthGuard';
import { AppointmentHelper } from '../helper/AppointmentHelper';
import { IBookAppointmentRequestDTO } from '../model/interfaces/requests/IBookAppointmentRequestDTO';

@Controller('appointment')
export class AppointmentServices {
  constructor(private readonly helper: AppointmentHelper) {}

  @UseGuards(AuthGuard)
  @Get('get/available/time')
  async getClinicAvailableTime(
    @Res() response,
    @Query('clinicId') clinicId: string,
    @Query('selectedDate') selectedDate: Date,
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
    @Query('accountId') accountId: string,
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

  @UseGuards(AuthGuard)
  @Post('allocate')
  async allocateAppointment(@Res() response, @Query('clinicId') clinicId: string, @Query('appointmentId') appointmentId: string){
    try {
      const dtoData = await this.helper.allocateAppointment(appointmentId, clinicId);

      return response.status(HttpStatus.OK).json({
        data: "success",
      });
    } catch (ex) {
      return response.status(ex.status).json(ex.response);
    }
  }

  @UseGuards(AuthGuard)
  @Post('complete')
  async completeAppointment(@Res() response, @Query('clinicId') clinicId: string, @Query('appointmentId') appointmentId: string){
    try {
      const dtoData = await this.helper.completeAppointment(appointmentId, clinicId);

      return response.status(HttpStatus.OK).json({
        data: "success",
      });
    } catch (ex) {
      return response.status(ex.status).json(ex.response);
    }
  }

  @UseGuards(AuthGuard)
  @Post('cancel')
  async cancelAppointment(@Res() response, @Query('clinicId') clinicId: string, @Query('appointmentId') appointmentId: string){
    try {
      const dtoData = await this.helper.cancelAppointment(appointmentId, clinicId);

      return response.status(HttpStatus.OK).json({
        data: "success",
      });
    } catch (ex) {
      return response.status(ex.status).json(ex.response);
    }
  }
}
