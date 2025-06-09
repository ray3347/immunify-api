import { IClinic } from "./IClinic";
import { IDisease } from "./IDisease";

export interface IVaccine{
    id: string;
    vaccineName: string;
    vaccineInformation: string;
    doses: number;
    doseInterval: number;
    informationSummary: string[];
    minimumAge: number;
    availableAt: IClinic[];
    sideEffects: string[];
    price: string;
    image: string;
}