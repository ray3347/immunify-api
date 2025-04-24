import { IAppointment, IUserAppointment } from "./IAppointment";
import { ISchedule } from "./ISchedule";
import { IVaccine } from "./IVaccine";

export interface IUser{
    id: string;
    fullName: string;
    dateOfBirth: Date;
    gender: string;
    scheduledAppointments: IUserAppointment[];
    vaccinationHistory: IVaccinationHistory[];
}

export interface IVaccinationHistory{
    id: string;
    vaccine: IVaccine;
    vaccinationDate: Date;
    doseNumber: number;
    certificateUri: string;
}