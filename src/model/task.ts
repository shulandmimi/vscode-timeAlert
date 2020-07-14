export default class Task {
    title: string; // 任务名称
    createTime: number; // 创建时间
    updateTime: number; // 更新时间
    noticeIntervalTime: number; // 通知间隔
    finishTime: number; // 完成时间
    finish: 0 | 1 | 2; // 0 完成 | 1 未完成 | 2 继续延期 |
    remark: string; //备注
    constructor(title: string, interval: number, remark: string) {
        this.title = title;
        this.createTime = Date.now();
        this.updateTime = this.createTime;
        this.noticeIntervalTime = interval;
        this.finishTime = 0;
        this.finish = 1;
        this.remark = remark;
    }
}

export interface TaskJson {
    total: number;
    tasks: {
        [key: string]: Task;
    };
}
