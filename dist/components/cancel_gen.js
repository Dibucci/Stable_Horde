"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const component_1 = require("../classes/component");
class default_1 extends component_1.Component {
    constructor() {
        super({
            name: "cancel_gen",
            staff_only: false,
            regex: /cancel_gen_.+/
        });
    }
    async run(ctx) {
        if (ctx.interaction.message.interaction?.user.id !== ctx.interaction.user.id)
            return ctx.error({ error: "Only the creator of this prompt can cancel the job" });
        const id = ctx.interaction.customId.slice(11);
        await ctx.stable_horde_manager.deleteGenerationRequest(id);
        ctx.interaction.update({
            components: [],
            content: "Generation cancelled",
            embeds: []
        });
    }
}
exports.default = default_1;
