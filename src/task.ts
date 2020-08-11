import { window } from 'vscode';
import { omit } from 'lodash';

import Life from './util/life';
import TaskModel from './model/task';
import TaskJson from './model/taskJson';

import { addNotice } from './notice';
import { createId } from './util/createHash';
import { resolveTemp } from './util/temp';
import TaskDataProvider from './explorer/TreeDataProvider';
import TaskWebview from './explorer/webview';
import createTaskTemplate from '@root/webview/task/remark';
import select from './component/select';
import valid, { ValidOptions } from './util/valid';
import workSpaceConfig, { TypeConfig } from './util/config';
import Auth from '@/util/auth';

const minute = 1000 * 60;

export async function addTask() {
    const res = await window.showInputBox({
        placeHolder: '请输入一个任务',
    });
    if (!res) return;
    const id = await createId();
    const task = new TaskModel(res, minute * 5, '', id, workSpaceConfig.initialType);
    try {
        const isWrite = await TaskJson.writeTask(async taskJson => {
            const { tasks, map } = taskJson;
            if (!!taskJson.tasks[id]) {
                const confirm = await window.showInformationMessage('任务已经存在，需要覆盖吗', '确定', '取消');
                if (confirm === '取消') return false;
            }
            const index = TaskJson.searchIndex(tasks, map, task.priority);
            map.splice(index, 0, task.id);
            taskJson.tasks[id] = task;
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
    const { id, priority } = task;
    await TaskJson.writeTask(taskJson => {
        const { tasks, total, map } = taskJson;
        const index = TaskJson.searchIndex(tasks, map, priority, false, id);
        delete tasks[id];
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
    children?: { [key: string]: SelectOptions };
}

interface ModifySelection {
    title: SelectOptions;
    remark: SelectOptions;
    noticeIntervalTime: SelectOptions;
    priority: SelectOptions;
    finish: SelectOptions;
}
const modifySelection: ModifySelection = {
    title: {
        placeHolder: '请输入标题',
        label: '标题',
        type: 'string',
        max: 100,
    },
    finish: {
        placeHolder: '请选择要更改的目标状态',
        label: '更改任务状态',
        type: 'string',
        children: {},
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
    const { id, priority, finish } = task;

    const { data, selected, key } = (await select<SelectOptions>(modifySelection, { label: 'label', placeHolder: '请选择一个修改项' })) || {};
    if (!data || !key || !selected) return;
    let value: string | number | undefined;

    const { placeHolder, type = 'string', children = {}, ...validOptions } = data;
    const validHandler = valid({ ...validOptions, type });
    if (Object.keys(children).length) {
        try {
            const { key: childKey } = (await select<SelectOptions>(omit(children, finish.toString()), { label: 'label', placeHolder })) || {};
            value = Number(childKey);
        } catch (error) {
            console.log(error, 'error');
        }
    } else {
        // @ts-ignore
        value = validHandler.to(
            await window.showInputBox({
                placeHolder: placeHolder,
                value: task[key].toString(),
                validateInput: validHandler,
            })
        );
    }

    if (typeof value === 'undefined') return;
    let newValue: string | number = value;
    await TaskJson.writeTask(async taskJson => {
        const { tasks, map } = taskJson;
        const task = tasks[id];
        if (key === 'priority') {
            const index = TaskJson.searchIndex(tasks, map, priority, false, id);
            map.splice(index, 1);
            let newIndex = TaskJson.searchIndex(tasks, map, <number>newValue);
            map.splice(newIndex, 0, id);
        }
        task.updateTime = Date.now();
        task[key] = newValue;
        return taskJson;
    });
    TaskDataProvider.refersh();
}

export async function taskFinish(task: TaskModel) {
    const { id } = task;
    await TaskJson.writeTask(taskJson => {
        const { tasks, total, map } = taskJson;
        const taskItem = tasks[id];
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

function resetConfig(config: TypeConfig[]) {
    modifySelection.finish.children = config.reduce((result: SelectOptions['children'], item) => {
        // @ts-ignore
        result[item.value.toString()] = {
            label: item.label,
            placeHolder: '请选择一个修改后的状态',
        };
        return result;
    }, {});
}

Life.once('created', () => {
    TaskJson.TaskFilePath = resolveTemp('task.json');
    TaskJson.noticeTask();
    addNotice(TaskJson.noticeTask.bind(TaskJson));
    resetConfig(workSpaceConfig.typeConfig as TypeConfig[]);
});

Life.once('beforeCreate', () => {
    workSpaceConfig.on('typeConfig', (newConfig: TypeConfig[]) => {
        resetConfig(newConfig);
        if (!Object.keys(newConfig).some(item => newConfig[Number(item)].value === workSpaceConfig.initialType)) {
            const config = newConfig.find(item => typeof item.value === 'number');
            if (typeof config === 'undefined') return Auth.setIsRun(true);
            return checkInitialType(workSpaceConfig.initialType, config.value);
        }
        if (Auth.isNextRun) Auth.setIsRun(false);
    });

    const checkInitialType = (newInitialType: number, oldNewInitialType: number) => {
        const typeConfig = workSpaceConfig.typeConfig;
        if (!typeConfig.some(({ value }) => newInitialType === value)) {
            window.showErrorMessage(`initialType不能更改为 "${newInitialType}" 它为在typeConfig中声明，将为您修改会 "${oldNewInitialType}"`);
            workSpaceConfig._config.update('timealert.initialType', oldNewInitialType, true, true);
        }
    };
    workSpaceConfig.on('initialType', checkInitialType);
});
