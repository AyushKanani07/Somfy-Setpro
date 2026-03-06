import type { AddProject } from '../interface/project.ts';
import { getDBPath, uniqueProjectId } from '../helpers/util.ts';
import * as fs from 'fs';
import { readFile, writeFile } from 'fs/promises';
import { existsSync, mkdirSync } from 'fs';
import { dbConfig } from '../models/index.ts';
const DB_PATH = getDBPath();
class ProjectService {
    PROJECT_CONFIG: AddProject[] = [];
    constructor() {
    }

    /**
     * This function takes an array of objects, sorts the array by the value of the 'name' property of
     * each object, and then writes the sorted array to a file.
     * @param {any} value - the value of the parameter
     */
    public set _projectConfig(value: any) {
        this.PROJECT_CONFIG = this.sortArray(value);
        writeFile(DB_PATH + 'sdn-project-config.json', JSON.stringify(value), 'utf8');
    }

    /**
     * If the directory doesn't exist, create it.
     * If the file doesn't exist, create it.
     * If the file exists, read it.
     * @returns An array of objects.
     */
    getAllProjectConfigs(): any {
        if (!existsSync(process.env.LOCALAPPDATA + "/Somfy")) {
            mkdirSync(process.env.LOCALAPPDATA + "/Somfy");
        }
        if (!existsSync(process.env.LOCALAPPDATA + "/Somfy/Set pro")) {
            mkdirSync(process.env.LOCALAPPDATA + "/Somfy/Set pro");
        }
        if (!existsSync(process.env.LOCALAPPDATA + "/Somfy/Set pro/db")) {
            mkdirSync(process.env.LOCALAPPDATA + "/Somfy/Set pro/db");
        }
        if (!existsSync(process.env.LOCALAPPDATA + "/Somfy/Set pro/firmware")) {
            mkdirSync(process.env.LOCALAPPDATA + "/Somfy/Set pro/firmware");
        }
        if (!fs.existsSync(DB_PATH + 'sdn-project-config.json')) {
            fs.writeFileSync(DB_PATH + 'sdn-project-config.json', '[]');
        }
        return readFile(DB_PATH + 'sdn-project-config.json', 'utf8');
    }

    public sortArray(project: AddProject[]) {
        project.sort((a: { last_opened: string | number | Date; }, b: { last_opened: string | number | Date; }) => {
            return new Date(b.last_opened).getTime() - new Date(a.last_opened).getTime();
        });
        return project;
    }

    /**`
     * It takes an object, adds a unique id to it, sets a property to false, gets all the projects,
     * parses them, pushes the new object to the array, and returns the array.
     * @param {AddProject} objParam - AddProject = {
     * @returns The return value is the value of the constant PROJECT_CONFIG.
     */
    public async createProjectConfig(objParam: AddProject) {
        objParam.project_id = objParam.project_id ?? uniqueProjectId();
        objParam.selected = false;
        objParam.last_opened = new Date();
        const project_config = await this.getAllProjectConfigs();
        let project: AddProject[] = project_config ? JSON.parse(project_config) : [];
        project.push(objParam);
        this._projectConfig = project;
        return this.PROJECT_CONFIG.find(project => project.project_id === objParam.project_id);
        // return this.PROJECT_CONFIG;
    }

    /**
     * It gets all the project configs, then it finds the project config with the project_id that
     * matches the project_id that was passed in
     * @param {string} project_id - string
     * @returns The projectConfig object.
     */
    public async getProjectConfigById(project_id: string) {
        const project_config = await this.getAllProjectConfigs();
        let project: AddProject[] = project_config ? JSON.parse(project_config) : [];
        let projectConfig = project.find(project => project.project_id === project_id);
        return projectConfig;
    }

    /**
     * It takes an object, finds the object in an array, updates the object in the array, and returns
     * the array.
     * @param {AddProject} objParam - AddProject = {
     * @param {any} global - any = {
     * @returns The return value is a promise.
     */
    public updateProjectConfig(objParam: AddProject, version?: number) {
        return new Promise(async (resolve, reject) => {
            const project_config = await this.getAllProjectConfigs();
            let project: AddProject[] = project_config ? JSON.parse(project_config) : [];
            let projectConfig = project.find(project => project.project_id === objParam.project_id);
            if (projectConfig) {
                this.updateProjectInDB(objParam, version);
                let index = project.indexOf(projectConfig);
                project[index] = objParam;
                this._projectConfig = project;
            }
            resolve(this.PROJECT_CONFIG);
        });
    }

    /**
     * It updates a project in the database, but only if the project exists. If it doesn't exist, it
     * creates it.
     * @param {AddProject} objParam - AddProject -&gt; This is the object that I'm passing to the
     * function.
     * @param {any} global - is the object that contains the sequelize instance and the model
     */
    async updateProjectInDB(objParam: AddProject, version?: number) {
        setTimeout(async () => {
            const get_project = await dbConfig.dbInstance.projectModel.findOne();
            if (get_project) {
                await dbConfig.dbInstance.projectModel.update(objParam, {
                    where: {
                        project_id: objParam.project_id
                    }
                });
            } else {
                await dbConfig.dbInstance.projectModel.create({ ...objParam, schema_version: version });
            }
        }, 3000);
    }


    /**
     * It takes a project_id as a parameter, finds the project in the array of projects, and then
     * deletes it
     * @param {string} project_id - string
     * @returns A promise that resolves to true.
     */
    public async deleteProjectConfigById(project_id: string) {
        return new Promise(async (resolve, reject) => {
            const project_config = await this.getAllProjectConfigs();
            let project: AddProject[] = project_config ? JSON.parse(project_config) : [];
            let projectConfig = project.find(project => project.project_id === project_id);
            if (projectConfig) {
                let index = project.indexOf(projectConfig);
                project.splice(index, 1);
                this._projectConfig = project;
            }
            resolve(true);
        });
    }

    public async unSelectAllProjectConfig(project_id: string) {
        const project_config = await this.getAllProjectConfigs();
        let project: AddProject[] = project_config ? JSON.parse(project_config) : [];
        project.forEach(element => {
            if (element.project_id !== project_id) {
                element.selected = false;
            } else {
                element.selected = true;
            }
        });
        this._projectConfig = project;
    }

    /**
     * If there is a project config, return the project id of the first project config that is
     * selected, otherwise return an empty string.
     */
    public async getSelectedProjectConfig() {
        const project_config = await this.getAllProjectConfigs();
        let project: AddProject[] = project_config ? JSON.parse(project_config) : [];
        if (project && project.length > 0) {
            let projectConfig = project.find(project => project.selected === true);
            if (projectConfig) {
                return projectConfig.project_id;
            } else {
                return "";
            }
        } else {
            return "";
        }
    }

    public async getSchemaVersion() {
        return new Promise<number>(async (resolve, reject) => {
            try {
                const project_info = await dbConfig.dbInstance.projectModel.findOne();
                if (project_info) {
                    resolve(project_info.schema_version);
                } else {
                    resolve(1);
                }
            } catch (err) {
                resolve(1);
            }
        });
    }
}

export default new ProjectService();
