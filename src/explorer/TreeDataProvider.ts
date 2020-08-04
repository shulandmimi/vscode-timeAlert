import { TreeDataProvider, TreeItem, EventEmitter } from 'vscode';
import Link from '@/model/link';
import TaskJson from '@/model/taskJson';
import TaskModel from '@/model/task';
import Life from '@/util/life';
import workSpaceConfig from '../util/config';

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

const transform = (config: { label: string; value: number }[]): { [key: string]: number } => {
    return config.reduce((result, item) => {
        result[item.label] = item.value;
        return result;
    }, {} as any);
};

let rawTitle: any;

let key2title: { [key: string]: number } = {};

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

    // @ts-ignore
    async getChildren(ele?: TaskModel | string) {
        if (!ele) {
            if (!tasks) await this.refershTask();
            console.log(tasks);
            const title = Object.keys(rawTitle);
            return title;
        }
        if (typeof ele === 'string') return tasks[key2title[ele]];
        if (ele.isTask)
            return Object.keys(ele.link).map(item => {
                const newItem = {
                    ...ele.link[item],
                    parent: ele,
                };
                return newItem;
            });
        return [];
    }

    getTreeItem(task: TaskModel | Link | string) {
        if ((task as TaskModel).isTask) {
            const { title, updateTime, id, remark, link, finish, priority } = task as TaskModel;
            const tree = new TreeItem(title, Object.keys(link).length === 0 ? 0 : 1);
            tree.tooltip = `${remark}\n\n最后更新时间: ${new Date(updateTime).toLocaleString()}`;
            tree.contextValue = `task ${contextValue[finish]}`;
            tree.id = id.toString();
            tree.description = `${priority}`;
            return tree;
        }

        if ((task as Link).isLink) {
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

        const tree = new TreeItem((task as string) || '', 1);
        tree.contextValue = 'haveChild';
        return tree;
    }

    async refersh() {
        await this.refershTask();
        this._onDidChangeTreeData.fire(undefined);
    }

    async refershTask() {
        tasks = await TaskJson.getTaskList();
        return tasks;
    }
}

const taskDataProvider = new TaskDataProvider();

export default taskDataProvider;

function startViewTaskList(config?: any) {
    rawTitle = transform(config || workSpaceConfig.typeConfig as { label: string; value: number }[]);
    key2title = reverse(rawTitle);
    taskDataProvider.refersh();
}

Life.once('created', () => {
    startViewTaskList();
    workSpaceConfig.on('typeConfig', (newConfig, oldConfig) => {
        startViewTaskList(newConfig);
    });
});
