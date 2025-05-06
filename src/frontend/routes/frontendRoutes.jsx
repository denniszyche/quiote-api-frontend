import { lazy } from "react";
import { Suspense } from "react";
import Loader from "../components/Loader";
import FrontendRoot from "../pages/FrontendRoot";
const HomePage = lazy(() => import("../pages/Home"));

import LanguageProvider from "../components/LanguageContext";

const frontendRoutes = [
    {
        path: "/",
        element: <FrontendRoot />,
        errorElement: (
            <Suspense fallback={<Loader />}>
                <p>Error loading page</p>
            </Suspense>
        ),
        children: [
            {
                index: true,
                element: (
                    <Suspense fallback={<Loader />}>
                        <LanguageProvider>
                            <HomePage />
                        </LanguageProvider>
                    </Suspense>
                ),
            }
        ]
    }
];

export default frontendRoutes;