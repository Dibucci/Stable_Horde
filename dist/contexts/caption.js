"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const stable_horde_1 = __importDefault(require("@zeldafan0225/stable_horde"));
const discord_js_1 = require("discord.js");
const context_1 = require("../classes/context");
const command_data = new discord_js_1.ContextMenuCommandBuilder()
    .setType(discord_js_1.ApplicationCommandType.User)
    .setName("Caption Profile Picture")
    .setDMPermission(false);
class default_1 extends context_1.Context {
    constructor() {
        super({
            name: "Caption Profile Picture",
            command_data: command_data.toJSON(),
            staff_only: false,
        });
    }
    async run(ctx) {
        if (!ctx.client.config.interrogate?.enable_user_captioning)
            return ctx.error({ error: "This feature has been disabled" });
        const target_user = ctx.interaction.targetUser;
        const user_token = await ctx.client.getUserToken(ctx.interaction.user.id, ctx.database);
        if (!user_token)
            return ctx.error({ error: `You are required to ${await ctx.client.getSlashCommandTag("login")} to use this action`, codeblock: false });
        const token = user_token || ctx.client.config.default_token || "0000000000";
        const forms = [{ name: stable_horde_1.default.ModelInterrogationFormTypes.caption }];
        if (target_user.defaultAvatarURL === target_user.displayAvatarURL())
            return ctx.error({ error: "This user does not have an avatar" });
        await ctx.interaction.deferReply();
        const interrogation_data = {
            source_image: target_user.displayAvatarURL({ forceStatic: true }),
            forms
        };
        if (ctx.client.config.advanced?.dev)
            console.log(interrogation_data);
        const interrogation_start = await ctx.stable_horde_manager.postAsyncInterrogate(interrogation_data, { token })
            .catch((e) => {
            if (ctx.client.config.advanced?.dev)
                console.error(e);
            ctx.error({ error: `Unable to perform this action\n${e.message}` });
            return null;
        });
        if (!interrogation_start || !interrogation_start?.id)
            return;
        const inter = setInterval(async () => {
            const status = await ctx.stable_horde_manager.getInterrogationStatus(interrogation_start?.id);
            if (ctx.client.config.advanced?.dev)
                console.log(status);
            if (status.state !== stable_horde_1.default.HordeAsyncRequestStates.waiting && status.state !== stable_horde_1.default.HordeAsyncRequestStates.processing)
                displayResult(status);
        }, 1000 * (ctx.client.config.interrogate?.update_interrogation_status_interval_seconds ?? 5));
        function displayResult(status) {
            clearInterval(inter);
            const embed = new discord_js_1.EmbedBuilder({
                color: discord_js_1.Colors.Blue,
                title: "Captioning finished",
                description: `**Caption**\n${status.forms?.[0]?.result?.caption ?? "Unable to generate caption"}`,
                image: {
                    url: target_user.displayAvatarURL()
                }
            });
            const delete_btn = new discord_js_1.ButtonBuilder({
                label: "Delete this message",
                custom_id: `delete_${ctx.interaction.user.id}`,
                style: 4
            });
            ctx.interaction.editReply({ embeds: [embed], components: [{ type: 1, components: [delete_btn.toJSON()] }] }).catch(console.error);
        }
    }
}
exports.default = default_1;
