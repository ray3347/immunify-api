import { Injectable, UnauthorizedException } from '@nestjs/common';
import { addDoc, collection, getDocs, query, where } from 'firebase/firestore';
import { userAccountTypes } from 'src/constants/types';
import { db } from 'src/model/entities/firebase';
import { IUserAccount } from 'src/model/interfaces/db/IAccount';
import { IArticle } from 'src/model/interfaces/db/IArticle';
import { IDisease } from 'src/model/interfaces/db/IDisease';
import { IVaccine } from 'src/model/interfaces/db/IVaccine';

@Injectable()
export class WikiHelper {
  // get
  async getVaccineList() {
    try {
      // console.log("ANJING")
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
      var crypto = require('crypto');
      var queryList: IVaccine[] = [];
      dto.forEach(async (vax) => {
        const newId = crypto.randomUUID();
        const newVax: IVaccine = {
          id: newId,
          doses: vax.doses,
          doseInterval: vax.doseInterval,
          relatedDiseases: vax.relatedDiseases,
          vaccineInformation: vax.vaccineInformation,
          vaccineName: vax.vaccineName,
          informationSummary: vax.informationSummary,
          availableAt: vax.availableAt,
          minimumAge: vax.minimumAge
        };

        queryList.push(newVax);

        await addDoc(collection(db, 'MsVaccine'), newVax);
      });

      return queryList;
    } catch (ex) {
      throw new UnauthorizedException(ex);
    }
  }

  async addDisease(dto: IDisease[]) {
    try {
      var crypto = require('crypto');
      var queryList: IDisease[] = [];
      dto.forEach(async (ds) => {
        const newId = crypto.randomUUID();
        const newDs: IDisease = {
          id: newId,
          information: ds.information,
          name: ds.name,
          relatedVaccines: ds.relatedVaccines,
        };

        queryList.push(newDs);

        await addDoc(collection(db, 'MsDisease'), newDs);
      });

      return queryList;
    } catch (ex) {
      throw new UnauthorizedException(ex);
    }
  }

  // update
  async updateVaccine(dto: IVaccine) {}

  async updateDisease(dto: IDisease) {}

  // delete

  // article
  async getArticles() {
    try {
      var ArticleList: IArticle[] = [];
      const dbData = await getDocs(collection(db, 'MsArticle'));
      dbData.forEach((x) => {
        ArticleList.push(x.data() as IArticle);
      });

      return ArticleList;
    } catch (ex) {
      throw new UnauthorizedException(ex);
    }
  }

  async addArticles(dto: IArticle[]) {
    try {
      var crypto = require('crypto');
      var queryList: IArticle[] = [];
      dto.forEach(async (a) => {
        const newId = crypto.randomUUID();
        const newArticle: IArticle = {
          id: newId,
          author: a.author,
          content: a.content,
          coverImage: a.coverImage,
          publishDate: new Date(),
          readDuration: a.readDuration,
          title: a.title
        };

        queryList.push(newArticle);

        await addDoc(collection(db, 'MsArticle'), newArticle);
      });

      return queryList;
    } catch (ex) {
      throw new UnauthorizedException(ex);
    }
  }
}
