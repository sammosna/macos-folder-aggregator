#!/usr/bin/env node
import { exec, execSync } from "node:child_process"
import { copyFileSync, existsSync, mkdirSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";
import { dirname } from 'path';
import { fileURLToPath } from 'url';
import { homedir } from "node:os";

const __dirname = dirname(fileURLToPath(import.meta.url));
const scriptsPath = resolve(homedir(), "Library/Scripts/Folder Action Scripts")
const pwd = execSync("pwd", { encoding: "utf-8" }).trim()
const configDirPath = resolve(pwd, ".sync");
const configPath = resolve(configDirPath, "config.json")

const tags = ["link"]

console.log("pwd", pwd);
const sources = process.argv.slice(2)

if (!sources.length) throw new Error("Set at least one source")

if (!existsSync(resolve(__dirname, "bin/sync"))) execSync(`cd ${__dirname} && bun run build:sync`)


const config = {
    sources: sources.map(s => ({
        path: s,
        tags: []
    })),
    dest: pwd,
    tags,
    exclude: []
}

if (!existsSync(configDirPath)) mkdirSync(configDirPath)

writeFileSync(configPath, JSON.stringify(config, null, "\t"))

// console.log("config", config);

// console.log("Copy");
// console.log("from", resolve(__dirname, "sync"));
// console.log("to", resolve(configDirPath, "sync"));
copyFileSync(resolve(__dirname, "bin/sync"), resolve(configDirPath, "sync"))
// console.log("r", r);

console.log(execSync("ls", { encoding: "utf-8" }));



// #region AGGREGATOR.SCP
console.log("scriptsPath", scriptsPath);
if (!existsSync(scriptsPath)) mkdirSync(scriptsPath, { recursive: true })
// if (!existsSync(resolve(scriptsPath, "Aggregator.scpt")))
copyFileSync(resolve(__dirname, "assets/Aggregator.scpt"), resolve(scriptsPath, "Aggregator.scpt"))
// copyFileSync(resolve(__dirname, "assets/icon.png"), resolve(configDirPath, "icon.png"))
// console.log(resolve(__dirname, "assets/icon.png"));
// console.log(resolve(scriptsPath, "icon.png"));
// #endregion AGGREGATOR.SCP



// execSync(`open ${configDirPath}`)
