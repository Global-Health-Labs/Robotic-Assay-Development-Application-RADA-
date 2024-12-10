import ProtectedLayout from '@/components/layout/ProtectedLayout';
import PublicLayout from '@/components/layout/PublicLayout';
import SettingsLayout from '@/pages/settings/SettingsLayout';
import { createBrowserRouter, RouteObject } from 'react-router-dom';

const importComponent = (module) => {
  return module.then((m) => ({
    Component: m.default,
  }));
};

export const publicRoutes: RouteObject[] = [
  {
    element: <PublicLayout />,
    children: [
      {
        path: '/login',
        lazy: () => importComponent(import('@/pages/auth/SigninPage')),
      },
    ],
  },
  // {
  //   path: '/register',
  //   component: SignupPage
  // },
  // {
  //   path: '/forgot-password',
  //   component: ForgotPasswordPage
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

export const protectedRoutes: RouteObject[] = [
  {
    element: <ProtectedLayout />,
    children: [
      {
        path: '/experiments',
        lazy: () => importComponent(import('@/pages/experiments/ExperimentsPage')),
      },
      {
        path: '/experiments/new',
        lazy: () => importComponent(import('@/pages/experiments/ExperimentPlanDetailsPage')),
      },
      {
        path: '/experiments/:id/edit',
        lazy: () => importComponent(import('@/pages/experiments/ExperimentPlanDetailsPage')),
      },
      {
        path: '/experiments/:id/mastermix',
        lazy: () => importComponent(import('@/pages/experiments/MastermixPage')),
      },
      {
        path: '/experiments/:id/export',
        lazy: () => importComponent(import('@/pages/experiments/ExperimentExportPage')),
      },
      {
        path: '/experiments/:id/instructions',
        lazy: () => importComponent(import('@/pages/experiments/RoboInstructionViewerPage')),
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
            path: 'liquid-types',
            lazy: () => importComponent(import('@/pages/settings/ManageLiquidTypesPage')),
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

export const router = createBrowserRouter([...publicRoutes, ...protectedRoutes]);

export const hideNavBarRoutes: string[] = [
  '/login',
  '/register',
  '/forgot-password',
  '/reset-password',
  '/email-sent',
  '/resend-confirmation-email',
];
