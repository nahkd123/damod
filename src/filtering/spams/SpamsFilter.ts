import { Message } from "discord.js";
import { Filter } from "../Filter";
import { FilterResult } from "../FilterResult";
import { FilterResultLevel } from "../FilterResultLevel";
import * as http from "http";
import * as https from "https";
import { OGPeak } from "../../misc/OGPeak";
import { Strings } from "../../misc/Strings";

const URL_REGEX = /(https?:\/\/[A-Za-z0-9\./%]+)/g;
const SCAM_DOMAINS: string[] = []; // TODO: Save domains to database
const SAFE_DOMAINS: Record<string, number> = {};
const SAFE_TIMEOUT = 3 * 60 * 1000; // 3 minutes

export class SpamsFilter extends Filter {

    async filter(message: Message<boolean>): Promise<FilterResult> {
        const urls = message.content.match(URL_REGEX)?.map(v => new URL(v.toLowerCase())) || [];

        const subfilters = await Promise.all(urls.map(async v => {
            if (SCAM_DOMAINS.includes(v.hostname)) return <FilterResult> {
                level: FilterResultLevel.DANGEROUS,
                reason: "Scam domain stored in temporary array"
            };
            if (SAFE_DOMAINS[v.hostname] > Date.now()) return <FilterResult> {
                level: FilterResultLevel.NORMAL,
                reason: `Domain is safe (for ${Math.floor((SAFE_DOMAINS[v.hostname] - Date.now()) / 1000)} seconds)`
            };

            let meta = await sendRequest(v);
            let filters = [findNitroScams(meta)];
            let highest = Filter.getHighest(filters);
            if (highest.level > FilterResultLevel.NORMAL) SCAM_DOMAINS.push(v.hostname);
            else SAFE_DOMAINS[v.hostname] = Date.now() + SAFE_TIMEOUT;
            return highest;
        }));

        subfilters.push({ level: FilterResultLevel.NORMAL, reason: "No suspicious URLs detected" });
        return Filter.getHighest(subfilters);
    }

}

function findNitroScams(og: OGPeak.Metadata[]): FilterResult {
    const WORDS = ["discord", "subscription", "nitro", "gifted"];
    const CONFIDENT_THRESHOLD = 3;
    
    let confidentLevel = 0;
    og.forEach(meta => {
        let words = meta.content.split(" ").map(Strings.hardNormalize);
        words.forEach(word => { if (WORDS.includes(word)) confidentLevel++; });
    });

    return {
        level:
            confidentLevel >= CONFIDENT_THRESHOLD? FilterResultLevel.DANGEROUS :
            FilterResultLevel.NORMAL,
        occurences: confidentLevel,
        reason: `Found ${confidentLevel} occurences`
    };
}

function sendRequest(url: URL) {
    const protocol = url.protocol == "https:"? https : http;
    return new Promise<OGPeak.Metadata[]>((resolve, reject) => {
        let req = protocol.request(url, (res) => {
            const chunks: Buffer[] = [];
            
            res.on("data", chunk => { chunks.push(chunk); });
            res.on("end", () => {
                let xml = Buffer.concat(chunks).toString("utf-8");
                resolve(OGPeak.findMetadatas(xml));
            });
            res.on("error", reject);
        });
        req.end();
        req.on("error", reject);
    });
}
