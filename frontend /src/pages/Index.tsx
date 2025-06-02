import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';
import { toast } from 'sonner';
import ThemeToggle from '../components/ThemeToggle';
import FileList from '../components/FileList';
import Uploader from '../components/Uploader';
import PdfViewer from '../components/PdfViewer';
import DataPanel from '../components/DataPanel';
import AIParticles from '../components/AIParticles';

const Index: React.FC = () => {
  const [theme, setTheme] = useState<string>('light');
  const [files, setFiles] = useState<string[]>([]);
  const [selectedFile, setSelectedFile] = useState<string | null>(null);
  const [isLoadingFiles, setIsLoadingFiles] = useState<boolean>(false);
  const [isUploading, setIsUploading] = useState<boolean>(false);

  useEffect(() => {
    // Set initial theme
    const savedTheme = localStorage.getItem('theme') || 'light';
    setTheme(savedTheme);
    document.documentElement.setAttribute('data-theme', savedTheme);
    
    // Load files on mount
    fetchFiles();
  }, []);

  const fetchFiles = async () => {
    setIsLoadingFiles(true);
    try {
      const response = await axios.get('http://localhost:8000/files');
      setFiles(response.data.files || []);
    } catch (error) {
      console.error('Error fetching files:', error);
      toast.error('Failed to fetch files');
      setFiles([]);
    } finally {
      setIsLoadingFiles(false);
    }
  };

  const handleThemeChange = (newTheme: string) => {
    setTheme(newTheme);
    localStorage.setItem('theme', newTheme);
  };

  const handleUploadSuccess = () => {
    fetchFiles();
  };

  const handleFileSelect = (filename: string) => {
    setSelectedFile(filename);
  };

  return (
    <div className="min-h-screen bg-base-200 relative overflow-hidden">
      {/* AI Background Particles */}
      <AIParticles />
      
      {/* Header */}
      <motion.header
        className="bg-base-100/90 backdrop-blur-sm shadow-sm border-b border-base-300 relative z-40"
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
      >
        <div className="container mx-auto px-2 sm:px-4 py-3 sm:py-4">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-0">
            {/* Title and Controls */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 sm:gap-4 w-full sm:w-auto">
              <motion.div
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 0.5, ease: "easeOut" }}
                className="relative"
              >
                <h1 className="text-xl sm:text-2xl font-semibold text-base-content tracking-tight">
                  <motion.span
                    className="inline-block relative"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.8, delay: 0.2 }}
                  >
                    Document Intelligence
                    <motion.div
                      className="absolute bottom-0 left-0 h-0.5 bg-primary/60"
                      initial={{ width: 0 }}
                      animate={{ width: "100%" }}
                      transition={{ duration: 1, delay: 0.5, ease: "easeOut" }}
                    />
                  </motion.span>
                </h1>
              </motion.div>
              
              {/* Mobile-friendly controls */}
              <div className="flex flex-wrap items-center gap-2 sm:gap-4 w-full sm:w-auto">
                <div className="hidden sm:block divider divider-horizontal"></div>
                
                <motion.div
                  initial={{ x: -50, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  transition={{ duration: 0.5, delay: 0.2 }}
                  className="flex-shrink-0"
                >
                  <Uploader 
                    onUploadSuccess={handleUploadSuccess}
                    isUploading={isUploading}
                    setIsUploading={setIsUploading}
                  />
                </motion.div>
                
                <motion.div
                  initial={{ x: -50, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  transition={{ duration: 0.5, delay: 0.3 }}
                  className="flex-shrink-0"
                >
                  <FileList
                    files={files}
                    selectedFile={selectedFile}
                    onFileSelect={handleFileSelect}
                    isLoading={isLoadingFiles}
                  />
                </motion.div>
              </div>
            </div>
            
            {/* Theme Toggle */}
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ duration: 0.5, delay: 0.4 }}
              className="flex-shrink-0 self-end sm:self-auto"
            >
              <ThemeToggle theme={theme} setTheme={handleThemeChange} />
            </motion.div>
          </div>
        </div>
      </motion.header>

      {/* Main Content */}
      <main className="container mx-auto px-2 sm:px-4 py-4 sm:py-6 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
          {/* PDF Viewer */}
          <motion.div
            className="order-2 lg:order-1 h-[75vh] min-h-[320px] max-h-[85vh] overflow-y-auto"
            initial={{ x: -100, opacity: 0, scale: 0.9 }}
            animate={{ x: 0, opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.1, ease: 'backOut' }}
          >
            <PdfViewer filename={selectedFile} />
          </motion.div>
          {/* Data Panel */}
          <motion.div
            className="order-1 lg:order-2 h-[75vh] min-h-[320px] max-h-[85vh] overflow-y-auto"
            initial={{ x: 100, opacity: 0, scale: 0.9 }}
            animate={{ x: 0, opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.2, ease: 'backOut' }}
          >
            <DataPanel filename={selectedFile} />
          </motion.div>
        </div>
      </main>

      {/* Enhanced Loading Overlay */}
      <AnimatePresence>
        {isUploading && (
          <motion.div
            className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
          >
            <motion.div
              className="bg-base-100 p-6 sm:p-8 rounded-2xl shadow-2xl flex flex-col items-center gap-4 sm:gap-6 relative overflow-hidden max-w-sm w-full"
              initial={{ scale: 0.8, y: 50 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.8, y: 50 }}
              transition={{ duration: 0.5, ease: "backOut" }}
            >
              {/* Animated background gradient */}
              <motion.div
                className="absolute inset-0 bg-gradient-to-r from-primary/10 via-secondary/10 to-primary/10"
                animate={{ x: [-200, 200] }}
                transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
              />
              
              <motion.div
                className="loading loading-spinner loading-lg text-primary relative z-10"
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
              />
              
              <div className="text-center relative z-10">
                <motion.p
                  className="font-medium text-lg"
                  animate={{ opacity: [0.5, 1, 0.5] }}
                  transition={{ duration: 2, repeat: Infinity }}
                >
                  AI Processing PDF...
                </motion.p>
                <motion.p
                  className="text-sm text-base-content/60 mt-2"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.5 }}
                >
                  Extracting data with advanced AI algorithms
                </motion.p>
              </div>
              
              {/* Processing dots animation */}
              <div className="flex gap-2 relative z-10">
                {[0, 1, 2].map((i) => (
                  <motion.div
                    key={i}
                    className="w-2 h-2 bg-primary rounded-full"
                    animate={{ scale: [0.8, 1.2, 0.8] }}
                    transition={{
                      duration: 1.5,
                      repeat: Infinity,
                      delay: i * 0.2
                    }}
                  />
                ))}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Index;
