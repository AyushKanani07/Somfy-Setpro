import { useEffect, useRef } from "react";
import { socket } from "~/services/socketService";
import { SOCKET_COMMAND } from "~/constant/constant";
import type { MotorSocketGetPositionResponse } from "~/interfaces/motor";
import { toast } from "sonner";
import { useMotors } from "./useMotors";
import { useComport } from "./useComport";

export function useMotorPositionPolling() {
    const {
        selectedMotor,
        selectedMotorId,
        getMotorCurrentPosition,
        getPositionType,

        stopGetMotorCurrentPosition,
        updateMotorCurrentPosition,
    } = useMotors();
    const { isOfflineEditMode } = useComport();

    const selectedMotorRef = useRef(selectedMotor);
    const getPositionTypeRef = useRef(getPositionType);
    const prevPositionRef = useRef<number | null | undefined>(null);
    const stableCountRef = useRef(0);
    const intervalRef = useRef<NodeJS.Timeout | null>(null);

    useEffect(() => {
        selectedMotorRef.current = selectedMotor;
    }, [selectedMotor]);

    useEffect(() => {
        getPositionTypeRef.current = getPositionType;
    }, [getPositionType]);

    useEffect(() => {
        const handleMotorCurrentPositionChange = (
            position: MotorSocketGetPositionResponse
        ) => {
            const { message, isError, data, status } = position;

            if (status === "error" || isError) {
                toast.error(message);
                if (intervalRef.current) {
                    clearInterval(intervalRef.current);
                    intervalRef.current = null;
                }
                stopGetMotorCurrentPosition();
                return;
            }

            updateMotorCurrentPosition(data);

            // const current = getPositionType === "pulse" ? selectedMotor?.tbl_motor.pos_pulse : selectedMotor?.tbl_motor.pos_tilt_pulse;
            const motor = selectedMotorRef.current;
            const type = getPositionTypeRef.current;
            const current = type === "pulse" ? motor?.tbl_motor.pos_pulse : motor?.tbl_motor.pos_tilt_pulse;
            if (current == null || current === undefined) return;

            if (prevPositionRef.current === current) {
                stableCountRef.current += 1;
            } else {
                prevPositionRef.current = current;
                stableCountRef.current = 0;
            }

            if (stableCountRef.current >= 3) {
                if (intervalRef.current) {
                    clearInterval(intervalRef.current);
                    intervalRef.current = null;
                }
                stopGetMotorCurrentPosition();
            }
        }

        socket.on(
            SOCKET_COMMAND.MOTOR_ACTIONS.POST_MOTOR_POSITION,
            handleMotorCurrentPositionChange
        );

        return () => {
            console.log("Cleaning up motor position listener");
            socket.off(
                SOCKET_COMMAND.MOTOR_ACTIONS.POST_MOTOR_POSITION,
                handleMotorCurrentPositionChange
            );
        };
    }, [getMotorCurrentPosition]);

    useEffect(() => {
        if (!selectedMotorId || !getMotorCurrentPosition || isOfflineEditMode) return;

        // clear any existing interval
        if (intervalRef.current) {
            clearInterval(intervalRef.current);
            intervalRef.current = null;
        }

        const currentPosition = getPositionType === "pulse" ? selectedMotor?.tbl_motor.pos_pulse : selectedMotor?.tbl_motor.pos_tilt_pulse;
        if (currentPosition !== undefined) {
            prevPositionRef.current = currentPosition;
        }
        stableCountRef.current = 0;

        intervalRef.current = setInterval(() => {
            console.log("Polling motor position for motor ID:", selectedMotorId);
            socket.emit(
                SOCKET_COMMAND.MOTOR_ACTIONS.GET_MOTOR_POSITION,
                { device_id: selectedMotorId }
            );
        }, 1000);

        return () => {
            if (intervalRef.current) {
                clearInterval(intervalRef.current);
                intervalRef.current = null;
            }
        };
    }, [getMotorCurrentPosition, selectedMotorId, getPositionType]);

}