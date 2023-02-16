"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const component_1 = require("../classes/component");
class default_1 extends component_1.Component {
    constructor() {
        super({
            name: "cancel_inter",
            staff_only: false,
            regex: /cancel_inter_.+/
        });
    }
    async run(ctx) {
        if (ctx.interaction.message.interaction?.user.id !== ctx.interaction.user.id)
            return ctx.error({ error: "Only the author of this command can cancel the job" });
        const id = ctx.interaction.customId.slice(13);
        await ctx.stable_horde_manager.deleteInterrogationRequest(id);
        ctx.interaction.deferUpdate();
    }
}
exports.default = default_1;
