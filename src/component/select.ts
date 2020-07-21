import { window, QuickPickOptions } from 'vscode';

export interface SelectReturn<T>{
    data: T,
    selected: string;
    key: string;
}

export default async function select<R>(selection: any, options?: QuickPickOptions & { label?: string }): Promise<SelectReturn<R> | false> {
    let keys = Object.keys(selection);
    const { label, ...quickPickOptions } = options || {};
    let keysMap: any = {};
    if (label) {
        keys = keys.map(item => {
            const key = selection[item][label];
            keysMap[key] = item;
            return key;
        });
    }

    const selected = await window.showQuickPick(keys, quickPickOptions);
    if (!selected) return false;
    return {
        data: selection[label ? keysMap[selected] : selected],
        selected,
        key: keysMap[selected],
    };
}
