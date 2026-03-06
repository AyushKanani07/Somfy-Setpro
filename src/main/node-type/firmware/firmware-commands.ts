

export class FirmwareCommands {

    protected FIRMWARE_COMMAND_LIST = [
        { cmd_id: 0x49, name: 'IDENTITY' },
        { cmd_id: 0x45, name: 'ERASE' },
        { cmd_id: 0x52, name: 'READ' },
        { cmd_id: 0x57, name: 'WRITE' },
        { cmd_id: 0x51, name: 'RESTART' },
    ];

    get firmwareCommandList() {
        return this.FIRMWARE_COMMAND_LIST;
    }
}