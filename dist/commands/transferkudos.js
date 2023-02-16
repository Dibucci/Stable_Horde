"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const discord_js_1 = require("discord.js");
const command_1 = require("../classes/command");
const command_data = new discord_js_1.SlashCommandBuilder()
    .setName("transferkudos")
    .setDMPermission(false)
    .setDescription(`Sends somebody Kudos`)
    .addStringOption(new discord_js_1.SlashCommandStringOption()
    .setName("user")
    .setRequired(true)
    .setDescription("The use to send the kudos to"))
    .addIntegerOption(new discord_js_1.SlashCommandIntegerOption()
    .setName("amount")
    .setRequired(false)
    .setDescription("The amount of kudos to send")
    .setMinValue(1));
class default_1 extends command_1.Command {
    constructor() {
        super({
            name: "transferkudos",
            command_data: command_data.toJSON(),
            staff_only: false,
        });
    }
    async run(ctx) {
        if (!ctx.database)
            return ctx.error({ error: "The database is disabled. This action requires a database." });
        let token = await ctx.client.getUserToken(ctx.interaction.user.id, ctx.database);
        const add_token_button = new discord_js_1.ButtonBuilder({
            custom_id: "save_token",
            label: "Save Token",
            style: 1
        });
        if (!token)
            return ctx.interaction.reply({
                content: `Please add your token before your user details can be shown.\nThis is needed to perform actions on your behalf\n\nBy entering your token you agree to the ${await ctx.client.getSlashCommandTag("terms")}\n\n\nDon't know what the token is?\nCreate a stable horde account here: https://stablehorde.net/register`,
                components: [{ type: 1, components: [add_token_button.toJSON()] }],
                ephemeral: true
            });
        const username = ctx.interaction.options.getString("user", true);
        const amount = ctx.interaction.options.getInteger("amount") ?? 1;
        if (!username.includes("#"))
            return ctx.error({
                error: "The username must follow the scheme: Name#1234"
            });
        if (amount <= 0)
            return ctx.error({
                error: "You can only send one or mode kudos"
            });
        const transfer = await ctx.stable_horde_manager.postKudosTransfer({
            username,
            amount
        }, { token }).catch(e => e);
        if (typeof transfer.name === "string")
            return ctx.error({ error: transfer.name });
        ctx.interaction.reply({
            content: `Transferred ${amount} kudos to ${username}`
        });
    }
}
exports.default = default_1;
