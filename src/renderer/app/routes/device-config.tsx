import { AppLayout } from "~/components/layout/AppLayout";
import { IDELayout } from "~/components/layout/IDELayout";
import DeviceConfigView from "~/components/views/DeviceConfigView";

function DeviceConfigLayout() {
  return (
    <AppLayout>
      <IDELayout>
        <DeviceConfigView />
      </IDELayout>
    </AppLayout>
  );
}

export default DeviceConfigLayout;
