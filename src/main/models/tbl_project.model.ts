import { DataTypes, Sequelize } from 'sequelize';

export function ProjectModel(sequelize: Sequelize) {
    return sequelize.define('tbl_project', {
        project_id: {
            type: DataTypes.STRING(50),
            allowNull: false,
        },
        name: {
            type: DataTypes.STRING(100),
            allowNull: true
        },
        address: {
            type: DataTypes.STRING(200),
            allowNull: true
        },
        building_type_id: {
            type: DataTypes.INTEGER(),
            allowNull: true
        },
        last_group_address: {
            type: DataTypes.STRING(20),
            allowNull: true,
            defaultValue: '1.1.0'
        },
        schema_version: {
            type: DataTypes.INTEGER(),
            allowNull: false,
            defaultValue: 1
        }
    }, {
        tableName: 'tbl_project'
    });
}