import { readFile } from 'fs-extra';
import createBashTemplate, { transformTemplate } from '../base/bash';
import TaskModel from '../../model/task';
import { join } from 'path';

async function createTaskTemplate(task: TaskModel): Promise<string> {
    const style = transformTemplate(await readFile(join(__dirname, './style.html'), 'utf8'), task);
    const body = transformTemplate(
        [await readFile(join(__dirname, './content.html'), 'utf8'), await readFile(join(__dirname, './script.html'), 'utf8')].join('\n'),
        task
    );

    return await createBashTemplate({ style, body });
}

export default createTaskTemplate;
