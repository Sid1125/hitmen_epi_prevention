import { useState, useRef, useEffect } from 'react';
import { User, ChevronDown, Settings, LogOut } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import ChangePasswordModal from './ChangePasswordModal';

interface ProfileDropdownProps {
  username: string;
  onLogout: () => void;
}

const ProfileDropdown: React.FC<ProfileDropdownProps> = ({ username, onLogout }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [showChangePasswordModal, setShowChangePasswordModal] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleMyProfile = () => {
    setIsOpen(false);
    navigate('/intel/me/profile');
  };

  const handleChangePassword = () => {
    setIsOpen(false);
    setShowChangePasswordModal(true);
  };

  const handleLogout = () => {
    setIsOpen(false);
    onLogout();
  };

  return (
    <>
      <div className="relative" ref={dropdownRef}>
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="flex items-center space-x-2 px-3 py-1 border text-xs font-mono border-accent hover:bg-accent hover:text-background transition"
        >
          <User className="w-3 h-3" />
          <span>{username.toUpperCase()}</span>
          <ChevronDown className={`w-3 h-3 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
        </button>

        {isOpen && (
          <div className="absolute right-0 mt-1 w-48 bg-background border border-accent/30 shadow-lg z-50">
            <div className="py-1">
              <button
                onClick={handleMyProfile}
                className="flex items-center w-full px-4 py-2 text-xs font-mono text-left hover:bg-accent/10 transition"
              >
                <User className="w-3 h-3 mr-2" />
                MY PROFILE
              </button>
              <button
                onClick={handleChangePassword}
                className="flex items-center w-full px-4 py-2 text-xs font-mono text-left hover:bg-accent/10 transition"
              >
                <Settings className="w-3 h-3 mr-2" />
                CHANGE PASSWORD
              </button>
              <div className="border-t border-accent/20 my-1" />
              <button
                onClick={handleLogout}
                className="flex items-center w-full px-4 py-2 text-xs font-mono text-left text-red-500 hover:bg-red-500/10 transition"
              >
                <LogOut className="w-3 h-3 mr-2" />
                LOGOUT
              </button>
            </div>
          </div>
        )}
      </div>
      
      <ChangePasswordModal
        isOpen={showChangePasswordModal}
        onClose={() => setShowChangePasswordModal(false)}
      />
    </>
  );
};

export default ProfileDropdown;
