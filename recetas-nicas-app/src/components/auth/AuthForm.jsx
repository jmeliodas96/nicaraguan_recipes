import React, { useState } from 'react';
import { useLanguage } from "../../contexts/LanguageContext";
import { useAuth } from '../../contexts/AuthContext';

// --- src/components/auth/AuthForm.jsx ---
export const AuthForm = ({ navigateTo }) => {
  const { t } = useLanguage();
  const { login, signUp, loadingAuth } = useAuth();
  const [isRegistering, setIsRegistering] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage('');
    setLoading(true);

    try {
      if (isRegistering) {
        await signUp(email, password);
        setMessage(t.registerSuccess);
        setIsRegistering(false); // Switch to login after successful registration
      } else {
        await login(email, password);
        setMessage(t.loginSuccess);
        navigateTo('recipesList'); // Navigate to main app on successful login
      }
    } catch (error) {
      setMessage((isRegistering ? t.registerError : t.loginError) + error.message);
    } finally {
      setLoading(false);
      setTimeout(() => setMessage(''), 3000); // Clear message after 3 seconds
    }
  };

  if (loadingAuth) {
    return (
      <div className="screen-background flex flex-col items-center justify-center w-full h-full rounded-b-xl p-4 text-center">
        <p className="text-lg text-gray-300">Loading Authentication...</p>
      </div>
    );
  }

  return (
    <div className="screen-background flex flex-col items-center justify-center w-full h-full rounded-b-xl p-4 overflow-y-auto">
      <div className="bg-gray-800 p-8 rounded-lg shadow-xl w-full max-w-md text-white">
        <h2 className="text-3xl font-bold mb-6 text-center">{isRegistering ? t.register : t.login}</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-200">{t.email}:</label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="mt-1 block w-full p-2 border border-gray-600 rounded-md bg-gray-700 text-white focus:ring-blue-500 focus:border-blue-500"
              required
            />
          </div>
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-200">{t.password}:</label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="mt-1 block w-full p-2 border border-gray-600 rounded-md bg-gray-700 text-white focus:ring-blue-500 focus:border-blue-500"
              required
            />
          </div>
          <button
            type="submit"
            className="w-full px-6 py-3 bg-blue-600 text-white font-bold rounded-md hover:bg-blue-700 transition-colors duration-200"
            disabled={loading}
            name="login"
          >
            {loading ? 'Loading...' : (isRegistering ? t.register : t.login)}
          </button>
        </form>
        <button
          onClick={() => setIsRegistering(!isRegistering)}
          className="mt-4 w-full text-blue-400 hover:text-blue-200 transition text-sm"
        >
          {isRegistering ? t.toggleLogin : t.toggleRegister}
        </button>
        {message && (
          <p className="mt-4 text-center text-sm font-medium text-yellow-300">
            {message}
          </p>
        )}
      </div>
    </div>
  );
};
