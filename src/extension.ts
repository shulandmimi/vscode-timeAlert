import * as vscode from 'vscode';
import { addTask, delTask, modifyTask } from './task';
import TaskDataProvider from './explorer/TreeDataProvider';
import './notice';

export function activate(context: vscode.ExtensionContext) {
    const inject = [
        vscode.window.createTreeView('TimeAlert', { treeDataProvider: new TaskDataProvider(), showCollapseAll: false }),
        vscode.commands.registerCommand('timealert.addTask', addTask),
        vscode.commands.registerCommand('timealert.delTask', delTask),
        vscode.commands.registerCommand('timealert.modifyTask', modifyTask),
    ];
    context.subscriptions.push(...inject);
}
