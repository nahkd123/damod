export namespace Strings {

    export const CHARS_MAPPING: Record<string, string> = {
        "\u0430": "a", "\u0435": "e", "\u043e": "o", "\u0441": "c",
        "\u0443": "y", "\u0445": "x", "\u0455": "s", "\u0456": "i",
        "\u0458": "j"
    };

    export const REGEX = /[\u0430\u0435\u043e\u0441\u0443\u0445\u0455\u0456\u0458]/g;

    /**
     * Hard normalize the given string by converting it to lower case,
     * then convert Russian characters to ASCII characters (because those
     * bards are smarts)
     * @param str The given string
     * @returns The hard normalized string
     */
    export function hardNormalize(str: string) {
        str = str.toLowerCase();
        return str.replace(REGEX, a => CHARS_MAPPING[a]);
    }

}