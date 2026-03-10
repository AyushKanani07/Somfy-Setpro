import { useEffect } from "react";
import DeviceMapView from "~/components/views/DeviceMapView";
import { useDevice } from "~/hooks/useDevice";

function DeviceMapLayout() {
  const { fetchAssignedDevices, fetchUnassignedDevices } = useDevice();

  useEffect(() => {
    fetchAssignedDevices();
    fetchUnassignedDevices();
  }, []);

  return <DeviceMapView />;
}

export default DeviceMapLayout;
