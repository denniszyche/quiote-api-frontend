
import { Suspense, lazy } from "react";
import { RouterProvider, createBrowserRouter } from "react-router-dom";
import ProtectedRoute from "./components/ProtectedRoute";
import Spinner from "./components/Spinner";

import "primereact/resources/themes/saga-blue/theme.css";
import "primereact/resources/primereact.min.css";
import "primeicons/primeicons.css";
import 'primeflex/primeflex.css'; 

const Root = lazy(() => import("./pages/Root"));
const LoginPage = lazy(() => import("./pages/Login"));
const ErrorPage = lazy(() => import("./pages/Error"));
const AllPostsPage = lazy(() => import("./pages/Post/AllPosts"));
const AddPostPage = lazy(() => import("./pages/Post/AddPost"));
const EditPostPage = lazy(() => import("./pages/Post/EditPost"));
const AllCategoriesPage = lazy(() => import("./pages/Category/AllCategories"));
const AddCategoryPage = lazy(() => import("./pages/Category/AddCategory"));
const EditCategoryPage = lazy(() => import("./pages/Category/EditCategory"));
const DashboardPage = lazy(() => import("./pages/Dashboard"));
const SignUpPage = lazy(() => import("./pages/SignUp"));
const AllUserPage = lazy(() => import("./pages/User/AllUser"));
const AddUserPage = lazy(() => import("./pages/User/AddUser"));
const EditUserPage = lazy(() => import("./pages/User/EditUser"));
const AllMediaPage = lazy(() => import("./pages/Media/AllMedia"));
const AddMediaPage = lazy(() => import("./pages/Media/AddMedia"));
const EditMediaPage = lazy(() => import("./pages/Media/EditMedia"));

function App() {
    const router = createBrowserRouter([
        {
            path: "/",  
            element: <Root />,
            errorElement: (
                <Suspense fallback={<Spinner />}>
                    <ErrorPage />
                </Suspense>
            ),
            children: [
                {
                    index: true,
                    element: (
                        <Suspense fallback={<Spinner />}>
                            <LoginPage />
                        </Suspense>
                    ),
                },
                {
                    path: "/sign-up",
                    element: (
                        <Suspense fallback={<Spinner />}>
                            <SignUpPage  />
                        </Suspense>
                    ),
                },
                {
                    path: "/dashboard",
                    element: (
                        <ProtectedRoute>
                            <Suspense fallback={<Spinner />}>
                                <DashboardPage  />
                            </Suspense>
                        </ProtectedRoute>
                    ),
                },
                {
                    path: "/all-posts",
                    element: (
                        <ProtectedRoute>
                            <Suspense fallback={<Spinner />}>
                                <AllPostsPage  />
                            </Suspense>
                        </ProtectedRoute>
                    ),
                },
                {
                    path: "/add-post",
                    element: (
                        <ProtectedRoute>
                            <Suspense fallback={<Spinner />}>
                                <AddPostPage  />
                            </Suspense>
                        </ProtectedRoute>
                    ),
                },
                {
                    path: "/edit-post/:id",
                    element: (
                        <ProtectedRoute>
                            <Suspense fallback={<Spinner />}>
                                <EditPostPage  />
                            </Suspense>
                        </ProtectedRoute>
                    ),
                },
                {
                    path: "/all-categories",
                    element: (
                        <ProtectedRoute>
                            <Suspense fallback={<Spinner />}>
                                <AllCategoriesPage  />
                            </Suspense>
                        </ProtectedRoute>
                    ),
                },
                {
                    path: "/add-category",
                    element: (
                        <ProtectedRoute>
                            <Suspense fallback={<Spinner />}>
                                <AddCategoryPage  />
                            </Suspense>
                        </ProtectedRoute>
                    ),
                },
                {
                    path: "/edit-category/:id",
                    element: (
                        <ProtectedRoute>
                            <Suspense fallback={<Spinner />}>
                                <EditCategoryPage  />
                            </Suspense>
                        </ProtectedRoute>
                    ),
                },
                {
                    path: "/all-user",
                    element: (
                        <ProtectedRoute>
                            <Suspense fallback={<Spinner />}>
                                <AllUserPage  />
                            </Suspense>
                        </ProtectedRoute>
                    ),
                },
                {
                    path: "/add-user",
                    element: (
                        <ProtectedRoute>
                            <Suspense fallback={<Spinner />}>
                                <AddUserPage  />
                            </Suspense>
                        </ProtectedRoute>
                    ),
                },
                {
                    path: "/edit-user/:id",
                    element: (
                        <ProtectedRoute>
                            <Suspense fallback={<Spinner />}>
                                <EditUserPage  />
                            </Suspense>
                        </ProtectedRoute>
                    ),
                },
                {
                    path: "/all-media",
                    element: (
                        <ProtectedRoute>
                            <Suspense fallback={<Spinner />}>
                                <AllMediaPage  />
                            </Suspense>
                        </ProtectedRoute>
                    ),
                },
                {
                    path: "/add-media",
                    element: (
                        <ProtectedRoute>
                            <Suspense fallback={<Spinner />}>
                                <AddMediaPage  />
                            </Suspense>
                        </ProtectedRoute>
                    ),
                },
                {
                    path: "/edit-media/:id",
                    element: (
                        <ProtectedRoute>
                            <Suspense fallback={<Spinner />}>
                                <EditMediaPage  />
                            </Suspense>
                        </ProtectedRoute>
                    ),
                }
            ],
        },
    ]);
    return <RouterProvider router={router} />;
}
export default App;