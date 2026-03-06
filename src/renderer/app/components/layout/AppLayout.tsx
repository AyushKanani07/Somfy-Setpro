import React from "react";

export interface AppLayoutProps {
  children: React.ReactNode;
}

export const AppLayout: React.FC<AppLayoutProps> = ({ children }) => {
  return <div className="flex-1 overflow-hidden">{children}</div>;
};
