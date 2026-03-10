import { Outlet } from "react-router";
import { AppLayout } from "~/components/layout/AppLayout";
import { IDELayout } from "~/components/layout/IDELayout";

export default function IDELayoutWrapper() {
  return (
    <AppLayout>
      <IDELayout>
        <Outlet />
      </IDELayout>
    </AppLayout>
  );
}
