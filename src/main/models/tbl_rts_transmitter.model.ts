import { DataTypes, Sequelize } from 'sequelize';

export function RtsTransmitterModel(sequelize: Sequelize) {
    return sequelize.define('tbl_rts_transmitter', {
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
        rts_address: {
            type: DataTypes.STRING(20),
            allowNull: true
        },
        frequency_mode: {
            type: DataTypes.ENUM('us', 'ce'),
            allowNull: true
        },
        application_mode: {
            type: DataTypes.ENUM('rolling', 'tilting'),
            allowNull: true
        },
        feature_set_mode: {
            type: DataTypes.ENUM('modulis', 'normal'),
            allowNull: true
        },
        tilt_frame_us: {
            type: DataTypes.INTEGER(),
            allowNull: true
        },
        tilt_frame_ce: {
            type: DataTypes.INTEGER(),
            allowNull: true
        },
        dim_frame: {
            type: DataTypes.INTEGER(),
            allowNull: true
        }
    }, {
        tableName: 'tbl_rts_transmitter'
    });
}