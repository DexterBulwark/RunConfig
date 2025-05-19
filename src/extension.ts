import * as vscode from 'vscode';
import * as fs from 'fs';
import * as path from 'path';
import * as xml2js from 'xml2js';

interface RunConfiguration {
    name: string;
    command: string;
    type: 'custom' | 'jetbrains';
}

let statusBarItem: vscode.StatusBarItem;
let currentConfig: RunConfiguration | undefined;

export function activate(context: vscode.ExtensionContext) {
    // Create status bar item
    statusBarItem = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Left, 100);
    statusBarItem.command = 'run-config.showRunConfigurations';
    statusBarItem.text = '$(play) No Run Configuration';
    statusBarItem.tooltip = 'Select a run configuration';
    statusBarItem.show();
    context.subscriptions.push(statusBarItem);

    // Show run configurations command
    let showConfigsDisposable = vscode.commands.registerCommand('run-config.showRunConfigurations', async () => {
        const configurations = await getRunConfigurations();
        
        if (configurations.length === 0) {
            vscode.window.showInformationMessage('No run configurations found');
            return;
        }

        const selectedConfig = await vscode.window.showQuickPick(
            configurations.map(config => ({
                label: config.name,
                description: config.command,
                config
            })),
            {
                placeHolder: 'Select a run configuration'
            }
        );

        if (selectedConfig) {
            currentConfig = selectedConfig.config;
            updateStatusBar();
            executeConfiguration(selectedConfig.config);
        }
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

        const config: RunConfiguration = {
            name,
            command,
            type: 'custom'
        };

        // Get current configurations
        const configs = vscode.workspace.getConfiguration('runConfig').get<RunConfiguration[]>('customConfigurations') || [];
        
        // Add new configuration
        configs.push(config);

        // Save to workspace settings
        await vscode.workspace.getConfiguration('runConfig').update('customConfigurations', configs, vscode.ConfigurationTarget.Workspace);

        vscode.window.showInformationMessage(`Added new configuration: ${name}`);
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

        const selectedConfig = await vscode.window.showQuickPick(
            customConfigs.map(config => ({
                label: config.name,
                description: config.command,
                config
            })),
            {
                placeHolder: 'Select a configuration to edit'
            }
        );

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
        const configs = vscode.workspace.getConfiguration('runConfig').get<RunConfiguration[]>('customConfigurations') || [];
        
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

        const selectedConfig = await vscode.window.showQuickPick(
            customConfigs.map(config => ({
                label: config.name,
                description: config.command,
                config
            })),
            {
                placeHolder: 'Select a configuration to remove'
            }
        );

        if (!selectedConfig) {
            return;
        }

        const confirm = await vscode.window.showWarningMessage(
            `Are you sure you want to remove the configuration "${selectedConfig.config.name}"?`,
            { modal: true },
            'Yes',
            'No'
        );

        if (confirm === 'Yes') {
            // Get current configurations
            const configs = vscode.workspace.getConfiguration('runConfig').get<RunConfiguration[]>('customConfigurations') || [];
            
            // Remove the configuration
            const newConfigs = configs.filter(c => c.name !== selectedConfig.config.name);

            // Save to workspace settings
            await vscode.workspace.getConfiguration('runConfig').update('customConfigurations', newConfigs, vscode.ConfigurationTarget.Workspace);

            // Clear current config if it was the one being removed
            if (currentConfig && currentConfig.name === selectedConfig.config.name) {
                currentConfig = undefined;
                updateStatusBar();
            }

            vscode.window.showInformationMessage(`Removed configuration: ${selectedConfig.config.name}`);
        }
    });

    // Add command to run current configuration
    let runCurrentConfigDisposable = vscode.commands.registerCommand('run-config.runCurrentConfiguration', () => {
        if (currentConfig) {
            executeConfiguration(currentConfig);
        } else {
            vscode.commands.executeCommand('run-config.showRunConfigurations');
        }
    });

    // Initialize status bar
    updateStatusBar();
    statusBarItem.show();

    // Add to subscriptions
    context.subscriptions.push(
        showConfigsDisposable,
        addConfigDisposable,
        editConfigDisposable,
        removeConfigDisposable,
        runCurrentConfigDisposable
    );

    // Show status bar item
    statusBarItem.show();
}

function updateStatusBar() {
    if (currentConfig) {
        statusBarItem.text = `$(play) ${currentConfig.name}`;
        statusBarItem.tooltip = `Run: ${currentConfig.command}`;
    } else {
        statusBarItem.text = '$(play) No Run Configuration';
        statusBarItem.tooltip = 'Select a run configuration';
    }
    statusBarItem.show();
}

async function getRunConfigurations(): Promise<RunConfiguration[]> {
    const configurations: RunConfiguration[] = [];
    
    // Get custom configurations from settings
    const customConfigs = vscode.workspace.getConfiguration('runConfig').get<RunConfiguration[]>('customConfigurations') || [];
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

async function findJetBrainsConfigurations(workspacePath: string): Promise<RunConfiguration[]> {
    const configurations: RunConfiguration[] = [];
    
    // Look for .idea/runConfigurations directory
    const runConfigDir = path.join(workspacePath, '.idea', 'runConfigurations');
    const workspaceXmlPath = path.join(workspacePath, '.idea', 'workspace.xml');
    
    // Read configurations from runConfigurations directory
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
                        const name = config.option.find((opt: any) => opt.$.name === 'name')?.value[0] || path.basename(file, '.xml');
                        const command = config.option.find((opt: any) => opt.$.name === 'scriptParameters')?.value[0] || '';
                        
                        configurations.push({
                            name,
                            command,
                            type: 'jetbrains'
                        });
                    }
                } catch (error) {
                    console.error(`Error parsing JetBrains configuration file ${file}:`, error);
                }
            }
        }
    }

    // Read configurations from workspace.xml
    if (fs.existsSync(workspaceXmlPath)) {
        try {
            const content = fs.readFileSync(workspaceXmlPath, 'utf8');
            const parser = new xml2js.Parser();
            const result = await parser.parseStringPromise(content);

            // Find RunManager component
            const runManager = result.project?.component?.find((comp: any) => comp.$.name === 'RunManager');
            if (runManager && runManager.configuration) {
                for (const config of runManager.configuration) {
                    try {
                        const name = config.$.name;
                        const type = config.$.type;
                        let command = '';

                        // Handle Python configurations
                        if (type === 'PythonConfigurationType') {
                            const scriptName = config.option.find((opt: any) => opt.$.name === 'SCRIPT_NAME')?.value[0];
                            const parameters = config.option.find((opt: any) => opt.$.name === 'PARAMETERS')?.value[0] || '';
                            const workingDir = config.option.find((opt: any) => opt.$.name === 'WORKING_DIRECTORY')?.value[0] || '';
                            
                            if (scriptName) {
                                command = `python ${scriptName} ${parameters}`.trim();
                                if (workingDir) {
                                    command = `cd "${workingDir}" && ${command}`;
                                }
                            }
                        }
                        // Add support for other configuration types here if needed

                        if (command) {
                            configurations.push({
                                name,
                                command,
                                type: 'jetbrains'
                            });
                        }
                    } catch (error) {
                        console.error(`Error parsing configuration in workspace.xml:`, error);
                    }
                }
            }
        } catch (error) {
            console.error('Error parsing workspace.xml:', error);
        }
    }
    
    return configurations;
}

function executeConfiguration(config: RunConfiguration) {
    const terminal = vscode.window.createTerminal(config.name);
    terminal.sendText(config.command);
    terminal.show();
}

export function deactivate() {} 