import { TreeDataProvider, TreeItem, EventEmitter } from 'vscode';
import Link from '@/model/link';
import { getTaskList } from '@/task';
import TaskModel from '@/model/task';

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

class TaskDataProvider implements TreeDataProvider<TaskModel | Link | string> {
    protected _onDidChangeTreeData = new EventEmitter<TaskModel | Link | string | undefined>();

    get onDidChangeTreeData() {
        return this._onDidChangeTreeData.event;
    }

    async getChildren(ele?: TaskModel | string) {
        if (!ele) {
            if (!tasks) await this.refershTask();
            const title = Object.keys(rawTitle);
            return title.map(item => key2title[item]);
        }
        if (typeof ele === 'string') return tasks[key2title[ele]];
        if (ele.hash) return Object.keys(ele.link).map(item => {
            const newItem = {
                ...ele.link[item],
                parent: ele,
            }
            return newItem;
        });
        return [];
    }

    getTreeItem(task: TaskModel | Link | string) {
        if ((task as TaskModel).isTask) {
            const { title, updateTime, hash, remark, link, finish } = task as TaskModel;
            const tree = new TreeItem(title, Object.keys(link).length === 0 ? 0 : 1);
            tree.tooltip = `最后更新时间: ${new Date(updateTime).toLocaleString()}\n\n${remark}`;
            tree.contextValue = `task ${contextValue[finish]}`;
            tree.id = hash;
            return tree;
        }

        if((task as Link).isLink) {
            const { file, relative, root, range } = task as Link;
            const tree = new TreeItem(`${relative || root} ${range[0].line}:${range[0].character}`, 0);
            tree.command = {
                command: 'timealert.toLink',
                arguments: [task],
                title: '',
            };
            tree.contextValue = 'link';
            tree.tooltip = file;
            return tree;
        }

        const tree = new TreeItem(task as string || '', 1);
        tree.contextValue = 'haveChild';
        return tree;
    }

    async refersh() {
        await this.refershTask();
        this._onDidChangeTreeData.fire(undefined);
    }

    async refershTask() {
        tasks = await getTaskList();
        return tasks;
    }
}

export default new TaskDataProvider();
