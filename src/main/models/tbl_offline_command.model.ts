import { DataTypes, Sequelize } from 'sequelize';

export function OfflineCommandModel(sequelize: Sequelize) {
    return sequelize.define('tbl_offline_command', {
        id: {
            type: DataTypes.INTEGER(),
            allowNull: false,
            primaryKey: true,
            autoIncrement: true
        },
        command: {
            type: DataTypes.STRING(50),
            allowNull: true
        },
        ack: {
            type: DataTypes.STRING(10),
            allowNull: true
        },
        node_type: {
            type: DataTypes.INTEGER(),
            allowNull: true
        },
        source: {
            type: DataTypes.STRING(20),
            allowNull: true
        },
        destination: {
            type: DataTypes.STRING(20),
            allowNull: true
        },
        data: {
            type: DataTypes.JSON,
            allowNull: true
        },
        sub_node_id: {
            type: DataTypes.INTEGER(),
            allowNull: true
        }
    }, {
        tableName: 'tbl_offline_command'
    });
}