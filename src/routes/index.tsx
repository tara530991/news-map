import { RouteObject, createBrowserRouter } from "react-router-dom";
import Mapbox from "../pages/Mapbox";
import NavLayout from "../components/NavLayout";

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
        element: <div>sdfsfa</div>,
      },
    ],
  },
];

const router = createBrowserRouter(config);

export default router;
