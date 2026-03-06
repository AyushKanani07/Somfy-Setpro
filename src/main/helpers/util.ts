import type { ParsedQs } from 'qs';
import { lstNodeType, lstSubNodeType } from './constant.ts';
import { PromiseRegistry } from '../services/promiseRegistery.service.ts';
import { eventBroker } from './event.ts';

export const GenerateRandomString = (strlength: number) => {
    const chars = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    let Random_String = "";
    let Random_String_Length = strlength || 5;
    for (var i = Random_String_Length; i > 0; --i) Random_String += chars[Math.floor(Math.random() * chars.length)];
    return Random_String;
};

export const LogError = (err: any) => {
    console.error('[' + GetCurrentDate() + '] ' + err);
};

export const uniqueProjectId = () => {
    return GenerateRandomString(6) + GetFileNameFromDate();
};

export const GetCurrentDate = (date?: string) => {
    var today = date ? new Date(date) : new Date();
    var mill = today.getMilliseconds();
    var sec = today.getSeconds();
    var min = today.getMinutes();
    var hour = today.getHours();
    var year = today.getFullYear();
    var month = today.getMonth() + 1; // beware: January = 0; February = 1, etc.
    var day = today.getDate();
    return (
        ("0000" + year.toString()).slice(-4) +
        "-" +
        ("00" + month.toString()).slice(-2) +
        "-" +
        ("00" + day.toString()).slice(-2) +
        " " +
        ("00" + hour.toString()).slice(-2) +
        ":" +
        ("00" + min.toString()).slice(-2) +
        ":" +
        ("00" + sec.toString()).slice(-2) +
        ":" +
        ("000" + mill.toString()).slice(-3)
    );
};

export const GetFileNameFromDate = () => {
    var d = new Date();
    var curr_date = d.getDate();
    var curr_month = d.getMonth() + 1; //Months are zero based
    var curr_year = d.getFullYear();
    var seconds = d.getSeconds();
    var minutes = d.getMinutes();
    var hour = d.getHours();
    var milisec = d.getMilliseconds();

    return (
        curr_year.toString() +
        curr_month.toString() +
        curr_date.toString() +
        hour.toString() +
        minutes.toString() +
        seconds.toString() +
        milisec.toString()
    );
};

export const GetPageIndex = (index: string | undefined | ParsedQs | string[] | ParsedQs[]) => {
    var pageIndex: number;
    if (index != undefined) {
        pageIndex = +index;
    } else {
        pageIndex = 0;
    }
    return pageIndex;
};

export const GetPageSize = (size: string | undefined | ParsedQs | string[] | ParsedQs[]) => {
    var pageSize: number;
    if (size != undefined) {
        pageSize = +size;
    } else {
        pageSize = 20;
    }
    return pageSize;
};

export const pageOffset = (index: string | number | undefined | ParsedQs | string[] | ParsedQs[] | (string | ParsedQs)[], limit: number): number => {
    let pageIndex = 0;
    if (index) pageIndex = +index;
    if (pageIndex >= 1) pageIndex = (pageIndex - 1) * limit;
    return pageIndex;
};


export const sleep = (ms: number) => {
    return new Promise(resolve => setTimeout(resolve, ms));
};

export const getKeyCount = (model_no: number) => {
    try {
        let model_arr = [{ id: 14, key_count: 8 }];
        // filter model_arr from model_no
        let key_count = model_arr.filter(item => item.id === model_no)[0].key_count;
        return key_count;
    } catch (err) {
        return 0;
    }
};

export const getDBPath = () => {
    return process.env.LOCALAPPDATA + "/Somfy/Set pro/db/";
};

export const getFirmwarePath = () => {
    return process.env.LOCALAPPDATA + "/Somfy/Set pro/firmware/";
};



export const getModelName = (id: number) => {
    try {
        let model_arr = lstNodeType.filter(item => item.node_id === id);
        return model_arr[0].node_type_name;
    } catch (err) {
        return '';
    }
};

export const getSubNodeTypeName = (id: number) => {
    try {
        let model_arr = lstSubNodeType.find(item => item.sub_node_id === id);
        if (model_arr) return model_arr.sub_node_name;
        else return '';
    } catch (err) {
        return '';
    }
};

export const resolveNodeName = (id: number): string => {
    const subNodeCheck = lstSubNodeType.find(item => item.sub_node_id === id);
    if (subNodeCheck) return subNodeCheck.sub_node_name;

    const nodeCheck = lstNodeType.find(item => item.node_id === id);
    if (nodeCheck) return nodeCheck.node_type_name;
    return 'Unknown';
}

export const buffer2value = (buffer: Buffer | number[]): number => {
    let ans = 0;
    buffer.forEach((element, i) => {
        ans |= buffer[buffer.length - (i + 1)] << (i * 8);
    });
    return ans;
}

export const buffer2string = (buffer: Buffer): string => {
    const b = Buffer.from(buffer);
    return b.toString('ascii');
}

export const bufferToSignedInt = (buffer: Buffer): number => {
    let ans = 0;
    buffer.forEach((element, i) => {
        ans |= buffer[buffer.length - (i + 1)] << (i * 8);
    });
    if (ans < 0) {
        ans += Math.pow(256, buffer.length);
    }
    return ans;
}

export const dec2hex = (dec: number, width = 6): string => {
    return dec.toString(16).toUpperCase().padStart(width, "0");
}

export const toByteHex = (num: number, byteLength: number) => {
    const buf = Buffer.alloc(byteLength);
    buf.writeUIntBE(num, 0, byteLength);
    return [...buf];
}

export const crc16 = (buffer: Buffer | Uint8Array | number[]) => {
    let crc = 0x0;
    let odd;
    buffer.forEach(element => {
        for (var j = 0; j < 8; j++) {
            odd = crc;
            crc = crc << 1;
            if (element & 0x80) {
                crc = crc + 1;
            }
            if (odd & 0x8000) {
                crc = crc ^ 0x8408;
            }
            element = element << 1;
        }
    });
    return crc & 0xFFFF;
};

export const hexStringToBuffer = (str: string, length: number) => {
    const value = parseInt(str, 16);

    if (Number.isNaN(value)) {
        throw new Error(`Invalid hexadecimal string: ${str}`);
    }

    const buffer = Buffer.alloc(length);
    buffer.writeUIntLE(value, 0, length);

    return buffer;
}

export const promiseRegistry = new PromiseRegistry(eventBroker);