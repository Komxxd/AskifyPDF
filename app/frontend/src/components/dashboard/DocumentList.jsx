import { FileText, Trash2, MoreVertical } from "lucide-react";
import { motion } from "framer-motion";
import { formatDistanceToNow } from "date-fns";

const DocumentList = ({ documents, onDocClick, onDelete }) => {
  return (
    <div className="flex flex-col w-full h-full text-[12px] font-medium selection:bg-white selection:text-black">
      {/* NORMALIZED TABLE HEADER */}
      <div className="flex items-center px-12 py-4 bg-surface-well border-b border-white/5 text-white/40 font-bold uppercase tracking-[0.2em] text-[10px] sticky top-0 z-10 shrink-0">
        <div className="w-[70%]">Document Name</div>
        <div className="w-[20%] text-right font-black italic">Sync History</div>
        <div className="w-[10%] text-right">Delete</div>
      </div>

      {/* DOCUMENT LIST */}
      <div className="flex-1 overflow-y-auto">
        {documents.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-96 text-white/5 mt-10">
            <span className="uppercase tracking-[0.5em] text-[10px] font-bold">No documents uploaded</span>
          </div>
        ) : (
          documents.map((doc, index) => (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: index * 0.02 }}
              key={doc.id}
              onClick={() => onDocClick(doc)}
              className="flex items-center px-12 py-5 hover:bg-white/[0.03] transition-all cursor-pointer group group/item border-b border-white/[0.02]"
            >
              {/* Name Column */}
              <div className="w-[70%] flex items-center space-x-6 min-w-0">
                <div className="w-8 h-8 rounded-none bg-surface-well border border-white/[0.03] flex items-center justify-center shrink-0 group-hover:bg-white/[0.05] group-hover:border-white/10 transition-all">
                  <FileText size={14} className="text-white/40 group-hover:text-white transition-colors" />
                </div>
                <div className="flex flex-col min-w-0">
                  <span className="text-white font-bold truncate group-hover:text-white transition-colors tracking-tight text-[13px]">
                    {doc.file_name}
                  </span>
                  <div className="flex items-center space-x-2 mt-1">
                    <span className="text-[9px] text-white/10 uppercase tracking-widest font-bold leading-none">
                      PDF File
                    </span>
                  </div>
                </div>
              </div>

              {/* Added Column */}
              <div className="w-[20%] text-right opacity-30 group-hover:opacity-70 transition-opacity">
                 <span className="text-white text-[11px] font-bold">
                   {formatDistanceToNow(new Date(doc.created_at))} ago
                 </span>
              </div>

              {/* Delete Column - Perfectly Aligned */}
              <div className="w-[10%] flex justify-end">
                <button 
                  onClick={(e) => {
                    e.stopPropagation();
                    onDelete(doc);
                  }}
                  className="p-1 text-white/5 hover:text-red-400 transition-all active:scale-90 flex items-center justify-center w-full max-w-[40px] ml-auto"
                  title="Delete Document"
                >
                  <Trash2 size={13} />
                </button>
              </div>
            </motion.div>
          ))
        )}
      </div>
    </div>
  );
};

export default DocumentList;
