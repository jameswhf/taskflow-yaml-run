// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
const vscode = require('vscode');
const path = require('path');
const fs = require('fs');

function findExistJavaFile (javaClassName) {
	const javaClassPath = javaClassName.replace(/\./g, '/') + '.java';
	const folders = vscode.workspace.workspaceFolders || []
	for (let i = 0; i < folders.length; i++) {
		const rootDir = folders[i].uri.fsPath
		const javaFilePath = path.join(rootDir, './src/main/java/', javaClassPath)
		if (fs.existsSync(javaFilePath)) {
			return javaFilePath
		}
	}
	return null
}

function getJavaFilePreview (javaFilePath) {
	try {
		const content = fs.readFileSync(javaFilePath, 'utf8');
		let lines = content.split('\n');
		const index = lines.findIndex(line => line.startsWith('@') || line.startsWith('public class'))
		if (index !== -1) {
			lines = lines.slice(index)
		}
		// 限制预览行数
		const MAX_LINES = 100;
		if (lines.length > MAX_LINES) {
			return lines.slice(0, MAX_LINES).join('\n') + '\n... (显示前100行)';
		}
		return lines.join('\n');
	} catch (error) {
		console.error('读取Java文件失败:', error);
		return undefined;
	}
}

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
		const command = `./mvnw clean compile exec:java -Dexec.mainClass="com.guandata.test.TestExecutor" -Dexec.args="-f ${filePath}" && open report/result_report.html`;
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
		const currentWorkspacePath = vscode.workspace.workspaceFolders[0].uri.fsPath;
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

	// 注册 yaml 中 clazz 识别和跳转
    const hoverProvider = vscode.languages.registerHoverProvider('yaml', {
        provideHover(document, position) {
            const line = document.lineAt(position.line);
            const text = line.text;

            // 匹配 clazz: "com.guandata.test.abc" 格式
            const clazzMatch = text.match(/clazz:\s*"([^"]+)"/);
            if (clazzMatch) {
                const javaClassName = clazzMatch[1];
				const realFilePath = findExistJavaFile(javaClassName)
				if (!realFilePath) {
					return new vscode.Hover(`未找到类: ${javaClassName}`);
				}
				const javaPreview = getJavaFilePreview(realFilePath)
				const markdownContent = new vscode.MarkdownString();
				markdownContent.appendMarkdown('**Task代码预览**:');
				markdownContent.appendMarkdown(`[点击跳转到 ${javaClassName}](${realFilePath})`);
				markdownContent.appendText('\n\n');
				markdownContent.appendCodeblock(javaPreview, 'java');

				// 允许在Markdown中使用命令
				markdownContent.isTrusted = true;
				return new vscode.Hover(markdownContent);
            }
            return null;
        }
    });
	context.subscriptions.push(hoverProvider)
}

// This method is called when your extension is deactivated
function deactivate() {}

module.exports = {
	activate,
	deactivate
}
