import * as vscode from 'vscode';
import * as yaml from 'js-yaml';
import { spawn } from 'child_process';
import * as path from 'path';
import * as fs from 'fs';
import * as os from 'os';

export function activate(context: vscode.ExtensionContext) {
    console.log('Tekton Validator extension is now active!');
    
    // Register the test command
    let testDisposable = vscode.commands.registerCommand('tektonValidator.test', () => {
        console.log('Test command triggered');
        vscode.window.showInformationMessage('Tekton extension test command works!');
        
        // Also log to output channel
        const outputChannel = vscode.window.createOutputChannel('Tekton Validator');
        outputChannel.appendLine('Test command was triggered successfully!');
        outputChannel.show();
    });

    // Register the validate pipeline command
    let validateDisposable = vscode.commands.registerCommand('tektonValidator.validatePipeline', async () => {
        console.log('Validate pipeline command triggered');
        const editor = vscode.window.activeTextEditor;
        if (!editor) {
            vscode.window.showErrorMessage('No active editor found');
            return;
        }

        const document = editor.document;
        if (document.languageId !== 'yaml') {
            vscode.window.showErrorMessage('Current file is not a YAML file');
            return;
        }

        await validateTektonPipeline(document);
    });

    // Register YAML document open listener for immediate validation
    let yamlOpenListener = vscode.workspace.onDidOpenTextDocument(async (document: vscode.TextDocument) => {
        if (document.languageId === 'yaml') {
            console.log('YAML file opened, triggering validation');
            validateTektonPipeline(document);
        }
    });

    context.subscriptions.push(testDisposable, validateDisposable, yamlOpenListener);
    console.log('Tekton Validator extension activation completed');
}

async function validateTektonPipeline(document: vscode.TextDocument): Promise<void> {
    console.log('validateTektonPipeline called for document:', document.fileName);
    
    try {
        // Check if the document contains Tekton resources
        const content = document.getText();
        console.log('Document content length:', content.length);
        
        const yamlDocs = yaml.loadAll(content) as any[];
        console.log('Number of YAML documents:', yamlDocs.length);
        
        let hasTektonResources = false;
        for (const doc of yamlDocs) {
            if (doc && doc.apiVersion && (
                doc.apiVersion.includes('tekton.dev') ||
                doc.kind === 'Pipeline' ||
                doc.kind === 'Task' ||
                doc.kind === 'PipelineRun' ||
                doc.kind === 'TaskRun'
            )) {
                hasTektonResources = true;
                console.log('Found Tekton resource:', doc.kind, doc.apiVersion);
                break;
            }
        }

        if (!hasTektonResources) {
            console.log('No Tekton resources found, skipping validation');
            return; // Not a Tekton file, skip validation
        }

        console.log('Tekton resources found, proceeding with validation');

        // Get tektor path from configuration
        const config = vscode.workspace.getConfiguration('tektonValidator');
        const tektorPath = config.get<string>('tektorPath', '/Users/bcook/go/bin/tektor');
        console.log('Using tektor path:', tektorPath);

        // Create a temporary file for validation
        const tempFile = path.join(os.tmpdir(), `tekton-${Date.now()}.yaml`);
        fs.writeFileSync(tempFile, content);
        console.log('Created temp file:', tempFile);

        // Run tektor validation
        console.log('Calling tektor validation...');
        const result = await runTektorValidation(tektorPath, tempFile);
        console.log('Tektor validation completed, result length:', result.length);
        
        // Clean up temp file
        fs.unlinkSync(tempFile);
        console.log('Cleaned up temp file');

        // Display results
        displayValidationResults(result, document);

    } catch (error) {
        console.error('Error validating Tekton pipeline:', error);
        vscode.window.showErrorMessage(`Error validating Tekton pipeline: ${error}`);
    }
}

function runTektorValidation(tektorPath: string, filePath: string): Promise<string> {
    return new Promise((resolve, reject) => {
        const process = spawn(tektorPath, ['validate', filePath], {
            stdio: ['pipe', 'pipe', 'pipe']
        });

        let stdout = '';
        let stderr = '';

        process.stdout.on('data', (data: Buffer) => {
            stdout += data.toString();
        });

        process.stderr.on('data', (data: Buffer) => {
            stderr += data.toString();
        });

        process.on('close', (code: number | null) => {
            if (code === 0) {
                resolve(stdout);
            } else {
                resolve(stderr || stdout); // tektor outputs errors to stdout
            }
        });

        process.on('error', (error: Error) => {
            reject(new Error(`Failed to run tektor: ${error.message}`));
        });
    });
}

function displayValidationResults(result: string, document: vscode.TextDocument): void {
    console.log('Tekton validation result:', result);
    console.log('Result length:', result.length);
    
    // Parse tektor output and create diagnostics
    const diagnostics: vscode.Diagnostic[] = [];
    
    // Check if the result contains validation errors
    if (result.includes('Error:') || result.includes('error occurred:') || result.includes('invalid value:')) {
        console.log('Found validation errors in result');
        
        // Create a diagnostic for the entire document since tektor doesn't provide line numbers
        const range = new vscode.Range(0, 0, document.lineCount - 1, 0);
        
        // Extract the error message
        const lines = result.split('\n');
        let errorMessage = '';
        for (const line of lines) {
            if (line.includes('Error:') || line.includes('error occurred:') || line.includes('invalid value:') || line.includes('* ')) {
                errorMessage += line.trim() + ' ';
            }
        }
        
        console.log('Extracted error message:', errorMessage);
        
        if (errorMessage.trim()) {
            const diagnostic = new vscode.Diagnostic(
                range,
                errorMessage.trim(),
                vscode.DiagnosticSeverity.Error
            );
            diagnostics.push(diagnostic);
            console.log('Created diagnostic:', diagnostic);
        }
    } else {
        console.log('No validation errors found in result');
    }

    // Create a diagnostic collection for this document
    const diagnosticCollection = vscode.languages.createDiagnosticCollection('tekton-validator');
    diagnosticCollection.set(document.uri, diagnostics);
    console.log('Set diagnostics for document:', document.uri, 'Count:', diagnostics.length);

    // Show summary in output channel
    const outputChannel = vscode.window.createOutputChannel('Tekton Validator');
    outputChannel.clear();
    outputChannel.appendLine('Tekton Pipeline Validation Results:');
    outputChannel.appendLine('==================================');
    outputChannel.append(result);
    outputChannel.show();

    // Show notification
    if (diagnostics.length === 0) {
        vscode.window.showInformationMessage('Tekton pipeline validation passed!');
    } else {
        vscode.window.showWarningMessage(`Tekton pipeline validation found ${diagnostics.length} issue(s). Check the output for details.`);
    }
}

export function deactivate() {} 