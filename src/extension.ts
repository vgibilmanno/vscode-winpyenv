import * as vscode from 'vscode';
import * as fs from 'fs';
import * as path from 'path';
import { window, workspace, ConfigurationTarget } from 'vscode';

export function activate(context: vscode.ExtensionContext) {
	const selectInterpreterCommandId = 'winpyenv.selectinterpreter';
	let disposable = vscode.commands.registerCommand(selectInterpreterCommandId, () => {
		const userProfile = process.env.USERPROFILE as string;
		const pyEnvPath = path.join(userProfile, '.pyenv', 'pyenv-win');
		const files = getFiles(pyEnvPath, ["Lib"]);
		const pythonPaths = files.filter(fn => fn.name === 'python.exe').map(x => x.path);
		window.showQuickPick(pythonPaths, { placeHolder: "Select interpreter" }).then(selectedPath => {
			const workspaceFolders = workspace.workspaceFolders;
			if (workspaceFolders) {
				const configuration = workspace.getConfiguration("python", workspaceFolders[0].uri);
				configuration.update("pythonPath", selectedPath, ConfigurationTarget.WorkspaceFolder);
			}			
		})
	});

	const selectInterpreterStatusBarItem = window.createStatusBarItem();
	selectInterpreterStatusBarItem.command = selectInterpreterCommandId;
	selectInterpreterStatusBarItem.text = "WinPyenv: Select interpreter";
	selectInterpreterStatusBarItem.show();

	context.subscriptions.push(disposable);
}

export function deactivate() {}

function getFiles(dirPath: string, dirsToIgnore: string[]) {
    const entries = fs.readdirSync(dirPath, { withFileTypes: true });
    const files = entries
        .filter(file => !file.isDirectory())
        .map(file => ({ ...file, path: path.join(dirPath, file.name) }));

    const folders = entries.filter(folder => folder.isDirectory() && !dirsToIgnore.find(x => x === folder.name));
    for (const folder of folders)
        files.push(...getFiles(path.join(dirPath, folder.name), dirsToIgnore));

    return files;
}