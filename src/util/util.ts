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

export function compare(origin: any, target: any): boolean {
    if ((origin && !target) || (!origin && target)) return false;

    switch (typeof origin) {
        case 'string':
        case 'boolean':
        case 'number':
            return origin === target;
        case 'object':
            const originTyoe = Object.prototype.toString.call(origin);
            const targetType = Object.prototype.toString.call(target);
            if (originTyoe === '[object Object]') {
                if (targetType !== '[object Object]') return false;
                const targetKeys = Object.keys(target);
                const originKeys = Object.keys(origin);
                if (!targetKeys.length && !originKeys.length) return true;
                if (targetKeys.length !== originKeys.length) return false;
                return Object.keys(target).every(item => compare(target[item], origin[item]));
            } else {
                if (!origin.length && !target.length) return true;
                if (origin.length !== target.length) return false;
                return origin.every((_i: any, index: number) => compare(origin[index], target[index]));
            }
        default:
            return true;
    }
}
