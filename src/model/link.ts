import Base from './base';
import TaskModel from './task';

interface PositionRange {
    line: number;
    character: number;
}
export default class Link extends Base {
    isLink: true;
    parent?: TaskModel;
    constructor(
        public file: string,
        public root: string,
        public relative: string,
        public range: [PositionRange, PositionRange],
        public hash: string
    ) {
        super();
        this.isLink = true;
    }
}
