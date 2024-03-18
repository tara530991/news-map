import { createBrowserRouter } from "react-router-dom";
import App from "../App";

const config = [
  {
    path: "/",
    element: <App />,
  },
];

const router = createBrowserRouter(config);

export default router;
