import { Sequelize } from 'sequelize';
import { FloorModel } from './tbl_floor.model.ts';
import projectService from '../services/project.service.ts';
import { RoomModel } from './tbl_room.model.ts';
import { MotorModel } from './tbl_motor.model.ts';
import { KeypadModel } from './tbl_keypad.model.ts';
import { DeviceModel } from './tbl_device.model.ts';
import { GroupModel } from './tbl_group.model.ts';
import { GroupDeviceMapModel } from './tbl_group_device_map.model.ts';
import { AuditLogModel } from './tbl_audit_log.model.ts';
import { ProjectModel } from './tbl_project.model.ts';
import { CommunicationLogModel } from './tbl_commmunication_log.model.ts';
import { OfflineCommandModel } from './tbl_offline_command.model.ts';
import { getDBPath } from '../helpers/util.ts';
import _ from 'underscore';
import { DeviceCloneModel } from './tbl_device_clone.model.ts';
import type { dbInstance } from '../interface/global.ts';
import { RtsTransmitterModel } from './tbl_rts_transmitter.model.ts';
import { RtsReceiverModel } from './tbl_rts_receiver.model.ts';
const DB_PATH = getDBPath();
export class dbConfig {

    private static db: dbInstance = { sequelize: null };
    private static DATABASE: string = "";
    private static USER: string = "";
    private static PASSWORD: string = "";
    private static HOST: string = "0.0.0.0";

    public static async initializeConfig() {
        if (this.db.sequelize) {
            await this.db.sequelize.close()
            this.db.sequelize = null;
        }
        if (!process.env.SOMFY_DATABASE_NAME || process.env.SOMFY_DATABASE_NAME == 'undefined') {
            process.env.SOMFY_DATABASE_NAME = await projectService.getSelectedProjectConfig();
        }
        this.DATABASE = process.env.SOMFY_DATABASE_NAME ? DB_PATH + process.env.SOMFY_DATABASE_NAME + ".somfy" : "";
        if (this.DATABASE) {
            let sequelize: Sequelize = new Sequelize(this.DATABASE, this.USER, this.PASSWORD, {
                host: this.HOST,
                dialect: 'sqlite',
                pool: {
                    max: 25,
                    min: 0,
                    idle: 10000
                },
                logging: false,
                username: "shivam",
                password: "qwe",
                ssl: true,
                storage: this.DATABASE
            });
            this.db.sequelize = sequelize;
            // sequelize.authenticate().then((err: any) => {
            //     console.log('Connection has been established successfully.');
            //     sequelize.sync().then(() => {
            //         // self.manageDBColumn();
            //     }, (err) => {
            //         this.db.error = err;
            //     });
            //     this.createModel(sequelize);
            // });
            try {
                await sequelize.authenticate();
                console.log('Connection has been established successfully.');

                this.createModel(sequelize);
                await sequelize.sync();
                await this.manageDBColumn();

            } catch (error) {
                this.db.error = error;
            }
        }
    }

    static createModel(sequelize: Sequelize) {
        this.db.floorModel = FloorModel(sequelize);
        this.db.roomModel = RoomModel(sequelize);
        this.db.motorModel = MotorModel(sequelize);
        this.db.keypadModel = KeypadModel(sequelize);
        this.db.deviceModel = DeviceModel(sequelize);
        this.db.groupModel = GroupModel(sequelize);
        this.db.groupDeviceMapModel = GroupDeviceMapModel(sequelize);
        this.db.auditLogModel = AuditLogModel(sequelize);
        this.db.projectModel = ProjectModel(sequelize);
        this.db.communicationLogModel = CommunicationLogModel(sequelize);
        this.db.offlineCommandModel = OfflineCommandModel(sequelize);
        this.db.deviceCloneModel = DeviceCloneModel(sequelize);
        this.db.rtsTransmitterModel = RtsTransmitterModel(sequelize);
        this.db.rtsReceiverModel = RtsReceiverModel(sequelize);
    }

    static async manageDBColumn() {
        const column_exist = await this.isColumnExist('sub_node_id', 'tbl_device');
        if (!column_exist) {
            const add_column_query = `ALTER TABLE tbl_device ADD COLUMN 'sub_node_id' INT(45);`;
            await this.db.sequelize.query(add_column_query, { type: this.db.sequelize.QueryTypes.SELECT });
        }

        const isDispStatusExist = await this.isColumnExist('disp_status', 'tbl_device');
        if (!isDispStatusExist) {
            const add_column_query = `ALTER TABLE tbl_device ADD COLUMN 'disp_status' TINYINT(1) DEFAULT 0;`;
            await this.db.sequelize.query(add_column_query, { type: this.db.sequelize.QueryTypes.SELECT });
        }
    }

    static isColumnExist(column: string, table: string) {
        return new Promise(async (resolve, reject) => {
            try {
                const column_lst = await this.db.sequelize.query(`PRAGMA table_info(${table})`, { type: this.db.sequelize.QueryTypes.SELECT });
                if (column_lst && column_lst.length) {
                    const check_column = _.findWhere(column_lst, { name: column });
                    if (check_column) {
                        resolve(true);
                    } else {
                        resolve(false);
                    }
                } else {
                    resolve(false);
                }
            } catch (err) {
                console.log(err);
                resolve(false);
            }
        });
    }

    public static get dbInstance(): dbInstance {
        return this.db;
    }
}

