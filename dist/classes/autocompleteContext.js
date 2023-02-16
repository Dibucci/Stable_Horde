"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AutocompleteContext = void 0;
const baseContext_1 = require("./baseContext");
class AutocompleteContext extends baseContext_1.BaseContext {
    interaction;
    constructor(options) {
        super(options);
        this.interaction = options.interaction;
    }
    async error() {
        return await this.interaction.respond([]).catch();
    }
}
exports.AutocompleteContext = AutocompleteContext;
