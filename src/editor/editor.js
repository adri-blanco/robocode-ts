export function setupEditor() {
    const editor = ace.edit("editor");
    editor.setTheme("ace/theme/monokai");
    editor.session.setMode("ace/mode/javascript");
    return editor;
}
export async function compileRobotScript(code) {
    try {
        // Create a function from the code
        const AsyncFunction = Object.getPrototypeOf(async function () { }).constructor;
        const fn = new AsyncFunction(code);
        return await fn();
    }
    catch (error) {
        console.error("Error compiling robot script:", error);
        throw error;
    }
}
//# sourceMappingURL=editor.js.map