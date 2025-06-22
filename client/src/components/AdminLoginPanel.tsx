import React, { useState, useEffect } from 'react';
import { Lock, Eye, EyeOff, Shield, Settings, X } from 'lucide-react';

interface AdminLoginPanelProps {
  isOpen: boolean;
  onClose: () => void;
  onAdminLogin: () => void;
  onShowPasswordSetup: () => void;
  isDarkMode: boolean;
  userDisplayName: string;
  hasAdminPassword: boolean;
  onCheckPassword: (password: string) => Promise<boolean>;
}

export const AdminLoginPanel: React.FC<AdminLoginPanelProps> = ({
  isOpen,
  onClose,
  onAdminLogin,
  onShowPasswordSetup,
  isDarkMode,
  userDisplayName,
  hasAdminPassword,
  onCheckPassword
}) => {
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  // Reset form when panel opens/closes
  useEffect(() => {
    if (!isOpen) {
      setPassword('');
      setError('');
      setShowPassword(false);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!hasAdminPassword) {
      onShowPasswordSetup();
      return;
    }

    if (!password.trim()) {
      setError('Bitte gib dein Admin-Passwort ein');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      const isValid = await onCheckPassword(password);
      
      if (isValid) {
        onAdminLogin();
        onClose();
      } else {
        setError('Falsches Passwort');
        setPassword('');
      }
    } catch (error) {
      console.error('Error checking admin password:', error);
      setError('Fehler beim Überprüfen des Passworts');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className={`w-full max-w-md rounded-2xl shadow-2xl border ${
        isDarkMode 
          ? 'bg-gray-800 border-gray-700' 
          : 'bg-white border-gray-200'
      }`}>
        {/* Header */}
        <div className={`px-6 py-4 border-b ${
          isDarkMode ? 'border-gray-700' : 'border-gray-200'
        }`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className={`p-2 rounded-lg ${
                isDarkMode ? 'bg-blue-500/20' : 'bg-blue-100'
              }`}>
                <Shield className="w-5 h-5 text-blue-500" />
              </div>
              <div>
                <h2 className={`text-lg font-semibold ${
                  isDarkMode ? 'text-white' : 'text-gray-900'
                }`}>
                  Admin-Bereich
                </h2>
                <p className={`text-sm ${
                  isDarkMode ? 'text-gray-400' : 'text-gray-600'
                }`}>
                  {userDisplayName}s Galerie
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className={`p-2 rounded-lg transition-colors ${
                isDarkMode 
                  ? 'hover:bg-gray-700 text-gray-400 hover:text-white' 
                  : 'hover:bg-gray-100 text-gray-500 hover:text-gray-900'
              }`}
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
          {!hasAdminPassword ? (
            // First time setup
            <div className="text-center space-y-4">
              <div className={`p-4 rounded-lg ${
                isDarkMode ? 'bg-yellow-500/20' : 'bg-yellow-50'
              }`}>
                <Settings className="w-8 h-8 text-yellow-500 mx-auto mb-2" />
                <h3 className={`font-medium mb-2 ${
                  isDarkMode ? 'text-yellow-400' : 'text-yellow-800'
                }`}>
                  Admin-Passwort einrichten
                </h3>
                <p className={`text-sm ${
                  isDarkMode ? 'text-yellow-300' : 'text-yellow-700'
                }`}>
                  Du musst zuerst ein Admin-Passwort für deine Galerie einrichten.
                </p>
              </div>
              
              <button
                onClick={onShowPasswordSetup}
                className="w-full bg-blue-500 hover:bg-blue-600 text-white font-medium py-3 px-4 rounded-lg transition-colors"
              >
                Passwort einrichten
              </button>
            </div>
          ) : (
            // Login form
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className={`block text-sm font-medium mb-2 ${
                  isDarkMode ? 'text-gray-200' : 'text-gray-700'
                }`}>
                  Admin-Passwort
                </label>
                <div className="relative">
                  <Lock className={`absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 ${
                    isDarkMode ? 'text-gray-400' : 'text-gray-500'
                  }`} />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className={`w-full pl-10 pr-12 py-3 rounded-lg border transition-colors ${
                      isDarkMode 
                        ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400 focus:border-blue-500' 
                        : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500 focus:border-blue-500'
                    } focus:outline-none focus:ring-2 focus:ring-blue-500/20`}
                    placeholder="Gib dein Admin-Passwort ein"
                    disabled={isLoading}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className={`absolute right-3 top-1/2 transform -translate-y-1/2 p-1 rounded ${
                      isDarkMode 
                        ? 'text-gray-400 hover:text-white' 
                        : 'text-gray-500 hover:text-gray-700'
                    }`}
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {error && (
                <div className="p-3 rounded-lg bg-red-100 border border-red-200">
                  <p className="text-red-700 text-sm">{error}</p>
                </div>
              )}

              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={onClose}
                  className={`flex-1 py-3 px-4 rounded-lg font-medium transition-colors ${
                    isDarkMode 
                      ? 'bg-gray-700 hover:bg-gray-600 text-gray-200' 
                      : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
                  }`}
                  disabled={isLoading}
                >
                  Abbrechen
                </button>
                <button
                  type="submit"
                  className="flex-1 bg-blue-500 hover:bg-blue-600 text-white font-medium py-3 px-4 rounded-lg transition-colors disabled:opacity-50"
                  disabled={isLoading || !password.trim()}
                >
                  {isLoading ? 'Überprüfe...' : 'Anmelden'}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};