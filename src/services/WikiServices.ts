import { Controller, Get, HttpStatus, Res, UseGuards } from '@nestjs/common';
import { WikiHelper } from 'src/helper/WikiHelper';
import { AuthGuard } from './AuthGuard';

@Controller('wiki')
export class WikiServices {
  constructor(private readonly helper: WikiHelper) {}

  @UseGuards(AuthGuard)
  @Get('vaccine')
  async getVaccine(@Res() response) {
    try {
      const dtoData = await this.helper.getVaccineList();

      return response.status(HttpStatus.OK).json({
        data: dtoData,
      });
    } catch (ex) {
      return response.status(ex.status).json(ex.response);
    }
  }

  @UseGuards(AuthGuard)
  @Get('disease')
  async getDisease(@Res() response) {
    try {
      const dtoData = await this.helper.getDiseaseList();

      return response.status(HttpStatus.OK).json({
        data: dtoData,
      });
    } catch (ex) {
      return response.status(ex.status).json(ex.response);
    }
  }
}
