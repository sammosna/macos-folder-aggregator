console.clear()
console.log("————NEW—————");
import fs, { existsSync, readFileSync } from "node:fs"
import path, { relative, resolve } from "node:path"
import directoryTree from "directory-tree";
import child from "child_process"
import { execSync } from "node:child_process";
import { extractPaths } from "./utils.js";

// const sources = [
//     {
//         path: "/Users/samuelemosna/Desktop/multifolder-test/sources/smssd/Freelancer",
//         tags: ["smssd"]
//     },
//     {
//         // path: "/Users/samuelemosna/Desktop/multifolder-test/sources/gdrive/Freelancer",
//         path: "/Users/samuelemosna/Library/Group Containers/G69SCX94XU.duck/Library/Application Support/duck/Volumes.noindex/sammosnagdrive/My Drive/Freelance",
//         tags: ["gdrive"]
//     }
// ];
// // const dest = "/Users/samuelemosna/Desktop/multifolder-test/Freelancer"
// const tags = []
// // console.log("d", d);

let dest = process.argv[2]
if (!dest) throw new Error("Missing dest argument")

if (dest.charAt(0) === "~") throw new Error("Please pass absolute path (avoid ~)")

const configPath = resolve(dest, "\.sync/config.json");
if (!existsSync(configPath)) throw new Error("Missing config file")


const brewPath = execSync("echo $(brew --prefix)", { encoding: "utf-8" }).trim()
if (!existsSync(brewPath)) throw new Error("Please install homebrew")

const execTag = resolve(brewPath, "bin/tag")
if (!existsSync(execTag)) throw new Error("Please install `tag` via `brew install tag`")

// const execTag = execSync("/usr/bin/env tag", { encoding: "utf-8" }).trim()
// console.log("execTag", execTag);



let { sources, dest: configDest, tags } = JSON.parse(readFileSync(configPath))
sources = sources.map(s => ({
    ...s,
    path: resolve(s.path)
}))

dest = resolve(dest);
configDest = resolve(configDest);

console.log("dest", dest);
console.log("configDest", configDest);
console.log("tags", tags);


if (relative(dest, configDest) !== "") throw new Error("Dest mismatch!")


const sTree = sources
    .map(sobj => ({
        tree: directoryTree(sobj.path),
        tags: sobj.tags
    }))
    .map(s => extractPaths(s.tree, s.tags)).flat()
    .filter(t => {
        return !sources.some(s => t.path === s)
    })
    .map(elem => {
        const source = sources.find(s => elem.path.includes(s.path)).path
        const full = elem.path
        const basename = path.basename(full)
        const p = full.replace(source, "").slice(1)
        const destPath = path.resolve(dest, p)
        return {
            path: p,
            dest: destPath,
            isDirectory: fs.lstatSync(full).isDirectory(),
            isDotfile: basename.charAt(0) === ".",
            source,
            full,
            basename,
            tags: elem.tags
        }
    })

console.log("Tree length:", sTree.length);
console.log(sTree[0]);


const dirs = sTree.filter(s => s.isDirectory)
const files = sTree.filter(s => !s.isDirectory)

console.log("Connecting folders...");
for (const d of dirs) {
    fs.mkdirSync(d.dest, { recursive: true });
}
console.log("Done.");

console.log("Connecting files...");
// for (const f of files) {
//     if (!fs.existsSync(f.dest)) {
//         // console.log(`ln -s ${f.full} ${path.resolve(dest, f.path)}`);
//         child.execSync(`ln -s "${f.full}" "${f.dest}"`)
//     }
//     // child.execSync(`tag --add link "${p}"`)
// }
await Promise.all(files
    .filter(f => !fs.existsSync(f.dest))
    .map(f => child.exec(`ln -s "${f.full}" "${f.dest}"`))
)
console.log("Done.");

console.log("Creating tags...");

await Promise.all(sTree
    .filter(s => {
        return fs.existsSync(path.resolve(dest, s.path)) && !s.isDotfile
    })
    .map(s => {
        try {
            child.exec(`${execTag} --add ${[...tags, s.tags].join(",")} "${path.resolve(dest, s.path)}"`)
        } catch (e) {
            console.log("ERROR WITH", s.path);
            console.log(e);
            console.log("————");
        }
    })
).catch(e => {
    console.log(e);
    process.exit(1)
})

// for (const s of sTree) {
//     const p = path.resolve(dest, s.path)
//     if (fs.existsSync(p) && !s.isDotfile) {
//         try {
//             execSync(`/usr/local/Cellar/tag/0.10_1/bin/tag --add ${[...tags, s.tags].join(",")} "${p}"`)
//         } catch (e) {
//             console.log("ERROR WITH", p);
//             console.log(s.basename);
//             console.log(e);
//             console.log("————");
//         }
//     }
// }
console.log("Done.");
process.exit(0)












class Tag {
    has(file, tags) {

    }
}