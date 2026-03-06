import * as fs from 'fs';
import { readFile, writeFile } from 'fs/promises';
import { getDBPath } from '../helpers/util.ts';
import { eventBroker } from '../helpers/event.ts';
import SocketService from './socket.service.ts';
import { Socket_Events } from '../helpers/constant.ts';
const DB_PATH = getDBPath();


export class KeypadService {

    private keypadListener: ((data: any) => void) | null = null;
    private isKeypadDiscoveryRunning: boolean = false;

    /**
     * If the file doesn't exist, create it and return an empty array. Otherwise, return the contents
     * of the file.
     * @returns the result of the readFile function.
     */
    getkeypadConfigList() {
        if (!fs.existsSync(DB_PATH + 'keypad-config.json')) {
            fs.writeFileSync(DB_PATH + 'keypad-config.json', '[]');
        }
        return readFile(DB_PATH + 'keypad-config.json', 'utf8');
    }

    /**
     * "Write the value of the keypad-config.json file to the DB_PATH + 'keypad-config.json' file."
     * </code>
     * @param {any[]} value - any[]
     */
    setkeypadConfigList(value: any[]) {
        return writeFile(DB_PATH + 'keypad-config.json', JSON.stringify(value), 'utf8');
    }

    async startKeyPadDiscovery() {
        if (this.isKeypadDiscoveryRunning) {
            SocketService.emit(Socket_Events.KEYPAD_DISCOVERY_INFO, { status: 'error', message: 'Keypad discovery is already running.' });
            return;
        }

        this.isKeypadDiscoveryRunning = true;

        this.keypadListener = (response: any) => {
            if (response && response.command_name == 'POST_SWITCH_ADDRESS' && response.source_node_type == 14) {
                const payload = {
                    address: response.source_add,
                    name: `Keypad-${response.source_add}`,
                    key_count: 8
                }
                SocketService.emit(Socket_Events.KEYPAD_DISCOVERY_INFO, { status: 'discover', message: "Keypad found", data: payload });
                this.stopKeyPadDiscovery();
            }
        }

        eventBroker.on('command', this.keypadListener);
        SocketService.emit(Socket_Events.KEYPAD_DISCOVERY_INFO, { status: 'start', message: 'Keypad discovery started.' });
    }

    async stopKeyPadDiscovery() {
        if (!this.isKeypadDiscoveryRunning) {
            SocketService.emit(Socket_Events.KEYPAD_DISCOVERY_INFO, { status: 'error', message: 'Keypad discovery is not running.' });
            return;
        }

        if (this.keypadListener) {
            eventBroker.off('command', this.keypadListener);
            this.keypadListener = null;
        }

        this.isKeypadDiscoveryRunning = false;

        SocketService.emit(Socket_Events.KEYPAD_DISCOVERY_INFO, { status: 'stop', message: 'Keypad discovery stopped.' });
    }

}