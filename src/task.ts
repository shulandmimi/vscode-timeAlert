import { window } from 'vscode';
import { join } from 'path';

import Life from './util/life';
import TaskModel from './model/task';
import TaskJson from './model/taskJson';

import { addNotice } from './notice';
import createHash from './util/createHash';
import { getRoot } from './util/util';
import TaskDataProvider from './explorer/TreeDataProvider';
import TaskWebview from './explorer/webview';
import createTaskTemplate from '@root/webview/task/remark';
import select from './component/select';
import valid, { ValidOptions } from './util/valid';

const minute = 1000 * 60;

export async function addTask() {
    const res = await window.showInputBox({
        placeHolder: '请输入一个任务',
    });
    if (!res) return;
    const hash = await createHash(res);
    const task = new TaskModel(res, minute * 5, '', hash);
    try {
        const isWrite = await TaskJson.writeTask(async taskJson => {
            const { tasks, map } = taskJson;
            if (!!taskJson.tasks[hash]) {
                const confirm = await window.showInformationMessage('任务已经存在，需要覆盖吗', '确定', '取消');
                if (confirm === '取消') return false;
            }
            const index = TaskJson.searchIndex(tasks, map, task.priority);
            map.splice(index, 0, task.hash);
            taskJson.tasks[hash] = task;
            taskJson.total++;
            return taskJson;
        });
        if (!isWrite) return false;
        window.showInformationMessage('输入成功');
        TaskDataProvider.refersh();
    } catch (error) {
        window.showErrorMessage(error.message);
        console.log(error);
    }
}

export async function delTask(task: TaskModel) {
    const { hash, priority } = task;
    await TaskJson.writeTask(taskJson => {
        const { tasks, total, map } = taskJson;
        const index = TaskJson.searchIndex(tasks, map, priority, false, hash);
        delete tasks[hash];
        map.splice(index, 1);
        return {
            tasks,
            total: total - 1,
            map,
        };
    });
    TaskDataProvider.refersh();
}

interface SelectOptions extends ValidOptions {
    placeHolder: string;
    label: string;
}

interface ModifySelection {
    title: SelectOptions;
    remark: SelectOptions;
    noticeIntervalTime: SelectOptions;
    priority: SelectOptions;
}
const modifySelection: ModifySelection = {
    title: {
        placeHolder: '请输入标题',
        label: '标题',
        type: 'string',
        max: 100,
    },
    remark: {
        placeHolder: '请输入备注',
        label: '备注',
        type: 'string',
        max: 1000,
    },
    noticeIntervalTime: {
        placeHolder: '请输入间隔时间',
        label: '间隔时间',
        type: 'number',
    },
    priority: {
        placeHolder: '请输入优先级',
        label: '优先级',
        type: 'number',
    },
};
export async function modifyTask(task: TaskModel) {
    const { hash, priority } = task;

    const { data, selected, key } = (await select<SelectOptions>(modifySelection, { label: 'label', placeHolder: '请选择一个修改项' })) || {};
    if (!data || !key || !selected) return;
    let value: string | number | undefined;

    const { placeHolder, type = 'string', ...validOptions } = data;
    const validHandler = valid({ ...validOptions, type });
    // @ts-ignore
    value = validHandler.to(
        await window.showInputBox({
            placeHolder: placeHolder,
            value: task[key].toString(),
            validateInput: validHandler,
        })
    );

    if (typeof value === 'undefined') return;
    let newValue: string | number = value;
    await TaskJson.writeTask(async taskJson => {
        const { tasks, map } = taskJson;
        const task = tasks[hash];
        if (key === 'title') {
            const newHash = await createHash(newValue as string);
            const index = TaskJson.searchIndex(tasks, map, priority, false, hash);
            map[index] = newHash;
            delete tasks[hash];
            task.hash = newHash;
            tasks[newHash] = task;
        }

        if (key === 'priority') {
            const index = TaskJson.searchIndex(tasks, map, priority, false, hash);
            map.splice(index, 1);
            let newIndex = TaskJson.searchIndex(tasks, map, <number>newValue);
            map.splice(newIndex, 0, hash);
        }
        task.updateTime = Date.now();
        task[key] = newValue;
        return taskJson;
    });
    TaskDataProvider.refersh();
}

export async function taskFinish(task: TaskModel) {
    const { hash } = task;
    await TaskJson.writeTask(taskJson => {
        const { tasks, total, map } = taskJson;
        const taskItem = tasks[hash];
        taskItem.finish = 0;
        taskItem.finishTime = Date.now();
        return {
            tasks,
            total: total - 1,
            map,
        };
    });
    TaskDataProvider.refersh();
}

export async function getTaskList() {
    const { tasks } = await TaskJson.readTask();
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
    const { tasks } = await TaskJson.readTask();
    return tasks[id];
}

export async function showWebview(extensionPath: string, task: TaskModel) {
    const { title } = task;
    TaskWebview.createOrShow(extensionPath);
    const instance = TaskWebview.currentInstance;
    const template = await createTaskTemplate(task);
    instance?.update(template, `task: ${title}`);
}

Life.on('created', () => {
    TaskJson.TaskFilePath = join(getRoot(), 'webview/task.json');
    addNotice(TaskJson.noticeTask.bind(TaskJson));
});
