import { Module } from "@nestjs/common";
import { AuthHelper } from "../../helper/AuthHelper";
import { AuthServices } from "../../services/AuthServices";

@Module({
    providers: [AuthHelper],
    controllers: [AuthServices]
})

export class AuthModule{}