export enum FilterResultLevel {

    /**
     * The basic filter level. Any message that passed the filter
     * will have this level
     */
    NORMAL = 0,

    /**
     * Filter level for messages that's questionable
     */
    SERVE = 1,

    /**
     * Filter level for dangerous messages. Must be deleted immediately
     */
    DANGEROUS = 2

}