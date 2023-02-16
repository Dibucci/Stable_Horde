"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.handleComponents = void 0;
const discord_js_1 = require("discord.js");
const componentContext_1 = require("../classes/componentContext");
async function handleComponents(interaction, client, database, stable_horde_manager) {
    const command = await client.components.getComponent(interaction).catch(() => null);
    if (!command)
        return;
    if (!interaction.inCachedGuild())
        return;
    let context;
    if (interaction.componentType === discord_js_1.ComponentType.Button)
        context = new componentContext_1.ComponentContext({ interaction, client, database, stable_horde_manager });
    else {
        switch (interaction.componentType) {
            case discord_js_1.ComponentType.StringSelect:
                context = new componentContext_1.ComponentContext({ interaction, client, database, stable_horde_manager });
                break;
            case discord_js_1.ComponentType.ChannelSelect:
                context = new componentContext_1.ComponentContext({ interaction, client, database, stable_horde_manager });
                break;
            case discord_js_1.ComponentType.MentionableSelect:
                context = new componentContext_1.ComponentContext({ interaction, client, database, stable_horde_manager });
                break;
            case discord_js_1.ComponentType.RoleSelect:
                context = new componentContext_1.ComponentContext({ interaction, client, database, stable_horde_manager });
                break;
            case discord_js_1.ComponentType.UserSelect:
                context = new componentContext_1.ComponentContext({ interaction, client, database, stable_horde_manager });
                break;
        }
    }
    if (interaction.appPermissions?.missing(client.required_permissions).length)
        return await context.error({
            error: `I require the following permissions to work:\n${interaction.appPermissions?.missing(client.required_permissions).join(", ")}`,
            codeblock: false,
            ephemeral: true
        });
    return await command.run(context).catch(console.error);
}
exports.handleComponents = handleComponents;
