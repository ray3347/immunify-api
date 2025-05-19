import { IClinic } from "./IClinic";
import { ISchedule } from "./ISchedule";
import { IUser } from "./IUser";
import { IVaccine } from "./IVaccine";

export interface IAppointment{
    id: string;
    // user: IUser;
    // clinic: IClinic;
    scheduledDate: Date;
    scheduledTime: string;
    scheduledEndTime: string;
    status: string;
    // isComplete: boolean;
    // isCanceled: boolean;
    // isAllocated: boolean;
    vaccine: IVaccine;
}

export interface IUserAppointment extends IAppointment{
    clinic: IClinic;
}

export interface IClinicAppointment extends IAppointment{
    user: IUser;
}