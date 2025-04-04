import { Module } from "@nestjs/common";
import { UserHelper } from "src/helper/UserHelper";
import { UserServices } from "src/services/UserServices";

@Module({
    providers: [UserHelper],
    controllers: [UserServices]
})

export class UserModule{}