import { window } from 'vscode';
import { readFile, outputFile, ensureFile } from 'fs-extra';
import { join } from 'path';

import TaskModel, { TaskJson } from './model/task';
import { addNotice } from './notice';
import createHash from './util/createHash';
import TaskDataProvider from './explorer/TreeDataProvider';

const minute = 1000 * 60;

let taskCache: TaskJson | undefined;

const initialTaskJson = JSON.stringify({ tasks: {}, total: 0 });

export async function addTask() {
    const res = await window.showInputBox({
        placeHolder: '请输入一个任务',
    });
    if (!res) return;
    const hash = await createHash(res);
    const task = new TaskModel(res, minute * 5, '', hash);
    try {
        writeTask(async (taskJson: TaskJson) => {
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

export async function delTask(task: TaskModel) {
    const { hash } = task;
    writeTask((taskJson: TaskJson) => {
        const { tasks, total } = taskJson;
        delete tasks[hash];
        return {
            tasks,
            total: total - 1,
        };
    });
}

export async function modifyTask(task: TaskModel) {
    const { hash, title } = task;
    const value = await window.showInputBox({
        placeHolder: '请输入修改后的内容',
        value: title,
        validateInput(value) {
            if (value === title) return '和修改前内容一样，请修改后提交';
            if (!value) return '输入不能为空';
        },
    });
    if (!value) return;

    const newHash = await createHash(value);
    await writeTask(taskJson => {
        const { tasks } = taskJson;
        const task = tasks[hash];
        delete tasks[hash];
        task.updateTime = Date.now();
        task.title = value;
        task.hash = newHash;
        tasks[newHash] = task;
        return taskJson;
    });
    TaskDataProvider.refersh();
}

export async function taskFinish(task: TaskModel) {
    const { hash } = task;
    await writeTask((taskJson: TaskJson) => {
        const { tasks, total } = taskJson;
        const taskItem = tasks[hash];
        taskItem.finish = 0;
        taskItem.finishTime = Date.now();
        return {
            tasks,
            total: total - 1,
        };
    });
    TaskDataProvider.refersh();
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

async function writeTask(cb: (taskJson: TaskJson) => Promise<TaskJson | false> | TaskJson | false): Promise<boolean> {
    await ensureFile(TaskFilePath);
    let taskJson = taskCache || (await readTask());
    if (taskJson !== taskCache) taskCache = taskJson;
    const json = await cb(taskJson);
    if (!json) return false;
    await outputFile(TaskFilePath, JSON.stringify(json, null, 4));
    return true;
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
