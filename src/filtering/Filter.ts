import { Message } from "discord.js";
import { FilterResult } from "./FilterResult";

export abstract class Filter {

    abstract filter(message: Message<boolean>): Promise<FilterResult>;

    static getHighest(results: FilterResult[]) {
        if (results.length == 0) return null;
        let highest = results[0];
        for (let i = 1; i < results.length; i++) if (results[i].level > highest.level) highest = results[i];
        return highest;
    }

}