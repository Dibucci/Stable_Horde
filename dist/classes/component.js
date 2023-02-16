"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Component = void 0;
class Component {
    name;
    regex;
    constructor(options) {
        this.name = options.name;
        this.regex = options.regex;
    }
    async run(_context) {
        throw new Error("You need to override the base run method");
    }
}
exports.Component = Component;
