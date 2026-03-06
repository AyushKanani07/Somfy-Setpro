import { DataTypes, Sequelize } from 'sequelize';

export function KeypadModel(sequelize: Sequelize) {
    return sequelize.define('tbl_keypad', {
        id: {
            type: DataTypes.INTEGER(),
            allowNull: false,
            primaryKey: true,
            autoIncrement: true,
        },
        device_id: {
            type: DataTypes.INTEGER(),
            allowNull: false,
            references: {
                model: 'tbl_device',
                key: 'device_id'
            }
        },
        target_address: {
            type: DataTypes.STRING(20),
            allowNull: true
        },
        key_no: {
            type: DataTypes.INTEGER(),
            allowNull: true
        },
        operation_type: {
            type: DataTypes.ENUM('normal', 'sequence'),
            allowNull: true
        },
        addr_code: {
            type: DataTypes.ENUM('0', '128', '1', '2', '64', '192', '65', '66'),
            allowNull: true
        },
        press_command: {
            type: DataTypes.INTEGER(),
            allowNull: true
        },
        press_value: {
            type: DataTypes.INTEGER(),
            allowNull: true
        },
        press_extra_value: {
            type: DataTypes.INTEGER(),
            allowNull: true
        },
        hold_command: {
            type: DataTypes.INTEGER(),
            allowNull: true
        },
        hold_value: {
            type: DataTypes.INTEGER(),
            allowNull: true
        },
        hold_extra_value: {
            type: DataTypes.INTEGER(),
            allowNull: true
        },
        release_command: {
            type: DataTypes.INTEGER(),
            allowNull: true
        },
        release_value: {
            type: DataTypes.INTEGER(),
            allowNull: true
        },
        release_extra_value: {
            type: DataTypes.INTEGER(),
            allowNull: true
        },
        group_address: {
            type: DataTypes.STRING(10),
            allowNull: true
        },
    }, {
        tableName: 'tbl_keypad'
    });
}
/*
0   - groupALl
128 - specific group
1   - motorAll
2   - specific motor

64  - seq groupALl
192 - seq specific group
65  - seq motorAll
66  - seq specific motor
*/