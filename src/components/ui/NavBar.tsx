import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import DialogModal from './DialogModal';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from './dropdown-menu';
import RADALogoInverted from './RADALogoInverted';
import { CircleUserRound } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { Link } from 'react-router-dom';

interface NavBarProps {
  name: string;
  role: string;
}

const NavBar: React.FC<NavBarProps> = ({ name, role }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { logout } = useAuth();
  const [isModalVisible, setIsModalVisible] = useState(false);

  const handleLogout = () => {
    setIsModalVisible(true);
  };

  const onCancel = () => {
    setIsModalVisible(false);
  };

  const onConfirm = () => {
    setIsModalVisible(false);
    logout();
    navigate('/login');
  };

  const isActive = (path: string) => location.pathname === path;

  return (
    <>
      <div className="sticky top-0 z-10 flex w-full items-center justify-between bg-muted px-6 py-3 shadow-md md:px-20">
        <a href="/experiments">
          <RADALogoInverted />
        </a>
        <div className="flex items-center gap-5">
          <Link to="/experiments">
            <button
              className={cn(
                'hidden items-center justify-center border-b-2 px-4 py-2 text-center md:flex',
                isActive('/experiments') ? 'border-primary' : 'border-transparent'
              )}
              onClick={() => navigate('/experiments')}
            >
              Experiments
            </button>
          </Link>
          {role === 'admin' && (
            <Link to="/roles-settings">
              <button
                className={cn(
                  'hidden items-center justify-center border-b-2 px-4 py-2 text-center md:flex',
                  isActive('/roles-settings') ? 'border-primary' : 'border-transparent'
                )}
                onClick={() => navigate('/roles-settings')}
              >
                Settings
              </button>
            </Link>
          )}

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                className="focus:outline-none focus:ring-0 focus-visible:ring-0"
              >
                <CircleUserRound className="h-8 w-8" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuLabel>
                <div className="flex flex-col">
                  <span className="text-sm font-medium">{name}</span>
                  <span className="text-xs font-medium text-muted-foreground">{role}</span>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <Link to="/experiments">
                <DropdownMenuItem className="block md:hidden">Experiments</DropdownMenuItem>
              </Link>
              <Link to="/roles-settings">
                <DropdownMenuItem className="block md:hidden">Settings</DropdownMenuItem>
              </Link>
              <DropdownMenuItem onSelect={handleLogout}>Log out</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
      <DialogModal
        isOpen={isModalVisible}
        title="Log out"
        message="Are you sure you want to log out?"
        onCancel={onCancel}
        onContinue={onConfirm}
      />
    </>
  );
};

export default NavBar;
