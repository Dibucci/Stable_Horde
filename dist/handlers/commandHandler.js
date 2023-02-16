"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.handleCommands = void 0;
const discord_js_1 = require("discord.js");
const commandContext_1 = require("../classes/commandContext");
async function handleCommands(interaction, client, database, stable_horde_manager) {
    const command = await client.commands.getCommand(interaction).catch(() => null);
    if (!command)
        return;
    const context = new commandContext_1.CommandContext({ interaction, client, database, stable_horde_manager });
    if (!interaction.inGuild())
        return await context.error({
            error: "You can only use commands in guilds",
            ephemeral: true
        });
    if (!interaction.channel)
        return await context.error({
            error: "Please add me to the private thread (by mentioning me) to use commands",
            ephemeral: true
        });
    if (interaction.appPermissions?.missing(client.required_permissions).length)
        return await context.error({
            error: `I require the following permissions to work:\n${(interaction.appPermissions || new discord_js_1.PermissionsBitField).missing(client.required_permissions).join(", ")}`,
            codeblock: false,
            ephemeral: true
        });
    return await command.run(context).catch(console.error);
}
exports.handleCommands = handleCommands;
