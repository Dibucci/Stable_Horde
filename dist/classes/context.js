"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Context = void 0;
class Context {
    name;
    commandData;
    constructor(options) {
        this.name = options.name;
        this.commandData = options.command_data;
    }
    async run(_context) {
        throw new Error("You need to override the base run method");
    }
}
exports.Context = Context;
