import React, { useEffect } from "react";
import { IconPanel } from "./IconPanel";
import { useLocation, useNavigate } from "react-router";
import ClientOnly from "../sharedComponent/ClientOnly";
import Sidebar from "../views/components/Sidebar";
import { PanelGroup, Panel, PanelResizeHandle } from "react-resizable-panels";
import { useFloor } from "~/hooks/useFloor";
import { useDeviceConfig } from "~/hooks/useDeviceConfig";
import { useDevice } from "~/hooks/useDevice";
import { Dialog, DialogContent, DialogTitle } from "../ui/dialog";
import { ProgressSpinner } from "primereact/progressspinner";

export interface IDELayoutProps {
  children?: React.ReactNode;
}

export const IDELayout: React.FC<IDELayoutProps> = ({ children }) => {
  return (
    <div className="h-full w-full flex bg-gray-50">
      <IDELayoutComponent>{children}</IDELayoutComponent>
    </div>
  );
};

const IDELayoutComponent: React.FC<IDELayoutProps> = ({ children }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { fetchFloorsThunk } = useFloor();
  const { activeDeviceConfigTab } = useDeviceConfig();
  const { loadingDialog, setLoadingDialog } = useDevice();
  const showControlPanel =
    activeDeviceConfigTab !== "control" && activeDeviceConfigTab !== "settings" &&
    location.pathname === "/device-config";

  // Get active icon based on current route
  const getActiveIcon = () => {
    const path = location.pathname;
    if (path === "/dashboard") return "dashboard";
    if (path === "/device-config") return "device-config";
    if (path === "/group-view") return "group-view";
    if (path === "/device-map") return "device-map";
    return "";
  };

  const handleIconClick = (iconId: string) => {
    // Navigate to corresponding route
    const routes = {
      dashboard: "/dashboard",
      "device-config": "/device-config",
      "group-view": "/group-view",
      "device-map": "/device-map",
    };

    const route = routes[iconId as keyof typeof routes];
    if (route) {
      navigate(route);
    }
  };

  const activeIcon = getActiveIcon();
  const isDashboard = activeIcon === "dashboard";

  useEffect(() => {
    fetchFloorsThunk();
  }, [location]);

  return (
    <div className="h-full w-full flex bg-gray-50">
      {/* Desktop Icon Panel - Hidden on tablet and mobile */}
      <div className="hidden lg:block">
        <IconPanel activeIcon={activeIcon} onIconClick={handleIconClick} />
      </div>

      <ClientOnly>
        <PanelGroup direction="horizontal" className="flex-1">
          {/* Sidebar */}
          <Panel minSize={15} defaultSize={22} maxSize={50}>
            <Sidebar />
          </Panel>

          <PanelResizeHandle className="w-1 bg-gray-300 hover:bg-blue-500 transition-colors" />

          {/* Main Content */}
          <Panel>
            <div className="h-full w-full overflow-hidden bg-white">
              {children}
              {loadingDialog.isOpen && (
                <Dialog open={loadingDialog.isOpen} onOpenChange={(isOpen) => {
                  if (!isOpen) {
                    setLoadingDialog({ isOpen: false, message: '' });
                  }
                }}>
                  <DialogContent
                    showCross={false}
                    onPointerDownOutside={(e) => e.preventDefault()}
                    onEscapeKeyDown={(e) => e.preventDefault()}
                    className="sm:max-w-[375px] bg-white"
                  >
                    <DialogTitle></DialogTitle>
                    <div className="w-full h-[200px] flex flex-col gap-2 justify-center items-center">
                      <div>
                        <ProgressSpinner
                          className="h-10 w-10 custom-spinner mr-2"
                          strokeWidth="4" />
                      </div>
                      <span className="text-xl font-bold">{loadingDialog.message}</span>
                    </div>
                  </DialogContent>
                </Dialog>
              )}
            </div>
          </Panel>

          {/* <PanelResizeHandle
              className="w-1 bg-gray-300 hover:bg-blue-500 transition-colors"
              hidden={!showControlPanel}
            /> */}

          {/* Control Panel */}
          {/* <Panel
              collapsible
              defaultSize={25}
              minSize={25}
              maxSize={25}
              hidden={!showControlPanel}
            >
              <div className="h-full w-full overflow-auto bg-white">
                <MotorCommonControlPanel />
              </div>
            </Panel> */}
        </PanelGroup>
      </ClientOnly>
    </div>
  );
};
