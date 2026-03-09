import { dbConfig } from "../models/index.ts";
import { CommandParserService } from "./command.parser.service.ts";

interface ColumnDefinition {
    name: string;
    type: string;   // SQL datatype (TEXT, INTEGER, BOOLEAN, etc.)
    default?: string; // optional DEFAULT value
}

export class SchemaService {

    private CommandParser = new CommandParserService();

    public async updateSchemaVersion(versionFrom: number, versionTo: number) {
        return new Promise(async (resolve, reject) => {
            try {
                if (versionFrom < versionTo) {
                    for (let i = versionFrom; i < versionTo; i++) {
                        switch (i) {
                            case 1:
                                await this.updateSchemaVersion1To2();
                                break;
                            case 2:
                                await this.updateSchemaVersion2To3();
                                break;
                            case 3:
                                await this.updateSchemaVersion3To4();
                                break;
                            default:
                                break;
                        }
                    }
                    resolve(true);
                } else {
                    resolve(true);
                }
            } catch (err) {
                reject(err);
            }

        });
    }

    private async updateSchemaVersion1To2() {
        return new Promise(async (resolve, reject) => {
            try {
                const versionColumn = await this.isColumnExist('tbl_project', 'schema_version');
                if (!versionColumn) {
                    await dbConfig.dbInstance.sequelize.query(`ALTER TABLE tbl_project ADD COLUMN schema_version INT DEFAULT 1;`);
                }

                const deviceTypeColumn = await this.isColumnExist('tbl_device_clone', 'device_type');
                if (!deviceTypeColumn) {
                    await dbConfig.dbInstance.sequelize.query(`ALTER TABLE tbl_device_clone ADD COLUMN device_type TEXT;`);
                }

                const keypadDataColumn = await this.isColumnExist('tbl_device_clone', 'keypad_data');
                if (!keypadDataColumn) {
                    await dbConfig.dbInstance.sequelize.query(`ALTER TABLE tbl_device_clone ADD COLUMN keypad_data JSON;`);
                }

                const individualSwitchGroupColumn = await this.isColumnExist('tbl_device_clone', 'individual_switch_group');
                if (!individualSwitchGroupColumn) {
                    await dbConfig.dbInstance.sequelize.query(`ALTER TABLE tbl_device_clone ADD COLUMN individual_switch_group JSON;`);
                }

                await dbConfig.dbInstance.sequelize.query('UPDATE tbl_project SET schema_version = 2;');
                resolve(true);
            } catch (err) {
                reject(err);
            }
        });
    }

    private async updateSchemaVersion2To3() {
        return new Promise(async (resolve, reject) => {
            try {
                const channelColumn = await this.isColumnExist('tbl_device_clone', 'channel');
                if (!channelColumn) {
                    await dbConfig.dbInstance.sequelize.query(`ALTER TABLE tbl_device_clone ADD COLUMN channel JSON;`);
                }

                await dbConfig.dbInstance.sequelize.query('UPDATE tbl_project SET schema_version = 3;');
                resolve(true);
            } catch (err) {
                reject(err);
            }
        });
    }

