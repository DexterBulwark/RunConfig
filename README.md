# Run Configuration Extension for VS Code

This extension provides a dropdown menu for preconfigured run commands, similar to JetBrains IDEs. It supports both custom configurations and JetBrains run configurations.

## Features

- Quick access to run configurations through a dropdown menu
- Support for JetBrains run configurations (`.idea/runConfigurations/*.xml`)
- Custom run configurations through VS Code settings
- Easy execution of commands in integrated terminal
- Add new configurations through the UI
- Status bar indicator showing current run configuration
- Keyboard shortcuts for quick access

## Usage

### Running Configurations

You can run configurations in several ways:

1. Using the status bar:
   - Click the run configuration indicator in the status bar
   - Select a configuration from the dropdown menu

2. Using the command palette:
   - Press `Ctrl+Shift+P` (or `Cmd+Shift+P` on macOS)
   - Type "Show Run Configurations" and select the command
   - Choose a configuration from the dropdown menu

3. Using keyboard shortcuts:
   - Press `Ctrl+Shift+R` (or `Cmd+Shift+R` on macOS) to run the current configuration
   - If no configuration is selected, it will open the configuration selector

The command will be executed in a new terminal, regardless of which file is currently open.

### Adding New Configurations

You can add new configurations in two ways:

1. Through the UI:
   - Press `Ctrl+Shift+P` (or `Cmd+Shift+P` on macOS)
   - Type "Add Run Configuration" and select the command
   - Enter a name for the configuration
   - Enter the command to run

2. Through VS Code settings:

```json
{
    "runConfig.customConfigurations": [
        {
            "name": "Start Development Server",
            "command": "npm run dev",
            "type": "custom"
        },
        {
            "name": "Run Tests",
            "command": "npm test",
            "type": "custom"
        }
    ]
}
```

## Configuration

You can add custom run configurations in your VS Code settings:

```json
{
    "runConfig.customConfigurations": [
        {
            "name": "Start Development Server",
            "command": "npm run dev",
            "type": "custom"
        },
        {
            "name": "Run Tests",
            "command": "npm test",
            "type": "custom"
        }
    ]
}
```

## JetBrains Configuration Support

The extension automatically detects and imports run configurations from JetBrains IDEs. It looks for configuration files in the `.idea/runConfigurations` directory of your project.

## Requirements

- VS Code 1.85.0 or higher

## Extension Settings

This extension contributes the following settings:

* `runConfig.customConfigurations`: Array of custom run configurations

## Known Issues

- Currently, only basic JetBrains run configurations are supported
- Complex run configurations with multiple steps or environment variables may not be fully supported

## Release Notes

### 0.0.1

Initial release of Run Configuration extension

## Status Bar

The extension adds a status bar item that shows:
- The currently selected run configuration
- A play icon indicating it's a run command
- A tooltip showing the full command

Clicking the status bar item will open the configuration selector.

## Keyboard Shortcuts

- `Ctrl+Shift+R` (Windows/Linux) or `Cmd+Shift+R` (macOS): Run the current configuration
- If no configuration is selected, this will open the configuration selector 