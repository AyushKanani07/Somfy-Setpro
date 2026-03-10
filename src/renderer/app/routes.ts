import { type RouteConfig, index, route, layout } from "@react-router/dev/routes";

export default [
  index("routes/home.tsx"),
  layout("routes/ide-layout-wrapper.tsx", [
    route("dashboard", "routes/dashboard.tsx"),
    route("device-map", "routes/device-map.tsx"),
    route("group-view", "routes/group-view.tsx"),
    route("device-config", "routes/device-config.tsx"),
  ]),
  route("offline-to-online", "routes/offline-to-online.tsx"),
  route("communication-log", "routes/communication-log.tsx"),
] satisfies RouteConfig;
