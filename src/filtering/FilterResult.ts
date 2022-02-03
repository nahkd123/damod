import { FilterResultLevel } from "./FilterResultLevel";

export interface FilterResult {

    level: FilterResultLevel;
    reason?: string;
    occurences?: number;

}
