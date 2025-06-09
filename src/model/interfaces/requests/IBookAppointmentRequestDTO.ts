import { IVaccine } from "../db/IVaccine";

export interface IBookAppointmentRequestDTO{
    userId: string;
    clinicId: string;
    selectedDate: Date;
    selectedStartTime: string;
    vaccine: IVaccine;
    doseNumber: number;
}