"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const discord_js_1 = require("discord.js");
const context_1 = require("../classes/context");
const command_data = new discord_js_1.ContextMenuCommandBuilder()
    .setType(discord_js_1.ApplicationCommandType.User)
    .setName("Userinfo")
    .setDMPermission(false);
class default_1 extends context_1.Context {
    constructor() {
        super({
            name: "Userinfo",
            command_data: command_data.toJSON(),
            staff_only: false,
        });
    }
    async run(ctx) {
        if (!ctx.database)
            return ctx.error({ error: "The database is disabled. This action requires a database." });
        let token = await ctx.client.getUserToken(ctx.interaction.targetId, ctx.database);
        if (!token && ctx.interaction.targetId !== ctx.interaction.user.id)
            return ctx.error({ error: "The user has not added their token" });
        const add_token_button = new discord_js_1.ButtonBuilder({
            custom_id: "save_token",
            label: "Save Token",
            style: 1
        });
        const delete_btn = new discord_js_1.ButtonBuilder({
            label: "Delete this message",
            custom_id: `delete_${ctx.interaction.user.id}`,
            style: 4
        });
        if (!token)
            return ctx.interaction.reply({
                content: `Please add your token before your user details can be shown.\nThis is needed to perform actions on your behalf\n\nBy entering your token you agree to the ${await ctx.client.getSlashCommandTag("terms")}\n\n\nDon't know what the token is?\nCreate a stable horde account here: https://stablehorde.net/register`,
                components: [{ type: 1, components: [add_token_button.toJSON()] }],
                ephemeral: true
            });
        const user_data = await ctx.stable_horde_manager.findUser({ token }).catch(() => null);
        if (!user_data)
            return ctx.interaction.reply({
                content: "Unable to find user for saved token.",
                components: [{ type: 1, components: [add_token_button.toJSON()] }],
                ephemeral: true
            });
        const props = [];
        if (user_data.moderator)
            props.push("⚔️ Moderator");
        if (user_data.trusted)
            props.push("🤝 Trusted");
        if (user_data.suspicious)
            props.push(`Suspicious ${user_data.suspicious}`);
        const embed = new discord_js_1.EmbedBuilder({
            color: discord_js_1.Colors.Blue,
            footer: { text: `${props.join(" | ")}` },
            title: `${user_data.username}`,
            description: `Images Requested \`${user_data.usage?.requests}\` (\`${user_data.usage?.megapixelsteps}\` Megapixelsteps)
Images Generated \`${user_data.contributions?.fulfillments}\` (\`${user_data.contributions?.megapixelsteps}\` Megapixelsteps)
Allowed Concurrency \`${user_data.concurrency}\`
Pseudonymous User \`${user_data.pseudonymous}\`

**Kudos**
Total \`${user_data.kudos}\`
Accumulated \`${user_data.kudos_details?.accumulated}\`
Gifted \`${user_data.kudos_details?.gifted}\`
Admin \`${user_data.kudos_details?.admin}\`
Received \`${user_data.kudos_details?.received}\`
Recurring \`${user_data.kudos_details?.recurring}\`

**Workers**
Invited \`${user_data.worker_invited}\`
Contributing \`${user_data.worker_count}\``,
        });
        ctx.interaction.reply({
            embeds: [embed.toJSON()],
            components: [{
                    type: 1,
                    components: [delete_btn.toJSON()]
                }]
        });
    }
}
exports.default = default_1;
