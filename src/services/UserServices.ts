import { Body, Controller, Get, HttpStatus, Param, Post, Query, Res, UseGuards } from "@nestjs/common";
import { AuthGuard } from "./AuthGuard";
import { UserHelper } from "../helper/UserHelper";
import { IUser, IVaccinationHistory } from "../model/interfaces/db/IUser";
import { IUserLoginData } from "../model/interfaces/requests/IUserLoginData";

@Controller('user')
export class UserServices{
    constructor(private readonly helper : UserHelper){}

    @UseGuards(AuthGuard)
    @Post('register')
    async register(@Res() response, @Body('userData') userData: IUserLoginData){
        try{
            // console.log("babi", userData)
            const obj = await this.helper.register(userData);

            return response.status(HttpStatus.OK).json({
                data: obj
            });
        }
        catch(ex){
            console.log(ex)
            return response.status(ex.status).json(ex.response);
        }
    }

    @UseGuards(AuthGuard)
    @Post('login')
    async login(@Res() response, @Body('userData') userData: IUserLoginData){
        try{
            const loginObj = await this.helper.login(userData);

            return response.status(HttpStatus.OK).json({
                data: loginObj
            });
        }
        catch(ex){
            console.log(ex)
            return response.status(ex.status).json(ex.response);
        }
    }

    @UseGuards(AuthGuard)
    @Post('entity/add')
    async addUser(@Res() response, @Body('accountId') accountId: string, @Body('dto') dto: IUser){
        try{
            const addUserObj = await this.helper.addUser(accountId, dto);

            return response.status(HttpStatus.OK).json({
                data: addUserObj
            });
        }
        catch(ex){
            console.log(ex)
            return response.status(ex.status).json(ex.response);
        }
    }

    @UseGuards(AuthGuard)
    @Post('entity/edit')
    async editUser(@Res() response, @Body('accountId') accountId: string, @Body('dto') dto: IUser){
        try{
            const editUserObj = await this.helper.editUser(accountId, dto);

            return response.status(HttpStatus.OK).json({
                data: editUserObj
            });
        }
        catch(ex){
            console.log(ex)
            return response.status(ex.status).json(ex.response);
        }
    }

    @UseGuards(AuthGuard)
    @Post('entity/delete')
    async deleteUser(@Res() response, @Body('accountId') accountId: string, @Body('userId') userId: string){
        try{
            const deleteUserObj = await this.helper.deleteUser(accountId, userId);

            return response.status(HttpStatus.OK).json({
                data: deleteUserObj
            });
        }
        catch(ex){
            console.log(ex)
            return response.status(ex.status).json(ex.response);
        }
    }

    @UseGuards(AuthGuard)
    @Get('get/appointment/next-dose')
    async getNextVaccineDoseAppointment(@Res() response, @Query('accountId') accountId: string){
        try{
            const upcomingScheduleObj = await this.helper.getNextVaccineDoseAppointment(accountId);

            return response.status(HttpStatus.OK).json({
                data: upcomingScheduleObj
            });
        }
        catch(ex){
            console.log(ex)
            return response.status(ex.status).json(ex.response);
        }
    }

    @UseGuards(AuthGuard)
    @Get('id')
    async getUserById(@Res() response, @Query('accountId') accountId: string){
        try{
            const userObj = await this.helper.getUserById(accountId);

            return response.status(HttpStatus.OK).json({
                data: userObj
            });
        }
        catch(ex){
            console.log(ex)
            return response.status(ex.status).json(ex.response);
        }
    }

    @UseGuards(AuthGuard)
    @Post('history/add')
    async addVaccinationHistory(@Res() response, @Query('accountId') accountId: string, @Query('userId') userId: string, @Body('dto') dto: IVaccinationHistory){
        try{
            const userObj = await this.helper.addVaccinationHistory(accountId,userId, dto);

            return response.status(HttpStatus.OK).json({
                data: userObj
            });
        }
        catch(ex){
            console.log(ex)
            return response.status(ex.status).json(ex.response);
        }
    }

    @UseGuards(AuthGuard)
    @Get('/vaccine/recommendation')
    async getRecommendedVaccines(@Res() response, @Query('accountId') accountId: string, @Query('userId') userId: string){
        try{
            const userObj = await this.helper.getRecommendedVaccines(accountId,userId);

            return response.status(HttpStatus.OK).json({
                data: userObj
            });
        }
        catch(ex){
            console.log(ex)
            return response.status(ex.status).json(ex.response);
        }
    }
}