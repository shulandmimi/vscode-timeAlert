import { Position } from 'vscode';
import Base from './base';
import TaskModel from './task';

export default class Link extends Base {
    isLink: true;
    parent?: TaskModel;
    constructor(public file: string, public root: string, public relative: string, public range: [Position, Position], public hash: string) {
        super();
        this.isLink = true;
    }
}
