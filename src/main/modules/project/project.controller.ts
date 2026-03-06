import type { NextFunction } from 'express';
import type { Request } from 'express';
import type { Response } from 'express';

import HttpStatus from '../../helpers/http-status.ts';
import type { AddProject } from '../../interface/project.ts';
import { dbConfig } from '../../models/index.ts';
import projectService from '../../services/project.service.ts';
import fsp from 'node:fs/promises';
import { getDBPath, sleep } from '../../helpers/util.ts';
import { SchemaService } from '../../services/schema.service.ts';
import { Op } from 'sequelize';
import { FirmwareUpdateService } from '../../services/firmware-update/firmware-update.service.ts';
import { ImportExportManager } from '../../services/import-export/import-export-manager.ts';
import path from 'path';
const extension = '.somfy';
export class ProjectController {

    model: any;
    private schemaService = new SchemaService();
    private firmwareUpdateService = new FirmwareUpdateService();
    private importExportManager = new ImportExportManager();

    constructor() {

        setTimeout(async () => {
            await dbConfig.initializeConfig();
        }, 1000);
    }

    getProject = async (req: Request, res: Response, next: NextFunction) => {
        try {
            let project_config = await projectService.getAllProjectConfigs();
            project_config = project_config ? JSON.parse(project_config) : [];
            return HttpStatus.OkResponse('Ok', res, project_config);
        } catch (err) {
            next(err);
        }
    };

