import React, { useState, useEffect, useRef } from 'react';
import { Document, Page, pdfjs } from 'react-pdf';
import { 
  ChevronLeft, 
  ChevronRight, 
  ZoomIn, 
  ZoomOut, 
  Download, 
  Layout
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

// Set up the worker for react-pdf
pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;

import 'react-pdf/dist/Page/AnnotationLayer.css';
import 'react-pdf/dist/Page/TextLayer.css';

const PDFViewer = ({ fileUrl, fileName, externalPage, onPageAction }) => {
  const [numPages, setNumPages] = useState(null);
  const [internalPage, setInternalPage] = useState(1);
  const [zoom, setZoom] = useState(1.0);
  const [sidebarOpen, setSidebarOpen] = useState(true);

  // Sync internal state with external page jumps
  useEffect(() => {
    if (externalPage && externalPage !== internalPage) {
      setInternalPage(externalPage);
    }
  }, [externalPage, internalPage]);

  function onDocumentLoadSuccess({ numPages }) {
    setNumPages(numPages);
    if (!externalPage) setInternalPage(1);
  }

  const zoomIn = () => setZoom(prev => Math.min(prev + 0.2, 3.0));
  const zoomOut = () => setZoom(prev => Math.max(prev - 0.2, 0.5));
  
  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= numPages) {
      setInternalPage(newPage);
      onPageAction?.(newPage);
    }
  };

  return (
    <div className="flex flex-col h-full bg-surface-sidebar overflow-hidden border border-white/5 selection:bg-white selection:text-black">
      {/* TOOLBAR */}
      <div className="h-12 bg-surface-base border-b border-white/5 px-6 flex items-center justify-between z-20 shrink-0">
        <div className="flex items-center space-x-6">
          <button 
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="text-white/20 hover:text-white transition-colors p-1"
          >
            <Layout size={16} />
          </button>
          <div className="h-4 w-[1px] bg-white/5" />
          <div className="flex items-center space-x-4">
            <button 
              onClick={() => handlePageChange(internalPage - 1)}
              disabled={internalPage <= 1}
              className="p-1 hover:bg-white/5 disabled:opacity-5 transition-all text-white/40 hover:text-white"
            >
              <ChevronLeft size={16} />
            </button>
            <span className="text-[10px] font-bold tracking-[0.2em] text-white/20 uppercase">
              <span className="text-white/60">{internalPage}</span> / {numPages || '--'}
            </span>
            <button 
              onClick={() => handlePageChange(internalPage + 1)}
              disabled={internalPage >= numPages}
              className="p-1 hover:bg-white/5 disabled:opacity-5 transition-all text-white/40 hover:text-white"
            >
              <ChevronRight size={16} />
            </button>
          </div>
        </div>

        <div className="flex items-center space-x-6">
          <div className="flex items-center bg-white/[0.02] border border-white/5 p-0.5">
            <button onClick={zoomOut} className="p-1.5 hover:bg-white/5 transition-all text-white/20 hover:text-white">
              <ZoomOut size={13} />
            </button>
            <span className="text-[9px] font-bold w-12 text-center text-white/40 uppercase tracking-widest">
               {Math.round(zoom * 100)}%
            </span>
            <button onClick={zoomIn} className="p-1.5 hover:bg-white/5 transition-all text-white/20 hover:text-white">
              <ZoomIn size={13} />
            </button>
          </div>
          <div className="h-4 w-[1px] bg-white/5" />
          <a href={fileUrl} target="_blank" rel="noopener noreferrer" className="text-white/20 hover:text-white transition-colors p-1">
            <Download size={16} />
          </a>
        </div>
      </div>

      <div className="flex-1 flex overflow-hidden relative">
        {/* Thumbnails Sidebar */}
        <AnimatePresence initial={false}>
          {sidebarOpen && (
            <motion.div 
              initial={{ width: 0 }}
              animate={{ width: 220 }}
              exit={{ width: 0 }}
              className="border-r border-white/5 bg-surface-well shrink-0 flex flex-col h-full overflow-hidden"
            >
              <div className="h-10 px-4 border-b border-white/5 flex items-center bg-surface-recessed/30 shrink-0">
                <span className="text-[9px] font-bold uppercase tracking-[0.3em] text-white/10 italic">Library_Index</span>
              </div>
              
              <div className="flex-1 overflow-y-auto custom-scrollbar p-4 bg-black/5">
                <Document file={fileUrl} loading={null}>
                  <div className="space-y-4">
                    {numPages && Array.from(new Array(numPages), (el, index) => (
                      <div 
                        key={`thumb_${index + 1}`}
                        onClick={() => handlePageChange(index + 1)}
                        className={`
                          relative cursor-pointer transition-all duration-300 border
                          ${internalPage === index + 1 ? 'border-white/40 bg-white/5' : 'border-white/5 hover:border-white/20'}
                        `}
                      >
                        <div className="bg-black/20 aspect-[3/4] flex items-center justify-center overflow-hidden pointer-events-none">
                           <Page 
                             pageNumber={index + 1} 
                             width={180}
                             className="opacity-40"
                             renderTextLayer={false}
                             renderAnnotationLayer={false}
                           />
                        </div>
                        <div className="absolute top-0 right-0 bg-white/10 backdrop-blur-sm px-1.5 py-0.5 text-[8px] font-bold text-white/40">
                          {index + 1}
                        </div>
                      </div>
                    ))}
                  </div>
                </Document>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Main Viewer area */}
        <div className="flex-1 overflow-auto p-16 flex justify-center items-start custom-scrollbar bg-surface-base h-full">
          <div 
             className="bg-white transition-transform duration-200 shadow-[0_0_100px_rgba(0,0,0,0.5)] origin-top border border-white/10"
             style={{ transform: `scale(${zoom})`, marginBottom: '100px' }}
          >
            <Document 
              file={fileUrl} 
              onLoadSuccess={onDocumentLoadSuccess}
              loading={<div className="w-[700px] h-[900px] bg-white/5" />}
            >
              <Page 
                key={`${internalPage}_${zoom}`}
                pageNumber={internalPage} 
                width={700}
                renderAnnotationLayer={true}
                renderTextLayer={true}
                className="mx-auto"
              />
            </Document>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PDFViewer;
