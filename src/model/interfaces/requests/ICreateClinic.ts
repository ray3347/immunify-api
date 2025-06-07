import { IClinic } from "../db/IClinic";

export interface ICreateClinic{
    hashedUsername: string;
    hashedPassword: string;
    clinic: IClinic;
}