import multer from 'multer';
import * as fs from 'fs';
import { getDBPath, getFirmwarePath } from './util.ts';

const privateDirs: Record<string, string> = {
    db: getDBPath(),
    firmware: getFirmwarePath()
};

export class Multer {
    storage: multer.StorageEngine;

    constructor(dir: string, isPublic: boolean) {
        this.storage = multer.diskStorage({
            destination: (req, file, cb) => {
                let directory;
                if (isPublic) {
                    directory = `public/${dir}`;
                } else {
                    directory = privateDirs[dir];
                }
                if (!directory) return cb(new Error('Invalid directory'), '');

                fs.mkdirSync(directory, { recursive: true });
                cb(null, directory);
            },
            filename: (req, file, cb) => {
                cb(null, file.originalname);
            }
        })
    }

    get uploadAndStore() {
        return multer({ storage: this.storage });
    }

    get upload() {
        return multer();
    }
}