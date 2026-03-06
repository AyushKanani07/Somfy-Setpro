

export class FirmwareCommandParserService {


    public parseFirmwareCommand = async (frame: Buffer): Promise<any> => {
        let buffer = frame;
        let commandName;
        switch (buffer[7]) {
            case 0x4A:
                commandName = "IDENTITY";
                break;
            case 0x46:
                commandName = "ERASE";
                break;
            case 0x54:
                commandName = "RESTART";
                break;
            case 0x53:
                commandName = "READ";
                break;
            case 0x58:
                commandName = "WRITE";
                break;
            case 0xFF:
                console.log("GENERAL ACK");
                break;
            default:
                console.log("Unknown Command Found!!");
                break;
        }

        let data = buffer.subarray(8, buffer.length - 3);

        return {
            command: commandName,
            data_frame: data
        };
    }
}