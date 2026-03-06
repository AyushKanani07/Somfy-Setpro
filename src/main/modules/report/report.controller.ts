import type { NextFunction } from 'express';
import type { Request } from 'express';
import type { Response } from 'express';

import HttpStatus from '../../helpers/http-status.ts';
import { buildExport } from 'node-excel-export';
import XLSX from 'xlsx';
import type { ImportFloor } from '../../interface/project.ts';
import { GetCurrentDate, getModelName } from '../../helpers/util.ts';
import { dbConfig } from '../../models/index.ts';

export class ReportController {

    exportReport = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const styles = {
                headerDark: {
                    font: {
                        sz: 14,
                        bold: true,
                    }
                },
                horizontalCentered: true,
            };
            const device_specification = {
                no: {
                    displayName: 'Sr no.',
                    headerStyle: styles.headerDark,
                    width: 80,
                    cellFormat: function (value: number, row: any) {
                        if (value != -1) {
                            return Number(value);
                        } else {
                            return '';
                        }
                    },
                },
                floor: {
                    displayName: 'Floor',
                    headerStyle: styles.headerDark,
                    width: 120,
                },
                room: {
                    displayName: 'Room',
                    headerStyle: styles.headerDark,
                    width: 180,
                },
                device_type: {
                    displayName: 'Device Type',
                    headerStyle: styles.headerDark,
                    width: 120,
                },
                model: {
                    displayName: 'Model',
                    headerStyle: styles.headerDark,
                    width: 120,
                },
                device_name: {
                    displayName: 'Device Name',
                    headerStyle: styles.headerDark,
                    width: 220,
                },
                device_address: {
                    displayName: 'Device Address',
                    headerStyle: styles.headerDark,
                    width: 150,
                }
            }
            const group_specification = {
                no: {
                    displayName: 'Sr no.',
                    headerStyle: styles.headerDark,
                    width: 80,
                    cellFormat: function (value: number, row: any) {
                        if (value != -1) {
                            return Number(value);
                        } else {
                            return '';
                        }
                    },
                },
                device_type: {
                    displayName: 'Device Type',
                    headerStyle: styles.headerDark,
                    width: 120,
                },
                model: {
                    displayName: 'Model',
                    headerStyle: styles.headerDark,
                    width: 120,
                },
                device_name: {
                    displayName: 'Device Name',
                    headerStyle: styles.headerDark,
                    width: 220,
                },
                device_address: {
                    displayName: 'Device Address',
                    headerStyle: styles.headerDark,
                    width: 150,
                },
                group_name: {
                    displayName: 'Group Name',
                    headerStyle: styles.headerDark,
                    width: 120,
                },
                group_address: {
                    displayName: 'Group Address',
                    headerStyle: styles.headerDark,
                    width: 120,
                },
                inverted_group_address: {
                    displayName: 'Inverted Group Address',
                    headerStyle: styles.headerDark,
                    width: 190
                },
                group_position: {
                    displayName: 'Group Position',
                    headerStyle: styles.headerDark,
                    width: 80,
                },
            }

            //* Device Report
            const query = `SELECT tb.device_type,tb.name as device_name,tb.address,tb.model_no,tr.name as room_name,tf.name as floor_name FROM tbl_device tb
                        LEFT JOIN tbl_room tr ON tb.room_id = tr.room_id
                        LEFT JOIN tbl_floor tf ON tr.floor_id = tf.floor_id ORDER BY tf.disp_order,tr.disp_order,tb.disp_order`;
            const deviceData = await dbConfig.dbInstance.sequelize.query(query, { type: dbConfig.dbInstance.sequelize.QueryTypes.SELECT });
            let deviceExcelData: any[] = [];
            deviceData.forEach((element: any, index: number) => {
                let row = {
                    no: index + 1,
                    floor: element.floor_name ?? '-',
                    room: element.room_name ?? 'Unassigned devices',
                    device_type: element.device_type,
                    device_name: element.device_name,
                    device_address: element.address ?? '',
                    model: element.model_no ? getModelName(element.model_no) : ''
                }
                deviceExcelData.push(row);
            });

