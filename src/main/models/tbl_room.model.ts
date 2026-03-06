import { DataTypes, Sequelize } from 'sequelize';

export function RoomModel(sequelize: Sequelize) {
    return sequelize.define('tbl_room', {
        room_id: {
            type: DataTypes.INTEGER(),
            allowNull: false,
            primaryKey: true,
            autoIncrement: true
        },
        floor_id: {
            type: DataTypes.INTEGER(),
            allowNull: true
        },
        name: {
            type: DataTypes.STRING(100),
            allowNull: true
        },
        disp_order: {
            type: DataTypes.INTEGER(),
            allowNull: true
        }
    }, {
        tableName: 'tbl_room'
    });
}
