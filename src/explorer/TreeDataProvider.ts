import { TreeDataProvider, TreeItem, EventEmitter, Disposable } from 'vscode';
import { getTaskList } from '../task';
import TaskModel from '../model/task';

let tasks: { [key: string]: TaskModel[] };

const reverse = (target: any) => {
    const keys = Object.keys(target);
    target = { ...target };
    for (let i = 0; i < keys.length; i++) {
        const key = keys[i];
        target[target[key].toString()] = key;
    }
    return target;
};
const rawTitle = {
    '1': '未完成',
    '0': '完成',
    '2': '待定',
};

const key2title: { [key: string]: string } = reverse(rawTitle);

const contextValue = {
    '0': 'finish',
    '1': 'undone',
    '2': 'delay',
};

export default class TaskDataProvider implements TreeDataProvider<TaskModel | string> {
    constructor() {
        this.init();
    }

    protected _onDidChangeTreeData = new EventEmitter<TaskModel | string>();

    get onDidChangeTreeData() {
        return this._onDidChangeTreeData.event;
    }

    async init() {
        tasks = await getTaskList();
    }

    getChildren(ele: TaskModel | string) {
        if (!ele) {
            const title = Object.keys(rawTitle);
            return title.map(item => key2title[item]);
        }
        if (typeof ele === 'string') return tasks[key2title[ele]];
        return;
    }

    getTreeItem(task: TaskModel | string) {
        if (typeof task === 'string') return new TreeItem(task, 1);
        const { title, updateTime, hash, remark } = task;
        const tree = new TreeItem(title, 0);
        tree.tooltip = `最后更新时间: ${new Date(updateTime).toLocaleString()}\n\n${remark}`;
        tree.contextValue = contextValue[task.finish];
        tree.id = hash;
        return tree;
    }

    refersh() {}
}
