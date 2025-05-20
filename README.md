# Run Configuration Extension for VS Code

This extension provides a dropdown menu for preconfigured run commands, similar to JetBrains IDEs. It allows you to save and quickly access your commonly used run commands, and also supports importing configurations from JetBrains run configurations.

## Installation

### Manual Installation

1. Download or clone this repository to your local machine

2. Open a terminal in the extension directory and install dependencies:

   ```bash
   npm install
   ```

3. Build the extension:

   ```bash
   npm run compile
   ```

4. Create the VSIX package:

   ```bash
   npm run package
   ```

   This will create a file named `run-config-0.0.1.vsix` in the extension directory.

5. Install the extension in VS Code:
   - Open VS Code
   - Press `Ctrl+Shift+P` (Windows/Linux) or `Cmd+Shift+P` (macOS)
   - Type "Extensions: Install from VSIX"
   - Navigate to the extension directory and select the `run-config-0.0.1.vsix` file

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

## Requirements

- VS Code 1.60.0 or higher

## Extension Settings

This extension contributes the following settings:

- `runConfig.customConfigurations`: Array of custom run configurations
- `runConfig.jetbrainsConfigurations`: Array of imported JetBrains run configurations

## Keyboard Shortcuts

The extension provides several keyboard shortcuts for quick access to its features:

| Action | Windows/Linux | macOS |
|--------|--------------|-------|
| Run current configuration | `Ctrl+Shift+R` | `Cmd+Shift+R` |
| Show all configurations | `Ctrl+Shift+C` | `Cmd+Shift+C` |
| Add new configuration | `Ctrl+Shift+A` | `Cmd+Shift+A` |

All shortcuts are available when you have focus in the editor.

## Commands

The extension provides the following commands:

- `Run Config: Show Run Configurations` - Display all available configurations
- `Run Config: Add Configuration` - Create a new run configuration
- `Run Config: Edit Configuration` - Modify an existing configuration
- `Run Config: Remove Configuration` - Delete a configuration
- `Run Config: Run Current Configuration` - Execute the currently selected configuration
- `Run Config: Refresh Configurations` - Reload all configurations

## Known Issues

- None at the moment

## Release Notes

### 1.0.0

Initial release of Run Configuration Extension:

- Basic run configuration support
- Status bar integration
- Configuration management UI
- Keyboard shortcuts

## Contributing

Feel free to submit issues and pull requests.

## License

This extension is licensed under the MIT License - see the LICENSE file for details.
