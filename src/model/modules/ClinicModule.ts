import { Module } from "@nestjs/common";
import { ClinicHelper } from "../../helper/ClinicHelper";
import { ClinicServices } from "../../services/ClinicServices";

@Module({
    providers: [ClinicHelper],
    controllers: [ClinicServices]
})

export class ClinicModule{}