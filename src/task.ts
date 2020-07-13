import { window } from 'vscode';
import { readFile, outputFile, ensureFile } from 'fs-extra';
import { join } from 'path';

import TaskModel, { TaskJson } from './model/task';
import { addNotice } from './notice';

const minute = 1000 * 60;

let taskCache: TaskJson | undefined;

const initialTaskJson = JSON.stringify({ tasks: [], total: 0 });

export async function addTask() {
    const res = await window.showInputBox({
        placeHolder: '请输入一个任务',
    });
    if (!res) return;

    const task = new TaskModel(res, minute * 5, '');
    try {
        writeTask(taskJson => {
            taskJson.tasks.push(task);
            taskJson.total++;
            return taskJson;
        });
        window.showInformationMessage('输入成功');
    } catch (error) {
        window.showErrorMessage(error.message);
        console.log(error);
    }
}

export function delTask() {}

export function getTaskList() {}

export function getTask() {}

const TaskFilePath = join(__dirname, './store/task.json');

async function writeTask(cb: (taskJson: TaskJson) => Promise<TaskJson> | TaskJson) {
    await ensureFile(TaskFilePath);
    let taskJson = taskCache || (await readTask());
    if (taskJson !== taskCache) taskCache = taskJson;
    taskJson = await cb(taskJson);
    return await outputFile(TaskFilePath, JSON.stringify(taskJson, null, 4));
}

async function readTask(): Promise<TaskJson> {
    await ensureFile(TaskFilePath);
    const json: TaskJson = JSON.parse((await readFile(TaskFilePath)).toString('utf-8') || initialTaskJson);
    return json;
}

async function noticeTask() {
    const { tasks, total } = await readTask();
    for (let i = 0; i < total; i++) {
        console.log(tasks[i].title, ' ', 'noticeed');
        window.showInformationMessage(tasks[i].title);
    }
}
addNotice(noticeTask);
