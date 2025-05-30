
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
      toast.error('Please select a PDF file');
      return;
    }

    if (file.size > 10 * 1024 * 1024) { // 10MB limit
      toast.error('File size must be less than 10MB');
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
      
      toast.success('File uploaded successfully!');
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
    <div className="relative">
      <input
        ref={fileInputRef}
        type="file"
        accept=".pdf"
        onChange={handleFileChange}
        className="hidden"
      />
      
      <motion.button
        onClick={handleFileSelect}
        disabled={isUploading}
        className="btn btn-primary gap-2 relative overflow-hidden btn-sm sm:btn-md"
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        transition={{ duration: 0.2 }}
      >
        {/* Animated background gradient */}
        {!isUploading && (
          <motion.div
            className="absolute inset-0 bg-gradient-to-r from-primary to-secondary opacity-0"
            whileHover={{ opacity: 0.2 }}
            transition={{ duration: 0.3 }}
          />
        )}
        
        {isUploading ? (
          <>
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
            >
              <Loader className="w-4 h-4" />
            </motion.div>
            <span className="hidden sm:inline">Uploading...</span>
            <span className="sm:hidden">...</span>
            
            {/* Processing particles */}
            <motion.div
              className="absolute right-2 top-1/2 transform -translate-y-1/2"
              animate={{ x: [0, 5, 0] }}
              transition={{ duration: 1, repeat: Infinity }}
            >
              <Sparkles className="w-3 h-3 text-yellow-300" />
            </motion.div>
          </>
        ) : (
          <>
            <motion.div
              whileHover={{ y: -2 }}
              transition={{ duration: 0.2 }}
            >
              <Upload className="w-4 h-4" />
            </motion.div>
            <span className="hidden sm:inline">Upload PDF</span>
            <span className="sm:hidden">Upload</span>
            
            {/* Hover effect sparkles */}
            <motion.div
              className="absolute right-2 top-1/2 transform -translate-y-1/2 opacity-0"
              whileHover={{ opacity: 1 }}
              transition={{ duration: 0.3 }}
            >
              <motion.div
                animate={{ scale: [0.8, 1.2, 0.8] }}
                transition={{ duration: 1.5, repeat: Infinity }}
              >
                <Sparkles className="w-3 h-3 text-yellow-300" />
              </motion.div>
            </motion.div>
          </>
        )}
      </motion.button>
    </div>
  );
};

export default Uploader;
