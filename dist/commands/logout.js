"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const discord_js_1 = require("discord.js");
const command_1 = require("../classes/command");
const command_data = new discord_js_1.SlashCommandBuilder()
    .setName("logout")
    .setDMPermission(false)
    .setDescription(`Deletes your token from the database`);
class default_1 extends command_1.Command {
    constructor() {
        super({
            name: "logout",
            command_data: command_data.toJSON(),
            staff_only: false,
        });
    }
    async run(ctx) {
        if (!ctx.database)
            return ctx.error({ error: "The database is disabled. This action requires a database." });
        const token = await ctx.client.getUserToken(ctx.interaction.user.id, ctx.database);
        if (!token)
            return ctx.interaction.reply({
                content: "You don't have your stable horde token saved in our database",
                ephemeral: true
            });
        await ctx.database.query("DELETE FROM user_tokens WHERE id=$1", [ctx.interaction.user.id]);
        ctx.interaction.reply({
            content: "Deleted.",
            ephemeral: true
        });
    }
}
exports.default = default_1;
