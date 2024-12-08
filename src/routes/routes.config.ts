import SigninPage from '@/pages/auth/SigninPage';
import ExperimentsPage from '@/pages/experiments/ExperimentsPage';
import CreateExperimentForm from '@/pages/experiments/ExperimentPlanDetailsPage';
import MastermixPage from '@/pages/experiments/MastermixPage';
import ExperimentExportPage from '@/pages/experiments/ExperimentExportPage';
import RoboInstructionViewerPage from '@/pages/experiments/RoboInstructionViewerPage';
// import SignupPage from '@/pages/auth/SignupPage'
// import EmailSentPage from '@/pages/auth/EmailSentPage'
// import ForgotPasswordPage from '@/pages/auth/ForgotPasswordPage'
// import ResetPasswordPage from '@/pages/auth/ResetPasswordPage'
// import ResendConfirmationEmailPage from '@/pages/auth/ResendConfirmationEmailPage'
// import ConfirmUserPage from '@/pages/auth/ConfirmUserPage'
// import ExperimentsPageNew from '@/pages/experiments/ExperimentsPageNew'

// import CreateNewExperiment from '@/pages/experiments/CreateNewExperiment'
// import RolesSettings from '@/pages/settings/RolesSettings'
// import ExperimentDocuments from '@/components/ui/ExperimentDocuments'
// import GenerateWorklistFiles from '@/pages/GenerateWorklistFiles'
// import InteractiveInstructionNew from '@/components/InteractiveInstructionNew'

export interface RouteConfig {
  path: string;
  component: React.ComponentType<any>;
  protected?: boolean;
  children?: RouteConfig[];
}

export const publicRoutes: RouteConfig[] = [
  {
    path: '/login',
    component: SigninPage,
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

export const protectedRoutes: RouteConfig[] = [
  // {
  //   path: '/',
  //   component: ExperimentsPageNew,
  //   protected: true
  // },
  {
    path: '/experiments',
    component: ExperimentsPage,
    protected: true,
  },
  {
    path: '/experiments/new',
    component: CreateExperimentForm,
    protected: true,
  },
  {
    path: '/experiments/:id/edit',
    component: CreateExperimentForm,
    protected: true,
  },
  {
    path: '/experiments/:id/mastermix',
    component: MastermixPage,
    protected: true,
  },
  {
    path: '/experiments/:id/export',
    component: ExperimentExportPage,
    protected: true,
  },
  {
    path: '/experiments/:id/instructions',
    component: RoboInstructionViewerPage,
    protected: true,
  },
  // {
  //   path: '/experiments/:experimentId/documents',
  //   component: ExperimentDocuments,
  //   protected: true
  // },
  // {
  //   path: '/roles-settings',
  //   component: RolesSettings,
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

export const hideNavBarRoutes: string[] = [
  '/login',
  '/register',
  '/forgot-password',
  '/reset-password',
  '/email-sent',
  '/resend-confirmation-email',
];
