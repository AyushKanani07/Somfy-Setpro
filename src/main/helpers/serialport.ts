import { SerialPort } from 'serialport';

export const writeToSerialPort = async (port: SerialPort, data: Buffer): Promise<void> => {
    await new Promise<void>(async (resolve, reject) => {
        port.write(data, (err: any) => (err ? reject(err) : resolve()));
    });
    // try {
    //     await new Promise<void>((resolve, reject) =>
    //         port.drain((err: any) => err ? reject(err) : resolve())
    //     );
    // } catch (e: any) {
    //     console.log('Error during port drain:', e);
    //     const msg = String(e?.message ?? e);
    //     if (msg.includes('Unknown error code 1') || msg.includes('ERROR_INVALID_FUNCTION')) {
    //         const baud = port.baudRate ?? 115200;
    //         const bitsPerFrame = 10; // 8N1
    //         const ms = Math.ceil((data.length * bitsPerFrame * 1000) / baud) + 3;
    //         await new Promise(r => setTimeout(r, ms));
    //         // Driver doesn't support FlushFileBuffers; continue without hard drain
    //     } else {
    //         throw e;
    //     }
    // }

    const baud = port.baudRate ?? 4800;
    const bitsPerFrame = 10; // 8N1
    const ms = Math.ceil((data.length * bitsPerFrame * 1000) / baud) - 3;
    await new Promise((r) => setTimeout(r, ms));
};
