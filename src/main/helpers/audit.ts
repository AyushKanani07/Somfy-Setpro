import { dbConfig } from "../models/index.ts"

type ActionType = "add" | "update" | "delete"
type ActionEntity = "floor" | "room" | "motor" | "keypad" | "group" | "group_map" | "device" | "motor_setting" | "keypad_setting"

export const createAuditLog = async (action_entity: ActionEntity, action_type: ActionType, action_data: JSON | null, action_response: JSON | null, action_status: boolean) => {
    await dbConfig.dbInstance.auditLogModel.create({
        action_entity: action_entity,
        action_type: action_type,
        action_data: action_data,
        action_response: action_response,
        action_status: action_status
    })
    return
}
