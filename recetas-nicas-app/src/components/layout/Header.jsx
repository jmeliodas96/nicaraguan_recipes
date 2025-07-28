import React, { useState } from 'react';
import { useLanguage } from "../../contexts/LanguageContext";
import { useAuth } from '../../contexts/AuthContext';

export const Header = ({ onNavigate }) => {
  const { t, language, toggleLanguage } = useLanguage();
  const { currentUser, logout, loadingAuth, userId } = useAuth();
  const [showLogoutMessage, setShowLogoutMessage] = useState(false);

  const handleLogout = async () => {
    const result = await logout();
    if (result.success) {
      setShowLogoutMessage(true);
      setTimeout(() => setShowLogoutMessage(false), 2000);
      onNavigate('auth'); // Navigate to auth page after logout
    } else {
      console.error("Logout failed:", result.error);
    }
  };

  return (
    <div className="w-full bg-gray-800 p-4 flex flex-col sm:flex-row justify-between items-center text-lg font-semibold z-10 rounded-t-xl">
      <div className="flex items-center gap-2 mb-2 sm:mb-0">
        <button onClick={() => onNavigate('recipesList')} className="text-gray-400 hover:text-white transition">
          {t.home}
        </button>
        <button onClick={() => onNavigate('cookbook')} className="text-gray-400 hover:text-white transition">
          {t.cookbook}
        </button>
      </div>
      <span className="text-center flex-grow text-xl md:text-2xl mb-2 sm:mb-0">{t.appName}</span>
      <div className="flex items-center gap-2">
        <button onClick={toggleLanguage} className="text-gray-400 hover:text-white transition text-sm">
          {t.language}: {language === 'es' ? t.english : t.spanish}
        </button>
        {!loadingAuth && (
          currentUser ? (
            <button onClick={handleLogout} className="px-3 py-1 rounded-full text-sm font-semibold bg-red-600 hover:bg-red-700 text-white transition">
              {t.logout}
            </button>
          ) : (
            <button onClick={() => onNavigate('auth')} className="px-3 py-1 rounded-full text-sm font-semibold bg-blue-600 hover:bg-blue-700 text-white transition">
              {t.login}
            </button>
          )
        )}
      </div>
      {showLogoutMessage && (
        <div className="absolute top-16 left-1/2 transform -translate-x-1/2 bg-black bg-opacity-70 text-white text-sm px-4 py-2 rounded-lg shadow-xl z-20 animate-pulse">
          {t.logoutSuccess}
        </div>
      )}
    </div>
  );
};
