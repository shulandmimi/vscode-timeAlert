import * as vscode from 'vscode';
import { addTask, delTask } from './task';
import TaskDataProvider from './explorer/TreeDataProvider';
import './notice';

export function activate(context: vscode.ExtensionContext) {
    context.subscriptions.push(vscode.window.createTreeView('TimeAlert', { treeDataProvider: new TaskDataProvider(), showCollapseAll: false }));
    context.subscriptions.push(vscode.commands.registerCommand('timealert.addTask', addTask));
    context.subscriptions.push(vscode.commands.registerCommand('timealert.delTask', delTask));
}
