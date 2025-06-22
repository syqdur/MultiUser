import React from 'react';
import { AlertTriangle, ExternalLink } from 'lucide-react';

interface FirebaseSetupNoticeProps {
  isDarkMode: boolean;
}

export const FirebaseSetupNotice: React.FC<FirebaseSetupNoticeProps> = ({ isDarkMode }) => {
  return (
    <div className={`fixed top-4 right-4 max-w-md p-4 rounded-lg shadow-lg border z-50 ${
      isDarkMode 
        ? 'bg-orange-900 border-orange-700 text-orange-100' 
        : 'bg-orange-50 border-orange-300 text-orange-900'
    }`}>
      <div className="flex items-start gap-3">
        <AlertTriangle className="w-5 h-5 text-orange-500 mt-0.5 flex-shrink-0" />
        <div className="flex-1">
          <h4 className="font-semibold mb-1">Firebase Setup Required</h4>
          <p className="text-sm mb-3">
            Email/password authentication needs to be enabled in your Firebase Console to use all features.
          </p>
          <a
            href="https://console.firebase.google.com/project/dev1-b3973/authentication"
            target="_blank"
            rel="noopener noreferrer"
            className={`inline-flex items-center gap-1 text-sm underline hover:no-underline ${
              isDarkMode ? 'text-orange-300' : 'text-orange-700'
            }`}
          >
            Open Firebase Console
            <ExternalLink className="w-3 h-3" />
          </a>
        </div>
      </div>
    </div>
  );
};