import { window } from 'vscode';
import { ensureFile, outputFile, readFile } from 'fs-extra';
import TaskWebview from '@/explorer/webview';
import createTaskTemplate from '@root/webview/task/remark';
import { extensionContext } from '@/extension';
import Task from './task';
import { taskFinish } from '../task';

const initialTaskJson = JSON.stringify({ tasks: {}, total: 0, map: [] });

class TaskJson {
    TaskFilePath: string = '';
    taskCache?: TaskJsonModel;
    constructor() {}

    async getTaskList() {
        const { tasks, map } = await this.readTask();
        const classify: { [key: number]: Task[] } = {};
        for (let i = 0; i < map.length; i++) {
            const task = tasks[map[i]];
            (classify[task.finish] || (classify[task.finish] = [])).push(task);
        }
        return classify;
    }

    async writeTask(cb: (taskJson: TaskJsonModel) => Promise<TaskJsonModel | false> | TaskJsonModel | false): Promise<boolean> {
        await ensureFile(this.TaskFilePath);
        let taskJson = this.taskCache || (await this.readTask());
        if (taskJson !== this.taskCache) this.taskCache = taskJson;
        const json = await cb(taskJson);
        if (!json) return false;
        await outputFile(this.TaskFilePath, JSON.stringify(json, null, 4));
        this.taskCache = json;
        return true;
    }

    async readTask(): Promise<TaskJsonModel> {
        await ensureFile(this.TaskFilePath);
        const json: TaskJsonModel = JSON.parse((await readFile(this.TaskFilePath)).toString('utf-8') || initialTaskJson);
        return json;
    }

    async noticeTask() {
        const { tasks } = await this.readTask();
        const key = Object.keys(tasks);
        let count = 3;
        let index = 0;
        while (count) {
            const task = tasks[key[index++]];
            if (!task) break;
            if (task.finish === 0) continue;
            window.showInformationMessage(task.title, '查看', '已完成').then(async res => {
                if (!extensionContext) return;
                if (res === '查看') {
                    const instance = TaskWebview.createOrShow(extensionContext.extensionPath) || TaskWebview.currentInstance;
                    if (!instance) return;
                    instance.update(await createTaskTemplate(task));
                }
                if (res === '已完成') {
                    await taskFinish(task);
                }
            });
        }
    }

    async insertTask(task: Task) {
        // const { tasks, map, total } = await this.readTask();
        // const { hash } = task;
        // const index = this.searchRange(tasks, map, task.priority);
    }

    public searchIndex(tasks: TaskJsonModel['tasks'], arr: string[], priority: number, isRange: boolean = true, hash?: string): number {
        if (!arr.length) return 0;
        const len = arr.length;
        function fn() {
            let l = 0;
            let r = len;
            let mid: number;
            while (l < r) {
                mid = Math.floor((r + l) / 2);
                const scopedNewPriority = tasks[arr[mid]].priority;
                if (isRange) {
                    // 具体相等时，向左搜索
                    if (scopedNewPriority === priority) return searchLeft(mid, isRange, hash);
                    const prevProiority = tasks[arr[mid - 1]]?.priority ?? NaN;
                    const nextProiority = tasks[arr[mid + 1]]?.priority ?? NaN;

                    if (mid === len - 1 && scopedNewPriority > priority) return searchLeft(mid);
                    if (mid === 0 && priority > scopedNewPriority) return mid;
                    if (prevProiority > priority && scopedNewPriority < priority) return mid;
                    if (scopedNewPriority > priority && nextProiority < priority) return mid + 1;
                } else {
                    if (scopedNewPriority === priority) return searchEqual(mid, <string>hash);
                }

                if (scopedNewPriority > priority) l = mid;
                else r = mid;
            }
            return arr.length;
        }

        function searchLeft(index: number, isRange: boolean = true, hash?: string) {
            while (index >= 0) {
                const scoped = tasks[arr[index]];
                if (isRange) {
                    if (scoped.priority && scoped.priority !== priority) return index + 1;
                } else {
                    if (hash === scoped.hash) return index;
                }
                index--;
            }
            return 0;
        }

        function searchEqual(index: number, hash: string) {
            if (tasks[arr[index]].hash === hash) return index;
            let l = index + 1,
                r = index - 1;
            while (l >= 0 || r < len) {
                const lTask = tasks[arr[l]];
                if (l >= 0 && lTask.priority === priority && lTask.hash === hash) return l;
                else l--;
                const rTask = tasks[arr[r]];
                if (r < len && rTask.priority === priority && rTask.hash === hash) return r;
                else r++;
            }
            return index;
        }
        return fn();
    }
}

export interface TaskJsonModel {
    total: number;
    tasks: {
        [key: string]: Task;
    };
    map: string[];
}

export default new TaskJson();
