import { IDisease } from "./IDisease";

export interface IVaccine{
    id: string;
    vaccineName: string;
    vaccineInformation: string;
    relatedDiseases: IDisease[];
}