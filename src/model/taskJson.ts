import { window, Range, Position, Hover, languages, TextDocument, TextEditorSelectionChangeEvent, workspace } from 'vscode';
import { ensureFile, outputFile, readFile } from 'fs-extra';
import Task from './task';
import life from '@/util/life';
import workSpaceConfig from '@/util/config';
import { debounce } from '@/util/util';

const initialTaskJson = JSON.stringify({ tasks: {}, total: 0, map: [] });

class TaskJson {
    static noticeQueeu: Task[] = [];
    static isEnd = false;
    static lineAlert: boolean = workSpaceConfig.lineAlert;
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
        const { tasks, map } = await this.readTask();
        let count = 3;
        let index = 0;
        const queue: Task[] = (TaskJson.noticeQueeu = []);
        while (count) {
            const task = tasks[map[index++]];
            if (!task) break;
            if (task.finish === 0) continue;
            queue.push(task);
            // window.showInformationMessage(task.title, '查看', '已完成').then(async res => {
            //     if (!extensionContext) return;
            //     if (res === '查看') {
            //         const instance = TaskWebview.createOrShow(extensionContext.extensionPath) || TaskWebview.currentInstance;
            //         if (!instance) return;
            //         instance.update(await createTaskTemplate(task));
            //     }
            //     if (res === '已完成') {
            //         await taskFinish(task);
            //     }
            // });
        }
        showDecoration();
        setTimeout(() => {
            TaskJson.noticeQueeu.length = 0;
            hideDecoration();
        }, 30000);
    }

    public searchIndex(tasks: TaskJsonModel['tasks'], arr: TaskJsonModel['map'], priority: number, isRange: boolean = true, id?: number): number {
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
                    if (scopedNewPriority === priority) return searchLeft(mid, isRange, id);
                    const prevProiority = tasks[arr[mid - 1]]?.priority ?? NaN;
                    const nextProiority = tasks[arr[mid + 1]]?.priority ?? NaN;

                    if (mid === len - 1 && scopedNewPriority > priority) return searchLeft(mid);
                    if (mid === 0 && priority > scopedNewPriority) return mid;
                    if (prevProiority > priority && scopedNewPriority < priority) return mid;
                    if (scopedNewPriority > priority && nextProiority < priority) return mid + 1;
                } else {
                    if (scopedNewPriority === priority) return searchEqual(mid, <number>id);
                }

                if (scopedNewPriority > priority) l = mid;
                else r = mid;
            }
            return arr.length;
        }

        function searchLeft(index: number, isRange: boolean = true, id?: number) {
            while (index >= 0) {
                const scoped = tasks[arr[index]];
                if (isRange) {
                    if (scoped.priority && scoped.priority !== priority) return index + 1;
                } else {
                    if (id === scoped.id) return index;
                }
                index--;
            }
            return 0;
        }

        function searchEqual(index: number, id: number) {
            if (tasks[arr[index]].id === id) return index;
            let l = index - 1,
                r = index + 1;
            while (l >= 0 || r < len) {
                const lTask = tasks[arr[l]];
                if (l >= 0 && lTask.priority === priority && lTask.id === id) return l;
                else l--;
                const rTask = tasks[arr[r]];
                if (r < len && rTask.priority === priority && rTask.id === id) return r;
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
    map: number[];
}

export default new TaskJson();

const dispose: Function[] = [];
const decorationType = window.createTextEditorDecorationType({});

const handler = debounce((line: number = 0) => {
    if (!TaskJson.noticeQueeu.length) return;
    TaskJson.isEnd = false;
    const queue = TaskJson.noticeQueeu || [];
    decoration(`TA: ${queue[0]?.title}`, line);
});

function showDecoration() {
    if (!window.activeTextEditor) return;
    handler(window.activeTextEditor.selection?.start?.line);
}

function decoration(text: string, line: number) {
    window.activeTextEditor?.setDecorations(decorationType, [
        {
            renderOptions: {
                after: { contentText: text, color: 'rgb(28, 224, 235)', margin: '0px 0px 0px 3rem' },
            },
            range: new Range(new Position(line, Number.MAX_VALUE), new Position(line, Number.MAX_VALUE)),
        },
    ]);
}

function hideDecoration() {
    TaskJson.isEnd = true;
    window.activeTextEditor?.setDecorations(decorationType, []);
}

function startInlineAlert() {
    dispose.push(
        window.onDidChangeTextEditorSelection((document: TextEditorSelectionChangeEvent) => handler(document.textEditor.selection.start.line))
            .dispose,
        languages.registerHoverProvider(
            {
                pattern: '**/**',
            },
            {
                provideHover(document: TextDocument, position: Position) {
                    const text = document.getText(new Range(position.line, 0, position.line, Number.MAX_VALUE));
                    if (text.length !== position.character || TaskJson.isEnd) return;
                    return new Hover(['123', '234', '345'].join('\n'));
                },
            }
        ).dispose
    );
}

function disposeHandler() {
    dispose.forEach(item => item());
    dispose.length = 0;
}

function restartInlineAlert() {
    startInlineAlert();
}

life.once('created', () => {
    startInlineAlert();
});
