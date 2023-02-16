"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const component_1 = require("../classes/component");
class default_1 extends component_1.Component {
    constructor() {
        super({
            name: "followuprate",
            staff_only: false,
            regex: /followuprate_\d_[0-9a-z-]+/
        });
    }
    async run(ctx) {
        if (ctx.interaction.user.id !== ctx.interaction.message.interaction?.user.id)
            return ctx.error({ error: "Only the user who used this command can rate the images" });
        await ctx.interaction.deferUpdate();
        const [rate, id] = ctx.interaction.customId.split("_").slice(1);
        const generation = await ctx.stable_horde_manager.getGenerationStatus(id).catch(console.error);
        if (!generation?.generations?.length)
            return ctx.error({ error: "Unable to find generation" });
        const res = await ctx.stable_horde_manager.postRating(id, {
            ratings: generation.generations.map(g => ({
                id: g.id,
                rating: Number(rate)
            }))
        }).catch(console.error);
        if (ctx.client.config.advanced?.dev)
            console.log(res);
        if (!res?.reward)
            await ctx.interaction.followUp({ content: "Unable to post review", ephemeral: true });
        const del = ctx.interaction.message.components[2];
        ctx.interaction.editReply({
            components: [del]
        });
    }
}
exports.default = default_1;
