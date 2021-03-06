import Life from './util/life';
import { WebviewPanel, window, commands, ExtensionContext } from 'vscode';
import { addTask, delTask, modifyTask, taskFinish, showWebview } from './task';
import { addLink, toLink, delLink } from './link';
import TaskDataProvider from './explorer/TreeDataProvider';
import { auth } from './util/auth';
import './notice';

Life.emit('beforeCreate');

export let extensionContext: ExtensionContext | undefined;
export function activate(context: ExtensionContext) {
    extensionContext = context;
    Life.emit('created');
    const inject = [
        // @ts-ignore
        window.createTreeView('TimeAlert', { treeDataProvider: TaskDataProvider, showCollapseAll: false }),
        commands.registerCommand('timealert.addTask', auth(addTask)),
        commands.registerCommand('timealert.delTask', delTask),
        commands.registerCommand('timealert.modifyTask', modifyTask),
        commands.registerCommand('timealert.taskFinish', taskFinish),
        commands.registerCommand('timealert.addLink', addLink),
        commands.registerCommand('timealert.toLink', toLink),
        commands.registerCommand('timealert.delLink', delLink),
        commands.registerCommand('timealert.refersh', TaskDataProvider.refersh.bind(TaskDataProvider)),
        commands.registerCommand('timealert.openRemark', showWebview.bind(null, context.extensionPath)),
        window.registerWebviewPanelSerializer('view', {
            async deserializeWebviewPanel(webviewPanel: WebviewPanel, state: any) {
                webviewPanel.dispose();
            },
        }),
    ];
    context.subscriptions.push(...inject);
    Life.emit('mounted');
}

export function deactived() {
    Life.emit('unMounted');
}
