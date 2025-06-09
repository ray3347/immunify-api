import { Module } from "@nestjs/common";
import { UserHelper } from "../../helper/UserHelper";
import { UserServices } from "../../services/UserServices";

@Module({
    providers: [UserHelper],
    controllers: [UserServices]
})

export class UserModule{}