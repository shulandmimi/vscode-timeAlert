import { join } from 'path';
import { ensureDirSync, readFile, outputFile } from 'fs-extra';
import config from '@root/config/config';
import { getRoot } from './util';
import Life from './life';

let temp: string = '';

export async function readTempFile(file: string) {
    return readFile(resolveTemp(file));
}

export async function writeTempFile(file: string, data: any) {
    return outputFile(resolveTemp(file), data);
}

export function resolveTemp(file: string) {
    return join(<string>temp || getRoot(), file);
}

Life.once('created', () => {
    temp = join(getRoot(), config.tempDir);
    ensureDirSync(temp);
});
