import { window } from 'vscode';

let id = 0;

interface Notice {
    id: number;
    fn: Function;
}

const noticeQueue: Notice[] = [];

function addNotice(fn: Notice['fn']) {
    noticeQueue.push({
        id: id++,
        fn,
    });
    flashQueue();
}

function flashQueue() {
    noticeQueue.forEach(item => item.fn());
}

function loopTick() {
    setTimeout(() => {
        flashQueue();
        loopTick();
    }, 1000 * 60 * 5);
}

loopTick();
window.showInformationMessage('通知正常启动');

export { addNotice };
