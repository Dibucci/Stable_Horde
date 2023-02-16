"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const component_1 = require("../classes/component");
class default_1 extends component_1.Component {
    constructor() {
        super({
            name: "delete",
            staff_only: false,
            regex: /delete_\d+/
        });
    }
    async run(ctx) {
        if (ctx.interaction.customId.split("_")[1] !== ctx.interaction.user.id)
            return ctx.error({ error: "Only the creator of this prompt can cancel the job" });
        await ctx.interaction.deferUpdate();
        await ctx.interaction.deleteReply();
    }
}
exports.default = default_1;
