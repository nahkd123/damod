/**
 * Peak the OpenGraph metadata from HTML
 * 
 * Used for detecting scams
 */
export namespace OGPeak {

    const OG_META_REGEX_GLOBAL = /meta\s+property=("|')(og:\w+)\1\s+content=("|')(.+?)\3/g;
    const OG_META_REGEX_LOCAL = /meta\s+property=("|')(og:\w+)\1\s+content=("|')(.+?)\3/;

    export interface Metadata {
        field: string;
        content: string;
    }

    export function findMetadatas(xml: string) {
        if (xml == null) return [];
        return xml.match(OG_META_REGEX_GLOBAL).map(v => {
            const local = v.match(OG_META_REGEX_LOCAL);
            return <Metadata> {
                field: local[2],
                content: local[4]
            }
        });
    }

}