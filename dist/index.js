"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const fs_1 = require("fs");
const discord_js_1 = require("discord.js");
const client_1 = require("./classes/client");
const commandHandler_1 = require("./handlers/commandHandler");
const componentHandler_1 = require("./handlers/componentHandler");
const modalHandler_1 = require("./handlers/modalHandler");
const pg_1 = require("pg");
const autocompleteHandler_1 = require("./handlers/autocompleteHandler");
const stable_horde_1 = __importDefault(require("@zeldafan0225/stable_horde"));
const contextHandler_1 = require("./handlers/contextHandler");
const fs_2 = require("fs");
const messageReact_1 = require("./handlers/messageReact");
const RE_INI_KEY_VAL = /^\s*([\w.-]+)\s*=\s*(.*)?\s*$/;
for (const line of (0, fs_1.readFileSync)(`${process.cwd()}/.env`, 'utf8').split(/[\r\n]/)) {
    const [, key, value] = line.match(RE_INI_KEY_VAL) || [];
    if (!key)
        continue;
    process.env[key] = value?.trim() || "";
}
let connection;
const client = new client_1.StableHordeClient({
    intents: ["Guilds", "GuildMessageReactions"],
    partials: [discord_js_1.Partials.Reaction, discord_js_1.Partials.Message]
});
if (client.config.advanced?.encrypt_token && !process.env["ENCRYPTION_KEY"]?.length)
    throw new Error("Either give a valid encryption key (you can generate one with 'npm run generate-key') or disable token encryption in your config.json file.");
if (client.config.use_database !== false) {
    connection = new pg_1.Pool({
        user: process.env["DB_USERNAME"],
        host: process.env["DB_IP"],
        database: process.env["DB_NAME"],
        password: process.env["DB_PASSWORD"],
        port: Number(process.env["DB_PORT"]),
    });
    connection.connect().then(async () => {
        await connection.query("CREATE TABLE IF NOT EXISTS user_tokens (index SERIAL, id VARCHAR(100) PRIMARY KEY, token VARCHAR(100) NOT NULL)");
        await connection.query("CREATE TABLE IF NOT EXISTS pending_kudos (index SERIAL, unique_id VARCHAR(200) PRIMARY KEY, target_id VARCHAR(100) NOT NULL, from_id VARCHAR(100) NOT NULL, amount int NOT NULL, updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP)");
    }).catch(() => null);
    setInterval(async () => {
        await connection?.query("DELETE FROM pending_kudos WHERE updated_at <= CURRENT_TIMESTAMP - interval '1 week'").catch(console.error);
    }, 1000 * 60 * 60 * 24);
}
const stable_horde_manager = new stable_horde_1.default({
    default_token: client.config.default_token,
    cache_interval: 1000,
    cache: {
        models: 1000 * 10,
        performance: 1000 * 10,
        teams: 1000 * 10
    },
    client_agent: `ZeldaFan-Discord-Bot:${client.bot_version}:https://github.com/ZeldaFan0225/Stable_Horde_Discord`
});
client.login(process.env["DISCORD_TOKEN"]);
if (client.config.logs?.enabled) {
    client.initLogDir();
}
if (!(0, fs_2.existsSync)(`${process.cwd()}/node_modules/webp-converter/temp`)) {
    (0, fs_2.mkdirSync)("./node_modules/webp-converter/temp");
}
client.on("ready", async () => {
    client.commands.loadClasses().catch(console.error);
    client.components.loadClasses().catch(console.error);
    client.contexts.loadClasses().catch(console.error);
    client.modals.loadClasses().catch(console.error);
    client.user?.setPresence({ activities: [{ type: discord_js_1.ActivityType.Listening, name: "to your generation requests | https://stablehorde.net" }], status: discord_js_1.PresenceUpdateStatus.DoNotDisturb, });
    if (client.config.generate?.enabled)
        await client.loadHordeStyles();
    console.log(`Ready`);
    await client.application?.commands.set([...client.commands.createPostBody(), ...client.contexts.createPostBody()]).catch(console.error);
    if ((client.config.advanced_generate?.user_restrictions?.amount?.max ?? 4) > 10)
        throw new Error("More than 10 images are not supported in the bot");
    if (client.config.filter_actions?.guilds?.length && (client.config.filter_actions?.mode !== "whitelist" && client.config.filter_actions?.mode !== "blacklist"))
        throw new Error("The actions filter mode must be set to either whitelist, blacklist.");
    if (client.config.advanced?.pre_check_prompts_for_suspicion?.enabled && !process.env["OPERATOR_API_KEY"])
        throw new Error("The OPERATOR_API_KEY in the .env is required when pre checking prompts for being suspicious");
});
if (client.config.react_to_transfer?.enabled)
    client.on("messageReactionAdd", async (r, u) => await (0, messageReact_1.handleMessageReact)(r, u, client, connection, stable_horde_manager).catch(console.error));
client.on("interactionCreate", async (interaction) => {
    switch (interaction.type) {
        case discord_js_1.InteractionType.ApplicationCommand:
            {
                switch (interaction.commandType) {
                    case discord_js_1.ApplicationCommandType.ChatInput: {
                        return await (0, commandHandler_1.handleCommands)(interaction, client, connection, stable_horde_manager).catch(console.error);
                    }
                    case discord_js_1.ApplicationCommandType.User:
                    case discord_js_1.ApplicationCommandType.Message: {
                        return await (0, contextHandler_1.handleContexts)(interaction, client, connection, stable_horde_manager).catch(console.error);
                    }
                }
            }
            ;
        case discord_js_1.InteractionType.MessageComponent:
            {
                return await (0, componentHandler_1.handleComponents)(interaction, client, connection, stable_horde_manager).catch(console.error);
            }
            ;
        case discord_js_1.InteractionType.ApplicationCommandAutocomplete:
            {
                return await (0, autocompleteHandler_1.handleAutocomplete)(interaction, client, connection, stable_horde_manager).catch(console.error);
            }
            ;
        case discord_js_1.InteractionType.ModalSubmit:
            {
                return await (0, modalHandler_1.handleModals)(interaction, client, connection, stable_horde_manager).catch(console.error);
            }
            ;
    }
});
