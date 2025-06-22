import React, { useState } from 'react';
import { X, Lock, Eye, EyeOff, Shield, AlertCircle } from 'lucide-react';

interface AdminPasswordSetupProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (password: string) => Promise<void>;
  isDarkMode: boolean;
  userDisplayName: string;
}

export const AdminPasswordSetup: React.FC<AdminPasswordSetupProps> = ({
  isOpen,
  onClose,
  onSave,
  isDarkMode,
  userDisplayName
}) => {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const validatePassword = () => {
    if (password.length < 6) {
      setError('Passwort muss mindestens 6 Zeichen lang sein');
      return false;
    }
    if (password !== confirmPassword) {
      setError('Passwörter stimmen nicht überein');
      return false;
    }
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!validatePassword()) return;

    setIsLoading(true);
    try {
      await onSave(password);
      setPassword('');
      setConfirmPassword('');
      onClose();
    } catch (err: any) {
      setError(err.message || 'Fehler beim Speichern des Passworts');
    } finally {
      setIsLoading(false);
    }
  };

  const getPasswordStrength = () => {
    if (password.length === 0) return { strength: 0, label: '', color: '' };
    if (password.length < 6) return { strength: 1, label: 'Schwach', color: 'text-red-500' };
    if (password.length < 8) return { strength: 2, label: 'Mittel', color: 'text-yellow-500' };
    if (password.length >= 8 && /[A-Z]/.test(password) && /[0-9]/.test(password)) {
      return { strength: 3, label: 'Stark', color: 'text-green-500' };
    }
    return { strength: 2, label: 'Mittel', color: 'text-yellow-500' };
  };

  const passwordStrength = getPasswordStrength();

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className={`rounded-2xl p-6 max-w-md w-full transition-colors duration-300 ${
        isDarkMode ? 'bg-gray-800' : 'bg-white'
      }`}>
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className={`p-2 rounded-full ${
              isDarkMode ? 'bg-blue-600' : 'bg-blue-500'
            }`}>
              <Shield className="w-5 h-5 text-white" />
            </div>
            <h3 className={`text-lg font-semibold transition-colors duration-300 ${
              isDarkMode ? 'text-white' : 'text-gray-900'
            }`}>
              Admin-Passwort einrichten
            </h3>
          </div>
          <button
            onClick={onClose}
            className={`p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors ${
              isDarkMode ? 'text-gray-400' : 'text-gray-600'
            }`}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className={`mb-6 p-4 rounded-xl transition-colors duration-300 ${
          isDarkMode ? 'bg-blue-900/20 border border-blue-700' : 'bg-blue-50 border border-blue-200'
        }`}>
          <div className="flex items-start gap-3">
            <AlertCircle className={`w-5 h-5 mt-0.5 ${
              isDarkMode ? 'text-blue-400' : 'text-blue-600'
            }`} />
            <div>
              <h4 className={`font-semibold text-sm mb-1 ${
                isDarkMode ? 'text-blue-300' : 'text-blue-800'
              }`}>
                Willkommen, {userDisplayName}!
              </h4>
              <p className={`text-sm ${
                isDarkMode ? 'text-blue-200' : 'text-blue-700'
              }`}>
                Als Galerie-Ersteller benötigen Sie ein Admin-Passwort für erweiterte Funktionen wie Medien-Management und Galerie-Einstellungen.
              </p>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Password Input */}
          <div>
            <label className={`block text-sm font-medium mb-2 ${
              isDarkMode ? 'text-gray-300' : 'text-gray-700'
            }`}>
              Admin-Passwort
            </label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Sicheres Passwort eingeben..."
                className={`w-full px-4 py-3 pr-12 border rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-colors duration-300 ${
                  isDarkMode 
                    ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' 
                    : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                }`}
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className={`absolute right-3 top-1/2 transform -translate-y-1/2 ${
                  isDarkMode ? 'text-gray-400 hover:text-gray-300' : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>
            {password && (
              <div className="mt-2 flex items-center gap-2">
                <div className="flex-1 bg-gray-200 dark:bg-gray-600 rounded-full h-2">
                  <div 
                    className={`h-2 rounded-full transition-all duration-300 ${
                      passwordStrength.strength === 1 ? 'bg-red-500 w-1/3' :
                      passwordStrength.strength === 2 ? 'bg-yellow-500 w-2/3' :
                      'bg-green-500 w-full'
                    }`}
                  />
                </div>
                <span className={`text-xs font-medium ${passwordStrength.color}`}>
                  {passwordStrength.label}
                </span>
              </div>
            )}
          </div>

          {/* Confirm Password Input */}
          <div>
            <label className={`block text-sm font-medium mb-2 ${
              isDarkMode ? 'text-gray-300' : 'text-gray-700'
            }`}>
              Passwort bestätigen
            </label>
            <div className="relative">
              <input
                type={showConfirmPassword ? 'text' : 'password'}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Passwort wiederholen..."
                className={`w-full px-4 py-3 pr-12 border rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-colors duration-300 ${
                  isDarkMode 
                    ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' 
                    : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                }`}
                required
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className={`absolute right-3 top-1/2 transform -translate-y-1/2 ${
                  isDarkMode ? 'text-gray-400 hover:text-gray-300' : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>
          </div>

          {error && (
            <div className={`p-3 rounded-lg ${
              isDarkMode ? 'bg-red-900/20 border border-red-700 text-red-300' : 'bg-red-50 border border-red-200 text-red-700'
            }`}>
              <div className="flex items-center gap-2">
                <AlertCircle className="w-4 h-4" />
                <span className="text-sm">{error}</span>
              </div>
            </div>
          )}

          <div className={`p-3 rounded-lg ${
            isDarkMode ? 'bg-gray-700 border border-gray-600' : 'bg-gray-50 border border-gray-200'
          }`}>
            <p className={`text-xs ${
              isDarkMode ? 'text-gray-300' : 'text-gray-600'
            }`}>
              <Lock className="w-3 h-3 inline mr-1" />
              Dieses Passwort wird sicher verschlüsselt gespeichert und ermöglicht Admin-Funktionen in Ihrer Galerie.
            </p>
          </div>

          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className={`flex-1 py-3 px-4 rounded-xl transition-colors duration-300 ${
                isDarkMode 
                  ? 'bg-gray-600 hover:bg-gray-500 text-gray-200' 
                  : 'bg-gray-300 hover:bg-gray-400 text-gray-700'
              }`}
            >
              Überspringen
            </button>
            <button
              type="submit"
              disabled={isLoading || !password || !confirmPassword}
              className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-white py-3 px-4 rounded-xl transition-colors flex items-center justify-center gap-2"
            >
              {isLoading ? (
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <Shield className="w-4 h-4" />
              )}
              {isLoading ? 'Speichern...' : 'Passwort speichern'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};