import { IVaccine } from "./IVaccine";

export interface IClinic{
    id: string;
    name: string;
    address: string;
    geoLatitude: string;
    geoLongtitude: string;
    availableVaccines: IVaccine[];
    distanceFromUser: string | null;
}