// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
const vscode = require('vscode');
const { exec } = require('child_process');
const path = require('path');

// This method is called when your extension is activated
// Your extension is activated the very first time the command is executed

/**
 * @param {vscode.ExtensionContext} context
 */
function activate(context) {
	// Use the console to output diagnostic information (console.log) and errors (console.error)
	// This line of code will only be executed once when your extension is activated
	console.log('Congratulations, your extension "taskflow-yaml-run" is now active!');

	// 运行任务
	async function runTaskflowJob(editor, filePath) {		
		const command = `./mvnw clean compile exec:java -Dexec.mainClass="com.guandata.test.TestExecutor" -Dexec.args="-f ${filePath}"`;
		try {
			const terminal = vscode.window.terminals.find(t => t.name === 'Taskflow Run') || vscode.window.createTerminal('Taskflow Run');
			terminal.sendText(command);
			terminal.show();
		} catch (error) {
			vscode.window.showErrorMessage(`Failed to run taskflow job: ${error.message}`);
		}
	}
	// 注册命令
	const commandDisposable = vscode.commands.registerCommand('taskflow.runYamlJob', (fileOrDirPath) => {
		const editor = vscode.window.activeTextEditor;
		const currentWorkspacePath = vscode.workspace.rootPath;
		const yamlFileBaseDirPath = path.join(currentWorkspacePath, './src/main/resources')

		const currentYamlFilePath = fileOrDirPath?.fsPath ?? editor.document.uri.fsPath;
		if (currentYamlFilePath.startsWith(yamlFileBaseDirPath)) {
			const relativeYamlFilePath = currentYamlFilePath.slice(yamlFileBaseDirPath.length + 1)
			if (relativeYamlFilePath) {
				console.log('需要执行的yaml文件路径', relativeYamlFilePath)
				runTaskflowJob(editor, relativeYamlFilePath);
				return
			}
		}
		vscode.window.showErrorMessage(`目标文件或文件夹的路径 ${currentYamlFilePath} 不符合运行规范, 路径中必须包含 /src/main/resources/ 目录`);
	});

	context.subscriptions.push(commandDisposable)
}

// This method is called when your extension is deactivated
function deactivate() {}

module.exports = {
	activate,
	deactivate
}
