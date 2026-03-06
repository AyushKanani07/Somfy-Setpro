import type { DeviceModel } from "../../../interface/device.ts";
import { type FirmwareContext, FirmwareStep } from "../../../interface/firmware.interface.ts";
import { GenericFirmwareStep } from "./generic.step.ts";


export class LSU40FirmwareStep extends GenericFirmwareStep {

    protected FIRMWARE_SEQUENCE: FirmwareStep[] = [
        FirmwareStep.PROCESS_NETWORK_COMMANDS,
        FirmwareStep.GET_IDENTITY,
        FirmwareStep.PROCESS_READ,
        FirmwareStep.PROCESS_WRITE_ROBUST,
        FirmwareStep.PROCESS_ERASE,
        FirmwareStep.PROCESS_WRITE,
        FirmwareStep.PROCESS_RESTART,
        FirmwareStep.GET_APP_VERSION,
        FirmwareStep.CLOSE_PROCESS
    ];

    public async startFirmwareUpdate(device_data: DeviceModel, isBricked: boolean, file_name: string) {
        try {

            const startStep = isBricked ? FirmwareStep.GET_IDENTITY : FirmwareStep.PROCESS_NETWORK_COMMANDS;

            const ctx: FirmwareContext = {
                deviceId: device_data.device_id,
                fileName: file_name,
                isBricked,
                currentStep: startStep,
                restartStep: startStep,
                command: {
                    total: 500,
                    completed: 0
                },
                eraseIndex: 1,
                writeIndex: 1,
                deviceData: device_data
            };

            await this.validateFirmwareFile(ctx);

            this.run(ctx, startStep);
        } catch (error) {
            throw error;
        }
    }

}