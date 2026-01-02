import { RouteObject, createBrowserRouter } from "react-router-dom";
import NavLayout from "../components/NavLayout";
import TestPage from "../pages/TestPage";
import MapPage from "../pages/MapPage";

const config: RouteObject[] = [
  {
    path: "/",
    element: <NavLayout />,
    children: [
      {
        path: "/",
        element: <MapPage />,
      },
      {
        path: "/test",
        element: <TestPage />,
      },
    ],
  },
];

const router = createBrowserRouter(config);

export default router;
