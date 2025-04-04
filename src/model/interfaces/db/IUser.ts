import { IAppointment } from "./IAppointment";
import { ISchedule } from "./ISchedule";

export interface IUser{
    id: string;
    // email: string;
    fullName: string;
    activeAppointments: IAppointment[];
    inactiveAppointments: IAppointment[];
    suggestedVaccineSchedules: ISchedule[];
}