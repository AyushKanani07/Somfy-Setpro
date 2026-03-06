import { DataTypes, Sequelize } from 'sequelize';

export function MotorModel(sequelize: Sequelize) {
    return sequelize.define('tbl_motor', {
        device_id: {
            type: DataTypes.INTEGER(),
            allowNull: false,
            primaryKey: true,
            references: {
                model: 'tbl_device',
                key: 'device_id'
            }
        },
        ip_data: {
            type: DataTypes.JSON,
            allowNull: true
        },
        direction: {
            type: DataTypes.ENUM('forward', 'reverse'),
            allowNull: true
        },
        up_limit: {
            type: DataTypes.INTEGER(),
            allowNull: true
        },
        down_limit: {
            type: DataTypes.INTEGER(),
            allowNull: true
        },
        up_speed: {
            type: DataTypes.INTEGER(),
            allowNull: true
        },
        down_speed: {
            type: DataTypes.INTEGER(),
            allowNull: true
        },
        slow_speed: {
            type: DataTypes.INTEGER(),
            allowNull: true
        },
        up_ramp: {
            type: DataTypes.INTEGER(),
            allowNull: true
        },
        down_ramp: {
            type: DataTypes.INTEGER(),
            allowNull: true
        },
        ramp: {
            type: DataTypes.JSON,
            allowNull: true
        },
        pos_per: {
            type: DataTypes.INTEGER(),
            allowNull: true
        },
        pos_pulse: {
            type: DataTypes.INTEGER(),
            allowNull: true
        },
        pos_tilt_per: {
            type: DataTypes.INTEGER(),
            allowNull: true
        },
        app_mode: {
            type: DataTypes.INTEGER(),
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
            type: DataTypes.INTEGER(),
            allowNull: true
        },
        touch_motion_sensitivity: {
            type: DataTypes.JSON,
            allowNull: true
        },
        move_count: {
            type: DataTypes.INTEGER(),
            allowNull: true
        },
        revolution_count: {
            type: DataTypes.INTEGER(),
            allowNull: true
        },
        thermal_count: {
            type: DataTypes.INTEGER(),
            allowNull: true
        },
        post_thermal_count: {
            type: DataTypes.INTEGER(),
            allowNull: true
        },
        obstacle_count: {
            type: DataTypes.INTEGER(),
            allowNull: true
        },
        post_obstacle_count: {
            type: DataTypes.INTEGER(),
            allowNull: true
        },
        power_cut_count: {
            type: DataTypes.INTEGER(),
            allowNull: true
        },
        reset_count: {
            type: DataTypes.INTEGER(),
            allowNull: true
        },
        fw_version: {
            type: DataTypes.STRING(20),
            allowNull: true
        },
    }, {
        tableName: 'tbl_motor'
    });
}
