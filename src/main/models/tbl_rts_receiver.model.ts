import { DataTypes, Sequelize } from 'sequelize';

export function RtsReceiverModel(sequelize: Sequelize) {
    return sequelize.define('tbl_rts_receiver', {
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
        channel_no: {
            type: DataTypes.INTEGER(),
            allowNull: false
        },
        is_configure: {
            type: DataTypes.BOOLEAN,
            allowNull: true
        }
    }, {
        tableName: 'tbl_rts_receiver'
    });
}