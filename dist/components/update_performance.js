"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const discord_js_1 = require("discord.js");
const component_1 = require("../classes/component");
class default_1 extends component_1.Component {
    constructor() {
        super({
            name: "update_performance",
            staff_only: false,
            regex: /update_performance/
        });
    }
    async run(ctx) {
        const performance = await ctx.stable_horde_manager.getPerformance();
        const btn = new discord_js_1.ButtonBuilder({
            label: "Refresh",
            style: 2,
            custom_id: "update_performance"
        });
        const embed = new discord_js_1.EmbedBuilder({
            color: discord_js_1.Colors.Blue,
            title: "Stable Horde Performance",
            description: `Queued Requests \`${performance.queued_requests}\`
Queued Interrogation Requests \`${performance.queued_forms}\`
Queued Megapixelsteps \`${performance.queued_megapixelsteps}\`
Queued Megapixelsteps (past minute) \`${performance.past_minute_megapixelsteps}\`
Generation Workers \`${performance.worker_count}\`
Interrogation Workers \`${performance.interrogator_count}\`
Generation Thread Count \`${performance.thread_count}\`
Interrogation Thread Count \`${performance.interrogator_thread_count}\``
        });
        const delete_btn = new discord_js_1.ButtonBuilder({
            label: "Delete this message",
            custom_id: `delete_${ctx.interaction.user.id}`,
            style: 4
        });
        ctx.interaction.update({
            embeds: [embed],
            components: [{
                    type: 1,
                    components: [btn.toJSON(), delete_btn.toJSON()]
                }]
        });
    }
}
exports.default = default_1;
