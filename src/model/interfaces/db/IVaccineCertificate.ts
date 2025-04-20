import { IVaccine } from "./IVaccine";

export interface IVaccineCertificate{
    id: string;
    vaccine: IVaccine;
    uri: string;
}