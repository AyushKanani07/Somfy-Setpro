import { DataTypes, Sequelize } from 'sequelize';

export function FloorModel(sequelize: Sequelize) {
    return sequelize.define('tbl_floor', {
        floor_id: {
            type: DataTypes.INTEGER(),
            allowNull: false,
            primaryKey: true,
            autoIncrement: true
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
        tableName: 'tbl_floor'
    });
}
