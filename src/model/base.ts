export default class Base {
    createTime: number;
    updateTime: number;
    constructor() {
        const now = Date.now();
        this.createTime = now;
        this.updateTime = now;
    }
}
