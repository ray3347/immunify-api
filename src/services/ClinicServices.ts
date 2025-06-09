import {
  Body,
  Controller,
  Get,
  HttpStatus,
  Post,
  Query,
  Res,
  UseGuards,
} from '@nestjs/common';
import { AuthGuard } from './AuthGuard';
import { IClinic, IVaccineStock } from '../model/interfaces/db/IClinic';
import { IUserLoginData } from '../model/interfaces/requests/IUserLoginData';
import { ICreateClinic } from '../model/interfaces/requests/ICreateClinic';
import { ClinicHelper } from '../helper/ClinicHelper';

@Controller('clinic')
export class ClinicServices {
  constructor(private readonly helper: ClinicHelper) {}

  // @UseGuards(AuthGuard)
  // @Post('details/location')
  // async get(@Res() response, @Body('dto') dto: IClinicFilterRequestDTO) {
  //   try {
  //     const dtoData = await this.helper.getClinicWithLocation(dto);

  //     return response.status(HttpStatus.OK).json({
  //       data: dtoData,
  //     });
  //   } catch (ex) {
  //     return response.status(ex.status).json(ex.response);
  //   }
  // }

  @UseGuards(AuthGuard)
  @Post('add')
  async add(@Res() response, @Body('dto') dto: ICreateClinic) {
    try {
      const dtoData = await this.helper.addClinic(dto);

      return response.status(HttpStatus.OK).json({
        data: dtoData,
      });
    } catch (ex) {
      return response.status(ex.status).json(ex.response);
    }
  }

  @UseGuards(AuthGuard)
  @Post('bind')
  async bindClinicAccount(
    @Res() response,
    @Query('accountId') accountId: string,
    @Body('dto') dto: IClinic,
  ) {
    try {
      const dtoData = await this.helper.bindClinicAccount(accountId, dto);

      return response.status(HttpStatus.OK).json({
        data: dtoData,
      });
    } catch (ex) {
      return response.status(ex.status).json(ex.response);
    }
  }

  @UseGuards(AuthGuard)
  @Post('login')
  async login(@Res() response, @Body('userData') userData: IUserLoginData) {
    try {
      const dtoData = await this.helper.clinicLogin(userData);

      return response.status(HttpStatus.OK).json({
        data: dtoData,
      });
    } catch (ex) {
      return response.status(ex.status).json(ex.response);
    }
  }

  @UseGuards(AuthGuard)
  @Post('vaccine-stock/modify')
  async modifyVaccineStock(
    @Res() response,
    @Query('accountId') accountId: string,
    @Body('vaccineStock') vaccineStock: IVaccineStock,
  ) {
    try {
      const dtoData = await this.helper.modifyClinicVaccineAvailability(
        accountId,
        vaccineStock,
      );

      return response.status(HttpStatus.OK).json({
        data: dtoData,
      });
    } catch (ex) {
      return response.status(ex.status).json(ex.response);
    }
  }

  @UseGuards(AuthGuard)
  @Get('id')
  async getUserById(@Res() response, @Query('accountId') accountId: string) {
    try {
      const userObj = await this.helper.getClinicById(accountId);

      return response.status(HttpStatus.OK).json({
        data: userObj,
      });
    } catch (ex) {
      console.log(ex);
      return response.status(ex.status).json(ex.response);
    }
  }
}
