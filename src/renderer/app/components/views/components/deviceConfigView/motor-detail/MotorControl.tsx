import MotorGoToPosition from "./motorControl/MotorGoToPosition";
import MotorMoveToEnd from "./motorControl/MotorMoveToEnd";
import MotorStepToMovement from "./motorControl/MotorStepToMovement";

function MotorControl() {
  return (
    <div className="w-full h-full flex flex-wrap justify-start items-start">
      <div className="w-full flex flex-wrap justify-center gap-8 items-stretch">
        <div className="flex">
          <MotorMoveToEnd title="Move to End" />
        </div>
        <div className="flex">
          <MotorGoToPosition title="Absolute Position Movement" />
        </div>
        <div className="flex">
          <MotorStepToMovement title="Step Movement" />
        </div>
      </div>
    </div>
  );
}

export default MotorControl;
