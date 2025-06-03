import React, { useRef } from 'react';
import { motion } from 'framer-motion';
import { Upload, Loader, Sparkles } from 'lucide-react';
import axios from 'axios';
import { toast } from 'sonner';

interface UploaderProps {
  onUploadSuccess: () => void;
  isUploading: boolean;
  setIsUploading: (loading: boolean) => void;
}

const Uploader: React.FC<UploaderProps> = ({ onUploadSuccess, isUploading, setIsUploading }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (file.type !== 'application/pdf') {
      toast.error('אנא בחר קובץ PDF בלבד');
      return;
    }

    if (file.size > 10 * 1024 * 1024) { // 10MB limit
      toast.error('הקובץ חייב להיות קטן מ-10MB');
      return;
    }

    const formData = new FormData();
    formData.append('file', file);

    setIsUploading(true);
    
    try {
      await axios.post('http://localhost:8000/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      
      toast.success('הקובץ הועלה בהצלחה!');
      onUploadSuccess();
      
      // Reset the input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    } catch (error) {
      console.error('Upload error:', error);
      toast.error('Failed to upload file. Please try again.');
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <motion.div
      className="card bg-base-100 shadow-lg p-4 flex flex-col items-center gap-4 w-full" dir="rtl">
      <div className="flex flex-col items-center gap-2 w-full">
        <button
          className="btn btn-primary btn-outline flex items-center gap-2 w-full text-right"
          onClick={handleFileSelect}
          disabled={isUploading}
        >
          <Upload className="w-5 h-5" />
          העלה קובץ PDF
        </button>
        <input
          type="file"
          accept="application/pdf"
          ref={fileInputRef}
          className="hidden"
          onChange={handleFileChange}
          disabled={isUploading}
        />
        <div className="text-xs text-base-content/60 text-right w-full">
          ניתן להעלות קובץ PDF עד 10MB בלבד
        </div>
      </div>
      {isUploading && (
        <div className="flex flex-col items-center gap-2 mt-2 text-right">
          <Loader className="w-6 h-6 animate-spin text-primary" />
          <span>מעלה קובץ...</span>
        </div>
      )}
    </motion.div>
  );
};

export default Uploader;
