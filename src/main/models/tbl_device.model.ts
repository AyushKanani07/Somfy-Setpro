import { DataTypes, Sequelize } from 'sequelize';

export function DeviceModel(sequelize: Sequelize) {
    return sequelize.define('tbl_device', {
        device_id: {
            type: DataTypes.INTEGER(),
            allowNull: false,
            primaryKey: true,
            autoIncrement: true
        },
        room_id: {
            type: DataTypes.INTEGER(),
            allowNull: true,
            defaultValue: 0
        },
        name: {
            type: DataTypes.STRING(30),
            allowNull: true
        },
        address: {
            type: DataTypes.STRING(10),
            allowNull: false,
            // unique: true
        },
        device_type: {
            type: DataTypes.ENUM('motor', 'keypad', 'rts-reciever', 'rts-transmitter', 'rs485-setting'),
            allowNull: true
        },
        model_no: {
            type: DataTypes.INTEGER(),
            allowNull: true
        },
        key_count: {
            type: DataTypes.INTEGER(),
            allowNull: true
        },
        is_limit_set: {
            type: DataTypes.BOOLEAN,
            allowNull: true,
            defaultValue: true
        },
        group_count: {
            type: DataTypes.INTEGER(),
            allowNull: true,
            defaultValue: 0
        },
        sub_node_id: {
            type: DataTypes.INTEGER(),
            allowNull: true
        },
        disp_status: {
            type: DataTypes.BOOLEAN,
            allowNull: true,
            defaultValue: false
        },
        disp_order: {
            type: DataTypes.INTEGER(),
            allowNull: true
        },
        sun_mode: {
            type: DataTypes.ENUM('on', 'off'),
            allowNull: true
        },
        dct_lock: {
            type: DataTypes.JSON(),
            allowNull: true
        },
        firmware_version: {
            type: DataTypes.STRING(20),
            allowNull: true
        },
        app_version: {
            type: DataTypes.STRING(50),
            allowNull: true
        },
        stack_version: {
            type: DataTypes.STRING(20),
            allowNull: true
        }
    }, {
        tableName: 'tbl_device'
    });
}