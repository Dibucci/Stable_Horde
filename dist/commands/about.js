"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const discord_js_1 = require("discord.js");
const command_1 = require("../classes/command");
const command_data = new discord_js_1.SlashCommandBuilder()
    .setName("about")
    .setDMPermission(false)
    .setDescription(`Shows information about this bot`);
class default_1 extends command_1.Command {
    constructor() {
        super({
            name: "about",
            command_data: command_data.toJSON(),
            staff_only: false,
        });
    }
    async run(ctx) {
        const embed = new discord_js_1.EmbedBuilder({
            color: discord_js_1.Colors.Blue,
            title: "Unofficial Stable Horde Discord Bot",
            description: `This Discord Bot was made by Zelda_Fan#0225 with <3\nYou can [view the code on GitHub](https://github.com/ZeldaFan0225/Stable_Horde_Discord) **but there is not guarantee that this instance is unmodified**.\nIf you find any bugs you can [report them on GitHub](https://github.com/ZeldaFan0225/Stable_Horde_Discord/issues).\n\n**Bot Version** \`${ctx.client.bot_version}\`\n**Package Version** \`${ctx.stable_horde_manager.VERSION}\`\n\nThis bot currently is in ${ctx.client.guilds.cache.size} servers`
        });
        return ctx.interaction.reply({
            embeds: [embed],
            ephemeral: true
        });
    }
}
exports.default = default_1;
