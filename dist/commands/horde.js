"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const discord_js_1 = require("discord.js");
const command_1 = require("../classes/command");
const command_data = new discord_js_1.SlashCommandBuilder()
    .setName("horde")
    .setDMPermission(false)
    .setDescription(`Shows info on stable horde`);
class default_1 extends command_1.Command {
    constructor() {
        super({
            name: "horde",
            command_data: command_data.toJSON(),
            staff_only: false,
        });
    }
    async run(ctx) {
        const news = await ctx.stable_horde_manager.getNews();
        const article = news[0];
        const embed = new discord_js_1.EmbedBuilder({
            color: discord_js_1.Colors.Blue,
            title: "Stable Horde",
            //TODO: Add more info in the future
            description: `The [Stable Horde](https://stablehorde.net) is a crowdsourced service providing Stable Diffusion for everyone.\nIt is free, open sourced, and relies on volunteer processing power.\n\nIf you enjoy using it, please consider [onboarding your own PC as a worker](https://github.com/db0/AI-Horde-Worker#readme) or supporting its development [on patreon](https://www.patreon.com/db0)${article ? `\n\n**Latest News**\n${article.newspiece}\n<t:${Math.round(Number(new Date(article.date_published)) / 1000)}>` : ""}`
        });
        return ctx.interaction.reply({
            embeds: [embed],
            ephemeral: true
        });
    }
}
exports.default = default_1;
