import { Module } from "@nestjs/common";
import { WikiHelper } from "src/helper/WikiHelper";
import { WikiServices } from "src/services/WikiServices";

@Module({
    providers: [WikiHelper],
    controllers: [WikiServices]
})

export class WikiModule{}