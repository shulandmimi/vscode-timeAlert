import { readFile } from 'fs-extra';
import createBashTemplate, { transformTemplate } from '../base/bash';
import TaskModel from '@/model/task';
import { loadView } from '@/util/util';

async function createTaskTemplate(task: TaskModel): Promise<string> {
    const style = transformTemplate(await readFile(loadView('task/style.html'), 'utf8'), task);
    const body = transformTemplate(
        [await readFile(loadView('task/content.html'), 'utf8'), await readFile(loadView('task/script.html'), 'utf8')].join('\n'),
        task
    );

    return await createBashTemplate({ style, body });
}

export default createTaskTemplate;
