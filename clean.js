import directoryTree from "directory-tree";
import { exec, execSync } from "node:child_process"
import { extractPaths } from "./utils.js";
import { resolve } from "node:path";
import { existsSync } from "node:fs";

const tags = process.argv[2]
if (!tags) throw new Error("Please give some tags, comma separated")

const brewPath = execSync("echo $(brew --prefix)", { encoding: "utf-8" }).trim()
if (!existsSync(brewPath)) throw new Error("Please install homebrew")

const execTag = resolve(brewPath, "bin/tag")
if (!existsSync(execTag)) throw new Error("Please install `tag` via `brew install tag`")

const pwd = execSync("pwd", { encoding: "utf-8" }).trim()

const sTree = extractPaths(directoryTree(pwd)).map(x => x.path)


console.log("Removing tags...", tags);

await Promise.all(sTree.map(p => exec(`${execTag} -r ${tags} "${p}"`, { encoding: "utf-8" })))

console.log("Done.");
process.exit(0)

// .map(sobj => ({
//     tree: directoryTree(sobj.path),
//     tags: sobj.tags
// }))
// .map(s => extractPaths(s.tree, s.tags)).flat()

// console.log("sTree", sTree);