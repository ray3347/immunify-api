import { IVaccine } from "../db/IVaccine";

export interface IVaccineRecommendation{
    vaccine: IVaccine;
    message: string;
    nextDose: number;
}