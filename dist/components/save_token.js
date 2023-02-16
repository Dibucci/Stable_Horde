"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const discord_js_1 = require("discord.js");
const component_1 = require("../classes/component");
class default_1 extends component_1.Component {
    constructor() {
        super({
            name: "save_token",
            staff_only: false,
            regex: /save_token/
        });
    }
    async run(ctx) {
        if (!ctx.database)
            return ctx.error({ error: "The database is disabled. This action requires a database." });
        const token = await ctx.client.getUserToken(ctx.interaction.user.id, ctx.database);
        const modal = new discord_js_1.ModalBuilder({
            title: "Save Token",
            custom_id: "save_token",
            components: [{
                    type: 1,
                    components: [{
                            type: 4,
                            label: "Token",
                            value: token || ctx.client.config.default_token || "0000000000",
                            custom_id: "token",
                            style: 1,
                            required: false
                        }]
                }]
        });
        ctx.interaction.showModal(modal);
    }
}
exports.default = default_1;
