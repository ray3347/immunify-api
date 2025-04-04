import { IVaccine } from "./IVaccine";

export interface IDisease{
    id: string;
    name: string;
    information: string;
    relatedVaccines: IVaccine[];
}