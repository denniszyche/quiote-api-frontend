import { RouterProvider, createBrowserRouter } from "react-router-dom";
import adminRoutes from "./admin/routes/adminRoutes";
import frontendRoutes from "./frontend/routes/frontendRoutes";

import "primereact/resources/themes/saga-blue/theme.css";
import "primereact/resources/primereact.min.css";
import "primeicons/primeicons.css";
import 'primeflex/primeflex.css'; 

function App() {
    const router = createBrowserRouter([...adminRoutes, ...frontendRoutes]);
    return <RouterProvider router={router} />;
}
export default App;