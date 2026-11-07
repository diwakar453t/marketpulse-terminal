'use client';

import React, { useState, useEffect } from 'react';
import { X, Key, Check, Trash2, ExternalLink } from 'lucide-react';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  apiKey: string;
  onSaveApiKey: (key: string) => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  apiKey,
  onSaveApiKey,
}) => {
  const [inputKey, setInputKey] = useState('');
  const [savedSuccess, setSavedSuccess] = useState(false);

  useEffect(() => {
    setInputKey(apiKey);
  }, [apiKey, isOpen]);

  if (!isOpen) return null;

  const handleSave = () => {
    onSaveApiKey(inputKey.trim());
    setSavedSuccess(true);
    setTimeout(() => {
      setSavedSuccess(false);
      onClose();
    }, 800);
  };

  const handleClear = () => {
    setInputKey('');
    onSaveApiKey('');
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="w-full max-w-sm bg-[#111115] border border-zinc-800 rounded-xl shadow-2xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="px-5 py-3.5 border-b border-zinc-800 flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs font-mono text-zinc-300">
            <Key className="w-3.5 h-3.5" />
            <span>Gemini API Key</span>
          </div>
          <button onClick={onClose} className="p-1 text-zinc-500 hover:text-zinc-200">
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-5 space-y-4 text-xs">
          <p className="text-zinc-400 leading-relaxed">
            Your key is stored locally in your browser to generate zero-fluff market impact summaries.
          </p>

          <div>
            <input
              type="password"
              placeholder="Paste AIzaSy... key"
              value={inputKey}
              onChange={(e) => setInputKey(e.target.value)}
              className="w-full px-3 py-2 rounded-lg bg-zinc-900 border border-zinc-800 text-zinc-200 placeholder-zinc-600 focus:outline-none focus:border-zinc-600 font-mono text-xs"
            />
          </div>

          <div className="flex items-center justify-between text-[11px]">
            <a
              href="https://aistudio.google.com/app/apikey"
              target="_blank"
              rel="noopener noreferrer"
              className="text-zinc-400 hover:text-zinc-200 flex items-center gap-1 underline"
            >
              Get free Gemini Key
              <ExternalLink className="w-3 h-3" />
            </a>

            {inputKey && (
              <button
                onClick={handleClear}
                className="text-rose-400 hover:text-rose-300 flex items-center gap-1"
              >
                <Trash2 className="w-3 h-3" />
                Clear
              </button>
            )}
          </div>
        </div>

        <div className="px-5 py-3 border-t border-zinc-800 flex items-center justify-end gap-2 text-xs">
          <button
            onClick={onClose}
            className="px-3 py-1.5 text-zinc-400 hover:text-zinc-200 font-medium"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            className="px-3 py-1.5 rounded-md bg-zinc-100 text-zinc-950 hover:bg-white font-medium transition-colors flex items-center gap-1"
          >
            {savedSuccess ? (
              <>
                <Check className="w-3.5 h-3.5" /> Saved
              </>
            ) : (
              'Save Key'
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
