import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown } from 'lucide-react';

interface FileListProps {
  files: string[];
  selectedFile: string | null;
  onFileSelect: (filename: string) => void;
  isLoading: boolean;
}

const FileList: React.FC<FileListProps> = ({ files, selectedFile, onFileSelect, isLoading }) => {
  const [base200, setBase200] = useState<string>('#f3f4f6'); // גיבוי לערך צבע

  useEffect(() => {
    const value = getComputedStyle(document.documentElement)
      .getPropertyValue('--base-200')
      .trim();
    if (value) setBase200(`hsl(${value})`);
  }, []);

  return (
    <div className="dropdown dropdown-end" dir="rtl">
      <motion.div
        tabIndex={0}
        role="button"
        className="btn btn-outline gap-2 btn-sm sm:btn-md text-right"
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
      >
        <span className="truncate max-w-20 sm:max-w-32">
          {selectedFile || 'בחר קובץ PDF'}
        </span>
        <ChevronDown className="w-4 h-4" />
      </motion.div>

      <AnimatePresence>
        <motion.ul
          tabIndex={0}
          className="dropdown-content z-[9999] menu p-2 shadow-xl bg-base-100 rounded-box w-48 sm:w-64 max-h-48 sm:max-h-64 overflow-y-auto border border-base-300 text-right"
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.2 }}
        >
          {isLoading ? (
            <li>
              <div className="flex items-center gap-2">
                <span className="loading loading-spinner loading-sm"></span>
                טוען קבצים...
              </div>
            </li>
          ) : files.length === 0 ? (
            <li>
              <span className="text-base-content/60 text-sm">לא הועלו קבצים</span>
            </li>
          ) : (
            files.map((filename) => (
              <motion.li
                key={filename}
                whileHover={{ backgroundColor: base200 }}
                transition={{ duration: 0.1 }}
              >
                <button
                  onClick={() => onFileSelect(filename)}
                  className={`w-full text-right truncate text-sm ${
                    selectedFile === filename ? 'bg-primary text-primary-content' : ''
                  }`}
                  title={filename}
                >
                  {filename}
                </button>
              </motion.li>
            ))
          )}
        </motion.ul>
      </AnimatePresence>
    </div>
  );
};

export default FileList;
