import { DataTypes, Sequelize } from 'sequelize';

export function GroupModel(sequelize: Sequelize) {
    return sequelize.define('tbl_group', {
        group_id: {
            type: DataTypes.INTEGER(),
            allowNull: false,
            primaryKey: true,
            autoIncrement: true
        },
        name: {
            type: DataTypes.STRING(30),
            allowNull: true
        },
        address: {
            type: DataTypes.STRING(10),
            allowNull: true
        },
        disp_order: {
            type: DataTypes.INTEGER(),
            allowNull: true
        }
    }, {
        tableName: 'tbl_group'
    });
}
