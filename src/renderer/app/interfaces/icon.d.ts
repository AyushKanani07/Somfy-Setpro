export interface IconConfig {
  id: string;
  to: string;
  iconName: string;
  tooltip: string;
  order: number;
  position: "top" | "bottom";
}

export interface IconConfigData {
  iconConfig: IconConfig[];
}
