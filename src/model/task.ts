import Base from './base';
import Link from './link';
export default class Task extends Base {
    title: string; // 任务名称
    noticeIntervalTime: number; // 通知间隔
    finishTime: number; // 完成时间
    finish: 0 | 1 | 2; // 0 完成 | 1 未完成 | 2 继续延期 |
    remark: string; //备注
    hash: string; // 随机出来的hash值
    link: Link[];
    [key: string]: string | number | Link[];
    constructor(title: string, interval: number, remark: string, hash: string) {
        super();
        this.title = title;
        this.noticeIntervalTime = interval;
        this.finishTime = 0;
        this.finish = 1;
        this.remark = remark;
        this.hash = hash;
        this.link = [];
    }
}

export interface TaskJson {
    total: number;
    tasks: {
        [key: string]: Task;
    };
}
