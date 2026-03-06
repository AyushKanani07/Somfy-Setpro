import { buffer2string, buffer2value, getFirmwarePath } from "../../helpers/util.ts";
import * as fs from 'fs';
import crc32 from 'crc/crc32';
import crypto from 'crypto';
import SocketService from "../socket.service.ts";
import { FIRMWARE_HEADER_TYPE, lstSubNodeType, Socket_Events } from "../../helpers/constant.ts";


export class FirmwareFileValidateService {


    async validateFirmwareFile(file_name: string, sub_node_id: number, isQt30: boolean = false) {
        const UPLOAD_PATH = getFirmwarePath();
        const FILE_PATH = UPLOAD_PATH + file_name;
        const file = fs.readFileSync(FILE_PATH);
        console.log('file: ', file);
        if (file.length === 0) {
            throw new Error('Firmware file is empty');
        }
        SocketService.emit(Socket_Events.FIRMWARE_UPDATE_INFO, { message: `Validating Firmware File`, status: 'progress' });

        const firmware_data = structuredClone(file);

        let i = 0;
        const header_magic = buffer2string(firmware_data.subarray(i, i + 4)); i += 4;
        const header_version = buffer2value(firmware_data.subarray(i, i + 4)); i += 4;
        const header_size = buffer2value(firmware_data.subarray(i, i + 8)); i += 8;
        const header_crc = buffer2value(firmware_data.subarray(i, i + 4)); i += 4;
        i += 8; // reserved

        if (header_magic.toLowerCase() !== 'sofy' || header_size !== firmware_data.length) {
            throw new Error('File corrupted: Invalid header');
        }

        /* Reading the firmware file and extracting firmware version from it. */
        const sub_header1_type = buffer2value(firmware_data.subarray(i, i + 4)); i += 4;
        const sub_header1_size = buffer2value(firmware_data.subarray(i, i + 8)); i += 8;
        const sub_header1_crc = buffer2value(firmware_data.subarray(i, i + 4)); i += 4;
        const sub_header1_hardware_id = buffer2value(firmware_data.subarray(i, i + 4)); i += 4;
        console.log('sub_header1_hardware_id: ', sub_header1_hardware_id);
        i += 4 // reserved

        const sub_header1_cal_crc = crc32(firmware_data.subarray(i, i + sub_header1_size)) & 0xFFFFFFFF;
        const file_firmware_version = buffer2string(firmware_data.subarray(i, i + sub_header1_size)); i += sub_header1_size;
        const curr_hardware_id = lstSubNodeType.find(item => item.sub_node_id === sub_node_id)?.hardware_id;
        console.log('curr_hardware_id: ', curr_hardware_id);

        const sub_header1_type_validate = FIRMWARE_HEADER_TYPE.find((item) => item.id === sub_header1_type);
        if (!sub_header1_type_validate || sub_header1_type_validate?.name !== 'firmware_version' || sub_header1_crc != sub_header1_cal_crc) {
            throw new Error('File corrupted: Invalid sub header 1');
        } else if (sub_header1_hardware_id !== curr_hardware_id) {
            throw new Error('Hardware ID mismatch 1');
        }

        /* Reading the firmware file and extracting hardware compatibility from it. */
        const sub_header2_type = buffer2value(firmware_data.subarray(i, i + 4)); i += 4;
        const sub_header2_size = buffer2value(firmware_data.subarray(i, i + 8)); i += 8;
        const sub_header2_crc = buffer2value(firmware_data.subarray(i, i + 4)); i += 4;
        const sub_header2_hardware_id = buffer2value(firmware_data.subarray(i, i + 4)); i += 4;
        i += 4 // reserved
        const sub_header2_cal_crc = crc32(firmware_data.subarray(i, i + sub_header2_size)) & 0xFFFFFFFF;
        const sub_header2_data = buffer2string(firmware_data.subarray(i, i + sub_header2_size)); i += sub_header2_size;
        const sub_header2_type_validate = FIRMWARE_HEADER_TYPE.find((item) => item.id === sub_header2_type);

        if (!sub_header2_type_validate || sub_header2_type_validate?.name !== 'hw_compat' || sub_header2_crc != sub_header2_cal_crc) {
            throw new Error('File corrupted: Invalid sub header 2');
        } else if (!sub_header2_data.includes(curr_hardware_id.toString())) {
            throw new Error('Hardware incompatibility');
        } else if (sub_header2_hardware_id !== curr_hardware_id) {
            throw new Error('Hardware ID mismatch 2');
        }
        /* Reading the firmware file and extracting application data from it. */
        const sub_header3_type = buffer2value(firmware_data.subarray(i, i + 4)); i += 4;
        const sub_header3_size = buffer2value(firmware_data.subarray(i, i + 8)); i += 8;
        const sub_header3_crc = buffer2value(firmware_data.subarray(i, i + 4)); i += 4;
        const sub_header3_hardware_id = buffer2value(firmware_data.subarray(i, i + 4)); i += 4;
        i += 4 // reserved
        const sub_header3_cal_crc = crc32(firmware_data.subarray(i, i + sub_header3_size)) & 0xFFFFFFFF;
        const sub_header3_data = firmware_data.subarray(i, i + sub_header3_size); i += sub_header3_size;
        const sub_header3_type_validate = FIRMWARE_HEADER_TYPE.find((item) => item.id === sub_header3_type);

        if (!sub_header3_type_validate || sub_header3_type_validate?.name !== 'app' || sub_header3_crc != sub_header3_cal_crc) {
            throw new Error('File corrupted: Invalid sub header 3');
        } else if (sub_header3_hardware_id !== curr_hardware_id) {
            throw new Error('Hardware ID mismatch 3');
        }

        if (isQt30) {
            const sub_header4_type = buffer2value(firmware_data.subarray(i, i + 4)); i += 4;
            const sub_header4_size = buffer2value(firmware_data.subarray(i, i + 8)); i += 8;
            const sub_header4_crc = buffer2value(firmware_data.subarray(i, i + 4)); i += 4;
            const sub_header4_hardware_id = buffer2value(firmware_data.subarray(i, i + 4)); i += 4;
            i += 4 // reserved
            const sub_header4_cal_crc = crc32(firmware_data.subarray(i, i + sub_header4_size)) & 0xFFFFFFFF;
            const sub_header4_data = firmware_data.subarray(i, i + sub_header4_size); i += sub_header4_size;
            const sub_header4_type_validate = FIRMWARE_HEADER_TYPE.find((item) => item.id === sub_header4_type);

            if (!sub_header4_type_validate || sub_header4_type_validate?.name !== 'motor' || sub_header4_crc != sub_header4_cal_crc) {
                throw new Error('File corrupted: Invalid sub header 4');
            } else if (sub_header4_hardware_id !== curr_hardware_id) {
                throw new Error('Hardware ID mismatch 4');
            }

            try {
                const decryptedData = await this.getFirmwareData(sub_header4_data);
                const decryptedData2 = await this.getFirmwareData(sub_header3_data);
                return {
                    decryptedData,
                    decryptedData2,
                    file_firmware_version
                };
            } catch (error) {
                throw error;
            }
        }
        try {
            const decryptedData = await this.getFirmwareData(sub_header3_data);
            return {
                decryptedData,
                decryptedData2: null,
                file_firmware_version
            };
        } catch (error) {
            throw error;
        }
    }

