import { createHash as rawCreateHash } from 'crypto';

export default async function createHash(str: string): Promise<string> {
    const hash = rawCreateHash('sha256');
    return new Promise(resolve => {
        hash.update(str);
        resolve(hash.digest('base64'));
        hash.end();
    });
}
