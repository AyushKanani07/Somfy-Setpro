import MotorGoToPosition from "../views/components/deviceConfigView/motor-detail/motorControl/MotorGoToPosition";
import MotorMoveToEnd from "../views/components/deviceConfigView/motor-detail/motorControl/MotorMoveToEnd";
import MotorStepToMovement from "../views/components/deviceConfigView/motor-detail/motorControl/MotorStepToMovement";

function MotorCommonControlPanel() {
  return (
    <div className="w-full h-full flex flex-col justify-center items-center">
      <div className="w-full flex justify-center gap-2 items-stretch p-4">
        <div className="flex">
          <MotorMoveToEnd from="motor_control_panel" type="normal" />
        </div>
        <div className="flex">
          <MotorGoToPosition from="motor_control_panel" />
        </div>
      </div>
      <div>
        <MotorStepToMovement from="motor_control_panel" />
      </div>
    </div>
  );
}

export default MotorCommonControlPanel;
