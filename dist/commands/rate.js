"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const discord_js_1 = require("discord.js");
const command_1 = require("../classes/command");
const command_data = new discord_js_1.SlashCommandBuilder()
    .setName("rate")
    .setDMPermission(false)
    .setDescription(`Earn kudos by rating images`);
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
class default_1 extends command_1.Command {
    constructor() {
        super({
            name: "rate",
            command_data: command_data.toJSON(),
            staff_only: false,
        });
    }
    async run(ctx) {
        await ctx.interaction.deferReply({ ephemeral: true });
        if (!ctx.database)
            return ctx.error({ error: "The database is disabled. This action requires a database." });
        let token = await ctx.client.getUserToken(ctx.interaction.user.id, ctx.database);
        const add_token_button = new discord_js_1.ButtonBuilder({
            custom_id: "save_token",
            label: "Save Token",
            style: 1
        });
        if (!token)
            return ctx.interaction.editReply({
                content: `Please add your token before your user details can be shown.\nThis is needed to perform actions on your behalf\n\nBy entering your token you agree to the ${await ctx.client.getSlashCommandTag("terms")}\n\n\nDon't know what the token is?\nCreate a stable horde account here: https://stablehorde.net/register`,
                components: [{ type: 1, components: [add_token_button.toJSON()] }]
            });
        const user_data = await ctx.stable_horde_manager.findUser({ token }).catch(() => null);
        if (!user_data)
            return ctx.interaction.editReply({
                content: "Unable to find user for saved token.",
                components: [{ type: 1, components: [add_token_button.toJSON()] }]
            });
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
            description: `How good does this image look to you?`,
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
