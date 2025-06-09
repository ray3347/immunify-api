import { Module } from "@nestjs/common";
import { AppointmentHelper } from "src/helper/AppointmentHelper";
import { AppointmentServices } from "src/services/AppointmentServices";
import { ClinicHelper } from "../../helper/ClinicHelper";

@Module({
    providers: [AppointmentHelper, ClinicHelper],
    controllers: [AppointmentServices]
})

export class AppointmentModule{}