            //* Group Report
            dbConfig.dbInstance.groupDeviceMapModel.belongsTo(dbConfig.dbInstance.groupModel, { foreignKey: "group_id" })
            dbConfig.dbInstance.groupDeviceMapModel.belongsTo(dbConfig.dbInstance.deviceModel, { foreignKey: "device_id" })
            const groupData = await dbConfig.dbInstance.groupDeviceMapModel.findAll({
                include: [{
                    model: dbConfig.dbInstance.deviceModel,
                    required: false,
                    attributes: ['device_type', 'name', 'address', 'model_no'],
                }, {
                    model: dbConfig.dbInstance.groupModel,
                    required: false,
                    attributes: ['name', 'address'],
                }],
            });
            let groupExcelData: any[] = [];
            groupData.forEach((element: any, index: number) => {
                let row = {
                    no: index + 1,
                    device_type: element.tbl_device ? element.tbl_device.device_type : '',
                    device_name: element.tbl_device ? element.tbl_device.name : '',
                    device_address: element.tbl_device ? element.tbl_device.address : '',
                    group_name: element.tbl_group ? element.tbl_group.name : '',
                    group_address: element.tbl_group ? element.tbl_group.address : '',
                    inverted_group_address: element.tbl_group && element.tbl_group.address
                        ? this.invertHexString(element.tbl_group.address)
                        : '',
                    group_position: element.device_group_pos,
                    model: element.tbl_device ? getModelName(element.tbl_device.model_no) : ''
                }
                groupExcelData.push(row);
            });

            const report = buildExport([{
                name: 'Device Report',
                heading: [],
                merges: [],
                specification: device_specification,
                data: deviceExcelData
            }, {
                name: 'Group Report',
                heading: [],
                merges: [],
                specification: group_specification,
                data: groupExcelData
            }]);

            res.setHeader('Content-Disposition', 'attachment; filename="FloorPlan.xlsx"');

