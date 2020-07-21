import { Range, Uri } from 'vscode';
import Base from './base';

export default class Link extends Base {
    constructor(public file: string, public range: Range) {
        super();
    }
}
