

export interface OfflineCommand {
    id: number;
    command: string;
    ack: string;
    node_type: number;
    sub_node_id: number;
    destination: string;
    source: string;
    data: Record<string, any>;
}