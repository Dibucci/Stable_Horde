"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.handleContexts = void 0;
const discord_js_1 = require("discord.js");
const contextContext_1 = require("../classes/contextContext");
async function handleContexts(interaction, client, database, stable_horde_manager) {
    const command = await client.contexts.getContext(interaction).catch(() => null);
    if (!command)
        return;
    let context;
    if (interaction.commandType === discord_js_1.ApplicationCommandType.User)
        context = new contextContext_1.ContextContext({ interaction, client, database, stable_horde_manager });
    else
        context = new contextContext_1.ContextContext({ interaction, client, database, stable_horde_manager });
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
            error: `I require the following permissions to work:\n${interaction.appPermissions?.missing(client.required_permissions).join(", ")}`,
            codeblock: false,
            ephemeral: true
        });
    return await command.run(context).catch(console.error);
}
exports.handleContexts = handleContexts;
