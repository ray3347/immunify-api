import { Injectable, UnauthorizedException } from '@nestjs/common';
import { collection, getDocs, query, where } from 'firebase/firestore';
import { db } from 'src/model/entities/firebase';
import { IClinic, IVaccineStock } from 'src/model/interfaces/db/IClinic';
import { IVaccine } from 'src/model/interfaces/db/IVaccine';
import { IClinicFilterRequestDTO } from 'src/model/interfaces/requests/IClinicFilterRequestDTO';
import { ILocationData } from 'src/model/interfaces/requests/ILocationData';
import { distanceCalculator } from 'src/utilities/distanceCalculator';

@Injectable()
export class ClinicHelper {
  async getClinic(request: IClinicFilterRequestDTO) {
    try {
      const clinicList: IClinic[] = [];
      var userLocationData: ILocationData | null = null;
      if(request.userLangtitude != null && request.userLongtitude != null){
        userLocationData = {
            latitude: parseInt(request.userLangtitude),
            longtitude: parseInt(request.userLongtitude)
        }
      }
      const dbData = await getDocs(
        query(
          collection(db, 'MsClinic'),
          where('name', '==', request.filterName ?? ''),
          where('availableVaccines', "array-contains", request.filterVaccineId ?? "")
        ),
      );

      dbData.forEach((x)=>{
        const clinicData: IClinic = {
            ...x.data() as IClinic,
            distanceFromUser: `${distanceCalculator(userLocationData as ILocationData, {
                latitude: parseInt(x.data().geoLatitude as string),
                longtitude: parseInt(x.data().geoLongtitude as string),
            })} km`
        }

        clinicList.push(clinicData);
      })
      
      if(userLocationData != null){
        return clinicList.sort((a,b)=> distanceCalculator(userLocationData as ILocationData, {
            latitude: parseInt(a.geoLatitude),
            longtitude: parseInt(a.geoLongtitude)
        }) - distanceCalculator(userLocationData as ILocationData, {
            latitude: parseInt(b.geoLatitude),
            longtitude: parseInt(b.geoLongtitude)
        })).slice(0,5);
      }
      return clinicList;
    } catch (ex) {
      throw new UnauthorizedException(ex);
    }
  }

  async modifyClinicVaccineAvailability(clinicId: string, dto: IVaccineStock[]){
    try{

    }
    catch(ex){
      throw new UnauthorizedException(ex);
    }
  }
}
