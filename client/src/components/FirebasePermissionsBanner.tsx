import React from 'react';
import { AlertTriangle, ExternalLink } from 'lucide-react';

interface FirebasePermissionsBannerProps {
  isDarkMode: boolean;
}

export const FirebasePermissionsBanner: React.FC<FirebasePermissionsBannerProps> = ({ isDarkMode }) => {
  return (
    <div className={`border-l-4 border-amber-500 p-4 mb-6 ${
      isDarkMode ? 'bg-amber-900/20 border-amber-500' : 'bg-amber-50 border-amber-500'
    }`}>
      <div className="flex items-start">
        <AlertTriangle className="w-5 h-5 text-amber-500 mt-0.5 mr-3 flex-shrink-0" />
        <div className="flex-1">
          <h3 className={`text-sm font-semibold mb-2 ${
            isDarkMode ? 'text-amber-200' : 'text-amber-800'
          }`}>
            Firebase Security Rules Not Deployed
          </h3>
          <p className={`text-sm mb-3 ${
            isDarkMode ? 'text-amber-200/80' : 'text-amber-700'
          }`}>
            Some features are limited because Firebase security rules haven't been deployed yet.
            This affects profile saving, gallery uploads, stories, and timeline functionality.
          </p>
          <div className="flex flex-col sm:flex-row gap-3">
            <a
              href="https://console.firebase.google.com/project/dev1-b3973/firestore/rules"
              target="_blank"
              rel="noopener noreferrer"
              className={`inline-flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                isDarkMode 
                  ? 'bg-amber-600 hover:bg-amber-700 text-white' 
                  : 'bg-amber-600 hover:bg-amber-700 text-white'
              }`}
            >
              <ExternalLink className="w-4 h-4 mr-2" />
              Deploy Firebase Rules
            </a>
            <a
              href="/FIREBASE_DEPLOYMENT_GUIDE.md"
              target="_blank"
              className={`inline-flex items-center px-3 py-2 text-sm font-medium rounded-md border transition-colors ${
                isDarkMode 
                  ? 'border-amber-500 text-amber-200 hover:bg-amber-500/10' 
                  : 'border-amber-500 text-amber-700 hover:bg-amber-50'
              }`}
            >
              View Instructions
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};