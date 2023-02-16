"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.handleAutocomplete = void 0;
const autocompleteContext_1 = require("../classes/autocompleteContext");
async function handleAutocomplete(interaction, client, database, stable_horde_manager) {
    const command = await client.commands.getCommand(interaction).catch(() => null);
    if (!command)
        return;
    const context = new autocompleteContext_1.AutocompleteContext({ interaction, client, database, stable_horde_manager });
    if (!interaction.inGuild())
        return await context.error();
    if (!interaction.channel)
        return await context.error();
    return await command.autocomplete(context).catch(console.error);
}
exports.handleAutocomplete = handleAutocomplete;
