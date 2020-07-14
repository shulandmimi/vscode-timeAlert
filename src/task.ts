import { window } from 'vscode';
import { readFile, outputFile, ensureFile } from 'fs-extra';
import { join } from 'path';

import TaskModel, { TaskJson } from './model/task';
import { addNotice } from './notice';
import createHash from './util/createHash';
import { downloadAndUnzipVSCode } from 'vscode-test';

const minute = 1000 * 60;

let taskCache: TaskJson | undefined;

const initialTaskJson = JSON.stringify({ tasks: {}, total: 0 });

export async function addTask() {
    const res = await window.showInputBox({
        placeHolder: '请输入一个任务',
    });
    if (!res) return;

    const task = new TaskModel(res, minute * 5, '');
    try {
        writeTask(async (taskJson: TaskJson) => {
            const hash = await createHash(task.title);
            if (!!taskJson.tasks[hash]) {
                const confirm = await window.showInformationMessage('任务已经存在，需要覆盖吗', '确定', '取消');
                if (confirm === '取消') return false;
            }
            taskJson.tasks[hash] = task;
            taskJson.total++;
            return taskJson;
        });
        window.showInformationMessage('输入成功');
    } catch (error) {
        window.showErrorMessage(error.message);
        console.log(error);
    }
}

export function delTask() {
    console.log('删除');
}

export function modifyTask() {
    console.log('修改');
}

export async function getTaskList() {
    const { tasks } = await readTask();
    const keys = Object.keys(tasks);
    const classify: {
        [key: number]: TaskModel[];
    } = {};
    for (let i = 0; i < keys.length; i++) {
        const task = tasks[keys[i]];
        (classify[task.finish] || (classify[task.finish] = [])).push(task);
    }
    return classify;
}

export async function getTask(id: string) {
    const { tasks } = await readTask();
    return tasks[id];
}

const TaskFilePath = join(__dirname, './store/task.json');

async function writeTask(cb: (taskJson: TaskJson) => Promise<TaskJson | false> | TaskJson | false) {
    await ensureFile(TaskFilePath);
    let taskJson = taskCache || (await readTask());
    if (taskJson !== taskCache) taskCache = taskJson;
    const json = await cb(taskJson);
    if (!json) return false;
    return await outputFile(TaskFilePath, JSON.stringify(json, null, 4));
}

async function readTask(): Promise<TaskJson> {
    await ensureFile(TaskFilePath);
    const json: TaskJson = JSON.parse((await readFile(TaskFilePath)).toString('utf-8') || initialTaskJson);
    return json;
}

async function noticeTask() {
    const { tasks } = await readTask();
    const key = Object.keys(tasks);
    for (let i = 0; i < key.length; i++) window.showInformationMessage(tasks[key[i]].title);
}
addNotice(noticeTask);
