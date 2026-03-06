import { DataTypes, Sequelize } from 'sequelize';

export function AuditLogModel(sequelize: Sequelize) {

    return sequelize.define('tbl_audit_log', {
        audit_log_id: {
            type: DataTypes.INTEGER(),
            allowNull: false,
            primaryKey: true,
            autoIncrement: true
        },
        action_entity: {
            type: DataTypes.ENUM('device', 'group', 'room', 'floor', 'group_map', 'motor_setting', 'keypad_setting'),
            allowNull: true
        },
        action_type: {
            type: DataTypes.STRING(30),
            allowNull: true
        },
        action_data: {
            type: DataTypes.JSON,
            allowNull: true
        },
        action_response: {
            type: DataTypes.JSON,
            allowNull: true
        },
        action_status: {
            type: DataTypes.BOOLEAN,
            allowNull: true,
            defaultValue: '1'
        }
    }, {
        tableName: 'tbl_audit_log'
    });
}
