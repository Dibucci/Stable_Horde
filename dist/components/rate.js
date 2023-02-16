"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const discord_js_1 = require("discord.js");
const component_1 = require("../classes/component");
function generateButtons(id) {
    let i = 0;
    const getId = () => `rate_${i + 1}_${id}`;
    const components = [];
    while (i < 10) {
        const btn = {
            type: 2,
            label: `${i + 1}`,
            customId: getId(),
            style: 1
        };
        if (!components[Math.floor(i / 5)]?.components)
            components.push({ type: 1, components: [] });
        components[Math.floor(i / 5)].components.push(btn);
        ++i;
    }
    return components;
}
class default_1 extends component_1.Component {
    constructor() {
        super({
            name: "rate",
            staff_only: false,
            regex: /rate_\d+_[0-9a-z-]+/
        });
    }
    async run(ctx) {
        await ctx.interaction.deferUpdate();
        const [rate, id] = ctx.interaction.customId.split("_").slice(1);
        const token = await ctx.client.getUserToken(ctx.interaction.user.id, ctx.database);
        const res = await ctx.stable_horde_manager.ratings.postRating(id, { rating: Number(rate) }, { token }).catch(console.error);
        if (!res?.message)
            ctx.error({
                error: "Unable to rate image"
            });
        if (ctx.client.config.advanced?.dev)
            console.log(res);
        const img = await ctx.stable_horde_manager.ratings.getNewRating(undefined, { token }).catch(console.error);
        if (!img?.url)
            return ctx.error({ error: "Unable to request Image" });
        if (ctx.client.config.advanced?.dev)
            console.log(img);
        const embed = new discord_js_1.EmbedBuilder({
            title: "Rate the Image below",
            image: {
                url: img.url
            },
            description: `How good does this image look to you?\nPrevious Rating: ${"⭐".repeat(Number(rate))}${"⬛".repeat(10 - Number(rate))}\nKudos earned for previous rating: \`${res?.reward}\``,
            color: discord_js_1.Colors.Blurple,
            footer: {
                text: `ImgID ${img.id}`
            }
        });
        ctx.interaction.editReply({
            embeds: [embed.toJSON()],
            components: generateButtons(img.id)
        });
    }
}
exports.default = default_1;
