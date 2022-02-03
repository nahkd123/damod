import { Client, Intents } from "discord.js";
import { Filter } from "./filtering/Filter";
import { FilterResult } from "./filtering/FilterResult";
import { FilterResultLevel } from "./filtering/FilterResultLevel";
import { SpamsFilter } from "./filtering/spams/SpamsFilter";

const token = process.env["DISCORD_TOKEN"] || process.env["TOKEN"] || null;
if (token == null) {
    process.stdout.write(`Discord bot token is required! (Set token to DISCORD_TOKEN enviroment variable)\n`);
    process.exit(1);
}

export namespace Logger {

    export function info(msg: string) { process.stdout.write(`info  | ${msg}\n`); }
    export function warn(msg: string) { process.stderr.write(`warn  | ${msg}\n`); }
    export function error(msg: string) { process.stderr.write(`error | ${msg}\n`); }

}

export namespace damod {

    export const Bot = new Client({
        intents: [
            Intents.FLAGS.GUILDS,
            Intents.FLAGS.GUILD_MESSAGES
        ]
    });

    export let ReadyState = false;

    export const Filters: Filter[] = [
        new SpamsFilter()
    ];

    Bot.on("ready", () => {
        Logger.info(`Logged in as ${Bot.user.tag}.`);
        ReadyState = true;
    });

    Bot.on("messageCreate", async msg => {
        let currentResult: FilterResult;
        for (let i = 0; i < Filters.length; i++) {
            const filter = Filters[i];
            const result = await filter.filter(msg);
            if (!currentResult || result.level > currentResult.level) currentResult = result;
        }

        if (currentResult.level >= FilterResultLevel.SERVE) {
            Logger.info("A message that's trapped in a set of filters: " + msg.content);
            if (msg.deletable) await msg.delete();
        }
        if (currentResult.level >= FilterResultLevel.DANGEROUS) {
            let member = await msg.guild.members.fetch(msg.author);
            if (member.bannable) {
                Logger.info("Banning " + msg.author.id + "...");
                member.ban({
                    reason: `Automod: Filter: ${currentResult.reason || "(no reason)"}`
                });
            }
        }
    });

}

damod.Bot.login(token);
Logger.info(`Logging in...`);
