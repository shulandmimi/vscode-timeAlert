import { WebviewPanel, window, commands, ExtensionContext } from 'vscode';
import { addTask, delTask, modifyTask, taskFinish, showWebview } from './task';
import TaskDataProvider from './explorer/TreeDataProvider';
import './notice';

export let extensionContext: ExtensionContext | undefined;
export function activate(context: ExtensionContext) {
    extensionContext = context;
    const inject = [
        window.createTreeView('TimeAlert', { treeDataProvider: TaskDataProvider, showCollapseAll: false }),
        commands.registerCommand('timealert.addTask', addTask),
        commands.registerCommand('timealert.delTask', delTask),
        commands.registerCommand('timealert.modifyTask', modifyTask),
        commands.registerCommand('timealert.taskFinish', taskFinish),
        commands.registerCommand('timealert.refersh', TaskDataProvider.refersh.bind(TaskDataProvider)),
        commands.registerCommand('timealert.openRemark', showWebview.bind(null, context.extensionPath)),
        window.registerWebviewPanelSerializer('view', {
            async deserializeWebviewPanel(webviewPanel: WebviewPanel, state: any) {
                webviewPanel.dispose();
            },
        }),
    ];
    context.subscriptions.push(...inject);
}