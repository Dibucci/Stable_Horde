"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.StableHordeClient = void 0;
const supermap_1 = __importDefault(require("@thunder04/supermap"));
const discord_js_1 = require("discord.js");
const fs_1 = require("fs");
const store_1 = require("../stores/store");
const types_1 = require("../types");
const fs_2 = require("fs");
const crypto_1 = __importDefault(require("crypto"));
const centra_1 = __importDefault(require("centra"));
class StableHordeClient extends discord_js_1.Client {
    commands;
    components;
    contexts;
    modals;
    config;
    cache;
    timeout_users;
    security_key;
    required_permissions;
    bot_version;
    horde_styles;
    constructor(options) {
        super(options);
        this.commands = new store_1.Store({ files_folder: "/commands", load_classes_on_init: false, storetype: types_1.StoreTypes.COMMANDS });
        this.components = new store_1.Store({ files_folder: "/components", load_classes_on_init: false, storetype: types_1.StoreTypes.COMPONENTS });
        this.contexts = new store_1.Store({ files_folder: "/contexts", load_classes_on_init: false, storetype: types_1.StoreTypes.CONTEXTS });
        this.modals = new store_1.Store({ files_folder: "/modals", load_classes_on_init: false, storetype: types_1.StoreTypes.MODALS });
        this.config = {};
        this.cache = new supermap_1.default({
            intervalTime: 1000
        });
        this.timeout_users = new supermap_1.default({
            intervalTime: 1000
        });
        this.loadConfig();
        this.security_key = this.config.advanced?.encrypt_token ? Buffer.from(process.env["ENCRYPTION_KEY"] || "", "hex") : undefined;
        this.required_permissions = new discord_js_1.PermissionsBitField(discord_js_1.PermissionFlagsBits.ViewChannel |
            discord_js_1.PermissionFlagsBits.SendMessages |
            discord_js_1.PermissionFlagsBits.AttachFiles |
            discord_js_1.PermissionFlagsBits.EmbedLinks |
            discord_js_1.PermissionFlagsBits.ManageRoles |
            discord_js_1.PermissionFlagsBits.UseExternalEmojis);
        this.bot_version = JSON.parse((0, fs_1.readFileSync)("./package.json", "utf-8")).version;
        this.horde_styles = {};
    }
    loadConfig() {
        const config = JSON.parse((0, fs_1.readFileSync)("./config.json").toString());
        this.config = config;
    }
    initLogDir() {
        const log_dir = this.config.logs?.directory ?? "/logs";
        if (!(0, fs_2.existsSync)(`${process.cwd()}${log_dir}`)) {
            (0, fs_2.mkdirSync)("./logs");
        }
        if (this.config.logs?.plain && !(0, fs_2.existsSync)(`${process.cwd()}${log_dir}/logs_${new Date().getMonth() + 1}-${new Date().getFullYear()}.txt`)) {
            (0, fs_2.writeFileSync)(`${process.cwd()}${log_dir}/logs_${new Date().getMonth() + 1}-${new Date().getFullYear()}.txt`, `Date                     | User ID              | Prompt ID                            | Image to Image | Prompt`, { flag: "a" });
        }
        if (this.config.logs?.csv && !(0, fs_2.existsSync)(`${process.cwd()}${log_dir}/logs_${new Date().getMonth() + 1}-${new Date().getFullYear()}.csv`)) {
            (0, fs_2.writeFileSync)(`${process.cwd()}${log_dir}/logs_${new Date().getMonth() + 1}-${new Date().getFullYear()}.csv`, `Date,User ID,Prompt ID,Image to Image,Prompt`, { flag: "a" });
        }
    }
    async loadHordeStyles() {
        const source = this.config.generate?.styles_source ?? `https://raw.githubusercontent.com/db0/Stable-Horde-Styles/main/styles.json`;
        const req = (0, centra_1.default)(source, "GET");
        const raw = await req.send();
        if (!raw.statusCode?.toString().startsWith("2"))
            throw new Error("Unable to fetch styles");
        const res = await raw.json();
        this.horde_styles = res;
    }
    async getSlashCommandTag(name) {
        const commands = await this.application?.commands.fetch();
        if (!commands?.size)
            return `/${name}`;
        else if (commands?.find(c => c.name === name)?.id)
            return `</${name}:${commands?.find(c => c.name === name).id}>`;
        else
            return `/${name}`;
    }
    async getUserToken(user_id, database) {
        if (!database)
            return undefined;
        const rows = await database.query("SELECT * FROM user_tokens WHERE id=$1", [user_id]);
        if (!rows.rowCount || !rows.rows[0])
            return undefined;
        const token = this.config.advanced?.encrypt_token ? this.decryptString(rows.rows[0].token) : rows.rows[0].token;
        return token;
    }
    decryptString(hash) {
        if (!hash.includes(":"))
            return hash;
        if (!this.security_key)
            return undefined;
        const iv = Buffer.from(hash.split(':')[1], 'hex');
        const encryptedText = Buffer.from(hash.split(':')[0], "hex");
        const decipher = crypto_1.default.createDecipheriv('aes-256-ctr', this.security_key, iv);
        const decrpyted = Buffer.concat([decipher.update(encryptedText), decipher.final()]);
        return decrpyted.toString("utf-8");
    }
    ;
    encryptString(text) {
        if (!this.security_key)
            return undefined;
        const iv = crypto_1.default.randomBytes(16);
        const cipher = crypto_1.default.createCipheriv('aes-256-ctr', this.security_key, iv);
        const encrypted = Buffer.concat([cipher.update(text), cipher.final()]);
        return encrypted.toString('hex') + ":" + iv.toString('hex');
    }
    ;
    checkGuildPermissions(id, action) {
        if (!id)
            return false;
        if (!this.config.filter_actions?.mode)
            return false;
        if (this.config.filter_actions.mode === "blacklist") {
            if (!!this.config.filter_actions.apply_filter_to?.[action])
                return !this.config.filter_actions.guilds?.includes(id);
            else
                return true;
        }
        if (this.config.filter_actions.mode === "whitelist") {
            if (!!this.config.filter_actions.apply_filter_to?.[action])
                return !!this.config.filter_actions.guilds?.includes(id);
            else
                return false;
        }
        return false;
    }
}
exports.StableHordeClient = StableHordeClient;
