import { DataTypes, Sequelize } from 'sequelize';

export function DeviceCloneModel(sequelize: Sequelize) {
    return sequelize.define('tbl_device_clone', {
        id: {
            type: DataTypes.INTEGER(),
            allowNull: false,
            primaryKey: true,
            autoIncrement: true
        },
        device_id: {
            type: DataTypes.INTEGER(),
            references: {
                model: 'tbl_device',
                key: 'device_id'
            }
        },
        device_type: {
            type: DataTypes.ENUM('motor', 'keypad', 'rts-reciever', 'rts-transmitter', 'rs485-setting'),
            allowNull: true
        },
        address: {
            type: DataTypes.STRING(),
            allowNull: true
        },
        name: {
            type: DataTypes.STRING(),
            allowNull: true
        },
        cur_pos: {
            type: DataTypes.INTEGER(),
            allowNull: true
        },
        sub_node_id: {
            type: DataTypes.INTEGER(),
            allowNull: true
        },
        model_no: {
            type: DataTypes.INTEGER(),
            allowNull: true
        },
        direction: {
            type: DataTypes.INTEGER(),
            allowNull: true
        },
        app_mode: {
            type: DataTypes.TINYINT(), // allow 0, 1, 2, 3
            allowNull: true
        },
        down_limit: {
            type: DataTypes.INTEGER(),
            allowNull: true
        },
        speed: {
            type: DataTypes.JSON,
            allowNull: true
        },
        ip: {
            type: DataTypes.JSON,
            allowNull: true
        },
        group: {
            type: DataTypes.JSON,
            allowNull: true
        },
        ramp: {
            type: DataTypes.JSON,
            allowNull: true
        },
        network_lock: {
            type: DataTypes.JSON,
            allowNull: true
        },
        network_config: {
            type: DataTypes.JSON,
            allowNull: true
        },
        local_ui: {
            type: DataTypes.JSON,
            allowNull: true
        },
        torque: {
            type: DataTypes.JSON,
            allowNull: true
        },
        dct_mode: {
            type: DataTypes.TINYINT(),
            allowNull: true
        },
        touch_motion_sensitivity: {
            type: DataTypes.JSON,
            allowNull: true
        },
        identity: {
            type: DataTypes.JSON,
            allowNull: true
        },
        keypad_data: {
            type: DataTypes.JSON,
            allowNull: true
        },
        individual_switch_group: {
            type: DataTypes.JSON,
            allowNull: true
        },
        channel: {
            type: DataTypes.JSON,
            allowNull: true
        },
    }, {
        tableName: 'tbl_device_clone'
    });
}
