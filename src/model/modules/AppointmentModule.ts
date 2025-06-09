import { Module } from "@nestjs/common";
import { ClinicHelper } from "../../helper/ClinicHelper";
import { AppointmentHelper } from "../../helper/AppointmentHelper";
import { AppointmentServices } from "../../services/AppointmentServices";

@Module({
    providers: [AppointmentHelper, ClinicHelper],
    controllers: [AppointmentServices]
})

export class AppointmentModule{}