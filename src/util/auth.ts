import { window, StatusBarItem } from 'vscode';
import { EventEmitter } from 'events';

class Auth extends EventEmitter {
    isNextRun: boolean = true;
    isShowError: boolean = false;
    statusBar: StatusBarItem;
    constructor() {
        super();
        this.statusBar = window.createStatusBarItem();
    }

    auth(fn: Function, text?: string) {
        const _this = this;
        return function (...arg: any[]) {
            if (_this.isNextRun) return _this.showError(text);
            // @ts-ignore
            fn.apply(this, arg);
        };
    }

    showError(text: string = '任务无法继续添加，可能是因为配置原因') {
        const status = this.statusBar;
        status.text = text;
        status.show();
        setTimeout(() => {
            status.hide();
        }, 10000);
    }

    setIsRun(val: boolean) {
        this.isNextRun = val;
        this.emit('isNextRun');
        if (val === false) this.statusBar.hide();
    }
}

const authInstance = new Auth();
export default authInstance;
export const auth = authInstance.auth.bind(authInstance);