    private async updateSchemaVersion3To4() {
        return new Promise(async (resolve, reject) => {
            try {
                const tbl_motor_check: ColumnDefinition[] = [
                    { name: 'pos_pulse', type: 'INT' },
                    { name: 'pos_per', type: 'INT' },
                    { name: 'pos_tilt_per', type: 'INT' },
                    { name: 'app_mode', type: 'INT' },
                    { name: 'ramp', type: 'JSON' },
                    { name: 'network_lock', type: 'JSON' },
                    { name: 'network_config', type: 'JSON' },
                    { name: 'local_ui', type: 'JSON' },
                    { name: 'torque', type: 'JSON' },
                    { name: 'dct_mode', type: 'TINYINT' },
                    { name: 'touch_motion_sensitivity', type: 'JSON' }
                ];
                const missingColName: ColumnDefinition[] = await this.getMissingColumns('tbl_motor', tbl_motor_check);

                for (const col of missingColName) {
                    const defaultClause = col.default ? ` DEFAULT ${col.default}` : '';
                    const query = `ALTER TABLE tbl_motor ADD COLUMN ${col.name} ${col.type}${defaultClause};`;
                    await dbConfig.dbInstance.sequelize.query(query);
                }

                const tbl_device_check: ColumnDefinition[] = [
                    { name: 'disp_status', type: 'TINYINT', default: '0' },
                    { name: 'sun_mode', type: 'TEXT' },
                    { name: 'dct_lock', type: 'JSON' },
                    { name: 'firmware_version', type: 'TEXT' },
                    { name: 'app_version', type: 'TEXT' },
                    { name: 'stack_version', type: 'TEXT' }
                ];
                const missingDeviceColName: ColumnDefinition[] = await this.getMissingColumns('tbl_device', tbl_device_check);

                for (const col of missingDeviceColName) {
                    const defaultClause = col.default ? ` DEFAULT ${col.default}` : '';
                    const query = `ALTER TABLE tbl_device ADD COLUMN ${col.name} ${col.type}${defaultClause};`;
                    await dbConfig.dbInstance.sequelize.query(query);
                }

                const deviceCloneTable = await this.isTableExist('tbl_device_clone');
                if (deviceCloneTable) {
                    const data = await dbConfig.dbInstance.deviceCloneModel.findAll();
                    for (const item of data) {
                        if (!item.device_id && !item.address) continue;
                        if (!item.device_id && item.address) {
                            const deviceRecord = await dbConfig.dbInstance.deviceModel.findOne({ where: { address: item.address }, raw: true });
                            if (!deviceRecord) continue;
                            if (deviceRecord) {
                                item.device_id = deviceRecord.device_id;
                            }
                        }

                        let motorConfig: any = {}
                        motorConfig.pos_per = item.cur_pos;
                        motorConfig.direction = item.direction == 0 ? 'forward' : 'reverse';
                        motorConfig.app_mode = item.app_mode;
                        if (item.speed?.length && item.speed.length >= 3) {
                            motorConfig.up_speed = item?.speed[0];
                            motorConfig.down_speed = item?.speed[1];
                            motorConfig.slow_speed = item?.speed[2];
                        }
                        motorConfig.ramp = item.ramp;
                        motorConfig.dct_mode = item.dct_mode;
                        motorConfig.torque = item.torque;
                        motorConfig.touch_motion_sensitivity = item.touch_motion_sensitivity;
                        motorConfig.network_lock = null;
                        motorConfig.network_config = null;
                        motorConfig.local_ui = null;

                        if (item.network_lock?.length) {
                            try {
                                const networkLockData = this.CommandParser.decodeDataFrame('POST_NETWORK_LOCK', Buffer.from(item.network_lock), item.model_no, item.sub_node_id);
                                motorConfig.network_lock = [networkLockData.status, networkLockData.source_addr, networkLockData.priority];
                                if (networkLockData.saved) {
                                    motorConfig.network_lock.push(networkLockData.saved);
                                }
                            } catch (error) {
                                motorConfig.network_lock = null;
                            }
                        }

                        if (item.network_config?.length) {
                            try {
                                const networkConfigData = this.CommandParser.decodeDataFrame('POST_NETWORK_CONFIG', Buffer.from(item.network_config), item.model_no, item.sub_node_id);
                                motorConfig.network_config = [
                                    networkConfigData.broadcast_mode, networkConfigData.broadcast_max_random_value,
                                    networkConfigData.supervision_active, networkConfigData.supervision_time_period,
                                    networkConfigData.deaf_mode
                                ];
                            } catch (error) {
                                motorConfig.network_config = null;
                            }
                        }

                        if (item.local_ui?.length) {
                            try {
                                const localUIData = this.CommandParser.decodeDataFrame('POST_LOCAL_UI', Buffer.from(item.local_ui), item.model_no, item.sub_node_id);
                                motorConfig.local_ui = [localUIData.status, localUIData.source_addr, localUIData.priority];
                            } catch (error) {
                                motorConfig.local_ui = null;
                            }
                        }

                        await dbConfig.dbInstance.motorModel.update(motorConfig, {
                            where: { device_id: item.device_id, }
                        });

                        if (item.keypad_data?.length) {
                            for (const keypadItem of item.keypad_data) {
                                try {
                                    const keypadData = this.CommandParser.decodeDataFrame('POST_SWITCH_SETTING', Buffer.from(keypadItem.data), item.model_no, item.sub_node_id);
                                    const data = {
                                        key_no: keypadData.button_id,
                                        addr_code: keypadData.press_addr_code, target_address: keypadData.press_target_addr,
                                        press_command: keypadData.press_command, press_value: keypadData.press_value, press_extra_value: keypadData.press_extra_value,
                                        hold_command: keypadData.hold_command, hold_value: keypadData.hold_value, hold_extra_value: keypadData.hold_extra_value,
                                        release_command: keypadData.release_command, release_value: keypadData.release_value, release_extra_value: keypadData.release_extra_value
                                    };
                                    await dbConfig.dbInstance.keypadModel.update(data, {
                                        where: {
                                            device_id: item.device_id,
                                            key_no: keypadData.button_id
                                        }
                                    });
                                } catch (error) {
                                    console.log('error: ', error);
                                }
                            }
                        }

                        if (item.individual_switch_group?.length) {
                            try {
                                const switchGroupData = this.CommandParser.decodeDataFrame('POST_INDIVIDUAL_SWITCH_GROUPS', Buffer.from(item.individual_switch_group), item.model_no, item.sub_node_id);
                                for (const [key, value] of Object.entries(switchGroupData)) {
                                    const number = Number(key.match(/\d+/)?.[0]);
                                    await dbConfig.dbInstance.keypadModel.update({ group_address: value }, {
                                        where: { device_id: item.device_id, key_no: number }
                                    });
                                }
                            } catch (error) {
                                console.log('error: ', error);
                            }
                        }

                        if (item.channel?.length) {
                            await dbConfig.dbInstance.rtsReceiverModel.create({
                                device_id: item.device_id,
                                channel_no: item.channel[0],
                                is_configure: item.channel[1]
                            });
                        }
                    }
                }

                const subNodeInOfflineCommandTable = await this.isColumnExist('tbl_offline_command', 'sub_node_id');
                if (!subNodeInOfflineCommandTable) {
                    await dbConfig.dbInstance.sequelize.query(`ALTER TABLE tbl_offline_command ADD COLUMN sub_node_id INT;`);
                }

                await dbConfig.dbInstance.sequelize.query('UPDATE tbl_project SET schema_version = 4;');
                resolve(true);
            } catch (err) {
                reject(err);
            }
        });
    }

