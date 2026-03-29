import { useState, useEffect, useCallback } from "react";
import Auth from './components/auth/Auth';
import LandingPage from './components/landing/LandingPage';
import { useAuth } from './hooks/useAuth';
import Header from "./components/layout/Header";
import PDFViewer from "./components/pdf/PDFViewer";
import AIChat from "./components/chat/AIChat";
import { getDocuments, uploadDocument } from "./services/supabaseService";
import { processDocument } from "./api";
import { 
  FileUp, 
  Loader2,
  Plus
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { supabase } from "./lib/supabase";

function App() {
  const { user, loading: authLoading } = useAuth();
  const [showAuth, setShowAuth] = useState(false);
  const [activeDoc, setActiveDoc] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);

  // Fetch only the most recent document on load to auto-open it
  const fetchRecentDoc = useCallback(async () => {
    if (!user) return;
    try {
      setInitialLoading(true);
      const docs = await getDocuments(user.id);
      if (docs && docs.length > 0) {
        setActiveDoc(docs[0]);
      }
    } catch (err) {
      console.error("Error fetching docs:", err);
    } finally {
      setInitialLoading(false);
    }
  }, [user]);

  useEffect(() => {
    if (user?.id) {
      // Only fetch if the user ID actually changed or we have no active doc
      if (!activeDoc) {
        fetchRecentDoc();
      }
    } else if (!user) {
      setShowAuth(false);
      setActiveDoc(null);
    }
  }, [user?.id, fetchRecentDoc, activeDoc]);

  const handleUpload = async (file) => {
    if (!file || !user) return;
    try {
      setIsUploading(true);
      const newDoc = await uploadDocument(user.id, file);
      
      // Notify Python backend to index
      try {
        await processDocument(newDoc.storage_path, newDoc.id, user.id);
      } catch (err) {
        console.error("Backend indexing failed:", err);
      }
      
      setActiveDoc(newDoc);
    } catch (err) {
      console.error("Upload error:", err);
      alert("Failed to upload document. Please try again.");
    } finally {
      setIsUploading(false);
    }
  };

  if (authLoading || (user && initialLoading)) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center p-8">
         <div className="text-white/20 text-[9px] font-bold uppercase tracking-[0.4em] animate-pulse italic">Initializing Grounded PDF Engine...</div>
      </div>
    );
  }

  if (!user) {
    if (showAuth) {
      return (
        <div className="relative">
          <button 
            onClick={() => setShowAuth(false)}
            className="fixed top-8 left-10 z-[60] bg-white/5 border border-white/10 text-white/40 px-5 py-2 rounded-xl hover:text-white transition-all text-[8px] uppercase font-black tracking-widest"
          >
            ← Back to Landing
          </button>
          <Auth initialMode={showAuth === 'login'} />
        </div>
      );
    }
    return <LandingPage onAuthClick={(mode) => setShowAuth(mode)} />;
  }

  return (
    <div className="min-h-screen bg-[#000000] text-[#f8fafc] font-inter selection:bg-white selection:text-black flex flex-col overflow-hidden">
      <Header />

      {/* Persistent floating upload button when a doc is active */}
      {activeDoc && (
        <button 
          onClick={() => document.getElementById('pdf-upload').click()}
          className="fixed bottom-10 left-10 z-[60] bg-white/5 border border-white/10 text-white/40 px-6 py-3 rounded-full hover:bg-white/10 hover:text-white transition-all text-[9px] uppercase font-black tracking-[0.2em] backdrop-blur-3xl flex items-center space-x-3 shadow-2xl"
        >
          {isUploading ? <Loader2 className="animate-spin" size={12} /> : <Plus size={14} />}
          <span>Upload Another</span>
          <input 
            id="pdf-upload" 
            type="file" 
            accept=".pdf" 
            className="hidden" 
            onChange={(e) => handleUpload(e.target.files[0])}
          />
        </button>
      )}

      <main className="flex-1 p-6 h-[calc(100vh-80px)] overflow-hidden">
        <AnimatePresence mode="wait">
          {activeDoc ? (
            <motion.div 
              key={activeDoc.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.98 }}
              className="flex h-full w-full"
            >
              <div className="flex-1">
                <PDFViewer 
                  fileUrl={`${supabase.storage.from('documents').getPublicUrl(activeDoc.storage_path).data.publicUrl}`} 
                  fileName={activeDoc.file_name}
                />
              </div>
              <AIChat activeDocumentId={activeDoc.id} />
            </motion.div>
          ) : (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="h-full flex flex-col items-center justify-center p-12 bg-white/[0.02] border border-dashed border-white/10 rounded-[3rem] space-y-10"
            >
              <div className="relative group">
                 <div className="absolute -inset-10 bg-white/5 blur-3xl rounded-full scale-0 group-hover:scale-100 transition-transform duration-1000 opacity-0 group-hover:opacity-100" />
                 <div className="w-32 h-32 rounded-[2.5rem] bg-gradient-to-tr from-white/10 to-white/5 border border-white/10 flex items-center justify-center shadow-2xl shadow-black relative rotate-3 group-hover:rotate-6 transition-all">
                    <FileUp size={48} strokeWidth={1} className="text-white/20 group-hover:text-white transition-all scale-75 group-hover:scale-110" />
                 </div>
              </div>
              <div className="text-center space-y-4 max-w-sm">
                 <h2 className="text-2xl font-black uppercase tracking-tighter italic">Ready to analyze?</h2>
                 <p className="text-[11px] font-medium leading-relaxed text-white/30 uppercase tracking-[0.2em]">
                   Upload your PDF to begin grounded AI analysis with visual highlights and page-level evidence.
                 </p>
              </div>
              <button 
                onClick={() => document.getElementById('pdf-upload-empty').click()}
                className="bg-white text-black px-12 py-5 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:scale-105 active:scale-95 transition-all shadow-2xl shadow-white/20"
              >
                 {isUploading ? 'Uploading...' : 'Get Started'}
                 <input 
                    id="pdf-upload-empty" 
                    type="file" 
                    accept=".pdf" 
                    className="hidden" 
                    onChange={(e) => handleUpload(e.target.files[0])}
                 />
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </main>
    </div>
  );
}

export default App;
