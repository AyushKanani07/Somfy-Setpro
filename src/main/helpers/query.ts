import { QueryTypes } from 'sequelize';
import { dbConfig } from '../models';

export const SelectQuery = (query: string) => {
    return dbConfig.dbInstance.sequelize.query(query, { type: QueryTypes.SELECT });
};

export const InsertQuery = (query: string) => {
    return dbConfig.dbInstance.sequelize.query(query, { type: QueryTypes.INSERT });
};

export const UpdateQuery = (query: string) => {
    return dbConfig.dbInstance.sequelize.query(query, { type: QueryTypes.UPDATE });
};

export const CreateQuery = (query: string) => {
    return dbConfig.dbInstance.sequelize.query(query);
};
