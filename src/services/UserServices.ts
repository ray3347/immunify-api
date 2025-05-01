import { Body, Controller, Get, HttpStatus, Param, Post, Query, Res, UseGuards } from "@nestjs/common";
import { UserHelper } from "src/helper/UserHelper";
import { IUserLoginData } from "src/model/interfaces/requests/IUserLoginData";
import { AuthGuard } from "./AuthGuard";
import { IUser } from "src/model/interfaces/db/IUser";

@Controller('user')
export class UserServices{
    constructor(private readonly helper : UserHelper){}

    @UseGuards(AuthGuard)
    @Post('register')
    async register(@Res() response, @Body('userData') userData: IUserLoginData){
        try{
            // console.log("babi", userData)
            await this.helper.register(userData);

            return response.status(HttpStatus.OK).json({
                data: "Success"
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
    @Get('get/schedule/upcoming')
    async getUpcomingVaccineSchedule(@Res() response, @Query('accountId') accountId: string){
        try{
            const upcomingScheduleObj = await this.helper.getUpcomingVaccineSchedule(accountId);

            return response.status(HttpStatus.OK).json({
                data: upcomingScheduleObj
            });
        }
        catch(ex){
            console.log(ex)
            return response.status(ex.status).json(ex.response);
        }
    }
}