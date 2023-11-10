export function extractPaths(obj, tags = [], result = []) {
    if (obj.path) {
        result.push({ path: obj.path, tags });
    }
    if (obj.children) {
        for (const child of obj.children) {
            extractPaths(child, tags, result);
        }
    }
    return result;
}