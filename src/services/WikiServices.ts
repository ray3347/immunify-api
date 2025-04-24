import { Body, Controller, Get, HttpStatus, Post, Res, UseGuards } from '@nestjs/common';
import { WikiHelper } from 'src/helper/WikiHelper';
import { AuthGuard } from './AuthGuard';
import { IVaccine } from 'src/model/interfaces/db/IVaccine';
import { IDisease } from 'src/model/interfaces/db/IDisease';
import { IArticle } from 'src/model/interfaces/db/IArticle';

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