    createProject = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const create_project = await projectService.createProjectConfig(req.body);
            return HttpStatus.OkResponse("Project saved successfully", res, create_project);
        } catch (err) {
            next(err);
        }
    };

    updateLastOpen = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const project = await projectService.getProjectConfigById(req.params.project_id);
            const version = req.body.version ?? 1;
            if (project) {
                await projectService.unSelectAllProjectConfig(project.project_id);
                process.env.SOMFY_DATABASE_NAME = project.project_id;
                await dbConfig.initializeConfig();
                project.last_opened = new Date();
                project.selected = true;
                await projectService.updateProjectConfig(project, version);
                await sleep(1000);

                const schema_version: number = await projectService.getSchemaVersion();
                if (schema_version > version) {
                    return HttpStatus.BadRequestResponse("Please update your software", res, project);
                } else if (schema_version < version) {
                    await this.schemaService.updateSchemaVersion(schema_version, version);
                    await dbConfig.initializeConfig();
                    await sleep(3000);
                }

                return HttpStatus.OkResponse("Project updated successfully", res, project);
            } else {
                return HttpStatus.NotFoundResponse("Project not found", res);
            }
        } catch (err) {
            next(err);
        }
    };

    updateProject = async (req: Request, res: Response, next: NextFunction) => {
        try {
            var objBody = req.body;
            const get_project = await projectService.getProjectConfigById(req.params.project_id);
            if (get_project) {
                let project: AddProject = objBody;
                project.project_id = req.params.project_id;
                await projectService.updateProjectConfig(project);
                return HttpStatus.OkResponse("Project updated successfully", res, project);
            } else {
                return HttpStatus.NotFoundResponse("Project not found", res);
            }
        } catch (err) {
            next(err);
        }
    };

    deleteProject = async (req: Request, res: Response, next: NextFunction) => {
        try {
            if (dbConfig.dbInstance.sequelize) {
                dbConfig.dbInstance.sequelize.close();
                dbConfig.dbInstance.sequelize = null;
            }
            await projectService.deleteProjectConfigById(req.params.project_id);
            const DB_PATH = getDBPath();
            const file_path = path.join(DB_PATH, req.params.project_id + extension);

            await fsp.unlink(file_path);

            return HttpStatus.OkResponse("Project deleted successfully", res);
        } catch (err) {
            next(err);
        }
    };

    getProjectById = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const project = await projectService.getProjectConfigById(req.params.project_id);
            return HttpStatus.OkResponse('Ok', res, project);
        } catch (err) {
            next(err);
        }
    };

    exportProject = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const DB_PATH = getDBPath() + "" + req.params.project_id + extension;
            // res.setHeader('Content-disposition', 'attachment; filename=' + req.params.project_id + '.somfy');
            // res.setHeader('Content-type', 'application/octet-stream');
            // const file = fs.createReadStream(DB_PATH);
            // res.attachment(req.params.project_id + '.somfy');
            // return res.send(file);
            res.download(DB_PATH);
        } catch (err) {
            next(err);
        }
    };

    importProject = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const fileData = req.file;
            const version = Number(req.body.version);
            if (!fileData) {
                return HttpStatus.BadRequestResponse('No file uploaded', res);
            }
            const fileName = fileData.filename.split('.')[0];

            //Initialize DB with new project
            process.env.SOMFY_DATABASE_NAME = fileName;
            await dbConfig.initializeConfig();
            if (dbConfig.dbInstance.error) {
                next(dbConfig.dbInstance.error);
                setTimeout(() => {
                    dbConfig.dbInstance.error = null;
                }, 1000);
                return;
            }

            const schema_version: number = await projectService.getSchemaVersion();
            if (schema_version > version) {
                return HttpStatus.BadRequestResponse("Please update your software", res, null);
            } else if (schema_version < version) {
                await this.schemaService.updateSchemaVersion(schema_version, version);
                await dbConfig.initializeConfig();
                await sleep(3000);
            }

            const get_project = await projectService.getProjectConfigById(fileName);

            if (get_project) {
                return HttpStatus.OkResponse("Project updated successfully", res, null);
            } else {
                const get_project = await dbConfig.dbInstance.projectModel.findOne();
                if (!get_project) return HttpStatus.BadRequestResponse("Something went wrong", res);

                let create_project_obj: AddProject = {
                    building_type_id: get_project.building_type_id,
                    name: get_project.name,
                    address: get_project.address,
                    project_id: fileName,
                    selected: true,
                    last_opened: new Date()
                };

                await projectService.createProjectConfig(create_project_obj);
                return HttpStatus.OkResponse("Project imported successfully", res, create_project_obj);
            }

        } catch (err) {
            next(err);
        }
    };

    getDashboardCount = async (req: Request, res: Response, next: NextFunction) => {
        try {
            let response_obj = {
                floor_count: 0,
                room_count: 0,
                motor_count: 0,
                keypad_count: 0,
                group_count: 0,
                assigned_motor_count: 0,
                unassigned_motor_count: 0,
                assigned_keypad_count: 0,
                unassigned_keypad_count: 0
            };
            response_obj.floor_count = await dbConfig.dbInstance.floorModel.count();
            response_obj.room_count = await dbConfig.dbInstance.roomModel.count();
            response_obj.motor_count = await dbConfig.dbInstance.deviceModel.count({ where: { device_type: 'motor' } });
            response_obj.keypad_count = await dbConfig.dbInstance.deviceModel.count({ where: { device_type: 'keypad' } });
            response_obj.group_count = await dbConfig.dbInstance.groupModel.count();
            response_obj.assigned_motor_count = await dbConfig.dbInstance.deviceModel.count({
                where: {
                    device_type: 'motor',
                    room_id: {
                        [Op.gte]: 1
                    }
                }
            });
            response_obj.unassigned_motor_count = await dbConfig.dbInstance.deviceModel.count({
                where: {
                    device_type: 'motor',
                    [Op.or]: [
                        { room_id: null },
                        { room_id: 0 }
                    ]
                }
            });
            response_obj.assigned_keypad_count = await dbConfig.dbInstance.deviceModel.count({
                where: {
                    device_type: 'keypad',
                    room_id: {
                        [Op.gte]: 1
                    }
                }
            });
            response_obj.unassigned_keypad_count = await dbConfig.dbInstance.deviceModel.count({
                where: {
                    device_type: 'keypad',
                    [Op.or]: [
                        { room_id: null },
                        { room_id: 0 }
                    ]
                }
            });
            return HttpStatus.OkResponse('Ok', res, response_obj);
        } catch (err) {
            next(err);
        }
    };

    getLastGroupAddress = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const last_group_addresses = await dbConfig.dbInstance.projectModel.findOne();
            return HttpStatus.OkResponse('Ok', res, last_group_addresses.last_group_address);
        } catch (err) {
            next(err);
        }
    };

    updateLastGroupAddress = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const last_group_addresses = await dbConfig.dbInstance.projectModel.findOne();
            last_group_addresses.last_group_address = req.body.address;
            await last_group_addresses.save();
            return HttpStatus.OkResponse('Ok', res, last_group_addresses.last_group_address);
        } catch (err) {
            next(err);
        }
    };

    // read firmware update file
    uploadFirmwareFile = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const fileData = req.file;
            if (!fileData) {
                return HttpStatus.BadRequestResponse('No file uploaded', res);
            }

            return HttpStatus.OkResponse('Ok', res, { file: fileData?.filename });

        } catch (err) {
            next(err);
        }
    };

    startFirmwareUpdate = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const { device_id, isBricked, file_name } = req.body;
            await this.firmwareUpdateService.start(device_id, isBricked, file_name);
            return HttpStatus.OkResponse('Firmware update started', res);
        } catch (err) {
            next(err);
        }
    }

    startProjectExport = async (req: Request, res: Response, next: NextFunction) => {
        try {
            await this.importExportManager.startExport();
            return HttpStatus.OkResponse('Project export started', res);
        } catch (err) {
            next(err);
        }
    }

    pauseProjectExport = async (req: Request, res: Response, next: NextFunction) => {
        try {
            this.importExportManager.pauseExport();
            return HttpStatus.OkResponse('Project export paused', res);
        } catch (err) {
            next(err);
        }
    }

    resumeProjectExport = async (req: Request, res: Response, next: NextFunction) => {
        try {
            this.importExportManager.resumeExport();
            return HttpStatus.OkResponse('Project export resumed', res);
        } catch (err) {
            next(err);
        }
    }

    retryProjectExport = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const { device_id, step } = req.body;
            this.importExportManager.retryExport(device_id, step);
            return HttpStatus.OkResponse('Project export retry initiated', res);
        } catch (err) {
            next(err);
        }
    }

    startProjectImport = async (req: Request, res: Response, next: NextFunction) => {
        try {
            await this.importExportManager.startImport();
            return HttpStatus.OkResponse('Project import started', res);
        } catch (err) {
            next(err);
        }
    }

    retryProjectImport = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const { device_id, step } = req.body;
            this.importExportManager.retryImport(device_id, step);
            return HttpStatus.OkResponse('Project import retry initiated', res);
        } catch (err) {
            next(err);
        }
    }

    closeImportExport = async (req: Request, res: Response, next: NextFunction) => {
        try {
            this.importExportManager.closeImportExport();
            return HttpStatus.OkResponse('Import/Export process closed', res);
        } catch (err) {
            next(err);
        }
    }

    // decrypt firmware update file
    // decryptFirmwareUpdateData = async (req: Request, res: Response, next: NextFunction) => {
    //     try {

    //         const form: any = new IncomingForm({
    //             keepExtensions: true
    //         });
    //         form.parse(req, async (err: any, fields: any, files: any) => {
    //             if (err) {
    //                 return next(err);
    //             }
    //             try {

    //                 let i = 0;
    //                 const firmware_data = JSON.parse(fields.data);
    //                 const init_vector = Buffer.from(firmware_data.slice(i, i + 16)); i += 32;
    //                 const encrypted_data = new Uint8Array(firmware_data.slice(i));
    //                 let final_decrypt_data = Buffer.alloc(0);
    //                 for (let j = 0; j < encrypted_data.length; j += 128) {
    //                     final_decrypt_data = Buffer.concat([final_decrypt_data, this.decrypt(encrypted_data.slice(j, j + 128), init_vector)]);
    //                 }

    //                 return HttpStatus.OkResponse('Ok', res, final_decrypt_data);
    //             } catch (err) {
    //                 return next(err);
    //             }
    //         });
    //     } catch (err) {
    //         next(err);
    //     }
    // };

    // private decrypt(buffer: Uint8Array, init_vector: Uint8Array) {
    //     const security_key = Buffer.from([0x36, 0x64, 0x34, 0x61, 0x33, 0x38, 0x32, 0x38, 0x34, 0x30, 0x31, 0x64, 0x37, 0x61, 0x31, 0x39, 0x37, 0x30, 0x35, 0x62, 0x34, 0x35, 0x31, 0x65, 0x36, 0x34, 0x37, 0x34, 0x30, 0x37, 0x31, 0x34]);
    //     const decipher = crypto.createDecipheriv('aes-256-ctr', security_key, init_vector);
    //     let decrypted = decipher.update(buffer);
    //     decrypted = Buffer.concat([decrypted, decipher.final()]);
    //     return decrypted;
    // }

    // calculateCrc32 = async (req: Request, res: Response, next: NextFunction) => {
    //     try {


    //         const form: any = new IncomingForm({
    //             keepExtensions: true
    //         });
    //         form.parse(req, async (err: any, fields: any, files: any) => {
    //             if (err) {
    //                 return next(err);
    //             }
    //             try {
    //                 const body = JSON.parse(fields.data);
    //                 const cal_crc32 = crc32(body) & 0xFFFFFFFF;
    //                 return HttpStatus.OkResponse('Ok', res, cal_crc32);
    //             } catch (err) {
    //                 return next(err);
    //             }
    //         });
    //     } catch (err) {
    //         next(err);
    //     }
    // };




}

