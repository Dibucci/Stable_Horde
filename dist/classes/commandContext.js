"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CommandContext = void 0;
const discord_js_1 = require("discord.js");
const baseContext_1 = require("./baseContext");
class CommandContext extends baseContext_1.BaseContext {
    interaction;
    constructor(options) {
        super(options);
        this.interaction = options.interaction;
    }
    async error(options) {
        const err_string = options.error ?? "Unknown Error";
        const embed = new discord_js_1.EmbedBuilder({
            color: discord_js_1.Colors.Red,
            description: `❌ **Error** | ${(options.codeblock ?? true) ? `\`${err_string}\`` : err_string}`
        });
        if (this.interaction.replied || this.interaction.deferred)
            return await this.interaction.editReply({ embeds: [embed] });
        else
            return await this.interaction.reply({ embeds: [embed], ephemeral: options.ephemeral ?? true });
    }
}
exports.CommandContext = CommandContext;
