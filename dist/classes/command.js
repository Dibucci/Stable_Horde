"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Command = void 0;
class Command {
    name;
    commandData;
    constructor(options) {
        this.name = options.name;
        this.commandData = options.command_data;
    }
    async run(_context) {
        throw new Error("You need to override the base run method");
    }
    async autocomplete(context) {
        return context.interaction.respond([]);
    }
}
exports.Command = Command;
