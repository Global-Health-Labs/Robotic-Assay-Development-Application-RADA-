import ProtectedLayout from '@/components/layout/ProtectedLayout';
import PublicLayout from '@/components/layout/PublicLayout';
import { PageLoading } from '@/components/ui/page-loading';
import ErrorPage from '@/pages/error/ErrorPage';
import NotFoundPage from '@/pages/error/NotFoundPage';
import SettingsLayout from '@/pages/settings/SettingsLayout';
import { ComponentType } from 'react';
import { createBrowserRouter, Navigate, RouteObject } from 'react-router-dom';

interface LazyModule {
  default: ComponentType;
}

const importComponent = (module: Promise<LazyModule>) => {
  return module.then((m) => ({
    Component: m.default,
    HydrateFallback: () => <PageLoading />,
  }));
};

const publicRoutes: RouteObject[] = [
  {
    element: <PublicLayout />,
    errorElement: <ErrorPage />,
    children: [
      {
        path: '/login',
        lazy: () => importComponent(import('@/pages/auth/SigninPage')),
      },
      {
        path: '/forgot-password',
        lazy: () => importComponent(import('@/pages/auth/ForgotPasswordPage')),
      },
      {
        path: '/email-sent',
        lazy: () => importComponent(import('@/pages/auth/EmailSentPage')),
      },
      {
        path: '/reset-password',
        lazy: () => importComponent(import('@/pages/auth/ResetPasswordPage')),
      },
    ],
  },
  // {
  //   path: '/register',
  //   component: SignupPage
  // },
  // {
  //   path: '/reset-password',
  //   component: ResetPasswordPage
  // },
  // {
  //   path: '/email-sent',
  //   component: EmailSentPage
  // },
  // {
  //   path: '/resend-confirmation-email',
  //   component: ResendConfirmationEmailPage
  // },
  // {
  //   path: '/auth/confirm/:confirmToken',
  //   component: ConfirmUserPage
  // }
];

const protectedRoutes: RouteObject[] = [
  {
    element: <ProtectedLayout />,
    errorElement: <ErrorPage />,
    children: [
      {
        path: '/',
        element: <Navigate to="/experiments" replace />,
      },
      {
        index: true,
        path: '/experiments',
        lazy: () => importComponent(import('@/pages/experiments/ExperimentsPage')),
      },
      {
        path: '/experiments/naat/new',
        lazy: () => importComponent(import('@/pages/experiments/NAATExperimentDetailsPage')),
      },
      {
        path: '/experiments/naat/:id/edit',
        lazy: () => importComponent(import('@/pages/experiments/NAATExperimentDetailsPage')),
      },
      {
        path: '/experiments/naat/:id/mastermix',
        lazy: () => importComponent(import('@/pages/experiments/MastermixPage')),
      },
      {
        path: '/experiments/naat/:id/export',
        lazy: () => importComponent(import('@/pages/experiments/ExperimentExportPage')),
      },
      {
        path: '/experiments/naat/:id/instructions',
        lazy: () => importComponent(import('@/pages/experiments/RoboInstructionViewerPage')),
      },
      {
        path: '/experiments/lfa/new',
        lazy: () => importComponent(import('@/pages/experiments/LFAExperimentDetailsPage')),
      },
      {
        path: '/experiments/lfa/:id',
        lazy: () => importComponent(import('@/pages/experiments/LFAExperimentDetailsPage')),
      },
      {
        path: '/experiments/lfa/:id/edit',
        lazy: () => importComponent(import('@/pages/experiments/LFAExperimentDetailsPage')),
      },
      {
        path: '/experiments/lfa/:id/export',
        lazy: () => importComponent(import('@/pages/experiments/ExperimentExportPage')),
      },
      {
        path: '/experiments/lfa/:id/instructions',
        lazy: () => importComponent(import('@/pages/experiments/RoboInstructionViewerPage')),
      },
      {
        path: '/experiments/lfa/:id/steps',
        lazy: () => importComponent(import('@/pages/experiments/EditLFAStepsPage')),
      },
      {
        path: '/settings',
        element: <SettingsLayout />,
        children: [
          {
            path: 'users',
            lazy: () => importComponent(import('@/pages/settings/UsersPage')),
          },
          {
            path: 'naat/liquid-types',
            lazy: () => importComponent(import('@/pages/settings/ManageLiquidTypesPage')),
          },
          {
            path: 'naat/volume-units',
            lazy: () => importComponent(import('@/pages/settings/ManageVolumeUnitsPage')),
          },
          {
            path: 'naat/deck-layout',
            lazy: () => importComponent(import('@/pages/settings/DeckLayoutSettingsPage')),
          },
        ],
      },
    ],
  },

  // {
  //   path: '/experiments/:experimentId/documents',
  //   component: ExperimentDocuments,
  //   protected: true
  // },
  // {
  //   path: '/create-new-experiment',
  //   component: CreateNewExperiment,
  //   protected: true
  // },
  // {
  //   path: '/experiments/:experimentId',
  //   component: ExperimentPage,
  //   protected: true
  // },
  // {
  //   path: '/experiments/:experimentId/worklist-files',
  //   component: GenerateWorklistFiles,
  //   protected: true
  // },
  // {
  //   path: '/experiments/:experimentId/instructions',
  //   component: InteractiveInstructionNew,
  //   protected: true
  // }
];

export const router = createBrowserRouter([
  ...publicRoutes,
  ...protectedRoutes,
  {
    path: '*',
    element: <NotFoundPage />,
  },
]);
