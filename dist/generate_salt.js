"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const crypto_1 = require("crypto");
const buffer = (0, crypto_1.randomBytes)(32).toString("hex");
console.log(`Your randomly generated ENCRYPTION_KEY:\n\n${buffer}\n\nSave this string in the key ENCRYPTION_KEY in your .env file\n\x1b[31m%s\x1b[5m\x1b[0m`, "DO NOT MAKE THIS PUBLIC");
