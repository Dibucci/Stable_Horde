"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const discord_js_1 = require("discord.js");
const command_1 = require("../classes/command");
const command_data = new discord_js_1.SlashCommandBuilder()
    .setName("worker")
    .setDMPermission(false)
    .setDescription(`Shows information on your stable horde workers`)
    .addStringOption(new discord_js_1.SlashCommandStringOption()
    .setName("query")
    .setDescription("The user to view")
    .setRequired(false)
    .setAutocomplete(true));
class default_1 extends command_1.Command {
    constructor() {
        super({
            name: "worker",
            command_data: command_data.toJSON(),
            staff_only: false,
        });
    }
    async run(ctx) {
        const query = ctx.interaction.options.getString("query");
        const workers = await ctx.stable_horde_manager.getWorkers();
        const worker = workers.find(t => t.id?.toLowerCase() === query?.toLowerCase() || t.name?.toLowerCase() === query?.toLowerCase());
        if (query && worker) {
            const delete_btn = new discord_js_1.ButtonBuilder({
                label: "Delete this message",
                custom_id: `delete_${ctx.interaction.user.id}`,
                style: 4
            });
            const embed = new discord_js_1.EmbedBuilder({
                title: `Worker Details`,
                color: discord_js_1.Colors.Blue,
                description: `Name: \`${worker.name}\`
Team: \`${worker.team?.name ?? "No team"}\`
Trusted: \`${worker.trusted}\`
Info: ${worker.info}

**Stats**
Requests Fulfilled: \`${worker.requests_fulfilled}\`
Kudos: \`${worker.kudos_rewards}\`
Online since: <t:${Math.floor(Date.now() / 1000) - (worker.uptime ?? 0)}:R>
Performance: \`${worker.performance}\` Megapixelsteps per second

**Config**
Img2Img: \`${worker.img2img}\`
NSFW: \`${worker.nsfw}\`
Painting: \`${worker.painting}\`

**Status**
Maintenance: \`${worker.maintenance_mode}\``,
                footer: { text: worker.id }
            });
            ctx.interaction.reply({
                embeds: [embed],
                components: [{ type: 1, components: [delete_btn] }]
            });
        }
        else {
            const max_name = workers.sort((a, b) => (b.name?.length ?? 0) - (a.name?.length ?? 0))[0]?.name?.length ?? 9;
            const max_models = workers.sort((a, b) => (b.models?.join(", ")?.length ?? 0) - (a.models?.join(", ")?.length ?? 0))[0]?.models?.join(", ")?.length ?? 0;
            const file_header = `Worker ID                            | name${" ".repeat(max_name - 4)} | img2img | nsfw  | maintenance | models${" ".repeat(max_models - 5)} |`;
            const file_data = `${file_header}\n${"-".repeat(file_header.length)}\n${workers.map(w => `${w.id} | ${w.name}${" ".repeat((max_name) - (w.name?.length ?? 9))} |  ${w.img2img ? `true ` : `false`}  | ${w.nsfw ? `true ` : `false`} | ${w.maintenance_mode ? `true ` : `false`}        | ${w.models?.join(", ")}${" ".repeat((max_models) - (w.models?.join(", ")?.length ?? 0))} |`).join("\n")}`;
            ctx.interaction.reply({
                content: "Data attached below",
                files: [new discord_js_1.AttachmentBuilder(Buffer.from(file_data), { name: `workers.txt` })],
                ephemeral: true
            });
        }
    }
    async autocomplete(context) {
        const option = context.interaction.options.getFocused(true);
        switch (option.name) {
            case "query": {
                const workers = await context.stable_horde_manager.getWorkers();
                if (context.client.config.advanced?.dev)
                    console.log(workers);
                const available = workers.filter(t => t.name?.toLowerCase().includes(option.value.toLowerCase()) || t.id?.toLowerCase().includes(option.value.toLowerCase())).map(t => ({ name: `${t.name} | ${t.id}`, value: t.id }));
                return await context.interaction.respond(available.slice(0, 25));
            }
        }
    }
}
exports.default = default_1;
