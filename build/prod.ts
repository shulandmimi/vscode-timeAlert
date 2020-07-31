import { remove } from 'fs-extra';
import { join } from 'path';
import config from '../config/config';

const log = console.log;
(async () => {
    log('开始清理...');
    try {
        await remove(join(process.cwd(), config.tempDir));
        log('清理成功!');
    } catch (error) {
        log('清理失败\n');
        log(error);
    }
})();
