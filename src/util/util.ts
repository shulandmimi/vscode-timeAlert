import { extensionContext } from '../extension';
import * as path from 'path';

let root: string | undefined;
export const getRoot = (): string => {
    if (root) return root;
    return (root = extensionContext?.extensionPath) || '';
};

export function loadView(file: string): string {
    return path.join(getRoot(), 'webview', file);
}

export function debounce(fn: Function, wait: number = 300) {
    let timer: any;
    return function (...arg: any[]) {
        clearTimeout(timer);
        // @ts-ignore
        const that = this;
        timer = setTimeout(() => {
            try {
                fn.apply(that, arg);
            } catch (error) {}
        }, wait);
    };
}
