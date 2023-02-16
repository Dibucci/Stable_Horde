"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const discord_js_1 = require("discord.js");
const command_1 = require("../classes/command");
const command_data = new discord_js_1.SlashCommandBuilder()
    .setName("models")
    .setDMPermission(false)
    .setDescription(`Shows information on available models`);
class default_1 extends command_1.Command {
    constructor() {
        super({
            name: "models",
            command_data: command_data.toJSON(),
            staff_only: false,
        });
    }
    async run(ctx) {
        const models = await ctx.stable_horde_manager.getModels({ force: true });
        let files = [];
        const embed = new discord_js_1.EmbedBuilder({
            color: discord_js_1.Colors.Blue,
            title: "Currently available models",
            description: models.map(w => `**${w.name}**
Workers: \`${w.count}\`
Performance: \`${w.performance}\``).join("\n\n")
        });
        if (models.length <= 25) {
            embed.setDescription(null);
            embed.setFields(models.map(w => ({
                name: w.name,
                value: `Workers: \`${w.count}\`\nPerformance: \`${w.performance}\`\nQueued: \`${w.queued}\``,
                inline: true
            })));
        }
        if ((embed.data.description?.length ?? 0) > 4096) {
            const longest_name = models.sort((a, b) => b.name.length - a.name.length)[0]?.name?.length ?? 0;
            const header = `Model Name${" ".repeat(longest_name - 10)} | Workers | Performance`;
            const dividor = "-".repeat(header.length);
            const rows = models.sort((a, b) => a.name.localeCompare(b.name)).map(m => `${m.name}${" ".repeat(longest_name - (m.name?.length ?? 0))} | ${m.count?.toString().padStart(7, " ")} | ${m.performance}`).join("\n");
            const content = [header, dividor, rows].join("\n");
            files.push(new discord_js_1.AttachmentBuilder(Buffer.from(content), { name: "models.txt" }));
            embed.setDescription("Models attached");
        }
        const delete_btn = new discord_js_1.ButtonBuilder({
            label: "Delete this message",
            custom_id: `delete_${ctx.interaction.user.id}`,
            style: 4
        });
        return ctx.interaction.reply({
            embeds: [embed],
            components: [{ type: 1, components: [delete_btn] }],
            files
        });
    }
}
exports.default = default_1;
