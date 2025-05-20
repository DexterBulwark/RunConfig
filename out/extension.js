"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.deactivate = exports.activate = void 0;
const vscode = require("vscode");
let statusBarItem;
let currentConfig;
function activate(context) {
    // Create status bar item
    statusBarItem = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Left, 100);
    statusBarItem.command = 'run-config.showRunConfigurations';
    statusBarItem.text = '$(play) No Run Configuration';
    statusBarItem.tooltip = 'Select a run configuration';
    statusBarItem.show();
    context.subscriptions.push(statusBarItem);
    // Load last used configuration
    const lastConfig = context.globalState.get('lastRunConfig');
    if (lastConfig) {
        currentConfig = lastConfig;
        updateStatusBar();
    }
    // Show run configurations command
    let showConfigsDisposable = vscode.commands.registerCommand('run-config.showRunConfigurations', async () => {
        const configurations = await getRunConfigurations();
        if (configurations.length === 0) {
            const addConfig = await vscode.window.showInformationMessage('No run configurations found. Would you like to add one?', 'Yes', 'No');
            if (addConfig === 'Yes') {
                vscode.commands.executeCommand('run-config.addConfiguration');
            }
            return;
        }
        // Group configurations by category
        const groupedConfigs = configurations.reduce((groups, config) => {
            const category = config.category || 'Other';
            if (!groups[category]) {
                groups[category] = [];
            }
            groups[category].push(config);
            return groups;
        }, {});
        // Create quick pick items with categories
        const items = Object.entries(groupedConfigs).flatMap(([category, configs]) => [
            { label: category, kind: vscode.QuickPickItemKind.Separator },
            ...configs.map(config => ({
                label: config.name,
                description: config.command,
                detail: config.command,
                config
            }))
        ]);
        const selectedConfig = await vscode.window.showQuickPick(items, {
            placeHolder: 'Select a run configuration'
        });
        if (selectedConfig && 'config' in selectedConfig) {
            currentConfig = selectedConfig.config;
            // Save the selected configuration
            await context.globalState.update('lastRunConfig', currentConfig);
            updateStatusBar();
            executeConfiguration(selectedConfig.config);
        }
    });
    // Add refresh command
    let refreshConfigsDisposable = vscode.commands.registerCommand('run-config.refreshConfigurations', async () => {
        const configurations = await getRunConfigurations();
        vscode.window.showInformationMessage(`Found ${configurations.length} run configurations`);
    });
    // Add new configuration command
    let addConfigDisposable = vscode.commands.registerCommand('run-config.addConfiguration', async () => {
        if (!vscode.workspace.workspaceFolders) {
            vscode.window.showErrorMessage('Please open a workspace folder first');
            return;
        }
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
        // Save to workspace settings
        await vscode.workspace.getConfiguration('runConfig').update('customConfigurations', configs, vscode.ConfigurationTarget.Workspace);
        // Set as current configuration
        currentConfig = config;
        // Save the selected configuration
        await context.globalState.update('lastRunConfig', currentConfig);
        updateStatusBar();
        const action = await vscode.window.showInformationMessage(`Added new configuration: ${name}`, 'Run Now', 'Add Another', 'Close');
        if (action === 'Run Now') {
            executeConfiguration(config);
        }
        else if (action === 'Add Another') {
            vscode.commands.executeCommand('run-config.addConfiguration');
        }
    });
    // Edit configuration command
    let editConfigDisposable = vscode.commands.registerCommand('run-config.editConfiguration', async () => {
        if (!vscode.workspace.workspaceFolders) {
            vscode.window.showErrorMessage('Please open a workspace folder first');
            return;
        }
        const configurations = await getRunConfigurations();
        const customConfigs = configurations.filter(config => config.type === 'custom');
        if (customConfigs.length === 0) {
            vscode.window.showInformationMessage('No custom configurations found to edit');
            return;
        }
        const selectedConfig = await vscode.window.showQuickPick(customConfigs.map(config => ({
            label: config.name,
            description: config.command,
            config
        })), {
            placeHolder: 'Select a configuration to edit'
        });
        if (!selectedConfig) {
            return;
        }
        const newName = await vscode.window.showInputBox({
            prompt: 'Enter a new name for the configuration',
            placeHolder: 'e.g., Start Development Server',
            value: selectedConfig.config.name
        });
        if (!newName) {
            return;
        }
        const newCommand = await vscode.window.showInputBox({
            prompt: 'Enter the new command to run',
            placeHolder: 'e.g., npm run dev',
            value: selectedConfig.config.command
        });
        if (!newCommand) {
            return;
        }
        // Get current configurations
        const configs = vscode.workspace.getConfiguration('runConfig').get('customConfigurations') || [];
        // Update the configuration
        const index = configs.findIndex(c => c.name === selectedConfig.config.name);
        if (index !== -1) {
            configs[index] = {
                name: newName,
                command: newCommand,
                type: 'custom'
            };
            // Save to workspace settings
            await vscode.workspace.getConfiguration('runConfig').update('customConfigurations', configs, vscode.ConfigurationTarget.Workspace);
            // Update current config if it was the one being edited
            if (currentConfig && currentConfig.name === selectedConfig.config.name) {
                currentConfig = configs[index];
                // Save the updated configuration
                await context.globalState.update('lastRunConfig', currentConfig);
                updateStatusBar();
            }
            vscode.window.showInformationMessage(`Updated configuration: ${newName}`);
        }
    });
    // Remove configuration command
    let removeConfigDisposable = vscode.commands.registerCommand('run-config.removeConfiguration', async () => {
        if (!vscode.workspace.workspaceFolders) {
            vscode.window.showErrorMessage('Please open a workspace folder first');
            return;
        }
        const configurations = await getRunConfigurations();
        const customConfigs = configurations.filter(config => config.type === 'custom');
        if (customConfigs.length === 0) {
            vscode.window.showInformationMessage('No custom configurations found to remove');
            return;
        }
        const selectedConfig = await vscode.window.showQuickPick(customConfigs.map(config => ({
            label: config.name,
            description: config.command,
            config
        })), {
            placeHolder: 'Select a configuration to remove'
        });
        if (!selectedConfig) {
            return;
        }
        const confirm = await vscode.window.showWarningMessage(`Are you sure you want to remove the configuration "${selectedConfig.config.name}"?`, { modal: true }, 'Yes', 'No');
        if (confirm === 'Yes') {
            // Get current configurations
            const configs = vscode.workspace.getConfiguration('runConfig').get('customConfigurations') || [];
            // Remove the configuration
            const newConfigs = configs.filter(c => c.name !== selectedConfig.config.name);
            // Save to workspace settings
            await vscode.workspace.getConfiguration('runConfig').update('customConfigurations', newConfigs, vscode.ConfigurationTarget.Workspace);
            // Clear current config if it was the one being removed
            if (currentConfig && currentConfig.name === selectedConfig.config.name) {
                currentConfig = undefined;
                // Clear the saved configuration
                await context.globalState.update('lastRunConfig', undefined);
                updateStatusBar();
            }
            vscode.window.showInformationMessage(`Removed configuration: ${selectedConfig.config.name}`);
        }
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
    // Initialize status bar
    updateStatusBar();
    statusBarItem.show();
    // Add to subscriptions
    context.subscriptions.push(showConfigsDisposable, addConfigDisposable, editConfigDisposable, removeConfigDisposable, runCurrentConfigDisposable, refreshConfigsDisposable);
    // Show status bar item
    statusBarItem.show();
}
exports.activate = activate;
function updateStatusBar() {
    if (currentConfig) {
        statusBarItem.text = `$(play) ${currentConfig.name}`;
        statusBarItem.tooltip = currentConfig.command;
    }
    else {
        statusBarItem.text = '$(play) No Run Configuration';
        statusBarItem.tooltip = 'Select a run configuration';
    }
    statusBarItem.show();
}
async function getRunConfigurations() {
    // Get custom configurations from settings
    return vscode.workspace.getConfiguration('runConfig').get('customConfigurations') || [];
}
function executeConfiguration(config) {
    try {
        const terminal = vscode.window.createTerminal({
            name: config.name,
            env: config.env
        });
        terminal.sendText(config.command);
        terminal.show();
    }
    catch (error) {
        vscode.window.showErrorMessage(`Failed to execute configuration: ${error.message}`);
    }
}
function deactivate() { }
exports.deactivate = deactivate;
//# sourceMappingURL=extension.js.map