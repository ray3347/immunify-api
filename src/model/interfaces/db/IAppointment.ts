import { IClinic } from "./IClinic";
import { ISchedule } from "./ISchedule";
import { IUser } from "./IUser";

export interface IAppointment{
    id: string;
    user: IUser;
    clinic: IClinic;
    scheduledDate: Date;
}