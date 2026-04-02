import { useState, useEffect, useCallback } from "react";
import Auth from './components/auth/Auth';
import LandingPage from './components/landing/LandingPage';
import { useAuth } from './hooks/useAuth';
import PDFViewer from "./components/pdf/PDFViewer";
import AIChat from "./components/chat/AIChat";
import DocumentList from "./components/dashboard/DocumentList";
import { getDocuments, uploadDocument, deleteDocument } from "./services/supabaseService";
import { processDocument } from "./api";
import { 
  FileUp, 
  Loader2,
  ArrowLeft,
  Plus,
  Database,
  LogOut
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { supabase } from "./lib/supabase";

function App() {
  const { user, loading: authLoading } = useAuth();
  const [showAuth, setShowAuth] = useState(false);
  const [activeDoc, setActiveDoc] = useState(null);
  const [documents, setDocuments] = useState([]);
  const [isUploading, setIsUploading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [currentDocPage, setCurrentDocPage] = useState(1);

  const fetchDocs = useCallback(async () => {
    if (!user?.id) return;
    try {
      if (documents.length === 0) setInitialLoading(true);
      const docs = await getDocuments(user.id);
      setDocuments(docs || []);
    } catch (err) {
      console.error("Error fetching docs:", err);
    } finally {
      setInitialLoading(false);
    }
  }, [user?.id, documents.length]);

  useEffect(() => {
    if (user?.id) {
      fetchDocs();
    } else if (!user) {
      setShowAuth(false);
      setActiveDoc(null);
      setDocuments([]);
    }
  }, [user?.id, fetchDocs]);

  useEffect(() => {
    if (!activeDoc) {
      setCurrentDocPage(1);
    }
  }, [activeDoc]);

  const handleUpload = async (file) => {
    if (!file || !user) return;
    try {
      setIsUploading(true);
      const newDoc = await uploadDocument(user.id, file);
      try {
        await processDocument(newDoc.storage_path, newDoc.id, user.id);
      } catch (err) {
        console.error("Backend indexing failed:", err);
      }
      await fetchDocs();
      setActiveDoc(newDoc);
    } catch (err) {
      console.error("Upload error:", err);
    } finally {
      setIsUploading(false);
    }
  };

  const handleDelete = async (doc) => {
    if (!window.confirm(`Delete "${doc.file_name}"?`)) return;
    try {
      await deleteDocument(doc.id, doc.storage_path);
      setDocuments(prev => prev.filter(d => d.id !== doc.id));
      if (activeDoc?.id === doc.id) setActiveDoc(null);
    } catch (err) {
      console.error("Delete error:", err);
    }
  };

  if (authLoading || (user && initialLoading && documents.length === 0)) {
    return (
      <div className="h-screen bg-surface-base flex items-center justify-center p-8 overflow-hidden">
         <div className="text-white/20 text-[10px] font-bold uppercase tracking-[0.4em] animate-pulse italic whitespace-nowrap">Loading documents...</div>
      </div>
    );
  }

  if (!user) {
    if (showAuth) {
      return (
        <div className="h-screen overflow-hidden relative">
          <button 
            onClick={() => setShowAuth(false)}
            className="fixed top-12 left-12 z-[60] text-white/20 hover:text-white transition-all text-[10px] font-bold uppercase tracking-[0.2em]"
          >
            ← Back
          </button>
          <Auth initialMode={showAuth === 'login'} />
        </div>
      );
    }
    return <LandingPage onAuthClick={(mode) => setShowAuth(mode)} />;
  }

  return (
    <div className="h-screen w-screen bg-surface-base text-white font-inter flex flex-col overflow-hidden selection:bg-white selection:text-black">
      {/* HEADER */}
      <header className="h-16 bg-surface-well px-12 flex items-center justify-between shrink-0 z-50">
         <div className="flex items-center space-x-3">
            <div className="w-5 h-5 bg-white flex items-center justify-center">
               <Database size={11} className="text-black" />
            </div>
            <h2 className="font-black uppercase tracking-tighter text-[16px] italic leading-none" onClick={() => setActiveDoc(null)} style={{cursor: 'pointer'}}>
               Askify<span className="text-white/10">PDF</span>
            </h2>
         </div>

         <div className="flex items-center space-x-10">
            <button 
               onClick={() => document.getElementById('monolith-upload').click()}
               disabled={isUploading}
               className="h-10 px-8 bg-white text-black hover:bg-neutral-200 transition-all text-[10px] font-bold uppercase tracking-[0.2em] flex items-center space-x-2.5 active:scale-95">
               {isUploading ? <Loader2 className="animate-spin" size={14} /> : <Plus size={14} />}
               <span>Add PDF</span>
               <input id="monolith-upload" type="file" accept=".pdf" className="hidden" onChange={(e) => handleUpload(e.target.files[0])} />
            </button>
            <button onClick={() => supabase.auth.signOut()} className="text-white/20 hover:text-white transition-colors" title="Sign Out">
               <LogOut size={16} />
            </button>
         </div>
      </header>

      {/* WORKSPACE */}
      <main className="flex-1 overflow-hidden">
        <AnimatePresence mode="wait">
          {activeDoc ? (
            <motion.div 
              key="document-focus" 
              initial={{ opacity: 0 }} 
              animate={{ opacity: 1 }} 
              exit={{ opacity: 0 }} 
              className="flex h-full w-full overflow-hidden"
            >
              <div className="flex-1 flex flex-col h-full bg-surface-base">
                {/* Close Bar */}
                <header className="h-10 flex items-center px-12 shrink-0 bg-surface-recessed/50 border-b border-white/5">
                  <div className="flex items-center space-x-3">
                    <FileUp size={11} className="text-white/20" />
                    <span className="font-bold text-[10px] uppercase tracking-[0.1em] truncate text-white/40">{activeDoc.file_name}</span>
                  </div>
                </header>
                
                <div className="flex-1 overflow-hidden">
                  <PDFViewer 
                    fileUrl={`${supabase.storage.from('documents').getPublicUrl(activeDoc.storage_path).data.publicUrl}`} 
                    fileName={activeDoc.file_name}
                    externalPage={currentDocPage}
                    onPageAction={setCurrentDocPage}
                  />
                </div>
              </div>
              <div className="w-[480px] h-full bg-surface-well border-l border-white/5">
                 <AIChat 
                    activeDocumentId={activeDoc.id} 
                    onPageJump={setCurrentDocPage}
                 />
              </div>
            </motion.div>
          ) : (
            <motion.div key="library-monolith" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex h-full flex-col overflow-hidden w-full px-12 pt-12">
              <div className="flex-1 overflow-hidden">
                 <DocumentList 
                   documents={documents} 
                   onDocClick={(doc) => setActiveDoc(doc)} 
                   onDelete={handleDelete}
                 />
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>
    </div>
  );
}

export default App;
