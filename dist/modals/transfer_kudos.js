"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const modal_1 = require("../classes/modal");
class default_1 extends modal_1.Modal {
    constructor() {
        super({
            name: "transfer_kudos",
            staff_only: false,
            regex: /transfer_kudos/
        });
    }
    async run(ctx) {
        if (!ctx.database)
            return ctx.error({ error: "The database is disabled. This action requires a database." });
        const username = (ctx.interaction.components[0]?.components[0]).value;
        const amount = parseInt((ctx.interaction.components[1]?.components[0]).value);
        const token = await ctx.client.getUserToken(ctx.interaction.user.id, ctx.database);
        if (isNaN(amount) || amount <= 0)
            return ctx.error({
                error: "You can only send one or mode kudos"
            });
        if (!username.includes("#"))
            return ctx.error({
                error: "The username must follow the scheme: Name#1234"
            });
        const transfer = await ctx.stable_horde_manager.postKudosTransfer({
            username,
            amount
        }, { token }).catch(e => e);
        if (!transfer?.transferred)
            return ctx.error({ error: "Unable to transfer kudos" });
        ctx.interaction.reply({
            content: `Transferred ${amount} kudos to ${username}`
        });
    }
}
exports.default = default_1;
