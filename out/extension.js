"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.activate = activate;
exports.deactivate = deactivate;
const vscode = require("vscode");
const fs = require("fs");
const path = require("path");
const xml2js = require("xml2js");
let statusBarItem;
let currentConfig;
function activate(context) {
    // Create status bar item
    statusBarItem = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Left, 100);
    statusBarItem.command = 'run-config.showRunConfigurations';
    context.subscriptions.push(statusBarItem);
    // Show run configurations command
    let showConfigsDisposable = vscode.commands.registerCommand('run-config.showRunConfigurations', async () => {
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
            currentConfig = selectedConfig.config;
            updateStatusBar();
            executeConfiguration(selectedConfig.config);
        }
    });
    // Add new configuration command
    let addConfigDisposable = vscode.commands.registerCommand('run-config.addConfiguration', async () => {
        const name = await vscode.window.showInputBox({
            prompt: 'Enter a name for the configuration',
            placeHolder: 'e.g., Start Development Server'
        });
        if (!name) {
            return;
        }
        const command = await vscode.window.showInputBox({
            prompt: 'Enter the command to run',
            placeHolder: 'e.g., npm run dev'
        });
        if (!command) {
            return;
        }
        const config = {
            name,
            command,
            type: 'custom'
        };
        // Get current configurations
        const configs = vscode.workspace.getConfiguration('runConfig').get('customConfigurations') || [];
        // Add new configuration
        configs.push(config);
        // Save to settings
        await vscode.workspace.getConfiguration('runConfig').update('customConfigurations', configs, vscode.ConfigurationTarget.Global);
        vscode.window.showInformationMessage(`Added new configuration: ${name}`);
    });
    // Add command to run current configuration
    let runCurrentConfigDisposable = vscode.commands.registerCommand('run-config.runCurrentConfiguration', () => {
        if (currentConfig) {
            executeConfiguration(currentConfig);
        }
        else {
            vscode.commands.executeCommand('run-config.showRunConfigurations');
        }
    });
    // Add keyboard shortcut for running current configuration
    context.subscriptions.push(vscode.commands.registerCommand('run-config.runCurrentConfiguration', () => {
        if (currentConfig) {
            executeConfiguration(currentConfig);
        }
        else {
            vscode.commands.executeCommand('run-config.showRunConfigurations');
        }
    }));
    // Initialize status bar
    updateStatusBar();
    statusBarItem.show();
    context.subscriptions.push(showConfigsDisposable, addConfigDisposable, runCurrentConfigDisposable);
}
function updateStatusBar() {
    if (currentConfig) {
        statusBarItem.text = `$(play) ${currentConfig.name}`;
        statusBarItem.tooltip = `Run: ${currentConfig.command}`;
    }
    else {
        statusBarItem.text = '$(play) No Run Configuration';
        statusBarItem.tooltip = 'Select a run configuration';
    }
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