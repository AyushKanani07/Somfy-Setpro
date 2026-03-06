import { EventEmitter } from "events";
import type { getAckResponse } from "../interface/global.ts";
import type { ParseCommandWithTransactionId } from "../interface/command.interface.ts";
import { nACK_status_code_map } from "../helpers/constant.ts";
import crypto from "crypto";

type Waiter = {
    resolve: (v: getAckResponse) => void;
    timer: NodeJS.Timeout;
    expectedCommandName: string;
};

export class PromiseRegistry {
    private pending = new Map<string, Waiter>();
    private broker: EventEmitter;

    constructor(broker: EventEmitter) {
        this.broker = broker;
        this.broker.on("parsed_command", this.onParsedCommand);
    }

    private onParsedCommand = (frames: ParseCommandWithTransactionId[]) => {
        if (!Array.isArray(frames)) return;

        for (const frame of frames) {
            const transactionId = frame.transaction_id;
            if (!transactionId) continue;

            const waiter = this.pending.get(transactionId);
            if (!waiter) continue;

            clearTimeout(waiter.timer);
            this.pending.delete(transactionId);

            if (frame.command_name === 'nACK') {
                const nackStatusMsg = nACK_status_code_map.get(frame.data?.status);
                waiter.resolve({
                    isError: true,
                    message: `nACK received: ${nackStatusMsg?.message ?? 'Unknown error'}`,
                });
                continue;
            }

            if (frame.state === 'timeout') {
                waiter.resolve({
                    isError: true,
                    message: `Timeout no response received`,
                });
                continue;
            }

            if (frame.state === 'error') {
                waiter.resolve({
                    isError: true,
                    message: frame.message || `Error in command response`,
                });
                continue;
            }

            let message;
            if (frame.command_name === 'ACK') {
                message = frame.state == "offline_command" ? "Command added to offline database successfully" : "Command sent successfully";
            } else {
                message = 'Command response received successfully';
            }
            if (frame.command_name === waiter.expectedCommandName) {
                waiter.resolve({
                    isError: false,
                    message: message,
                    data: frame.data || null,
                });
            }
        }
    }

    public waitForTransaction = (transactionId: string, expectedCommandName: string): Promise<getAckResponse> => {
        if (this.pending.has(transactionId)) {
            return Promise.resolve({ isError: true, message: `Internal error: duplicate request_id`, });
        }

        return new Promise<getAckResponse>((resolve) => {
            const timer = setTimeout(() => {
                this.pending.delete(transactionId);
                resolve({ isError: true, message: `Timeout no response received`, });
            }, 2 * 60 * 1000); // 2 minutes timeout

            this.pending.set(transactionId, { resolve, timer, expectedCommandName });
        });
    }

    public newRequestId(): string {
        return crypto.randomUUID();
    }

    public cancelAllTransactions(reason = 'Cancelled') {
        for (const [transactionId, waiter] of this.pending.entries()) {
            clearTimeout(waiter.timer);
            waiter.resolve({ isError: true, message: reason, });
            this.pending.delete(transactionId);
        }
    }
}