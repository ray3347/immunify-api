import { Injectable, UnauthorizedException } from "@nestjs/common";
import { collection, getDocs } from "firebase/firestore";
import { db } from "src/model/entities/firebase";
import { IDisease } from "src/model/interfaces/db/IDisease";
import { IVaccine } from "src/model/interfaces/db/IVaccine";

@Injectable()
export class WikiHelper{
    // get
    async getVaccineList(){
        try{
            var vaccineList:IVaccine[] = [];
            const dbData = await getDocs(collection(db, "MsVaccine"));
            dbData.forEach((x)=>{
                vaccineList.push(x.data() as IVaccine);
            })

            return vaccineList;
        }
        catch(ex){
            throw new UnauthorizedException(ex)
        }
    }

    async getDiseaseList(){
        try{
            var diseaseList:IDisease[] = [];
            const dbData = await getDocs(collection(db, "MsDisease"));
            dbData.forEach((x)=>{
                diseaseList.push(x.data() as IDisease);
            })
            return diseaseList;
        }
        catch(ex){
            throw new UnauthorizedException(ex)
        }
    }

    // add
    async addVaccine(dto: IVaccine){

    }

    async addDisease(dto: IDisease){

    }

    // update
    async updateVaccine(dto: IVaccine){

    }

    async updateDisease(dto: IDisease){

    }
    
    // delete
}
