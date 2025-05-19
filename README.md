# Run Configuration Extension for VS Code

This extension provides a dropdown menu for preconfigured run commands, similar to JetBrains IDEs. It allows you to save and quickly access your commonly used run commands, and also supports importing configurations from JetBrains run configurations.

## Features

- Dropdown menu for selecting run configurations
- Status bar indicator showing current configuration
- Support for custom run configurations
- Support for JetBrains run configurations (both `.run` files and `workspace.xml`)
- Configuration management (add, edit, remove)
- Configurations are stored in workspace settings (`.vscode/settings.json`)
- Keyboard shortcut (Ctrl+Shift+R / Cmd+Shift+R) to run current configuration

## Usage

1. Open the Command Palette (Ctrl+Shift+P)
2. Type "Run Config" to see available commands:
   - "Run Config: Show Run Configurations" - Opens the configuration dropdown
   - "Run Config: Add Configuration" - Add a new run configuration
   - "Run Config: Edit Configuration" - Edit an existing configuration
   - "Run Config: Remove Configuration" - Remove a configuration
   - "Run Config: Run Current Configuration" - Run the currently selected configuration

## Configuration Storage

Run configurations are stored in your workspace's `.vscode/settings.json` file. This means:

- Configurations are project-specific
- They can be shared with team members through version control
- Each project can have its own set of run configurations
- The configurations will persist with the project

## JetBrains Support

The extension can import run configurations from JetBrains IDEs. It looks for configurations in two locations:

1. `.idea/runConfigurations/*.xml` files
2. `.idea/workspace.xml` file

Currently supported JetBrains configuration types:

- Python configurations (with working directory and parameters)
- More types coming soon!

## Requirements

- VS Code 1.60.0 or higher
- For JetBrains configuration support: `.idea` directory in your project

## Extension Settings

This extension contributes the following settings:

- `runConfig.customConfigurations`: Array of custom run configurations
- `runConfig.jetbrainsConfigurations`: Array of imported JetBrains run configurations

## Keyboard Shortcuts

- `Ctrl+Shift+R` (Windows/Linux) or `Cmd+Shift+R` (macOS): Run the current configuration
- If no configuration is selected, this will open the configuration selector

## Known Issues

- None at the moment

## Release Notes

### 1.0.0

Initial release of Run Configuration Extension:

- Basic run configuration support
- JetBrains configuration import (both `.run` files and `workspace.xml`)
- Status bar integration
- Configuration management UI
- Keyboard shortcuts

## Contributing

Feel free to submit issues and pull requests.

## License

This extension is licensed under the MIT License - see the LICENSE file for details.
