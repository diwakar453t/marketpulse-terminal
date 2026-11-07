'use client';

import React, { useState, useEffect } from 'react';
import { X, Key, Check, Trash2, ExternalLink, Sparkles, AlertCircle } from 'lucide-react';

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
    }, 1000);
  };

  const handleClear = () => {
    setInputKey('');
    onSaveApiKey('');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
      <div
        className="w-full max-w-md bg-[#0D121F] border border-gray-700 rounded-2xl shadow-2xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="px-6 py-4 border-b border-gray-800 flex items-center justify-between bg-[#111827]/70">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-purple-900/40 text-purple-400 border border-purple-700/40">
              <Key className="w-4 h-4" />
            </div>
            <h3 className="font-bold text-gray-200 text-sm">
              Gemini AI Settings
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 text-gray-400 hover:text-white rounded-lg hover:bg-gray-800"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-6 space-y-4 text-xs">
          <p className="text-gray-300 leading-relaxed">
            MarketPulse uses Google's Gemini models to distill long economic articles into direct 2-point market impacts, removing clickbait and noise.
          </p>

          <div>
            <label className="block text-gray-400 font-semibold mb-1.5">
              Enter Gemini API Key
            </label>
            <input
              type="password"
              placeholder="AIzaSy..."
              value={inputKey}
              onChange={(e) => setInputKey(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl bg-gray-900 border border-gray-700 text-gray-200 placeholder-gray-500 focus:outline-none focus:border-purple-500 font-mono text-xs"
            />
            <p className="text-[11px] text-gray-500 mt-1.5 flex items-center gap-1">
              <AlertCircle className="w-3 h-3 text-gray-400" />
              Stored safely in your browser localStorage. Never saved on third-party servers.
            </p>
          </div>

          <div className="pt-2 flex items-center justify-between">
            <a
              href="https://aistudio.google.com/app/apikey"
              target="_blank"
              rel="noopener noreferrer"
              className="text-purple-400 hover:text-purple-300 flex items-center gap-1 underline"
            >
              Get free Gemini API Key
              <ExternalLink className="w-3 h-3" />
            </a>

            {inputKey && (
              <button
                onClick={handleClear}
                className="text-red-400 hover:text-red-300 flex items-center gap-1"
              >
                <Trash2 className="w-3.5 h-3.5" />
                Remove Key
              </button>
            )}
          </div>
        </div>

        <div className="px-6 py-4 border-t border-gray-800 bg-[#111827]/70 flex items-center justify-end gap-2">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-gray-400 hover:text-white text-xs font-semibold hover:bg-gray-800"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs shadow-md shadow-purple-950/40 active:scale-95 transition-all"
          >
            {savedSuccess ? (
              <>
                <Check className="w-3.5 h-3.5" /> Saved!
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

