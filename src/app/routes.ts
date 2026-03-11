import { createBrowserRouter } from "react-router";
import Landing from "./pages/Landing";
import Login from "./pages/Login";
import DashboardLayout from "./layouts/DashboardLayout";
import DashboardHome from "./pages/DashboardHome";
import MedManager from "./pages/MedManager";
import Interactions from "./pages/Interactions";
import Reports from "./pages/Reports";
import Settings from "./pages/Settings";

export const router = createBrowserRouter([
  {
    path: "/",
    Component: Landing,
  },
  {
    path: "/login",
    Component: Login,
  },
  {
    path: "/app",
    Component: DashboardLayout,
    children: [
      { index: true, Component: DashboardHome },
      { path: "meds", Component: MedManager },
      { path: "interactions", Component: Interactions },
      { path: "reports", Component: Reports },
      { path: "settings", Component: Settings },
    ],
  },
]);
