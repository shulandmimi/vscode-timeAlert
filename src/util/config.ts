import { EventEmitter } from 'events';
import { workspace, WorkspaceConfiguration } from 'vscode';
import Life from './life';
import { compare, debounce } from './util';

export interface TypeConfig {
    label: string;
    value: number;
}

export type LineAlertColor = string[] | string;

const prefix = 'timealert';
const keys = ['lineAlert', 'lineAlertColor', 'typeConfig', 'initialType'];

function getConfig() {
    return keys.reduce((result: any, key: string) => {
        result[key] = workSpaceConfig.get(key) as any;
        return result;
    }, {});
}

class Config extends EventEmitter {
    constructor() {
        super();
        const that = this;
        workspace.onDidChangeConfiguration(
            debounce(() => {
                that._config = workspace.getConfiguration();
                const newConfig = getConfig();
                Object.keys(newConfig).forEach(item => {
                    if (!compare(newConfig[item], that.prevConfig[item])) {
                        that.emit(item, newConfig[item], that.prevConfig[item], newConfig, this.prevConfig);
                    }
                });
                this.prevConfig = newConfig;
            }, 500)
        );
    }
    _config: WorkspaceConfiguration = workspace.getConfiguration();
    prevConfig: any;

    public get(key: string) {
        return this._config.get(`${prefix}.${key}`);
    }

    public get lineAlert(): boolean {
        return this.get('lineAlert') as boolean;
    }

    public get typeConfig() {
        return this.get('typeConfig') as TypeConfig[];
    }

    public get initialType() {
        return this.get('initialType') as number;
    }

    public get lineAlertColor() {
        return this.get('lineAlertColor') as LineAlertColor;
    }
}
const workSpaceConfig = new Config();

Life.once('created', () => {
    try {
        workSpaceConfig.prevConfig = getConfig();
    } catch (error) {
        console.log(error, 'error');
    }
});

export default workSpaceConfig;
