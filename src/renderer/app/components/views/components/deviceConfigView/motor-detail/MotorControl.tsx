import { useMotors } from '~/hooks/useMotors';
import MotorGoToPosition from './motorControl/MotorGoToPosition';
import MotorMoveToEnd from './motorControl/MotorMoveToEnd';
import MotorStepToMovement from './motorControl/MotorStepToMovement';
import MotorTiltPosition from './motorControl/MotorTiltPosition';

function MotorControl() {
    const { selectedMotor, selectedMotorId } = useMotors();
    return (
        <div className="w-full h-full flex flex-col justify-start items-start">
            {selectedMotor && selectedMotor.tbl_motor.app_mode !== 3 && (
                <div className="w-full flex flex-wrap justify-center gap-8 items-stretch">
                    <div className="flex">
                        <MotorMoveToEnd title="Move to End" type="normal" />
                    </div>
                    <div className="flex">
                        <MotorGoToPosition title="Absolute Position Movement" />
                    </div>
                    <div className="flex">
                        <MotorStepToMovement title="Step Movement" />
                    </div>
                </div>
            )}
            {selectedMotor &&
                (selectedMotor.tbl_motor.app_mode === 1 ||
                    selectedMotor.tbl_motor.app_mode === 3) && (
                    <div className="w-full flex flex-wrap justify-center gap-8 items-stretch">
                        <div className="flex">
                            <MotorMoveToEnd title="Move to End" type="tilt" />
                        </div>
                        <div className="flex">
                            <MotorTiltPosition title="Absolute Position Movement" />
                        </div>
                        <div className="flex">
                            <MotorStepToMovement title="Step Movement" 
                            showMsInput={false} 
                            showPulsesInput={false}
                            showTiltInput={true}
                            />
                        </div>
                    </div>
                )}
        </div>
    );
}

export default MotorControl;
