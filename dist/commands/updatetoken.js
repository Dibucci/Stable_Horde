"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const discord_js_1 = require("discord.js");
const command_1 = require("../classes/command");
const command_data = new discord_js_1.SlashCommandBuilder()
    .setName("updatetoken")
    .setDMPermission(false)
    .setDescription(`Updates your token in the database`);
class default_1 extends command_1.Command {
    constructor() {
        super({
            name: "updatetoken",
            command_data: command_data.toJSON(),
            staff_only: false,
        });
    }
    async run(ctx) {
        if (!ctx.database)
            return ctx.error({ error: "The database is disabled. This action requires a database." });
        const add_token_button = new discord_js_1.ButtonBuilder({
            custom_id: "save_token",
            label: "Save Token",
            style: 1
        });
        return ctx.interaction.reply({
            content: `Update your token by pressing the button below.\nThis is needed to perform actions on your behalf\n\nBy entering your token you agree to the ${await ctx.client.getSlashCommandTag("terms")}\n**You agree to not upload or generate any illegal content**${!ctx.client.config.advanced?.encrypt_token ? "\n\n**The bot is configured not to save your token in an encrypted form!**" : ""}\n\n\nDon't know what the token is?\nCreate a stable horde account here: https://stablehorde.net/register`,
            components: [{ type: 1, components: [add_token_button.toJSON()] }],
            ephemeral: true
        });
    }
}
exports.default = default_1;
