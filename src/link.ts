import { window, Position, Range, workspace, Uri } from 'vscode';
import path from 'path';

import TaskDataProvider from '@/explorer/TreeDataProvider';
import TaskModel from '@/model/task';
import Link from '@/model/link';
import TaskJson from '@/model/taskJson';
import createHash from '@/util/createHash';

export async function addLink(task: TaskModel) {
    const { hash } = task;
    if (typeof window.activeTextEditor === 'undefined') return window.showErrorMessage('请进入到一个文件或一个文件中的段落');
    const { selection, document } = window.activeTextEditor;
    const { rootPath } = workspace;
    const fileUri = document.uri.fsPath;
    let root = '';

    if (rootPath && fileUri.indexOf(rootPath) === 0) root = rootPath || '';

    const relative = path.relative(path.join(root, root ? '../' : ''), fileUri);
    const LinkHash = await createHash(`${fileUri}${JSON.stringify([selection.start, selection.end])}`);
    const newLink = new Link(fileUri, root, relative, [selection.start, selection.end], LinkHash);
    await TaskJson.writeTask(taskJson => {
        const { tasks } = taskJson;
        tasks[hash].link[LinkHash] = newLink;
        return taskJson;
    });
    await TaskDataProvider.refersh();
    window.showInformationMessage('添加链接锚点成功');
}

export async function toLink(link: Link) {
    if (!link) return;
    const {
        range: [start, end],
        file,
    } = link;
    const newUri = Uri.file(file);
    const statuBar = window.createStatusBarItem(1);

    statuBar.text = 'timealert: 正在打开文件';
    statuBar.show();
    try {
        await window.showTextDocument(newUri, {
            preview: false,
            selection: new Range(new Position(start.line, start.character), new Position(end.line, end.character)),
        });
    } catch (error) {
        console.log(error, 'error');
    }
    statuBar.hide();
    statuBar.dispose();
}

export async function delLink(link: Link) {
    if(!link || !link.parent) return;
    const { hash, parent } = link;
    await TaskJson.writeTask(taskJson => {
        const { tasks } = taskJson;
        delete tasks[parent.hash].link[hash];
        return taskJson;
    });
    await TaskDataProvider.refersh();
}