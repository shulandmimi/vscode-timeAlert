import Base from './base';
import Link from './link';
export default class Task extends Base {
    title: string; // 任务名称
    noticeIntervalTime: number; // 通知间隔
    finishTime: number = 0; // 完成时间
    finish: number; // 0 完成 | 1 未完成 | 2 继续延期
    remark: string; //备注
    id: number; // 自动增长的唯一key
    link: { [key: string]: Link } = {};
    isTask: boolean = true;
    priority: number = 0;
    [key: string]: string | number | boolean | { [key: string]: Link };
    constructor(title: string, interval: number, remark: string, id: number, finish: number) {
        super();
        this.title = title;
        this.noticeIntervalTime = interval;
        this.remark = remark;
        this.id = id;
        this.finish = finish;
    }
}

export interface TaskJson {
    total: number;
    tasks: {
        [key: string]: Task;
    };
}
