import { lazy } from "react";
import { Suspense } from "react";
import Spinner from "../../admin/components/Spinner";
import FrontendRoot from "../pages/FrontendRoot";
const HomePage = lazy(() => import("../pages/Home"));

import LanguageProvider from "../components/LanguageContext";

const frontendRoutes = [
    {
        path: "/",
        element: <FrontendRoot />,
        errorElement: (
            <Suspense fallback={<Spinner />}>
                <p>Error loading page</p>
            </Suspense>
        ),
        children: [
            {
                index: true,
                element: (
                    <Suspense fallback={<Spinner />}>
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