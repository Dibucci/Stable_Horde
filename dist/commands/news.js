"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const discord_js_1 = require("discord.js");
const command_1 = require("../classes/command");
const command_data = new discord_js_1.SlashCommandBuilder()
    .setName("news")
    .setDMPermission(false)
    .setDescription(`Shows ours news of stable horde`);
class default_1 extends command_1.Command {
    constructor() {
        super({
            name: "news",
            command_data: command_data.toJSON(),
            staff_only: false,
        });
    }
    async run(ctx) {
        const news = await ctx.stable_horde_manager.getNews();
        const embeds = news.slice(0, 3).map(n => new discord_js_1.EmbedBuilder({
            title: n.importance,
            description: n.newspiece,
            timestamp: new Date(n.date_published),
            color: discord_js_1.Colors.Red
        }).toJSON());
        ctx.interaction.reply({
            content: `Stable Horde News (3/${news.length})`,
            embeds,
            ephemeral: true
        });
    }
}
exports.default = default_1;
