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
  // Zoom state
  const [scale, setScale] = useState<number>(1.0);
  // Drag state for panning
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState<{x: number, y: number} | null>(null);
  const [offset, setOffset] = useState<{x: number, y: number}>({x: 0, y: 0});
  const [lastOffset, setLastOffset] = useState<{x: number, y: number}>({x: 0, y: 0});

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

  // Zoom handlers
  const zoomIn = () => setScale(s => Math.min(s + 0.2, 2.5));
  const zoomOut = () => setScale(s => Math.max(s - 0.2, 0.5));
  const resetZoom = () => setScale(1.0);

  // Pan handlers
  const handleMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    if (scale <= 1) return;
    setIsDragging(true);
    setDragStart({ x: e.clientX, y: e.clientY });
  };
  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!isDragging || !dragStart) return;
    const dx = e.clientX - dragStart.x;
    const dy = e.clientY - dragStart.y;
    setOffset({ x: lastOffset.x + dx, y: lastOffset.y + dy });
  };
  const handleMouseUp = () => {
    if (!isDragging) return;
    setIsDragging(false);
    setLastOffset(offset);
    setDragStart(null);
  };
  const handleMouseLeave = () => {
    if (!isDragging) return;
    setIsDragging(false);
    setLastOffset(offset);
    setDragStart(null);
  };

  if (!filename) {
    return (
      <motion.div
        className="card bg-base-100 shadow-lg h-full relative overflow-hidden" dir="rtl">
        <motion.div
          className="absolute inset-0 bg-gradient-to-br from-primary/5 to-secondary/5"
          animate={{ opacity: [0.3, 0.6, 0.3] }}
          transition={{ duration: 3, repeat: Infinity }}
        />
        <div className="card-body items-center justify-center relative z-10">
          <div className="text-center w-full" dir="rtl">
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
            <p className="text-base-content/60">העלה קובץ PDF או בחר אחד מהרשימה לצפייה</p>
          </div>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      className="card bg-base-100 shadow-lg h-full flex flex-col relative overflow-hidden" dir="rtl"
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.6, ease: "backOut" }}
      whileHover={{ boxShadow: "0 20px 40px rgba(0,0,0,0.1)" }}
    >
      {/* Animated border gradient */}
      <motion.div
        className="absolute inset-x-0 top-0 bottom-0 bg-gradient-to-r from-primary/20 via-transparent to-secondary/20 rounded-t-lg"
        style={{ pointerEvents: 'none' }}
        animate={{ opacity: [0.3, 0.7, 0.3] }}
        transition={{ duration: 4, repeat: Infinity }}
      />
      
      <div className="card-body p-4 flex-1 flex flex-col relative z-10 min-h-0 max-h-full h-full w-full overflow-auto">
        <motion.div
          className="flex items-center justify-between mb-4 text-right w-full min-w-0"
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
                {/* Zoom controls */}
                <motion.button
                  onClick={zoomOut}
                  className="btn btn-xs btn-outline mx-1"
                  title="הקטן"
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  transition={{ duration: 0.2 }}
                >
                  −
                </motion.button>
                <span className="text-xs w-10 text-center select-none">{Math.round(scale * 100)}%</span>
                <motion.button
                  onClick={zoomIn}
                  className="btn btn-xs btn-outline mx-1"
                  title="הגדל"
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  transition={{ duration: 0.2 }}
                >
                  +
                </motion.button>
                <motion.button
                  onClick={resetZoom}
                  className="btn btn-xs btn-ghost mx-1"
                  title="איפוס זום"
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  transition={{ duration: 0.2 }}
                >
                  100%
                </motion.button>
                {/* Page navigation */}
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
                  {pageNumber} מתוך {numPages}
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
          className="flex-1 overflow-auto border border-base-300 rounded-lg bg-base-50 relative min-h-0 max-h-full w-full"
          style={{ overscrollBehavior: 'contain' }}
          whileHover={{ borderColor: "rgba(59, 130, 246, 0.3)" }}
          transition={{ duration: 0.3 }}
        >
          {error ? (
            <motion.div
              className="flex items-center justify-center h-full"
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
            >
              <div className="text-center w-full" dir="rtl">
                <motion.div
                  className="text-error text-4xl mb-2"
                  animate={{ scale: [1, 1.1, 1] }}
                  transition={{ duration: 0.5 }}
                >
                  ⚠️
                </motion.div>
                <p className="text-error">טעינת ה-PDF נכשלה</p>
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
                  <div className="flex flex-col items-center gap-4 text-right">
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
                    <span className="text-sm">טוען PDF...</span>
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
                  <div
                    style={{
                      width: '100%',
                      height: '100%',
                      overflow: 'hidden',
                      cursor: scale > 1 ? (isDragging ? 'grabbing' : 'grab') : 'default',
                      userSelect: isDragging ? 'none' : 'auto',
                    }}
                    onMouseDown={handleMouseDown}
                    onMouseMove={handleMouseMove}
                    onMouseUp={handleMouseUp}
                    onMouseLeave={handleMouseLeave}
                  >
                    <div
                      style={{
                        transform: `translate(${offset.x}px, ${offset.y}px)`,
                        transition: isDragging ? 'none' : 'transform 0.2s',
                        display: 'inline-block',
                      }}
                    >
                      <Page
                        pageNumber={pageNumber}
                        loading={
                          <motion.div
                            className="flex items-center justify-center p-8 text-right w-full"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                          >
                            <Loader className="w-6 h-6 animate-spin text-primary" />
                          </motion.div>
                        }
                        className="shadow-md w-full max-w-full h-auto"
                        scale={scale}
                      />
                    </div>
                  </div>
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
