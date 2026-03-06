import { DataTypes, Sequelize } from 'sequelize';

export function GroupDeviceMapModel(sequelize: Sequelize) {
    return sequelize.define('tbl_group_device_map', {
        group_device_map_id: {
            type: DataTypes.INTEGER(),
            allowNull: false,
            primaryKey: true,
            autoIncrement: true
        },
        group_id: {
            type: DataTypes.INTEGER(),
            allowNull: true,
            references: {
                model: 'tbl_group',
                key: 'group_id'
            }
        },
        device_id: {
            type: DataTypes.INTEGER(),
            allowNull: true,
            references: {
                model: 'tbl_device',
                key: 'device_id'
            }
        },
        device_group_pos: {
            type: DataTypes.INTEGER(),
            allowNull: true
        }
    }, {
        tableName: 'tbl_group_device_map'
    });
}
