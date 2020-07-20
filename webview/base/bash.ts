import { window } from 'vscode';
import { readFile } from 'fs-extra';
import { runInNewContext, createContext } from 'vm';
import { loadView } from '../../src/util/util';

interface BashTemplateContext {
    _root?: BashTemplateContext;
    style?: string;
    body?: string;
    [key: string]: any;
}

export function transformTemplate(template: string, inject: object) {
    return runInNewContext(`\`${template}\``, createContext(inject));
}

async function createBashTemplate(inject: BashTemplateContext = {}) {
    const template: string = await readFile(loadView('base/base.html'), 'utf8');
    try {
        const root = { ...inject };
        return transformTemplate(template, root);
    } catch (error) {
        window.showInformationMessage(error.message);
        return '';
    }
}

export default createBashTemplate;
