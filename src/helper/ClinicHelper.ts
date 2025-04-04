import { Injectable, UnauthorizedException } from '@nestjs/common';
import { collection, getDocs, query, where } from 'firebase/firestore';
import { db } from 'src/model/entities/firebase';
import { IClinic } from 'src/model/interfaces/db/IClinic';
import { IClinicFilterRequestDTO } from 'src/model/interfaces/requests/IClinicFilterRequestDTO';

@Injectable()
export class ClinicHelper {
  async getClinic(request: IClinicFilterRequestDTO) {
    try {
      const clinicList: IClinic[] = [];
      const dbData = await getDocs(
        query(
          collection(db, 'MsClinic'),
          where('name', '==', request.filterName ?? ''),
          where('availableVaccines', "array-contains", request.filterVaccineId ?? "")
        ),
      );

      dbData.forEach((x)=>{
        clinicList.push(x.data() as IClinic);
      })

      return clinicList;
    } catch (ex) {
      throw new UnauthorizedException(ex);
    }
  }
}
