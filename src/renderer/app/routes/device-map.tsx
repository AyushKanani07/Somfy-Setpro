import { useEffect } from "react";
import { AppLayout } from "~/components/layout/AppLayout";
import { IDELayout } from "~/components/layout/IDELayout";
import DeviceMapView from "~/components/views/DeviceMapView";
import { useDevice } from "~/hooks/useDevice";

function DeviceMapLayout() {
  const { fetchAssignedDevices, fetchUnassignedDevices } = useDevice();

  useEffect(() => {
    fetchAssignedDevices();
    fetchUnassignedDevices();
  }, []);

  return (
    <AppLayout>
      <IDELayout>
        <DeviceMapView />
      </IDELayout>
    </AppLayout>
  );
}

export default DeviceMapLayout;
