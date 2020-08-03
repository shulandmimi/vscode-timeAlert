import { EventEmitter } from 'events';
import { workspace, WorkspaceConfiguration } from 'vscode';
import Life from './life';

const prefix = 'timealert';
const keys = ['lineAlert', 'typeConfig'];

function getConfig() {
    return keys.reduce((result: any, key: string) => {
        result[key] = workSpaceConfig.get(key) as any;
        return result;
    }, {});
}

class Config extends EventEmitter {
    static _config: WorkspaceConfiguration;
    prevConfig: any;

    public get(key: string) {
        if (!Config._config) return false;
        return Config._config.get(`${prefix}.${key}`);
    }

    public get lineAlert(): boolean {
        return this.get('lineAlert') as boolean;
    }

    public get typeConfig() {
        return this.get('typeConfig');
    }

    onChange() {
        workspace.onDidChangeConfiguration(config => {

        });
    }
}
const workSpaceConfig = new Config();

Life.once('created', () => {
    try {
        Config._config = workspace.getConfiguration();
        workSpaceConfig.prevConfig = getConfig();
    } catch (error) {
        console.log(error, 'error');
    }
});

export default workSpaceConfig;
