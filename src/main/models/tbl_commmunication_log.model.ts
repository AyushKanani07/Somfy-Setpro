import { DataTypes, Sequelize } from 'sequelize';

export function CommunicationLogModel(sequelize: Sequelize) {
    return sequelize.define('tbl_communication_log', {
        communication_log_id: {
            type: DataTypes.INTEGER(),
            allowNull: false,
            primaryKey: true,
            autoIncrement: true
        },
        time: {
            type: DataTypes.DATE,
            allowNull: true
        },
        source_node_type: {
            type: DataTypes.STRING(100),
            allowNull: true
        },
        destination_node_type: {
            type: DataTypes.STRING(100),
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
        command: {
            type: DataTypes.STRING(50),
            allowNull: true
        },
        data: {
            type: DataTypes.STRING(100),
            allowNull: true
        },
        ack: {
            type: DataTypes.BOOLEAN,
            allowNull: true
        },
        frame: {
            type: DataTypes.STRING(200),
            allowNull: true
        },
        type: {
            type: DataTypes.ENUM('sent', 'received', 'unknown-received', 'unknown-sent'),
            allowNull: true
        },
    }, {
        tableName: 'tbl_communication_log'
    });
}