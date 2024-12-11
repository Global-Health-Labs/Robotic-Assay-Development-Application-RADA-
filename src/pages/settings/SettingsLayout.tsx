import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { buttonVariants } from '@/components/ui/button';
import { Suspense, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';

interface SidebarNavProps extends React.HTMLAttributes<HTMLElement> {
  items: {
    href: string;
    title: string;
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
        <Link
          key={item.href}
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
    title: 'Liquid Types',
    href: '/settings/liquid-types',
  },
  {
    title: 'Volume Units',
    href: '/settings/volume-units',
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
    <div className="space-y-6 p-10 pb-16">
      <div className="space-y-0.5">
        <h2 className="text-2xl font-bold tracking-tight">Settings</h2>
        <p className="text-muted-foreground">Manage your account settings and preferences.</p>
      </div>

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
