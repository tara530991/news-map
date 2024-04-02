import { RouteObject, createBrowserRouter } from "react-router-dom";
import Mapbox from "../pages/Mapbox";
import NavLayout from "../components/NavLayout";
import Test from "../pages/Test";

const config: RouteObject[] = [
  {
    path: "/",
    element: <NavLayout />,
    children: [
      {
        path: "/",
        element: <Mapbox />,
      },
      {
        path: "/test",
        element: <Test />,
      },
    ],
  },
];

const router = createBrowserRouter(config);

export default router;