    private async isColumnExist(tableName: string, columnName: string) {
        return new Promise(async (resolve, reject) => {
            try {
                const results = await dbConfig.dbInstance.sequelize.query(`PRAGMA table_info( ${tableName});`);
                const column = results[0].findIndex((column: any) => column.name === columnName);
                resolve(column >= 0);

            } catch (err) {
                reject(err);
            }
        });
    }

    private async getMissingColumns(tableName: string, columnNames: ColumnDefinition[]): Promise<ColumnDefinition[]> {
        try {
            const results = await dbConfig.dbInstance.sequelize.query(`PRAGMA table_info( ${tableName});`);

            const existingColumns = new Set(
                results[0].map((col: any) => col.name)
            );
            const missingColumns = columnNames.filter(col => !existingColumns.has(col.name));

            return missingColumns;
        } catch (err) {
            throw err;
        }
    }

    private async isTableExist(tableName: string): Promise<boolean> {
        const [rows] = await dbConfig.dbInstance.sequelize.query(
            `SELECT EXISTS (SELECT 1 FROM sqlite_master WHERE type='table' AND name = :tableName) AS table_exists;`,
            {
                replacements: { tableName },
                type: dbConfig.dbInstance.sequelize.QueryTypes.SELECT,
            }
        )

        return (rows as any).table_exists === 1;
    }

}