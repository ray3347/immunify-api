import { IDisease } from "./IDisease";
import { IVaccine } from "./IVaccine";

export interface ISchedule{
    id: string;
    scheduledDate: Date;
    vaccine: IVaccine;
}