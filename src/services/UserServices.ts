import { Body, Controller, Get, HttpStatus, Param, Post, Res, UseGuards } from "@nestjs/common";
import { UserHelper } from "src/helper/UserHelper";
import { IUserLoginData } from "src/model/interfaces/requests/IUserLoginData";
import { AuthGuard } from "./AuthGuard";

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
}