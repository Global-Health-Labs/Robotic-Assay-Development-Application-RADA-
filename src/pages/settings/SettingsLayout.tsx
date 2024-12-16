import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { buttonVariants } from '@/components/ui/button';
import { Suspense, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';

interface SidebarNavProps extends React.HTMLAttributes<HTMLElement> {
  items: {
    href?: string;
    title: string;
    children?: {
      href: string;
      title: string;
    }[];
  }[];
}

export function SidebarNav({ className, items, ...props }: SidebarNavProps) {
  const location = useLocation();

  return (
    <nav
      className={cn('flex space-x-2 lg:flex-col lg:space-x-0 lg:space-y-2', className)}
      {...props}
    >
      {items.map((item) => (
        <div key={item.title} className="flex flex-col gap-1">
          {item.href ? (
            <Link
              to={item.href}
              className={cn(
                buttonVariants({ variant: 'ghost' }),
                location.pathname === item.href
                  ? 'bg-muted hover:bg-muted'
                  : 'hover:bg-transparent hover:underline',
                'justify-start'
              )}
            >
              {item.title}
            </Link>
          ) : (
            <div className="px-4 py-2 text-sm font-medium">{item.title}</div>
          )}
          {item.children && (
            <div className="ml-4 flex flex-col gap-1">
              {item.children.map((child) => (
                <Link
                  key={child.href}
                  to={child.href}
                  className={cn(
                    buttonVariants({ variant: 'ghost' }),
                    location.pathname === child.href
                      ? 'bg-muted hover:bg-muted'
                      : 'hover:bg-transparent hover:underline',
                    'justify-start'
                  )}
                >
                  {child.title}
                </Link>
              ))}
            </div>
          )}
        </div>
      ))}
    </nav>
  );
}

const sidebarNavItems = [
  {
    title: 'Users',
    href: '/settings/users',
  },
  {
    title: 'NAAT Configurations',
    children: [
      {
        title: 'Liquid Types',
        href: '/settings/naat/liquid-types',
      },
      {
        title: 'Volume Units',
        href: '/settings/naat/volume-units',
      },
      {
        title: 'Deck Layout',
        href: '/settings/naat/deck-layout',
      },
    ],
  },
];

export default function SettingsLayout() {
  const navigate = useNavigate();
  const { role } = useAuth();

  useEffect(() => {
    if (role !== 'admin') {
      navigate('/experiments');
    }
  }, [role, navigate]);

  if (role !== 'admin') {
    return null;
  }

  return (
    <div className="space-y-6 py-4 pb-16 md:py-10">
      {/* <div className="space-y-0.5">
        <h2 className="text-2xl font-bold tracking-tight">Settings</h2>
        <p className="text-muted-foreground">Manage your account settings and preferences.</p>
      </div> */}

      <div className="flex flex-col space-y-8 lg:flex-row lg:space-x-12 lg:space-y-0">
        <aside className="-mx-4 lg:w-1/5">
          <SidebarNav items={sidebarNavItems} />
        </aside>
        <div className="flex-1">
          <Suspense fallback={<div>Loading settings...</div>}>
            <Outlet />
          </Suspense>
        </div>
      </div>
    </div>
  );
}
