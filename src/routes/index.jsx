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
import ProjectsPage from '../pages/ProjectsPage';
import ProjectDetailsPage from '../pages/ProjectDetailsPage';
import CreateEditProjectPage from '../pages/CreateEditProjectPage';
import ModulesPage from '../pages/ModulesPage';
import CreateEditModulePage from '../pages/CreateEditModulePage';
import UsersPage from '../pages/UsersPage';
import UserDetailsPage from '../pages/UserDetailsPage';
import CreateEditUserPage from '../pages/CreateEditUserPage';
import VerificationPage from '../pages/VerificationPage';

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
              {
                path: 'projects',
                element: <ProjectsPage />,
              },
              {
                path: 'projects/new',
                element: <CreateEditProjectPage />,
              },
              {
                path: 'projects/:id',
                element: <ProjectDetailsPage />,
              },
              {
                path: 'projects/:id/edit',
                element: <CreateEditProjectPage />,
              },
              {
                path: 'modules',
                element: <ModulesPage />,
              },
              {
                path: 'modules/new',
                element: <CreateEditModulePage />,
              },
              {
                path: 'modules/:id/edit',
                element: <CreateEditModulePage />,
              },
              {
                path: 'users',
                element: <UsersPage />,
              },
              {
                path: 'users/new',
                element: <CreateEditUserPage />,
              },
              {
                path: 'users/:id',
                element: <UserDetailsPage />,
              },
              {
                path: 'users/:id/edit',
                element: <CreateEditUserPage />,
              },
              {
                path: 'verification',
                element: <VerificationPage />,
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
