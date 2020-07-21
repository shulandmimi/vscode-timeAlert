import { window, Position, TextDocument, Range, workspace, Uri, ViewColumn } from 'vscode';
import TaskModel from '@/model/task';
import Link from '@/model/link';
import { writeTask } from './task';

export async function addLink(task: TaskModel) {
    const { hash } = task;
    if (typeof window.activeTextEditor === 'undefined') return window.showErrorMessage('请进入到一个文件或一个文件中的段落');
    const { selection, document } = window.activeTextEditor;
    const range = new Range(selection.start, selection.end);
    const newLink = new Link(document.uri.path, range);

    await writeTask(taskJson => {
        const { tasks } = taskJson;
        tasks[hash].link.push(newLink);
        return taskJson;
    });

    window.showInformationMessage('添加链接锚点成功');
}

export async function toLink(link: Link) {
    if (!link) return;
    const { range, file } = link;
    const newUri = Uri.file(file);
    console.log(newUri);
    const document = await workspace.openTextDocument(newUri);
    console.log(document, 'document');
    try {
        console.log(
            await window.showTextDocument(document, {
                preview: false,
            }),
            'showTextDOcument'
        );
    } catch (error) {
        console.log(error, 'error');
    }
}
