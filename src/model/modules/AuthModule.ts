import { Module } from "@nestjs/common";
import { AuthHelper } from "src/helper/AuthHelper";
import { AuthServices } from "src/services/AuthServices";

@Module({
    providers: [AuthHelper],
    controllers: [AuthServices]
})

export class AuthModule{}