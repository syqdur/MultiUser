import React, { useState } from 'react';
import { Edit3, Save, X } from 'lucide-react';

interface EditableNoteProps {
  initialText: string;
  onSave: (newText: string) => void;
  canEdit: boolean;
  isDarkMode: boolean;
  className?: string;
}

export const EditableNote: React.FC<EditableNoteProps> = ({
  initialText,
  onSave,
  canEdit,
  isDarkMode,
  className = ''
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editText, setEditText] = useState(initialText);

  const handleSave = () => {
    onSave(editText);
    setIsEditing(false);
  };

  const handleCancel = () => {
    setEditText(initialText);
    setIsEditing(false);
  };

  if (!canEdit) {
    return (
      <p className={`whitespace-pre-line ${className}`}>
        {initialText}
      </p>
    );
  }

  if (isEditing) {
    return (
      <div className="space-y-2">
        <textarea
          value={editText}
          onChange={(e) => setEditText(e.target.value)}
          className={`w-full p-2 border rounded-md resize-none ${
            isDarkMode
              ? 'bg-gray-700 border-gray-600 text-white'
              : 'bg-white border-gray-300 text-gray-900'
          } focus:ring-2 focus:ring-blue-500 focus:border-blue-500`}
          rows={3}
          maxLength={500}
        />
        <div className="flex gap-2">
          <button
            onClick={handleSave}
            className="flex items-center gap-1 px-3 py-1 bg-green-500 hover:bg-green-600 text-white text-sm rounded-md transition-colors"
          >
            <Save className="w-3 h-3" />
            Save
          </button>
          <button
            onClick={handleCancel}
            className={`flex items-center gap-1 px-3 py-1 text-sm rounded-md transition-colors ${
              isDarkMode
                ? 'bg-gray-600 hover:bg-gray-700 text-gray-200'
                : 'bg-gray-200 hover:bg-gray-300 text-gray-700'
            }`}
          >
            <X className="w-3 h-3" />
            Cancel
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="group relative">
      <p className={`whitespace-pre-line ${className}`}>
        {initialText}
      </p>
      <button
        onClick={() => setIsEditing(true)}
        className={`absolute -top-1 -right-1 opacity-0 group-hover:opacity-100 p-1 rounded-full transition-all ${
          isDarkMode
            ? 'bg-gray-700 hover:bg-gray-600 text-gray-300'
            : 'bg-gray-100 hover:bg-gray-200 text-gray-600'
        }`}
        title="Edit note"
      >
        <Edit3 className="w-3 h-3" />
      </button>
    </div>
  );
};