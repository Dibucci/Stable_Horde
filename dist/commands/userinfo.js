"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const discord_js_1 = require("discord.js");
const command_1 = require("../classes/command");
const command_data = new discord_js_1.SlashCommandBuilder()
    .setName("userinfo")
    .setDMPermission(false)
    .setDescription(`Shows information on your stable horde account`)
    .addUserOption(new discord_js_1.SlashCommandUserOption()
    .setName("user")
    .setDescription("The user to view")
    .setRequired(false));
class default_1 extends command_1.Command {
    constructor() {
        super({
            name: "userinfo",
            command_data: command_data.toJSON(),
            staff_only: false,
        });
    }
    async run(ctx) {
        if (!ctx.database)
            return ctx.error({ error: "The database is disabled. This action requires a database." });
        const user = ctx.interaction.options.getUser("user")?.id ?? ctx.interaction.user.id;
        let token = await ctx.client.getUserToken(user, ctx.database);
        if (!token && ctx.interaction.options.getUser("user")?.id)
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
                content: `Please add your token before your user details can be shown.\nThis is needed to perform actions on your behalf\n\nBy entering your token you agree to the ${await ctx.client.getSlashCommandTag("terms")}\n**You agree to not upload or generate any illegal content**${!ctx.client.config.advanced?.encrypt_token ? "\n\n**The bot is configured not to save your token in an encrypted form!**" : ""}\n\n\nDon't know what the token is?\nCreate a stable horde account here: https://stablehorde.net/register`,
                components: [{ type: 1, components: [add_token_button.toJSON()] }],
                ephemeral: true
            });
        await ctx.interaction.deferReply();
        const user_data = await ctx.stable_horde_manager.findUser({ token }).catch(() => null);
        const member = await ctx.interaction.guild?.members.fetch(user).catch(console.error);
        if (member) {
            let apply_roles = [];
            if (ctx.client.checkGuildPermissions(ctx.interaction.guildId, "apply_roles_to_worker_owners") && user_data?.worker_ids?.length && ctx.client.config.apply_roles_to_worker_owners?.length)
                apply_roles.push(...ctx.client.config.apply_roles_to_worker_owners);
            if (ctx.client.checkGuildPermissions(ctx.interaction.guildId, "apply_roles_to_trusted_users") && user_data?.trusted && ctx.client.config.apply_roles_to_trusted_users?.length)
                apply_roles.push(...ctx.client.config.apply_roles_to_trusted_users);
            apply_roles = apply_roles.filter(r => !member?.roles.cache.has(r));
            if (apply_roles.length)
                await member?.roles.add(apply_roles).catch(console.error);
        }
        if (!user_data)
            return ctx.error({
                error: `Unable to find user for saved token.\nUpdate your token with ${await ctx.client.getSlashCommandTag("updatetoken")}`,
                codeblock: false
            });
        const props = [];
        if (user_data.moderator)
            props.push("?????? Moderator");
        if (user_data.trusted)
            props.push("???? Trusted");
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
Awarded \`${user_data.kudos_details?.awarded}\`
Recurring \`${user_data.kudos_details?.recurring}\`

**Workers**
Invited \`${user_data.worker_invited}\`
Contributing \`${user_data.worker_count}\``,
        });
        ctx.interaction.editReply({
            embeds: [embed.toJSON()],
            components: [{
                    type: 1,
                    components: [delete_btn.toJSON()]
                }]
        });
    }
}
exports.default = default_1;
