"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const discord_js_1 = require("discord.js");
const command_1 = require("../classes/command");
const fs_1 = require("fs");
const stable_horde_1 = __importDefault(require("@zeldafan0225/stable_horde"));
const config = JSON.parse((0, fs_1.readFileSync)("./config.json").toString());
const command_data = new discord_js_1.SlashCommandBuilder()
    .setName("interrogate")
    .setDMPermission(false)
    .setDescription(`Interrogates an image with stable horde`);
if (config.interrogate?.enabled) {
    command_data.addAttachmentOption(new discord_js_1.SlashCommandAttachmentOption()
        .setName("image")
        .setDescription("The image to interrogate")
        .setRequired(true));
    if (config.interrogate.user_restrictions?.allow_nsfw) {
        command_data.addBooleanOption(new discord_js_1.SlashCommandBooleanOption()
            .setName("nsfw")
            .setDescription("Whether to interrogate the image for nsfw"));
    }
    if (config.interrogate.user_restrictions?.allow_caption) {
        command_data.addBooleanOption(new discord_js_1.SlashCommandBooleanOption()
            .setName("caption")
            .setDescription("Whether to create a caption for the image"));
    }
    if (config.interrogate.user_restrictions?.allow_interrogation) {
        command_data.addBooleanOption(new discord_js_1.SlashCommandBooleanOption()
            .setName("detailed_interrogation")
            .setDescription("Whether to create a detailed interrogation result"));
    }
}
class default_1 extends command_1.Command {
    constructor() {
        super({
            name: "interrogate",
            command_data: command_data.toJSON(),
            staff_only: false,
        });
    }
    async run(ctx) {
        if (!ctx.client.config.interrogate?.enabled)
            return ctx.error({ error: "Interrogation is disabled." });
        await ctx.interaction.deferReply({});
        const attachment = ctx.interaction.options.getAttachment("image", true);
        const nsfw = ctx.interaction.options.getBoolean("nsfw") ?? ctx.client.config.interrogate?.default?.nsfw;
        const caption = ctx.interaction.options.getBoolean("caption") ?? ctx.client.config.interrogate?.default?.caption;
        const detailed = ctx.interaction.options.getBoolean("detailed_interrogation") ?? ctx.client.config.interrogate?.default?.interrogation;
        if (!nsfw && !caption && !detailed)
            return ctx.error({ error: "One of the interrogation types must be selected" });
        const user_token = await ctx.client.getUserToken(ctx.interaction.user.id, ctx.database);
        if (!user_token)
            return ctx.error({ error: `You are required to ${await ctx.client.getSlashCommandTag("login")} to use ${await ctx.client.getSlashCommandTag("interrogate")}`, codeblock: false });
        if (!attachment.contentType?.startsWith("image/"))
            return ctx.error({ error: "Attachment input must be a image" });
        const token = user_token || ctx.client.config.default_token || "0000000000";
        const forms = [];
        if (nsfw)
            forms.push({ name: stable_horde_1.default.ModelInterrogationFormTypes.nsfw });
        if (caption)
            forms.push({ name: stable_horde_1.default.ModelInterrogationFormTypes.caption });
        if (detailed)
            forms.push({ name: stable_horde_1.default.ModelInterrogationFormTypes.interrogation });
        const interrogation_data = {
            source_image: attachment.url,
            forms
        };
        const interrogation_start = await ctx.stable_horde_manager.postAsyncInterrogate(interrogation_data, { token })
            .catch((e) => {
            if (ctx.client.config.advanced?.dev)
                console.error(e);
            ctx.error({ error: `Unable to start interrogation: ${e.message}` });
            return null;
        });
        if (!interrogation_start || !interrogation_start.id)
            return;
        if (ctx.client.config.advanced?.dev)
            console.log(`${ctx.interaction.user.id} interrogated ${attachment.url} (${interrogation_start?.id})`);
        const start_status = await ctx.stable_horde_manager.getInterrogationStatus(interrogation_start.id).catch((e) => ctx.client.config.advanced?.dev ? console.error(e) : null);
        const start_horde_data = await ctx.stable_horde_manager.getPerformance();
        if (ctx.client.config.advanced?.dev) {
            console.log(start_status);
        }
        const embed = new discord_js_1.EmbedBuilder({
            color: discord_js_1.Colors.Blue,
            title: "Interrogation started",
            description: `Please wait...

Interrogation workers: \`${start_horde_data.interrogator_count}\`
Interrogations queued: \`${start_horde_data.queued_forms}\`
${nsfw ? `\n**NSFW** \`${start_status?.forms?.find(f => f.form === stable_horde_1.default.ModelInterrogationFormTypes.nsfw)?.state}\`` : ""}${caption ? `\n**Caption** \`${start_status?.forms?.find(f => f.form === stable_horde_1.default.ModelInterrogationFormTypes.caption)?.state}\`` : ""}${detailed ? `\n**Detailed Interrogation** \`${start_status?.forms?.find(f => f.form === stable_horde_1.default.ModelInterrogationFormTypes.interrogation)?.state}\`` : ""}`,
            image: {
                url: attachment.url
            }
        });
        if (ctx.client.config.advanced?.dev)
            embed.setFooter({ text: interrogation_start.id });
        const btn = new discord_js_1.ButtonBuilder({
            label: "Cancel",
            custom_id: `cancel_inter_${interrogation_start.id}`,
            style: 4
        });
        const delete_btn = new discord_js_1.ButtonBuilder({
            label: "Delete this message",
            custom_id: `delete_${ctx.interaction.user.id}`,
            style: 4
        });
        const components = [{ type: 1, components: [btn.toJSON()] }];
        ctx.interaction.editReply({
            content: "",
            embeds: [embed.toJSON()],
            components
        });
        const message = await ctx.interaction.fetchReply();
        let done = false;
        const inter = setInterval(async () => {
            const d = await getCheckAndDisplayResult();
            if (!d)
                return;
            const { status, horde_data } = d;
            if (start_status?.state === stable_horde_1.default.HordeAsyncRequestStates.faulted) {
                if (!done) {
                    await ctx.stable_horde_manager.deleteInterrogationRequest(interrogation_start.id);
                    message.edit({
                        components: [],
                        content: "Interrogation cancelled due to errors",
                        embeds: []
                    });
                }
                clearInterval(inter);
                return;
            }
            const embed = new discord_js_1.EmbedBuilder({
                color: discord_js_1.Colors.Blue,
                title: "Interrogation started",
                description: `Please wait...

                Interrogation workers: \`${horde_data.interrogator_count}\`
                Interrogations queued: \`${horde_data.queued_forms}\`
                ${nsfw ? `\n**NSFW** \`${status?.forms?.find(f => f.form === stable_horde_1.default.ModelInterrogationFormTypes.nsfw)?.state}\`` : ""}${caption ? `\n**Caption** \`${status?.forms?.find(f => f.form === stable_horde_1.default.ModelInterrogationFormTypes.caption)?.state}\`` : ""}${detailed ? `\n**Detailed Interrogation** \`${status?.forms?.find(f => f.form === stable_horde_1.default.ModelInterrogationFormTypes.interrogation)?.state}\`` : ""}`,
                image: {
                    url: attachment.url
                }
            });
            if (ctx.client.config.advanced?.dev)
                embed.setFooter({ text: interrogation_start?.id ?? "Unknown ID" });
            return message.edit({
                content: "",
                embeds: [embed.toJSON()],
                components
            });
        }, 1000 * (ctx.client.config?.interrogate?.update_interrogation_status_interval_seconds || 5));
        async function getCheckAndDisplayResult(precheck) {
            if (done)
                return;
            const status = await ctx.stable_horde_manager.getInterrogationStatus(interrogation_start.id).catch((e) => ctx.client.config.advanced?.dev ? console.error(e) : null);
            done = status?.state === stable_horde_1.default.HordeAsyncRequestStates.done;
            const horde_data = await ctx.stable_horde_manager.getPerformance();
            if (!status || status.state === stable_horde_1.default.HordeAsyncRequestStates.faulted) {
                if (!done)
                    await message.edit({ content: "Interrogation has been cancelled", embeds: [] });
                if (!precheck)
                    clearInterval(inter);
                return null;
            }
            if (ctx.client.config.advanced?.dev) {
                console.log(status);
            }
            if (status.state !== stable_horde_1.default.HordeAsyncRequestStates.done && status.state !== stable_horde_1.default.HordeAsyncRequestStates.partial)
                return { status, horde_data };
            else {
                done = true;
                const nsfw_res = status?.forms?.find(f => f.form === stable_horde_1.default.ModelInterrogationFormTypes.nsfw);
                const caption_res = status?.forms?.find(f => f.form === stable_horde_1.default.ModelInterrogationFormTypes.caption);
                const detailed_res = status?.forms?.find(f => f.form === stable_horde_1.default.ModelInterrogationFormTypes.interrogation);
                const embed = new discord_js_1.EmbedBuilder({
                    color: discord_js_1.Colors.Blue,
                    title: "Interrogation finished",
                    description: `${nsfw ? `**NSFW** \`${nsfw_res?.state !== stable_horde_1.default.HordeAsyncRequestStates.done ? nsfw_res?.state : nsfw_res?.result?.nsfw}\`` : ""}${detailed ? `\n**Detailed Interrogation** \`${detailed_res?.state !== stable_horde_1.default.HordeAsyncRequestStates.done ? detailed_res?.state : "Result attached"}\`` : ""}${caption ? `\n**Caption**\n${caption_res?.state !== stable_horde_1.default.HordeAsyncRequestStates.done ? caption_res?.state : caption_res?.result?.caption}` : ""}`,
                    image: {
                        url: attachment.url
                    }
                });
                if (!precheck)
                    clearInterval(inter);
                const files = [];
                if (detailed && detailed_res?.state === stable_horde_1.default.HordeAsyncRequestStates.done)
                    files.push(new discord_js_1.AttachmentBuilder(Buffer.from(JSON.stringify((status?.forms?.find(f => f.form === stable_horde_1.default.ModelInterrogationFormTypes.interrogation)?.result?.interrogation || {}), null, 2)), { name: "detailed.json" }));
                await message.edit({ components: [{ type: 1, components: [delete_btn.toJSON()] }], embeds: [embed], files });
                return null;
            }
        }
    }
}
exports.default = default_1;
