import { Body, Controller, Get, HttpStatus, Post, Query, Res, UseGuards } from '@nestjs/common';
import { AuthGuard } from './AuthGuard';
import { WikiHelper } from '../helper/WikiHelper';
import { IArticle } from '../model/interfaces/db/IArticle';
import { IDisease } from '../model/interfaces/db/IDisease';
import { IVaccine } from '../model/interfaces/db/IVaccine';

@Controller('wiki')
export class WikiServices {
  constructor(private readonly helper: WikiHelper) {}

  @UseGuards(AuthGuard)
  @Get('vaccine')
  async getVaccine(@Res() response, @Query('latitude') latitude?: string, @Query('longtitude') longtitude?: string) {
    try {
      const dtoData = await this.helper.getVaccineList(latitude, longtitude);

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

  @UseGuards(AuthGuard)
  @Post('vaccine/add')
  async addVaccines(@Res() response, @Body('dto') dto: IVaccine[]){
    try{
      const results = await this.helper.addVaccine(dto);
      return response.status(HttpStatus.OK).json({
        data: results
      });
    }
    catch(ex){
        console.log(ex)
        return response.status(ex.status).json(ex.response);
    }
  }

  @UseGuards(AuthGuard)
  @Post('disease/add')
  async addDiseases(@Res() response, @Body('dto') dto: IDisease[]){
    try{
      const results = await this.helper.addDisease(dto);
      return response.status(HttpStatus.OK).json({
        data: results
      });
    }
    catch(ex){
        console.log(ex)
        return response.status(ex.status).json(ex.response);
    }
  }

  @UseGuards(AuthGuard)
  @Get('article')
  async getArticles(@Res() response) {
    try {
      const dtoData = await this.helper.getArticles();

      return response.status(HttpStatus.OK).json({
        data: dtoData,
      });
    } catch (ex) {
      return response.status(ex.status).json(ex.response);
    }
  }

  @UseGuards(AuthGuard)
  @Post('article/add')
  async addArticles(@Res() response, @Body('dto') dto: IArticle[]){
    try{
      const results = await this.helper.addArticles(dto);
      return response.status(HttpStatus.OK).json({
        data: results
      });
    }
    catch(ex){
        console.log(ex)
        return response.status(ex.status).json(ex.response);
    }
  }
}
