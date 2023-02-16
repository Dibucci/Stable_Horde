"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.handleModals = void 0;
const modalContext_1 = require("../classes/modalContext");
async function handleModals(interaction, client, database, stable_horde_manager) {
    const command = await client.modals.getModal(interaction).catch(() => null);
    if (!command)
        return;
    let context = new modalContext_1.ModalContext({ interaction, client, database, stable_horde_manager });
    return await command.run(context).catch(console.error);
}
exports.handleModals = handleModals;
