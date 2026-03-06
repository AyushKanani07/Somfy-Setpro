import { useEffect } from "react";
import { AppLayout } from "~/components/layout/AppLayout";
import { IDELayout } from "~/components/layout/IDELayout";
import DashboardView from "~/components/views/DashboardView";
import { useProject } from "~/hooks";

function Dashboard() {
  const { fetchDashboardCount } = useProject();

  useEffect(() => {
    fetchDashboardCount();
  }, []);

  return (
    <AppLayout>
      <IDELayout>
        <DashboardView />
      </IDELayout>
    </AppLayout>
  );
}

export default Dashboard;
