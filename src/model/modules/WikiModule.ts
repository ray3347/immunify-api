import { Module } from "@nestjs/common";
import { WikiHelper } from "../../helper/WikiHelper";
import { WikiServices } from "../../services/WikiServices";

@Module({
    providers: [WikiHelper],
    controllers: [WikiServices]
})

export class WikiModule{}