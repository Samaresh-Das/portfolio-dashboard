import { useState } from "react";
import { useSelector } from "react-redux";
import { getDatabase, ref, update, remove, get } from "firebase/database";
import { app } from "@/firebase";
import { RootState } from "@/store/store";
import { GdriveUrlConverter } from "@/functions/GdriveUrlConverter";
import useData from "@/hooks/useData";
import Modal from "../ui/Modal";
import Button from "../ui/Button";
import { motion, AnimatePresence } from "framer-motion";

interface SkillItem {
  id: number;
  text: string;
  logo: string;
}

const ManageSkills = () => {
  /**
   * 1. FIREBASE & REDUX CONTEXT
   * - db: Firebase Realtime Database instance.
   * - userId: Current user's ID from Redux store (src/store/authSlice.ts).
   *   Used for authorization checks before any write operation.
   */
  const db = getDatabase(app);
  const userId = useSelector((state: RootState) => state.auth.userId);

  /**
   * 2. DATA FETCHING (src/hooks/useData.ts)
   * - Custom hook that listens to a Firebase path and returns real-time data.
   * - url: "/skills" -> Fetches all skills and metadata from the database.
   */
  const { data, loading } = useData("/skills");

  /**
   * 3. COMPONENT STATE
   * - editItem: Holds the skill currently being updated in the modal.
   * - isModalOpen: Controls visibility of the src/components/ui/Modal.tsx.
   * - actionStatus: Manages UI feedback for success/error messages.
   * - deletingId: Tracks which item is currently being removed to show loading state.
   */
  const [editItem, setEditItem] = useState<SkillItem | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editText, setEditText] = useState("");
  const [editLogo, setEditLogo] = useState("");
  const [actionStatus, setActionStatus] = useState<{ type: "success" | "error"; message: string } | null>(null);
  const [deletingId, setDeletingId] = useState<number | null>(null);
  
  // Confirmation state
  const [itemToDelete, setItemToDelete] = useState<SkillItem | null>(null);
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);

  /**
   * 4. DATA PARSING
   * Firebase returns an object. We convert it to an array for easy mapping, 
   * while filtering out the "metadata" key which isn't a skill item.
   */
  const items: SkillItem[] = data
    ? Object.entries(data)
        .filter(([key]) => key !== "metadata")
        .map(([, value]: [string, any]) => value as SkillItem)
    : [];

  const showStatus = (type: "success" | "error", message: string) => {
    setActionStatus({ type, message });
    setTimeout(() => setActionStatus(null), 3000);
  };

  const openEditModal = (item: SkillItem) => {
    setEditItem(item);
    setEditText(item.text);
    setEditLogo(item.logo);
    setIsModalOpen(true);
  };

  /**
   * HANDLE UPDATE LOGIC
   * 1. Converts GDrive link using src/functions/GdriveUrlConverter.ts.
   * 2. Performs atomic update on specific fields (text, logo).
   * 3. Closes modal and provides feedback.
   */
  const handleUpdate = async () => {
    if (!editItem || !editText.trim() || !editLogo.trim()) return;
    try {
      if (userId !== import.meta.env.VITE_APP_OWNER_ID) {
        throw new Error("Not Authorized");
      }

      const gdriveImageUrl = GdriveUrlConverter(editLogo);
      const updates: Record<string, any> = {};
      updates[`/skills/${editItem.id}/text`] = editText;
      updates[`/skills/${editItem.id}/logo`] = gdriveImageUrl;
      await update(ref(db), updates);

      setIsModalOpen(false);
      setEditItem(null);
      showStatus("success", "Skill updated successfully!");
    } catch (error) {
      console.error(error);
      showStatus("error", "Failed to update skill.");
    }
  };

  /**
   * TRIGGER DELETE CONFIRMATION
   */
  const confirmDelete = (item: SkillItem) => {
    setItemToDelete(item);
    setIsConfirmOpen(true);
  };

  /**
   * HANDLE DELETE & RE-INDEX LOGIC (CRITICAL)
   * Firebase Realtime DB uses keys (1, 2, 3...). If we delete "2", we need to shift 
   * "3" to "2" to maintain a continuous array structure for the portfolio website.
   */
  const handleDelete = async () => {
    if (!itemToDelete) return;
    try {
      if (userId !== import.meta.env.VITE_APP_OWNER_ID) {
        throw new Error("Not Authorized");
      }

      setDeletingId(itemToDelete.id);
      setIsConfirmOpen(false); // Close confirmation immediately

      // 1. Remove the target entry
      await remove(ref(db, `/skills/${itemToDelete.id}`));

      // 2. Fetch current state to rebuild the array
      const snapshot = await get(ref(db, "/skills"));
      const currentData = snapshot.val();
      const metadata = currentData?.metadata;

      // 3. Filter out non-item keys and collect remaining skills
      const remaining: any[] = [];
      Object.entries(currentData || {}).forEach(([key, value]) => {
        if (key !== "metadata") {
          remaining.push(value);
        }
      });

      // 4. Re-assign continuous IDs (1, 2, 3...) to the remaining items
      const rebuilt: Record<string, any> = { metadata: { ...metadata, maxLength: remaining.length } };
      remaining.forEach((item, index) => {
        const key = index + 1;
        rebuilt[key] = { ...item, id: key };
      });

      // 5. Overwrite the entire /skills node with the rebuilt continuous data
      const { set } = await import("firebase/database");
      await set(ref(db, "/skills"), rebuilt);

      setDeletingId(null);
      setItemToDelete(null);
      showStatus("success", "Skill deleted successfully!");
    } catch (error) {
      console.error(error);
      setDeletingId(null);
      setItemToDelete(null);
      showStatus("error", "Failed to delete skill.");
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
              background: "linear-gradient(135deg, rgba(240,227,164,0.15), rgba(251,86,7,0.1))",
              border: "1px solid rgba(240,227,164,0.2)",
            }}
          >
            ⚙
          </div>
          <div>
            <h2 className="font-orbitron font-bold text-sm text-gradient">MANAGE SKILLS</h2>
            <p className="font-grotesk text-xs" style={{ color: "rgba(240,227,164,0.4)" }}>
              Update or delete existing skills
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
        ) : items.length === 0 ? (
          <div className="text-center py-12">
            <p className="font-grotesk text-sm" style={{ color: "rgba(240,227,164,0.4)" }}>
              No skills added yet
            </p>
          </div>
        ) : (
          <div className="space-y-2 max-h-[60vh] overflow-y-auto pr-1">
            <AnimatePresence>
              {items.map((item, index) => (
                <motion.div
                  key={item.id}
                  layout
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20, height: 0, marginBottom: 0 }}
                  transition={{ delay: index * 0.03, duration: 0.3 }}
                  className="manage-item flex items-center gap-4 p-4 rounded-xl"
                  style={{
                    background: "linear-gradient(135deg, rgba(251,86,7,0.07) 0%, rgba(255,159,28,0.03) 100%)",
                    border: "1px solid rgba(251,86,7,0.18)",
                  }}
                >
                  {/* Skill icon */}
                  <div
                    className="shrink-0 w-10 h-10 rounded-xl overflow-hidden flex items-center justify-center"
                    style={{
                      background: "rgba(255,255,255,0.05)",
                      border: "1px solid rgba(251,86,7,0.15)",
                    }}
                  >
                    <img className="w-7 h-7 object-contain" src={item.logo} alt={item.text} />
                  </div>

                  {/* Skill name */}
                  <h5 className="font-orbitron font-bold text-sm flex-1" style={{ color: "#fb5607" }}>
                    {item.text}
                  </h5>

                  {/* Action buttons */}
                  <div className="flex items-center gap-2 shrink-0">
                    <motion.button
                      whileHover={{ scale: 1.08 }}
                      whileTap={{ scale: 0.92 }}
                      onClick={() => openEditModal(item)}
                      className="manage-btn manage-btn-edit"
                      title="Edit"
                    >
                      <span className="font-orbitron text-[9px] tracking-wider">UPDATE</span>
                    </motion.button>
                    <motion.button
                      whileHover={{ scale: 1.08 }}
                      whileTap={{ scale: 0.92 }}
                      onClick={() => confirmDelete(item)}
                      disabled={deletingId === item.id}
                      className="manage-btn manage-btn-delete"
                      title="Delete"
                    >
                      <span className="font-orbitron text-[9px] tracking-wider">
                        {deletingId === item.id ? "..." : "DELETE"}
                      </span>
                    </motion.button>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}
      </div>

      {/* Edit Modal */}
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="UPDATE SKILL">
        <div className="space-y-4">
          <div>
            <label className="clay-label">Logo URL</label>
            <input
              type="text"
              value={editLogo}
              onChange={(e) => setEditLogo(e.target.value)}
              className="clay-input"
              placeholder="Google Drive share link or direct image URL"
            />
            <p className="mt-1.5 font-grotesk text-xs" style={{ color: "rgba(240,227,164,0.3)" }}>
              Google Drive links are automatically converted
            </p>
          </div>
          <div>
            <label className="clay-label">Skill Name</label>
            <input
              type="text"
              value={editText}
              onChange={(e) => setEditText(e.target.value)}
              className="clay-input"
              placeholder="e.g. React, TypeScript, Node.js"
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
              <h3 className="font-orbitron font-bold text-sm text-gradient-error mb-2 uppercase tracking-wider">Are you absolutely sure?</h3>
              <p className="font-grotesk text-xs leading-relaxed" style={{ color: "rgba(240,227,164,0.6)" }}>
                You are about to delete <span style={{ color: "#fb5607", fontWeight: 600 }}>"{itemToDelete?.text}"</span>. 
                This action cannot be undone and will permanently remove this item from your portfolio.
              </p>
            </div>
          </div>

          <div className="flex gap-3 pt-2">
            <button
              onClick={() => setIsConfirmOpen(false)}
              className="flex-1 btn-clay btn-ghost flex items-center justify-center"
            >
              <span className="font-orbitron text-xs tracking-wider">GO BACK</span>
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

export default ManageSkills;
