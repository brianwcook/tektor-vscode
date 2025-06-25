# VS Code Tekton Pipeline Validator

A Visual Studio Code extension that validates Tekton YAML pipelines using the [tektor](https://github.com/lcarva/tektor) tool.

## Features

- **Real-time validation**: Automatically validates Tekton pipelines as you type
- **Manual validation**: Run validation on demand using the command palette
- **Error highlighting**: Shows validation errors directly in the editor with diagnostics
- **Output channel**: Detailed validation results in a dedicated output panel
- **Configuration**: Customizable tektor executable path

## Prerequisites

1. **VS Code**: This extension requires Visual Studio Code version 1.74.0 or higher.
2. **tektor tool**: The tektor validation tool is bundled with this extension for the following platforms:
   - macOS ARM64
   - Linux x86_64
   - Windows x86_64
   The extension will automatically select the correct binary for your platform.

> **Note**: If you prefer to use your own tektor installation, you can configure the path in VS Code settings.

## Platform Support

This extension bundles the tektor binary for:
- **macOS ARM64** (`binaries/darwin-arm64/tektor`)
- **Linux x86_64** (`binaries/linux-x64/tektor`)
- **Windows x86_64** (`binaries/win32-x64/tektor.exe`)

If you need support for additional platforms, you can cross-compile tektor using Go and add the binary to the appropriate `binaries/` subdirectory.

## Installation

### For Development

1. Clone this repository:
   ```bash
   git clone <your-repo-url>
   cd vscode-plugin
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Compile the extension:
   ```bash
   npm run compile
   ```

4. Press `F5` in VS Code to launch the extension in a new Extension Development Host window.

### For End Users

1. Install the extension from the VS Code Marketplace (when published)
2. Or install from the `.vsix` file (see Packaging section below)

## Usage

### Automatic Validation

The extension automatically validates Tekton YAML files when:
- You open a YAML file containing Tekton resources
- You make changes to a YAML file (with a 1-second debounce)

### Manual Validation

1. Open a Tekton YAML file
2. Press `Ctrl+Shift+P` (or `Cmd+Shift+P` on macOS) to open the command palette
3. Type "Tekton: Validate Pipeline" and select the command

### Configuration

You can configure the tektor executable path in VS Code settings (optional):

1. Open VS Code settings (`Ctrl+,` or `Cmd+,`)
2. Search for "Tekton Validator"
3. Set the `tektonValidator.tektorPath` setting to the path of your tektor executable

**Default behavior**: The extension uses the bundled tektor binary automatically. Only set a custom path if you want to use a different tektor installation.

## Supported Tekton Resources

The extension validates the following Tekton resource types:
- Pipeline
- Task
- PipelineRun
- TaskRun

## Validation Features

The extension uses tektor to perform the following validations:

- Verify PipelineTasks pass all required parameters to Tasks
- Verify PipelineTasks pass known parameters to Tasks
- Verify PipelineTasks pass parameters of expected types to Tasks
- Verify PipelineTasks use known Task results
- Resolve remote/local Tasks via PaC resolver, Bundles resolver, and embedded Task definitions

## Development

### Building the Extension

```bash
npm install
npm run compile
```

### Running Tests

```bash
npm test
```

### Watching for Changes

```bash
npm run watch
```

## Packaging

### Prerequisites for Packaging

1. Install `vsce` (VS Code Extension Manager):
   ```bash
   npm install -g vsce
   ```

2. Make sure your `package.json` has the required fields:
   - `name`: Extension identifier
   - `displayName`: Human-readable name
   - `description`: Extension description
   - `version`: Extension version
   - `publisher`: Your publisher name (for marketplace publishing)

### Create a .vsix Package

1. Build the extension:
   ```bash
   npm run compile
   ```

2. Package the extension:
   ```bash
   vsce package
   ```

   This will create a `.vsix` file in your project directory.

### Install the .vsix Package

1. In VS Code, open the Command Palette (`Ctrl+Shift+P` or `Cmd+Shift+P`)
2. Type "Extensions: Install from VSIX..."
3. Select your `.vsix` file
4. Restart VS Code when prompted

### Publishing to the VS Code Marketplace

1. Create a publisher account at [Visual Studio Marketplace](https://marketplace.visualstudio.com/)

2. Get a Personal Access Token (PAT) from Azure DevOps

3. Login with vsce:
   ```bash
   vsce login <publisher-name>
   ```

4. Publish the extension:
   ```bash
   vsce publish
   ```

   Or publish a specific version:
   ```bash
   vsce publish patch  # 1.0.0 -> 1.0.1
   vsce publish minor  # 1.0.0 -> 1.1.0
   vsce publish major  # 1.0.0 -> 2.0.0
   ```

## Troubleshooting

### Extension Not Loading

1. Check that the extension compiled successfully:
   ```bash
   npm run compile
   ```

2. Verify `out/extension.js` exists

3. Check the "Log (Extension Host)" output panel for errors

### tektor Not Found

1. Verify tektor is installed:
   ```bash
   which tektor
   ```

2. Update the tektor path in VS Code settings

3. Check that the tektor executable has proper permissions

### Validation Not Working

1. Ensure your YAML file contains Tekton resources (apiVersion: tekton.dev/v1)
2. Check the "Tekton Validator" output panel for detailed error messages
3. Verify the tektor tool can validate your file from the command line

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

This project is licensed under the MIT License.

## Acknowledgments

- [tektor](https://github.com/lcarva/tektor) - The underlying validation tool
- [Tekton](https://tekton.dev/) - The CI/CD framework this extension supports 