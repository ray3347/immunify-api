import { Controller, Get, HttpStatus, Query, Res } from "@nestjs/common";
import { AuthHelper } from "../helper/AuthHelper";

@Controller('auth')
export class AuthServices{
    constructor(private readonly helper: AuthHelper){}

    @Get('token')
    async getToken(@Res() response, @Query('token') token: string) : Promise<string>{
        try{
            const data = await this.helper.getToken(token);

            return response.status(HttpStatus.OK).json({
                data: data
            });
        }
        catch(ex){
            return response.status(ex.status).json(ex.response);
        }
    }
}