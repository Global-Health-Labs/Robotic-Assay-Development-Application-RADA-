import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import DialogModal from './DialogModal';
import RADALogoInverted from './RADALogoInverted';
import { useAuth } from '../../context/AuthContext';

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
      <div className="flex w-full items-center justify-between bg-muted px-20 py-3">
        <a href="/experiments">
          <RADALogoInverted scale={0.2} />
        </a>
        <div className="flex items-center gap-5">
          <button
            className={`Sans flex items-center justify-center gap-2.5 border-b-2 px-4 py-4 text-center ${
              isActive('/experiments') || isActive('/')
                ? 'border-[#121212] text-[#121212]'
                : 'border-transparent text-[#121212]'
            }`}
            onClick={() => navigate('/experiments')}
          >
            Experiments
          </button>
          {role === 'admin' && (
            <button
              className={`Sans flex items-center justify-center gap-2.5 border-b-2 px-4 py-4 text-center ${
                isActive('/roles-settings')
                  ? 'border-[#121212] text-[#121212]'
                  : 'border-transparent text-[#121212]'
              }`}
              onClick={() => navigate('/roles-settings')}
            >
              Settings
            </button>
          )}

          <button
            className="Sans font-nunito flex items-center justify-center gap-2.5 border-b-2 border-transparent px-4 py-3 text-center leading-6 text-[#121212]"
            onClick={handleLogout}
          >
            Log out
          </button>
          <div className="flex items-center gap-2">
            <div className="flex items-start gap-2.5 rounded-[1.25rem] border-2 border-[#121314] bg-white p-2">
              <svg
                width={24}
                height={24}
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <circle cx={12} cy={7} r={5} fill="#0E1420" />
                <path
                  d="M4 18.8C4 16.149 6.14903 14 8.8 14H15.2C17.851 14 20 16.149 20 18.8C20 20.5673 18.5673 22 16.8 22H7.2C5.43269 22 4 20.5673 4 18.8Z"
                  fill="#0E1420"
                />
              </svg>
            </div>
            <div className="flex flex-col items-start">
              <div className="Sans font-['nunito'] text-sm font-bold leading-5 text-[#121212]">
                {name}
              </div>
              <div className="Sans font-['nunito'] text-xs font-semibold leading-[normal] text-[#121212]">
                {role}
              </div>
            </div>
          </div>
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
