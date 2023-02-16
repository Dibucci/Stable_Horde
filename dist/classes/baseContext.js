"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BaseContext = void 0;
class BaseContext {
    interaction;
    client;
    database;
    stable_horde_manager;
    constructor(options) {
        this.interaction = options.interaction;
        this.client = options.client;
        this.database = options.database;
        this.stable_horde_manager = options.stable_horde_manager;
    }
}
exports.BaseContext = BaseContext;
