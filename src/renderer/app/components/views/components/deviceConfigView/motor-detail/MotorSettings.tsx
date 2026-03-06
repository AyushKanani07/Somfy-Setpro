import MotorAccordion from "~/components/sharedComponent/MotorAccordion";
import MotorApplicationMode from "./motorSettings/MotorApplicationMode";
import MotorDirection from "./motorSettings/MotorDirection";
import MotorLimit from "./motorSettings/MotorLimit";
import MotorLockSetUp from "./motorSettings/MotorLockSetUp";
import { useMotors } from "~/hooks/useMotors";
import { MotorLed } from "./motorSettings/MotorLed";
import { MotorSpeedAdjustment } from "./motorSettings/MotorSpeedAdjustment";
import { MotorRampsAdjustment } from "./motorSettings/MotorRampsAdjustment";
import { MotorTiltLimitAdjustment } from "./motorSettings/MotorTiltLimitAdjustment";
import { useDevice } from "~/hooks/useDevice";

function MotorSettings() {
  const {
    selectedMotor,
  } = useMotors();
  const { findDeviceTypeBySubNode } = useDevice();
  const motorType = findDeviceTypeBySubNode(selectedMotor?.sub_node_id || 0);
  return (
    <div className="w-full h-full flex flex-col gap-4 justify-start items-center pt-4 overflow-auto scrollbar-none">
      <MotorAccordion title="Motor Application Mode">
        <MotorApplicationMode />
      </MotorAccordion>
      <MotorAccordion title="Direction Adjustment">
        <MotorDirection />
      </MotorAccordion>
      <MotorAccordion title="Motor End Limit Adjustment">
        <MotorLimit />
      </MotorAccordion>
      {
        motorType && motorType == "lsu_40_ac" &&
        < MotorAccordion title="Motor Tilt Limit Adjustment">
          <MotorTiltLimitAdjustment />
        </MotorAccordion>
      }
      {
        motorType && !['lsu_50_ac', 'lsu_40_ac'].includes(motorType) &&
        <MotorAccordion title="Speed Adjustment">
          <MotorSpeedAdjustment />
        </MotorAccordion>
      }
      {
        motorType && !['lsu_50_ac', 'lsu_40_ac', 'glydea', 'st_30'].includes(motorType) &&
        <MotorAccordion title="Ramps Adjustment">
          <MotorRampsAdjustment />
        </MotorAccordion>
      }
      {
        motorType && ['lsu_40_ac', 'qt_30'].includes(motorType) &&
        < MotorAccordion title="Motor LED">
          <MotorLed />
        </MotorAccordion>
      }
      <MotorAccordion title="Lock Set up">
        <MotorLockSetUp />
      </MotorAccordion>
    </div >
  );
}

export default MotorSettings;
