import * as vscode from 'vscode';
import { addTask, delTask, modifyTask, taskFinish } from './task';
import TaskDataProvider from './explorer/TreeDataProvider';
import './notice';

export function activate(context: vscode.ExtensionContext) {
    const inject = [
        vscode.window.createTreeView('TimeAlert', { treeDataProvider: TaskDataProvider, showCollapseAll: false }),
        vscode.commands.registerCommand('timealert.addTask', addTask),
        vscode.commands.registerCommand('timealert.delTask', delTask),
        vscode.commands.registerCommand('timealert.modifyTask', modifyTask),
        vscode.commands.registerCommand('timealert.taskFinish', taskFinish),
        vscode.commands.registerCommand('timealert.refersh', TaskDataProvider.refersh.bind(TaskDataProvider)),
    ];
    context.subscriptions.push(...inject);
}
