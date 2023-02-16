"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const discord_js_1 = require("discord.js");
const command_1 = require("../classes/command");
const command_data = new discord_js_1.SlashCommandBuilder()
    .setName("terms")
    .setDMPermission(false)
    .setDescription(`Shows our privacy policy and other terms`);
class default_1 extends command_1.Command {
    constructor() {
        super({
            name: "terms",
            command_data: command_data.toJSON(),
            staff_only: false,
        });
    }
    async run(ctx) {
        const add_token_button = new discord_js_1.ButtonBuilder({
            custom_id: "save_token",
            label: "Save Token",
            style: 1
        });
        return ctx.interaction.reply({
            content: `By entering your token you agree to the terms below:\n- we save only your token until you use ${await ctx.client.getSlashCommandTag("logout")} which will permanently delete your token from our database\n- we make requests using your token to provide the service. We ensure nobody can perform actions using your token\n\n**ALL PROMPTS CAN BE LOGGED AND YOU WILL BE REPORTED TO AUTHORITIES IF YOU GENERATE OR UPLOAD ANY KIND OF ILLEGAL CONTENT**\nCurrently logs are ${ctx.client.config.logs?.enabled ? "en" : "dis"}abled\n\n\nDon't know what the token is?\nCreate a stable horde account here: https://stablehorde.net/register`,
            components: [{ type: 1, components: [add_token_button.toJSON()] }],
            ephemeral: true
        });
    }
}
exports.default = default_1;
