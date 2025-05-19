"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.activate = activate;
exports.deactivate = deactivate;
const vscode = require("vscode");
const fs = require("fs");
const path = require("path");
const xml2js = require("xml2js");
function activate(context) {
    let disposable = vscode.commands.registerCommand('run-config.showRunConfigurations', async () => {
        const configurations = await getRunConfigurations();
        if (configurations.length === 0) {
            vscode.window.showInformationMessage('No run configurations found');
            return;
        }
        const selectedConfig = await vscode.window.showQuickPick(configurations.map(config => ({
            label: config.name,
            description: config.command,
            config
        })), {
            placeHolder: 'Select a run configuration'
        });
        if (selectedConfig) {
            executeConfiguration(selectedConfig.config);
        }
    });
    context.subscriptions.push(disposable);
}
async function getRunConfigurations() {
    const configurations = [];
    // Get custom configurations from settings
    const customConfigs = vscode.workspace.getConfiguration('runConfig').get('customConfigurations') || [];
    configurations.push(...customConfigs);
    // Look for JetBrains run configurations
    const workspaceFolders = vscode.workspace.workspaceFolders;
    if (workspaceFolders) {
        for (const folder of workspaceFolders) {
            const jetbrainsConfigs = await findJetBrainsConfigurations(folder.uri.fsPath);
            configurations.push(...jetbrainsConfigs);
        }
    }
    return configurations;
}
async function findJetBrainsConfigurations(workspacePath) {
    const configurations = [];
    // Look for .idea/runConfigurations directory
    const runConfigDir = path.join(workspacePath, '.idea', 'runConfigurations');
    if (fs.existsSync(runConfigDir)) {
        const files = fs.readdirSync(runConfigDir);
        for (const file of files) {
            if (file.endsWith('.xml')) {
                try {
                    const content = fs.readFileSync(path.join(runConfigDir, file), 'utf8');
                    const parser = new xml2js.Parser();
                    const result = await parser.parseStringPromise(content);
                    if (result.component && result.component.configuration) {
                        const config = result.component.configuration[0];
                        const name = config.option.find((opt) => opt.$.name === 'name')?.value[0] || path.basename(file, '.xml');
                        const command = config.option.find((opt) => opt.$.name === 'scriptParameters')?.value[0] || '';
                        configurations.push({
                            name,
                            command,
                            type: 'jetbrains'
                        });
                    }
                }
                catch (error) {
                    console.error(`Error parsing JetBrains configuration file ${file}:`, error);
                }
            }
        }
    }
    return configurations;
}
function executeConfiguration(config) {
    const terminal = vscode.window.createTerminal(config.name);
    terminal.sendText(config.command);
    terminal.show();
}
function deactivate() { }
//# sourceMappingURL=extension.js.map