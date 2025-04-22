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

	// 运行图标的装饰器类型
	const runIconDecorationType = vscode.window.createTextEditorDecorationType({
		before: {
			contentText: '▶',
			color: '#00ff00',
			margin: '0 5px 0 0'
		}
	});

	// 存储当前装饰器的范围
	let decorationRanges = [];

	// 更新装饰器
	function updateDecorations(editor) {
		if (!editor) return;

		const document = editor.document;
		if (document.languageId !== 'yaml') return;

		const text = document.getText();
		const lines = text.split('\n');
		decorationRanges = [];

		for (let i = 0; i < lines.length; i++) {
			const line = lines[i].trim();
			if (line.startsWith('job:')) {
				const range = new vscode.Range(
					new vscode.Position(i, 0),
					new vscode.Position(i, 0)
				);
				decorationRanges.push(range);
			}
		}

		editor.setDecorations(runIconDecorationType, decorationRanges);
	}

	// 运行任务
	async function runTaskflowJob(editor, position) {
		const document = editor.document;
		const filePath = document.uri.fsPath;
		
		const command = `taskflow_run -f "${filePath}"`;
		
		try {
			const terminal = vscode.window.createTerminal('Taskflow Run');
			terminal.sendText(command);
			terminal.show();
		} catch (error) {
			vscode.window.showErrorMessage(`Failed to run taskflow job: ${error.message}`);
		}
	}

	// 监听文档变化
	let disposable = vscode.workspace.onDidChangeTextDocument(event => {
		const editor = vscode.window.activeTextEditor;
		if (editor && event.document === editor.document) {
			updateDecorations(editor);
		}
	});

	// 监听编辑器切换
	disposable = vscode.window.onDidChangeActiveTextEditor(editor => {
		if (editor) {
			updateDecorations(editor);
		}
	});

	// 注册点击事件
	disposable = vscode.window.onDidChangeTextEditorSelection(event => {
		const editor = event.textEditor;
		const position = event.selections[0].active;
		
		const range = decorationRanges.find(range => range.contains(position));
		if (range) {
			runTaskflowJob(editor, position);
		}
	});

	// 注册命令
	let commandDisposable = vscode.commands.registerCommand('taskflow-yaml-run.runJob', () => {
		const editor = vscode.window.activeTextEditor;
		if (editor) {
			const position = editor.selection.active;
			runTaskflowJob(editor, position);
		}
	});

	context.subscriptions.push(disposable, commandDisposable);
}

// This method is called when your extension is deactivated
function deactivate() {}

module.exports = {
	activate,
	deactivate
}
