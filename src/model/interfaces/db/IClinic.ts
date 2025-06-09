import { IClinicAppointment } from "./IAppointment";
import { IReview } from "./IReview";
import { IVaccine } from "./IVaccine";

export interface IClinic{
    id: string;
    name: string;
    address: string;
    geoLatitude: string;
    geoLongtitude: string;
    availableVaccines: IVaccineStock[];
    distanceFromUser: string | null;
    websiteURL: string;
    googleMapsURL: string;
    reviews: IReview[];
    openTime: string;
    closeTime: string;
    scheduledAppointments: IClinicAppointment[];
    image: string;
}

export interface IVaccineStock{
    id: string;
    vaccine: IVaccine;
    stock: number;
}