    private async getFirmwareData(data: Buffer) {
        try {
            let i = 0;
            const magic_word = buffer2string(data.subarray(i, i + 18)); i += 18;
            const firmware_data = data.subarray(i);
            let j = 0;
            const init_vector = firmware_data.subarray(j, j + 16); j += 32;
            const encrypted_data = new Uint8Array(firmware_data.subarray(j));
            let final_decrypt_data = Buffer.alloc(0);
            for (let j = 0; j < encrypted_data.length; j += 128) {
                final_decrypt_data = Buffer.concat([final_decrypt_data, this.decrypt(encrypted_data.slice(j, j + 128), init_vector)]);
            }
            return final_decrypt_data;
        } catch (error) {
            throw error;
        }
    }

    private decrypt(buffer: Uint8Array, init_vector: Uint8Array) {
        const security_key = Buffer.from([0x36, 0x64, 0x34, 0x61, 0x33, 0x38, 0x32, 0x38, 0x34, 0x30, 0x31, 0x64, 0x37, 0x61, 0x31, 0x39, 0x37, 0x30, 0x35, 0x62, 0x34, 0x35, 0x31, 0x65, 0x36, 0x34, 0x37, 0x34, 0x30, 0x37, 0x31, 0x34]);
        const decipher = crypto.createDecipheriv('aes-256-ctr', security_key, init_vector);
        let decrypted = decipher.update(buffer);
        decrypted = Buffer.concat([decrypted, decipher.final()]);
        return decrypted;
    }
}