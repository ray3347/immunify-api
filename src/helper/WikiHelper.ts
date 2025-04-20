import { Injectable, UnauthorizedException } from '@nestjs/common';
import { addDoc, collection, getDocs, query, where } from 'firebase/firestore';
import { userAccountTypes } from 'src/constants/types';
import { db } from 'src/model/entities/firebase';
import { IUserAccount } from 'src/model/interfaces/db/IAccount';
import { IDisease } from 'src/model/interfaces/db/IDisease';
import { IVaccine } from 'src/model/interfaces/db/IVaccine';

@Injectable()
export class WikiHelper {
  // get
  async getVaccineList() {
    try {
      var vaccineList: IVaccine[] = [];
      const dbData = await getDocs(collection(db, 'MsVaccine'));
      dbData.forEach((x) => {
        vaccineList.push(x.data() as IVaccine);
      });

      return vaccineList;
    } catch (ex) {
      throw new UnauthorizedException(ex);
    }
  }

  async getDiseaseList() {
    try {
      var diseaseList: IDisease[] = [];
      const dbData = await getDocs(collection(db, 'MsDisease'));
      dbData.forEach((x) => {
        diseaseList.push(x.data() as IDisease);
      });
      return diseaseList;
    } catch (ex) {
      throw new UnauthorizedException(ex);
    }
  }

  // add
  async addVaccine(dto: IVaccine[]) {
    try {
      // const dbData = await getDocs(
      //     query(
      //       collection(db, 'MsAccount'),
      //       where('email', '==', dto.hashedUsername),
      //       // where('secretKey', '==', dto.hashedPassword),
      //     ),
      //   );

      //   if(dbData.size > 0){
      //     throw new UnauthorizedException("User Account Already Exists");
      //   }
      //   else{
      var crypto = require('crypto');
      var queryList:IVaccine[] = [];
      dto.forEach(async (vax) => {
        const newId = crypto.randomUUID();
        const newVax : IVaccine = {
            id: newId,
            doses: vax.doses,
            doseInterval: vax.doseInterval,
            relatedDiseases: vax.relatedDiseases,
            vaccineInformation: vax.vaccineInformation,
            vaccineName: vax.vaccineName
        }

        queryList.push(newVax);
        
      await addDoc(collection(db, 'MsVaccine'), newVax);
      })
      
      return queryList;
      //   }
    } catch (ex) {
      throw new UnauthorizedException(ex);
    }
  }

  async addDisease(dto: IDisease) {}

  // update
  async updateVaccine(dto: IVaccine) {}

  async updateDisease(dto: IDisease) {}

  // delete
}
