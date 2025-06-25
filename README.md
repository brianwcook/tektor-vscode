# VS Code Tekton Pipeline Validator

A Visual Studio Code extension that validates Tekton YAML pipelines using the [tektor](https://github.com/konflux-ci/tektor) tool.

## Features

- **Real-time validation**: Automatically validates Tekton pipelines as you type
- **Manual validation**: Run validation on demand using the command palette
- **Error highlighting**: Shows validation errors directly in the editor
- **Output channel**: Detailed validation results in a dedicated output panel
- **Configuration**: Customizable tektor executable path

## Prerequisites

1. **tektor tool**: You need to have the tektor tool installed on your system. You can install it by following the instructions in the [tektor repository](https://github.com/konflux-ci/tektor).

2. **VS Code**: This extension requires Visual Studio Code version 1.74.0 or higher.

## Installation

1. Clone this repository
2. Run `npm install` to install dependencies
3. Run `npm run compile` to build the extension
4. Press `F5` in VS Code to launch the extension in a new Extension Development Host window

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

You can configure the path to the tektor executable in VS Code settings:

1. Open VS Code settings (`Ctrl+,` or `Cmd+,`)
2. Search for "Tekton Validator"
3. Set the `tektonValidator.tektorPath` setting to the path of your tektor executable

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

### Packaging the Extension

```bash
npm run vscode:prepublish
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

This project is licensed under the MIT License.

## Acknowledgments

- [tektor](https://github.com/konflux-ci/tektor) - The underlying validation tool
- [Tekton](https://tekton.dev/) - The CI/CD framework this extension supports 