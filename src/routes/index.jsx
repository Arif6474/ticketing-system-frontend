import { createBrowserRouter, Navigate } from 'react-router-dom';
import RootLayout from '../layouts/RootLayout';
import AppLayout from '../layouts/AppLayout';
import ProtectedRoute from './ProtectedRoute';
import PublicRoute from './PublicRoute';
import DashboardPage from '../pages/DashboardPage';
import LoginPage from '../pages/LoginPage';
import NotFoundPage from '../pages/NotFoundPage';
import IssuesPage from '../pages/IssuesPage';
import IssueDetailsPage from '../pages/IssueDetailsPage';
import CreateEditIssuePage from '../pages/CreateEditIssuePage';

export const router = createBrowserRouter([
  {
    path: '/',
    element: <RootLayout />,
    children: [
      {
        element: <PublicRoute />,
        children: [
          {
            path: 'login',
            element: <LoginPage />,
          },
        ],
      },
      {
        element: <ProtectedRoute />,
        children: [
          {
            element: <AppLayout />,
            children: [
              {
                index: true,
                element: <DashboardPage />,
              },
              {
                path: 'dashboard',
                element: <Navigate to="/" replace />,
              },
              {
                path: 'issues',
                element: <IssuesPage />,
              },
              {
                path: 'issues/new',
                element: <CreateEditIssuePage />,
              },
              {
                path: 'issues/:id',
                element: <IssueDetailsPage />,
              },
              {
                path: 'issues/:id/edit',
                element: <CreateEditIssuePage />,
              },
            ],
          },
        ],
      },
      {
        path: '*',
        element: <NotFoundPage />,
      },
    ],
  },
]);

export default router;
