import { lazy } from 'react';
import { Navigate, createBrowserRouter } from "react-router";
import ProtectedRoute from "../components/ProtectedRoute";

/* ***Layouts**** */
const FullLayout = lazy(() => import('../layouts/full/FullLayout'));
const BlankLayout = lazy(() => import('../layouts/blank/BlankLayout'));

// Dashboard
const DashboardUser = lazy(() => import('../views/dashboards/DashboardUser'));
const DashboardAdmin = lazy(() => import('../views/dashboards/DashboardAdmin'));

// authentication
const Login = lazy(() => import('../views/auth/login/Login'));
const Register = lazy(() => import('../views/auth/register/Register'));
const SamplePage = lazy(() => import('../views/sample-page/SamplePage'));
const Error = lazy(() => import('../views/auth/error/Error'));

const Router = [
  {
    path: '/',
    element: <FullLayout />,
    children: [
      { path: '/', exact: true, element: <Navigate to="/auth/login" /> },
      { path: '/dashboarduser', exact: true, element: <DashboardUser /> },
      { path: '/dashboardadmin', exact: true, element: <ProtectedRoute allowedRoles={['Admin', 'Supervisor']}><DashboardAdmin /></ProtectedRoute> },
      { path: '/sample-page', exact: true, element: <SamplePage /> },
      { path: '*', element: <Navigate to="/auth/404" /> },
    ],
  },
  {
    path: '/',
    element: <BlankLayout />,
    children: [
      { path: '/auth/login', element: <Login /> },
      { path: '/auth/register', element: <Register /> },
      { path: '404', element: <Error /> },
      { path: '/auth/404', element: <Error /> },
      { path: '*', element: <Navigate to="/auth/404" /> },
    ],
  }
  ,
];

const router = createBrowserRouter(Router)

export default router;
