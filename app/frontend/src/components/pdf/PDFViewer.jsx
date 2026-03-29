import React, { useState, useEffect, useRef } from 'react';
import { Document, Page, pdfjs } from 'react-pdf';
import { 
  ChevronLeft, 
  ChevronRight, 
  ZoomIn, 
  ZoomOut, 
  Download, 
  Search,
  Maximize2,
  FileText,
  Layers,
  Layout
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

// Set up the worker for react-pdf
pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;

import 'react-pdf/dist/Page/AnnotationLayer.css';
import 'react-pdf/dist/Page/TextLayer.css';

const PDFViewer = ({ fileUrl, fileName }) => {
  const [numPages, setNumPages] = useState(null);
  const [pageNumber, setPageNumber] = useState(1);
  const [zoom, setZoom] = useState(1.0);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const containerRef = useRef(null);

  function onDocumentLoadSuccess({ numPages }) {
    setNumPages(numPages);
    setPageNumber(1);
  }

  const zoomIn = () => setZoom(prev => Math.min(prev + 0.2, 3.0));
  const zoomOut = () => setZoom(prev => Math.max(prev - 0.2, 0.5));
  
  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= numPages) {
      setPageNumber(newPage);
    }
  };

  return (
    <div className="flex h-[calc(100vh-120px)] bg-[#0A0A0A] rounded-[2rem] border border-white/5 overflow-hidden">
      {/* Thumbnails Sidebar */}
      <AnimatePresence initial={false}>
        {sidebarOpen && (
          <motion.div 
            initial={{ width: 0, opacity: 0 }}
            animate={{ width: 260, opacity: 1 }}
            exit={{ width: 0, opacity: 0 }}
            className="border-r border-white/5 bg-black/40 flex flex-col"
          >
            <div className="p-6 border-b border-white/5 flex items-center justify-between">
              <span className="text-[10px] font-black uppercase tracking-widest text-white/40">Thumbnails</span>
              <Layers size={14} className="text-white/20" />
            </div>
            <div className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar">
              {numPages && Array.from(new Array(numPages), (el, index) => (
                <div 
                  key={`thumb_${index + 1}`}
                  onClick={() => setPageNumber(index + 1)}
                  className={`
                    relative cursor-pointer transition-all duration-300 rounded-xl overflow-hidden group
                    ${pageNumber === index + 1 ? 'ring-2 ring-white/20 scale-[0.98]' : 'hover:scale-[0.98]'}
                  `}
                >
                  <div className="bg-white/5 aspect-[3/4] flex items-center justify-center overflow-hidden border border-white/5">
                    <Document file={fileUrl}>
                       <Page 
                         pageNumber={index + 1} 
                         width={200}
                         className="opacity-60 group-hover:opacity-100 transition-opacity"
                         renderTextLayer={false}
                         renderAnnotationLayer={false}
                       />
                    </Document>
                  </div>
                  <div className="absolute bottom-2 right-2 bg-black/60 backdrop-blur-md px-2 py-0.5 rounded-md text-[8px] font-bold text-white/60">
                    {index + 1}
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Viewer Area */}
      <div className="flex-1 flex flex-col relative bg-[#111] overflow-hidden">
        {/* Toolbar */}
        <div className="h-14 bg-black/40 backdrop-blur-3xl border-b border-white/5 px-6 flex items-center justify-between z-10">
          <div className="flex items-center space-x-6">
            <button 
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="text-white/40 hover:text-white transition-colors"
            >
              <Layout size={18} />
            </button>
            <div className="h-4 w-px bg-white/5" />
            <div className="flex items-center space-x-4">
              <button 
                onClick={() => handlePageChange(pageNumber - 1)}
                disabled={pageNumber <= 1}
                className="p-1 hover:bg-white/5 rounded-lg disabled:opacity-20 transition-all"
              >
                <ChevronLeft size={20} />
              </button>
              <span className="text-[11px] font-black tracking-widest text-white/60">
                PAGE <span className="text-white">{pageNumber}</span> / {numPages || '--'}
              </span>
              <button 
                onClick={() => handlePageChange(pageNumber + 1)}
                disabled={pageNumber >= numPages}
                className="p-1 hover:bg-white/5 rounded-lg disabled:opacity-20 transition-all"
              >
                <ChevronRight size={20} />
              </button>
            </div>
          </div>

          <div className="absolute left-1/2 -translate-x-1/2 text-[10px] font-black uppercase tracking-[0.3em] text-white/20 truncate max-w-[300px]">
            {fileName}
          </div>

          <div className="flex items-center space-x-6">
            <div className="flex items-center bg-white/5 rounded-xl p-1">
              <button onClick={zoomOut} className="p-2 hover:bg-white/10 rounded-lg transition-all text-white/40 hover:text-white">
                <ZoomOut size={16} />
              </button>
              <span className="text-[10px] font-black w-14 text-center text-white/60">
                {Math.round(zoom * 100)}%
              </span>
              <button onClick={zoomIn} className="p-2 hover:bg-white/10 rounded-lg transition-all text-white/40 hover:text-white">
                <ZoomIn size={16} />
              </button>
            </div>
            <div className="h-4 w-px bg-white/5" />
            <a href={fileUrl} download={fileName} className="text-white/40 hover:text-white transition-colors">
              <Download size={18} />
            </a>
          </div>
        </div>

        {/* PDF Canvas */}
        <div 
          ref={containerRef}
          className="flex-1 overflow-auto p-12 flex justify-center items-start custom-scrollbar bg-neutral-900/50"
        >
          <div className="shadow-2xl shadow-black/80 rounded-sm overflow-hidden bg-white origin-top transition-transform duration-200" style={{ transform: `scale(${zoom})` }}>
            <Document 
              file={fileUrl} 
              onLoadSuccess={onDocumentLoadSuccess}
              loading={
                <div className="w-[600px] aspect-[1/1.4] flex items-center justify-center bg-white/5 animate-pulse rounded-2xl">
                   <div className="text-[9px] font-black uppercase tracking-[0.5em] text-white/20 italic">Loading PDF...</div>
                </div>
              }
            >
              <Page 
                pageNumber={pageNumber} 
                width={800} // Base width, can be adjusted
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
