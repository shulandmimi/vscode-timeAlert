import { createHash as rawCreateHash } from 'crypto';
import { ensureFile } from 'fs-extra';
import { readTempFile, resolveTemp, writeTempFile } from './temp';
import Life from './life';

const IdTempFile = 'id';
let id: number;

export default async function createHash(str: string): Promise<string> {
    const hash = rawCreateHash('sha256');
    return new Promise(resolve => {
        hash.update(str);
        resolve(hash.digest('base64'));
        hash.end();
    });
}

export async function createId() {
    let newId = id++;
    await writeTempFile(IdTempFile, newId + 1);
    return newId;
}

Life.once('created', async () => {
    await ensureFile(resolveTemp(IdTempFile));
    id = Number(await readTempFile(IdTempFile)) || 0;
});
