import { useState } from "react";
import { useSelector } from "react-redux";
import { getDatabase, ref, update, remove, get } from "firebase/database";
import { app } from "@/firebase";
import { RootState } from "@/store/store";
import useData from "@/hooks/useData";
import Modal from "../ui/Modal";
import Button from "../ui/Button";
import { motion, AnimatePresence } from "framer-motion";

interface ExperienceItem {
  id?: number;
  jobTitle: string;
  companyName: string;
  responsibility: string[];
  timeLine: string;
  certificate?: string | null;
}

const ManageExperience = () => {
  const db = getDatabase(app);
  const userId = useSelector((state: RootState) => state.auth.userId);
  const { data, loading } = useData("/experience");

  const [editItem, setEditItem] = useState<ExperienceItem | null>(null);
  const [editKey, setEditKey] = useState<string>("");
  const [isModalOpen, setIsModalOpen] = useState(false);

  const [editJobTitle, setEditJobTitle] = useState("");
  const [editCompanyName, setEditCompanyName] = useState("");
  const [editTimeline, setEditTimeline] = useState("");
  const [editResp1, setEditResp1] = useState("");
  const [editResp2, setEditResp2] = useState("");
  const [editResp3, setEditResp3] = useState("");
  const [editCertificate, setEditCertificate] = useState("");

  const [actionStatus, setActionStatus] = useState<{ type: "success" | "error"; message: string } | null>(null);
  const [deletingKey, setDeletingKey] = useState<string | null>(null);

  // Confirmation state
  const [itemToDelete, setItemToDelete] = useState<{ key: string; name: string } | null>(null);
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);

  // Parse items from data
  const itemEntries: [string, ExperienceItem][] = data
    ? Object.entries(data)
        .filter(([key]) => key !== "metadata")
        .map(([key, value]) => [key, value as ExperienceItem])
    : [];

  const showStatus = (type: "success" | "error", message: string) => {
    setActionStatus({ type, message });
    setTimeout(() => setActionStatus(null), 3000);
  };

  const openEditModal = (key: string, item: ExperienceItem) => {
    setEditItem(item);
    setEditKey(key);
    setEditJobTitle(item.jobTitle || "");
    setEditCompanyName(item.companyName || "");
    setEditTimeline(item.timeLine || "");
    setEditResp1(item.responsibility?.[0] || "");
    setEditResp2(item.responsibility?.[1] || "");
    setEditResp3(item.responsibility?.[2] || "");
    setEditCertificate(item.certificate || "");
    setIsModalOpen(true);
  };

  /**
   * HANDLE UPDATE LOGIC
   * 1. Merges new field values into the experience object.
   * 2. Responsibility list is reconstructed from individual state variables.
   * 3. Certificate is kept as null if empty (optional field).
   */
  const handleUpdate = async () => {
    if (!editItem || !editJobTitle.trim() || !editCompanyName.trim() || !editTimeline.trim()) return;
    try {
      if (userId !== import.meta.env.VITE_APP_OWNER_ID) {
        throw new Error("Not Authorized");
      }

      const updatedData: ExperienceItem = {
        ...editItem,
        jobTitle: editJobTitle,
        companyName: editCompanyName,
        timeLine: editTimeline,
        responsibility: [editResp1, editResp2, editResp3].filter(Boolean),
        certificate: editCertificate || null,
      };

      const updates: Record<string, any> = {};
      updates[`/experience/${editKey}`] = updatedData;
      await update(ref(db), updates);

      setIsModalOpen(false);
      setEditItem(null);
      showStatus("success", "Experience updated successfully!");
    } catch (error) {
      console.error(error);
      showStatus("error", "Failed to update experience.");
    }
  };

  /**
   * TRIGGER DELETE CONFIRMATION
   */
  const confirmDelete = (key: string, name: string) => {
    setItemToDelete({ key, name });
    setIsConfirmOpen(true);
  };

  /**
   * HANDLE DELETE & RE-INDEX LOGIC
   * Same pattern as Skills: delete the item, fetch remaining, re-assign numeric keys (1, 2, 3...), 
   * and overwrite the node to maintain a clean sequence for the frontend.
   */
  const handleDelete = async () => {
    if (!itemToDelete) return;
    try {
      if (userId !== import.meta.env.VITE_APP_OWNER_ID) {
        throw new Error("Not Authorized");
      }

      setDeletingKey(itemToDelete.key);
      setIsConfirmOpen(false);

      await remove(ref(db, `/experience/${itemToDelete.key}`));

      // Re-index remaining items to prevent "holes" in the database sequence
      const snapshot = await get(ref(db, "/experience"));
      const currentData = snapshot.val();
      const metadata = currentData?.metadata;

      const remaining: any[] = [];
      Object.entries(currentData || {}).forEach(([k, value]) => {
        if (k !== "metadata") {
          remaining.push(value);
        }
      });

      const rebuilt: Record<string, any> = { metadata: { ...metadata, maxLength: remaining.length } };
      remaining.forEach((item, index) => {
        const numKey = index + 1;
        rebuilt[numKey] = { ...item, id: numKey };
      });

      const { set } = await import("firebase/database");
      await set(ref(db, "/experience"), rebuilt);

      setDeletingKey(null);
      setItemToDelete(null);
      showStatus("success", "Experience entry deleted!");
    } catch (error) {
      console.error(error);
      setDeletingKey(null);
      setItemToDelete(null);
      showStatus("error", "Failed to delete experience.");
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.3 }}
      className="mt-8"
    >
      <div className="clay-card p-6">
        {/* Panel header */}
        <div className="flex items-center gap-3 mb-6">
          <div
            className="w-8 h-8 rounded-lg flex items-center justify-center text-sm"
            style={{
              background: "linear-gradient(135deg, rgba(255,159,28,0.2), rgba(251,86,7,0.1))",
              border: "1px solid rgba(255,159,28,0.3)",
            }}
          >
            ⚙
          </div>
          <div>
            <h2 className="font-orbitron font-bold text-sm text-gradient">MANAGE EXPERIENCE</h2>
            <p className="font-grotesk text-xs" style={{ color: "rgba(240,227,164,0.4)" }}>
              Update or delete existing entries
            </p>
          </div>
        </div>

        {/* Status banner */}
        <AnimatePresence>
          {actionStatus && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="mb-4 px-4 py-3 rounded-xl font-grotesk text-sm"
              style={{
                background: actionStatus.type === "success" ? "rgba(34,197,94,0.08)" : "rgba(239,68,68,0.08)",
                border: `1px solid ${actionStatus.type === "success" ? "rgba(34,197,94,0.2)" : "rgba(239,68,68,0.2)"}`,
                color: actionStatus.type === "success" ? "#22c55e" : "#ef4444",
              }}
            >
              {actionStatus.type === "success" ? "✓" : "✗"} {actionStatus.message}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Items list */}
        {loading ? (
          <div className="flex items-center justify-center gap-2 py-12">
            <div className="loader-dot" />
            <div className="loader-dot" />
            <div className="loader-dot" />
          </div>
        ) : itemEntries.length === 0 ? (
          <div className="text-center py-12">
            <p className="font-grotesk text-sm" style={{ color: "rgba(240,227,164,0.4)" }}>
              No experience entries yet
            </p>
          </div>
        ) : (
          <div className="space-y-2 max-h-[60vh] overflow-y-auto pr-1">
            <AnimatePresence>
              {itemEntries.map(([key, item], index) => (
                <motion.div
                  key={key}
                  layout
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20, height: 0, marginBottom: 0 }}
                  transition={{ delay: index * 0.03, duration: 0.3 }}
                  className="manage-item p-4 rounded-xl"
                  style={{
                    background: "linear-gradient(135deg, rgba(251,86,7,0.07) 0%, rgba(255,159,28,0.03) 100%)",
                    border: "1px solid rgba(251,86,7,0.18)",
                  }}
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1 flex-wrap">
                        <h5 className="font-orbitron font-bold text-sm" style={{ color: "#fb5607" }}>
                          {item.companyName}
                        </h5>
                        <span
                          className="font-orbitron text-[8px] tracking-widest px-2 py-0.5 rounded shrink-0"
                          style={{
                            background: "rgba(255,159,28,0.1)",
                            color: "rgba(255,159,28,0.8)",
                            border: "1px solid rgba(255,159,28,0.2)",
                          }}
                        >
                          {item.timeLine}
                        </span>
                      </div>
                      <p className="font-grotesk text-xs" style={{ color: "rgba(240,227,164,0.6)" }}>
                        {item.jobTitle}
                      </p>
                    </div>

                    {/* Action buttons */}
                    <div className="flex items-center gap-2 shrink-0">
                      <motion.button
                        whileHover={{ scale: 1.08 }}
                        whileTap={{ scale: 0.92 }}
                        onClick={() => openEditModal(key, item)}
                        className="manage-btn manage-btn-edit"
                        title="Edit"
                      >
                        <span className="font-orbitron text-[9px] tracking-wider">UPDATE</span>
                      </motion.button>
                      <motion.button
                        whileHover={{ scale: 1.08 }}
                        whileTap={{ scale: 0.92 }}
                        onClick={() => confirmDelete(key, item.companyName)}
                        disabled={deletingKey === key}
                        className="manage-btn manage-btn-delete"
                        title="Delete"
                      >
                        <span className="font-orbitron text-[9px] tracking-wider">
                          {deletingKey === key ? "..." : "DELETE"}
                        </span>
                      </motion.button>
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}
      </div>

      {/* Edit Modal */}
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="UPDATE EXPERIENCE">
        <div className="space-y-4">
          <div>
            <label className="clay-label">Job Title</label>
            <input
              type="text"
              value={editJobTitle}
              onChange={(e) => setEditJobTitle(e.target.value)}
              className="clay-input"
              placeholder="e.g. Frontend Developer"
            />
          </div>
          <div>
            <label className="clay-label">Company Name</label>
            <input
              type="text"
              value={editCompanyName}
              onChange={(e) => setEditCompanyName(e.target.value)}
              className="clay-input"
              placeholder="e.g. Acme Corp"
            />
          </div>
          <div>
            <label className="clay-label">Timeline</label>
            <input
              type="text"
              value={editTimeline}
              onChange={(e) => setEditTimeline(e.target.value)}
              className="clay-input"
              placeholder="e.g. Jan 2023 – Present"
            />
          </div>

          {/* Responsibility divider */}
          <div className="flex items-center gap-3 pt-1">
            <span className="font-orbitron text-[9px] tracking-widest" style={{ color: "rgba(251,86,7,0.5)" }}>
              RESPONSIBILITIES
            </span>
            <div className="flex-1 h-px" style={{ background: "rgba(251,86,7,0.15)" }} />
          </div>

          <div>
            <label className="clay-label">Responsibility 1</label>
            <textarea
              rows={2}
              value={editResp1}
              onChange={(e) => setEditResp1(e.target.value)}
              className="clay-input resize-none"
              placeholder="Describe a key responsibility..."
            />
          </div>
          <div>
            <label className="clay-label">Responsibility 2</label>
            <textarea
              rows={2}
              value={editResp2}
              onChange={(e) => setEditResp2(e.target.value)}
              className="clay-input resize-none"
              placeholder="Describe a key responsibility..."
            />
          </div>
          <div>
            <label className="clay-label">Responsibility 3</label>
            <textarea
              rows={2}
              value={editResp3}
              onChange={(e) => setEditResp3(e.target.value)}
              className="clay-input resize-none"
              placeholder="Describe a key responsibility..."
            />
          </div>

          {/* Optional divider */}
          <div className="flex items-center gap-3 pt-1">
            <span className="font-orbitron text-[9px] tracking-widest" style={{ color: "rgba(251,86,7,0.5)" }}>
              OPTIONAL
            </span>
            <div className="flex-1 h-px" style={{ background: "rgba(251,86,7,0.08)" }} />
          </div>

          <div>
            <label className="clay-label">Certificate URL (optional)</label>
            <input
              type="text"
              value={editCertificate}
              onChange={(e) => setEditCertificate(e.target.value)}
              className="clay-input"
              placeholder="https://..."
            />
          </div>

          <div className="flex gap-3 pt-2">
            <button
              onClick={() => setIsModalOpen(false)}
              className="flex-1 btn-clay btn-ghost flex items-center justify-center"
            >
              <span className="font-orbitron text-xs tracking-wider">CANCEL</span>
            </button>
            <Button
              type="button"
              className="flex-1"
              onClick={handleUpdate}
            >
              <span className="font-orbitron text-xs tracking-wider">SAVE CHANGES</span>
            </Button>
          </div>
        </div>
      </Modal>
      {/* Delete Confirmation Modal */}
      <Modal isOpen={isConfirmOpen} onClose={() => setIsConfirmOpen(false)} title="CONFIRM DELETION">
        <div className="space-y-6 text-center py-2">
          <div className="flex flex-col items-center gap-4">
            <div 
              className="w-16 h-16 rounded-full flex items-center justify-center text-2xl"
              style={{
                background: "rgba(239,68,68,0.1)",
                border: "1px solid rgba(239,68,68,0.3)",
                color: "#ef4444"
              }}
            >
              ⚠
            </div>
            <div>
              <h3 className="font-orbitron font-bold text-sm text-gradient-error mb-2 uppercase tracking-wider">Remove experience?</h3>
              <p className="font-grotesk text-xs leading-relaxed" style={{ color: "rgba(240,227,164,0.6)" }}>
                You are about to delete the entry for <span style={{ color: "#fb5607", fontWeight: 600 }}>"{itemToDelete?.name}"</span>. 
                This will permanently remove it from your professional timeline.
              </p>
            </div>
          </div>

          <div className="flex gap-3 pt-2">
            <button
              onClick={() => setIsConfirmOpen(false)}
              className="flex-1 btn-clay btn-ghost flex items-center justify-center"
            >
              <span className="font-orbitron text-xs tracking-wider">CANCEL</span>
            </button>
            <button
              onClick={handleDelete}
              className="flex-1 rounded-xl flex items-center justify-center transition-all duration-200"
              style={{
                background: "linear-gradient(135deg, #ef4444, #dc2626)",
                border: "1px solid rgba(255,255,255,0.1)",
                color: "white",
                boxShadow: "0 4px 20px rgba(239,68,68,0.4)"
              }}
            >
              <span className="font-orbitron text-xs tracking-wider">CONFIRM DELETE</span>
            </button>
          </div>
        </div>
      </Modal>
    </motion.div>
  );
};

export default ManageExperience;
