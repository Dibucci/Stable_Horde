"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Store = void 0;
const supermap_1 = __importDefault(require("@thunder04/supermap"));
const fs_1 = require("fs");
const path_1 = require("path");
const types_1 = require("../types");
class Store {
    files_folder;
    loaded_classes;
    storetype;
    constructor(options) {
        this.files_folder = options.files_folder;
        this.storetype = options.storetype;
        this.loaded_classes = new supermap_1.default();
        if (options.load_classes_on_init && this.checkDirectory())
            this.loadClasses().then(res => this.loaded_classes = res).catch(console.error);
    }
    checkDirectory() {
        return (0, fs_1.existsSync)((0, path_1.join)(__dirname, "../", this.files_folder));
    }
    async loadClasses() {
        if (!this.files_folder)
            throw new Error("No location for commands given");
        if (!this.checkDirectory())
            throw new Error("Unable to find location");
        const files = (0, fs_1.readdirSync)((0, path_1.join)(__dirname, "../", this.files_folder));
        const map = new supermap_1.default();
        for (let command_file of files) {
            const command = new (require((0, path_1.join)(__dirname, "../", this.files_folder, command_file)).default)();
            map.set(command.name.toLowerCase(), command);
        }
        this.loaded_classes = map;
        console.log(`Loaded ${map.size} classes`);
        return map;
    }
    createPostBody() {
        if (this.storetype !== types_1.StoreTypes.COMMANDS && this.storetype !== types_1.StoreTypes.CONTEXTS)
            return [];
        const commands = this.loaded_classes.map(c => c.commandData).filter(c => c);
        return commands;
    }
    async getCommand(interaction) {
        if (!this.loaded_classes.size)
            throw new Error("No commands loaded");
        if (this.storetype !== types_1.StoreTypes.COMMANDS)
            throw new Error("Wrong class type loaded");
        let command_name = interaction.commandName;
        if (interaction.options.getSubcommandGroup(false))
            command_name += `_${interaction.options.getSubcommandGroup()}`;
        if (interaction.options.getSubcommand(false))
            command_name += `_${interaction.options.getSubcommand()}`;
        const command = this.loaded_classes.get(command_name);
        if (!command)
            throw new Error("Unable to find command");
        return command;
    }
    async getContext(interaction) {
        if (!this.loaded_classes.size)
            throw new Error("No commands loaded");
        if (this.storetype !== types_1.StoreTypes.CONTEXTS)
            throw new Error("Wrong class type loaded");
        let command_name = interaction.commandName.toLowerCase();
        const command = this.loaded_classes.get(command_name.toLowerCase());
        if (!command)
            throw new Error("Unable to find context");
        return command;
    }
    async getComponent(interaction) {
        if (!this.loaded_classes.size)
            throw new Error("No commands loaded");
        if (this.storetype !== types_1.StoreTypes.COMPONENTS)
            throw new Error("Wrong class type loaded");
        const command = this.loaded_classes.find(c => c.regex.test(interaction.customId));
        if (!command)
            throw new Error("Unable to find component");
        return command;
    }
    async getModal(interaction) {
        if (!this.loaded_classes.size)
            throw new Error("No commands loaded");
        if (this.storetype !== types_1.StoreTypes.MODALS)
            throw new Error("Wrong class type loaded");
        const command = this.loaded_classes.find(c => c.regex.test(interaction.customId));
        if (!command)
            throw new Error("Unable to find component");
        return command;
    }
}
exports.Store = Store;