            return res.send(report);
        } catch (err) {
            next(err);
        }
    }

    importFloorPlan = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const fileData = req.file;
            if (!fileData) {
                return HttpStatus.BadRequestResponse('Error while uploading file', res, null);
            }
            const filePath = fileData.path;
            let importError: any = [];

            const workbook = XLSX.readFile(filePath, {
                type: 'binary'
            });
            const first_sheet_name = workbook.SheetNames[0];
            const worksheet = workbook.Sheets[first_sheet_name];

            if (!worksheet) return HttpStatus.BadRequestResponse('Error while creating worksheet', res, null);

            const c1 = worksheet.A1 ? worksheet.A1.v : '';
            const c2 = worksheet.B1 ? worksheet.B1.v : '';
            if (c1 == "Floor" && c2 == "Room") {
                const floorLst: ImportFloor[] = XLSX.utils.sheet_to_json(worksheet);
                const data_length = floorLst.length;
                for (let i = 0; i < data_length; i++) {
                    const floor_id = await this.getFloorId(floorLst[i].Floor);
                    let data = {
                        floor_id: floor_id,
                        name: floorLst[i].Room
                    }
                    const create_room = await dbConfig.dbInstance.roomModel.findOrCreate({
                        where: {
                            floor_id: data.floor_id,
                            name: data.name
                        },
                        defaults: data
                    });
                    if (!create_room[1]) {
                        importError.push(floorLst[i])
                    }
                }
                return HttpStatus.OkResponse('Floor Plan Imported Successfully', res, importError);
            } else {
                return HttpStatus.BadRequestResponse('Invalid file format', res, null);
            }
        } catch (err) {
            next(err);
        }
    }

    downloadTemplate = async (req: Request, res: Response, next: NextFunction) => {
        const styles = {
            headerDark: {
                font: {
                    sz: 14,
                    bold: true,
                }
            },
            horizontalCentered: true,
        };
        const specification = {
            floor: {
                displayName: 'Floor',
                headerStyle: styles.headerDark,
                width: 120,
            },
            room: {
                displayName: 'Room',
                headerStyle: styles.headerDark,
                width: 180,
            },
        }
        const report = buildExport([{
            name: 'Device Report',
            heading: [],
            merges: [],
            specification: specification,
            data: []
        }]);
        res.attachment('FloorPlan_Template.xlsx');
        return res.send(report);
    }

    exportCommunicationLog = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const styles = {
                headerDark: {
                    font: {
                        sz: 14,
                        bold: true,
                    }
                },
                horizontalCentered: true,
            };
            const specification = {
                no: {
                    displayName: 'Sr no.',
                    headerStyle: styles.headerDark,
                    width: 80,
                    cellFormat: function (value: number, row: any) {
                        if (value != -1) {
                            return Number(value);
                        } else {
                            return '';
                        }
                    },
                },
                time: {
                    displayName: 'Time',
                    headerStyle: styles.headerDark,
                    width: 180,
                },
                source_node_type: {
                    displayName: 'Source Node type',
                    headerStyle: styles.headerDark,
                    width: 180,
                },
                destination_node_type: {
                    displayName: 'Destination Node type',
                    headerStyle: styles.headerDark,
                    width: 180,
                },
                source: {
                    displayName: 'Source',
                    headerStyle: styles.headerDark,
                    width: 150,
                },
                destination: {
                    displayName: 'Destination',
                    headerStyle: styles.headerDark,
                    width: 150,
                },
                command: {
                    displayName: 'Command',
                    headerStyle: styles.headerDark,
                    width: 220,
                },
                data: {
                    displayName: 'Data',
                    headerStyle: styles.headerDark,
                    width: 220,
                },
                frame: {
                    displayName: 'Raw Frame',
                    headerStyle: styles.headerDark,
                    width: 300,
                },
                inverted_frame: {
                    displayName: 'Bus Frame',
                    headerStyle: styles.headerDark,
                    width: 300,
                },
                type: {
                    displayName: 'Type',
                    headerStyle: styles.headerDark,
                    width: 150,
                },
            }
            const deviceData = await dbConfig.dbInstance.communicationLogModel.findAll();
            let excelData: any[] = [];
            deviceData.forEach((element: any, index: number) => {
                let row = {
                    no: index + 1,
                    time: element.time ? GetCurrentDate(element.time) : '',
                    source_node_type: element.source_node_type ?? '',
                    destination_node_type: element.destination_node_type ?? '',
                    source: element.source ?? '',
                    destination: element.destination ?? '',
                    command: element.command ?? '',
                    data: element.data ?? '',
                    frame: element.frame ?? '',
                    inverted_frame: element.frame ? this.invertHexString(element.frame.slice(0, element.frame.length - 4)) + element.frame.slice(element.frame.length - 4, element.frame.length) : '',
                    type: element.type ?? '',
                }
                excelData.push(row);
            });

            const report = buildExport([{
                name: 'Communication Log',
                heading: [],
                merges: [],
                specification: specification,
                data: excelData
            }]);
            res.attachment('Communication_Log.xlsx');
            return res.send(report);
        } catch (err) {
            next(err);
        }
    }

    private getFloorId(floorName: string) {
        return new Promise(async (resolve, reject) => {
            const floor = await dbConfig.dbInstance.floorModel.findOne({
                where: {
                    name: floorName
                }
            });
            if (floor) {
                resolve(floor.floor_id);
            } else {
                const create_floor = await dbConfig.dbInstance.floorModel.create({
                    name: floorName
                });
                resolve(create_floor.floor_id);
            }
        })
    }

    private invertHexString(hexString: string) {
        let result: number[] = [];
        const hexArray: number[] = this.hexStringtoByteArray(hexString)
        hexArray.forEach((element: number) => {
            result.push((255 - element));
        });
        return this.toHexString(result).join('');
    }

    private toHexString(byteArray: number[]) {
        return Array.from(byteArray, function (byte: number) {
            return ('0' + ((byte) & 0xFF).toString(16).toUpperCase()).slice(-2);
        })
    }

    hexStringtoByteArray(hexString: string): any {
        var result = [];
        while (hexString.length >= 2) {
            result.push(parseInt(hexString.substring(0, 2), 16));
            hexString = hexString.substring(2, hexString.length);
        }
        return result;
    }


}

