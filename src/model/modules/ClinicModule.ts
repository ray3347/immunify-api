import { Module } from "@nestjs/common";
import { ClinicHelper } from "src/helper/ClinicHelper";
import { ClinicServices } from "src/services/ClinicServices";

@Module({
    providers: [ClinicHelper],
    controllers: [ClinicServices]
})

export class ClinicModule{}