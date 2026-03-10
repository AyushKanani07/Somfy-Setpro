import { useEffect } from "react";
import DashboardView from "~/components/views/DashboardView";
import { useProject } from "~/hooks";

function Dashboard() {
  const { fetchDashboardCount } = useProject();

  useEffect(() => {
    fetchDashboardCount();
  }, []);

  return <DashboardView />;
}

export default Dashboard;
