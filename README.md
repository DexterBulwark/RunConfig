# Run Configuration Extension for VS Code

This extension provides a dropdown menu for preconfigured run commands, similar to JetBrains IDEs. It supports both custom configurations and JetBrains run configurations.

## Features

- Quick access to run configurations through a dropdown menu
- Support for JetBrains run configurations (`.idea/runConfigurations/*.xml`)
- Custom run configurations through VS Code settings
- Easy execution of commands in integrated terminal
- Add new configurations through the UI

## Usage

### Running Configurations

1. Press `Ctrl+Shift+P` (or `Cmd+Shift+P` on macOS)
2. Type "Show Run Configurations" and select the command
3. Choose a configuration from the dropdown menu
4. The command will be executed in a new terminal

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