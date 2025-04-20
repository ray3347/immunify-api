import { IAppointment } from "./IAppointment";
import { ISchedule } from "./ISchedule";
import { IVaccineCertificate } from "./IVaccineCertificate";

export interface IUser{
    id: string;
    // email: string;
    fullName: string;
    age: number;
    gender: string;
    activeAppointments: IAppointment[];
    inactiveAppointments: IAppointment[];
    suggestedVaccineSchedules: ISchedule[];
    vaccineCertificates: IVaccineCertificate[];
}