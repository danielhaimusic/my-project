import React, { useState } from 'react';
import { Document, Page, pdfjs } from 'react-pdf';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight, Loader, Eye } from 'lucide-react';

// Set the worker using the CDN URL
pdfjs.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.min.js`;


interface PdfViewerProps {
  filename: string | null;
}

const PdfViewer: React.FC<PdfViewerProps> = ({ filename }) => {
  const [numPages, setNumPages] = useState<number | null>(null);
  const [pageNumber, setPageNumber] = useState<number>(1);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const onDocumentLoadSuccess = ({ numPages }: { numPages: number }) => {
    setNumPages(numPages);
    setPageNumber(1);
    setLoading(false);
    setError(null);
  };

  const onDocumentLoadError = (error: Error) => {
    console.error('PDF load error:', error);
    setError('Failed to load PDF');
    setLoading(false);
  };

  const goToPrevPage = () => {
    setPageNumber(prev => Math.max(prev - 1, 1));
  };

  const goToNextPage = () => {
    setPageNumber(prev => Math.min(prev + 1, numPages || 1));
  };

  if (!filename) {
    return (
      <motion.div
        className="card bg-base-100 shadow-lg h-full relative overflow-hidden"
        whileHover={{ scale: 1.02 }}
        transition={{ duration: 0.3 }}
      >
        <motion.div
          className="absolute inset-0 bg-gradient-to-br from-primary/5 to-secondary/5"
          animate={{ opacity: [0.3, 0.6, 0.3] }}
          transition={{ duration: 3, repeat: Infinity }}
        />
        
        <div className="card-body items-center justify-center relative z-10">
          <div className="text-center">
            <motion.div
              className="text-6xl mb-4 relative"
              animate={{ y: [-5, 5, -5] }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              📄
              <motion.div
                className="absolute -top-2 -right-2"
                animate={{ rotate: [0, 10, -10, 0] }}
                transition={{ duration: 1.5, repeat: Infinity }}
              >
                <Eye className="w-6 h-6 text-primary/60" />
              </motion.div>
            </motion.div>
            <h3 className="text-lg font-semibold mb-2">PDF Viewer Ready</h3>
            <p className="text-base-content/60">Upload a PDF or select one from the list to view</p>
          </div>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      className="card bg-base-100 shadow-lg h-full flex flex-col relative overflow-hidden"
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.6, ease: "backOut" }}
      whileHover={{ boxShadow: "0 20px 40px rgba(0,0,0,0.1)" }}
    >
      {/* Animated border gradient */}
      <motion.div
        className="absolute inset-0 bg-gradient-to-r from-primary/20 via-transparent to-secondary/20 rounded-lg"
        animate={{ opacity: [0.3, 0.7, 0.3] }}
        transition={{ duration: 4, repeat: Infinity }}
      />
      
      <div className="card-body p-4 flex-1 flex flex-col relative z-10">
        <motion.div
          className="flex items-center justify-between mb-4"
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          <motion.h3
            className="text-lg font-semibold truncate flex items-center gap-2"
            title={filename}
            whileHover={{ scale: 1.05 }}
          >
            <Eye className="w-5 h-5 text-primary" />
            {filename}
          </motion.h3>
          
          <AnimatePresence>
            {numPages && (
              <motion.div
                className="flex items-center gap-2"
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0, opacity: 0 }}
                transition={{ duration: 0.3 }}
              >
                <motion.button
                  onClick={goToPrevPage}
                  disabled={pageNumber <= 1}
                  className="btn btn-sm btn-circle btn-outline"
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  transition={{ duration: 0.2 }}
                >
                  <ChevronLeft className="w-4 h-4" />
                </motion.button>
                
                <motion.span
                  className="text-sm font-medium min-w-20 text-center"
                  key={pageNumber}
                  initial={{ y: -10, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ duration: 0.3 }}
                >
                  {pageNumber} / {numPages}
                </motion.span>
                
                <motion.button
                  onClick={goToNextPage}
                  disabled={pageNumber >= numPages}
                  className="btn btn-sm btn-circle btn-outline"
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  transition={{ duration: 0.2 }}
                >
                  <ChevronRight className="w-4 h-4" />
                </motion.button>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>

        <motion.div
          className="flex-1 overflow-auto border border-base-300 rounded-lg bg-base-50 relative"
          whileHover={{ borderColor: "rgba(59, 130, 246, 0.3)" }}
          transition={{ duration: 0.3 }}
        >
          {error ? (
            <motion.div
              className="flex items-center justify-center h-full"
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
            >
              <div className="text-center">
                <motion.div
                  className="text-error text-4xl mb-2"
                  animate={{ scale: [1, 1.1, 1] }}
                  transition={{ duration: 0.5 }}
                >
                  ⚠️
                </motion.div>
                <p className="text-error">{error}</p>
              </div>
            </motion.div>
          ) : (
            <Document
              file={`http://localhost:8000/pdf/${filename}`}
              onLoadSuccess={onDocumentLoadSuccess}
              onLoadError={onDocumentLoadError}
              loading={
                <motion.div
                  className="flex items-center justify-center h-full"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                >
                  <div className="flex flex-col items-center gap-4">
                    <motion.div
                      className="relative"
                      animate={{ rotate: 360 }}
                      transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                    >
                      <Loader className="w-8 h-8 text-primary" />
                      <motion.div
                        className="absolute inset-0 border-2 border-primary/30 rounded-full"
                        animate={{ scale: [1, 1.3, 1], opacity: [1, 0, 1] }}
                        transition={{ duration: 1.5, repeat: Infinity }}
                      />
                    </motion.div>
                    <span className="text-sm">Loading PDF...</span>
                  </div>
                </motion.div>
              }
              className="flex justify-center p-4"
            >
              <AnimatePresence mode="wait">
                <motion.div
                  key={pageNumber}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 1.1 }}
                  transition={{ duration: 0.3 }}
                >
                  <Page
                    pageNumber={pageNumber}
                    loading={
                      <motion.div
                        className="flex items-center justify-center p-8"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                      >
                        <Loader className="w-6 h-6 animate-spin text-primary" />
                      </motion.div>
                    }
                    className="shadow-md"
                    width={Math.min(window.innerWidth * 0.4, 600)}
                  />
                </motion.div>
              </AnimatePresence>
            </Document>
          )}
        </motion.div>
      </div>
    </motion.div>
  );
};

export default PdfViewer;
