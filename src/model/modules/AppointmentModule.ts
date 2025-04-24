import { Module } from "@nestjs/common";
import { AppointmentHelper } from "src/helper/AppointmentHelper";
import { AppointmentServices } from "src/services/AppointmentServices";

@Module({
    providers: [AppointmentHelper],
    controllers: [AppointmentServices]
})

export class AppointmentModule{}