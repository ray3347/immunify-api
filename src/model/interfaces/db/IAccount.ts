import { IAppointment, IClinicAppointment } from "./IAppointment";
import { IClinic } from "./IClinic";
import { IUser } from "./IUser";

export interface IAccount{
    id: string;
    email: string;
    type: string;
    secretKey: string;
}

export interface IUserAccount extends IAccount{
    userList: IUser[];
}

export interface IClinicAccount extends IAccount{
    clinic: IClinic;
}