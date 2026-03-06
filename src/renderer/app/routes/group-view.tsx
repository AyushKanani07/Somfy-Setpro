import { AppLayout } from "~/components/layout/AppLayout";
import { IDELayout } from "~/components/layout/IDELayout";
import GroupView from "~/components/views/GroupView";

function GroupViewLayout() {
  return (
    <AppLayout>
      <IDELayout>
        <GroupView />
      </IDELayout>
    </AppLayout>
  );
}

export default GroupViewLayout;
