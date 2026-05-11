import { useState } from "react";
import { useSelector } from "react-redux";
import { getDatabase, ref, update, remove, get } from "firebase/database";
import { app } from "@/firebase";
import { RootState } from "@/store/store";
import useData from "@/hooks/useData";
import Modal from "../ui/Modal";
import Button from "../ui/Button";
import RichTextEditor from "../ui/RichTextEditor";
import TechStackInput from "../ui/TechStackInput";
import MultiImageInput from "../ui/MultiImageInput";
import { truncateDescription } from "@/functions/truncate";
import { motion, AnimatePresence } from "framer-motion";

/**
 * PROJECT DATA SHAPE
 * Includes all new fields: images array, richDescription, techStack, video.
 * Fields like 'image' remain for backward compatibility with existing data.
 */
interface ProjectItem {
  id?: number;
  title: string;
  description: string;
  image: string;
  images?: string[];
  richDescription?: string;
  techStack?: string[];
  video?: string;
  live?: string;
  code?: string;
}

const ManageProjects = () => {
  const db = getDatabase(app);
  const userId = useSelector((state: RootState) => state.auth.userId);
  const { data, loading } = useData("/projects");

  const [editItem, setEditItem] = useState<ProjectItem | null>(null);
  const [editKey, setEditKey] = useState<string>("");
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Standard fields
  const [editTitle, setEditTitle] = useState("");
  const [editDescription, setEditDescription] = useState("");
  const [editLive, setEditLive] = useState("");
  const [editCode, setEditCode] = useState("");

  // New rich content fields
  const [editImages, setEditImages] = useState<string[]>([""]);
  const [editRichDescription, setEditRichDescription] = useState("");
  const [editTechStack, setEditTechStack] = useState<string[]>([]);
  const [editVideo, setEditVideo] = useState("");

  const [actionStatus, setActionStatus] = useState<{ type: "success" | "error"; message: string } | null>(null);
  const [deletingKey, setDeletingKey] = useState<string | null>(null);

  // Confirmation state
  const [itemToDelete, setItemToDelete] = useState<{ key: string; title: string } | null>(null);
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);

  // Parse items from data
  const itemEntries: [string, ProjectItem][] = data
    ? Object.entries(data)
        .filter(([key]) => key !== "metadata")
        .map(([key, value]) => [key, value as ProjectItem])
    : [];

  const showStatus = (type: "success" | "error", message: string) => {
    setActionStatus({ type, message });
    setTimeout(() => setActionStatus(null), 3000);
  };

  /**
   * OPEN EDIT MODAL
   * Pre-fills all fields from the existing project data.
   * For backward compatibility, if 'images' array doesn't exist,
   * falls back to a single-element array from the 'image' field.
   */
  const openEditModal = (key: string, item: ProjectItem) => {
    setEditItem(item);
    setEditKey(key);
    setEditTitle(item.title || "");
    setEditDescription(item.description || "");
    setEditLive(item.live || "");
    setEditCode(item.code || "");

    // New fields — fallback to empty/default if not present in older data
    setEditImages(item.images?.length ? [...item.images] : [item.image || ""]);
    setEditRichDescription(item.richDescription || "");
    setEditTechStack(item.techStack ? [...item.techStack] : []);
    setEditVideo(item.video || "");

    setIsModalOpen(true);
  };

  /**
   * HANDLE UPDATE LOGIC
   * Merges all fields (old + new) into the project object.
   * 'image' field is kept as images[0] for backward compatibility.
   */
  const handleUpdate = async () => {
    if (!editItem || !editTitle.trim() || !editDescription.trim()) return;
    try {
      if (userId !== import.meta.env.VITE_APP_OWNER_ID) {
        throw new Error("Not Authorized");
      }

      const updatedData: ProjectItem = {
        ...editItem,
        title: editTitle,
        description: editDescription,
        image: editImages[0] || "",
        images: editImages.filter(Boolean),
        richDescription: editRichDescription,
        techStack: editTechStack,
        video: editVideo || "",
        live: editLive || "",
        code: editCode || "",
      };

      const updates: Record<string, any> = {};
      updates[`/projects/${editKey}`] = updatedData;
      await update(ref(db), updates);

      setIsModalOpen(false);
      setEditItem(null);
      showStatus("success", "Project updated successfully!");
    } catch (error) {
      console.error(error);
      showStatus("error", "Failed to update project.");
    }
  };

  /**
   * TRIGGER DELETE CONFIRMATION
   */
  const confirmDelete = (key: string, title: string) => {
    setItemToDelete({ key, title });
    setIsConfirmOpen(true);
  };

  /**
   * HANDLE DELETE & RE-INDEX LOGIC
   * Deletes the item, then reconstructs the collection starting from index 1.
   */
  const handleDelete = async () => {
    if (!itemToDelete) return;
    try {
      if (userId !== import.meta.env.VITE_APP_OWNER_ID) {
        throw new Error("Not Authorized");
      }

      setDeletingKey(itemToDelete.key);
      setIsConfirmOpen(false);

      await remove(ref(db, `/projects/${itemToDelete.key}`));

      const snapshot = await get(ref(db, "/projects"));
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
      await set(ref(db, "/projects"), rebuilt);

      setDeletingKey(null);
      setItemToDelete(null);
      showStatus("success", "Project deleted successfully!");
    } catch (error) {
      console.error(error);
      setDeletingKey(null);
      setItemToDelete(null);
      showStatus("error", "Failed to delete project.");
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
              background: "linear-gradient(135deg, rgba(251,86,7,0.2), rgba(255,159,28,0.1))",
              border: "1px solid rgba(251,86,7,0.3)",
            }}
          >
            ⚙
          </div>
          <div>
            <h2 className="font-orbitron font-bold text-sm text-gradient">MANAGE PROJECTS</h2>
            <p className="font-grotesk text-xs" style={{ color: "rgba(240,227,164,0.4)" }}>
              Update or delete existing projects
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
              No projects added yet
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
                  <div className="flex items-center gap-4">
                    {/* Thumbnail */}
                    <div
                      className="shrink-0 w-14 h-14 rounded-xl overflow-hidden"
                      style={{ border: "1px solid rgba(251,86,7,0.2)" }}
                    >
                      <img
                        className="w-full h-full object-cover"
                        src={item.image}
                        alt={item.title}
                      />
                    </div>

                    {/* Text */}
                    <div className="flex-1 min-w-0">
                      <h5 className="font-orbitron font-bold text-sm truncate" style={{ color: "#fb5607" }}>
                        {item.title}
                      </h5>
                      <p className="font-grotesk text-xs leading-relaxed" style={{ color: "rgba(240,227,164,0.5)" }}>
                        {truncateDescription(item.description, 60)}
                      </p>
                      {/* Tech stack pills preview */}
                      {item.techStack && item.techStack.length > 0 && (
                        <div className="flex flex-wrap gap-1 mt-1.5">
                          {item.techStack.slice(0, 4).map((tech, i) => (
                            <span
                              key={i}
                              className="font-grotesk text-[10px] px-1.5 py-0.5 rounded"
                              style={{
                                background: "rgba(251,86,7,0.1)",
                                color: "rgba(251,86,7,0.7)",
                                border: "1px solid rgba(251,86,7,0.15)",
                              }}
                            >
                              {tech}
                            </span>
                          ))}
                          {item.techStack.length > 4 && (
                            <span
                              className="font-grotesk text-[10px] px-1.5 py-0.5 rounded"
                              style={{ color: "rgba(240,227,164,0.4)" }}
                            >
                              +{item.techStack.length - 4}
                            </span>
                          )}
                        </div>
                      )}
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
                        onClick={() => confirmDelete(key, item.title)}
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

      {/* ═══ Edit Modal ═══ */}
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="UPDATE PROJECT">
        <div className="space-y-4">
          {/* Title */}
          <div>
            <label className="clay-label">Project Title</label>
            <input
              type="text"
              value={editTitle}
              onChange={(e) => setEditTitle(e.target.value)}
              className="clay-input"
              placeholder="e.g. Portfolio Website"
            />
          </div>

          {/* Short Description */}
          <div>
            <label className="clay-label">Short Description</label>
            <textarea
              rows={3}
              value={editDescription}
              onChange={(e) => setEditDescription(e.target.value)}
              className="clay-input resize-none"
              placeholder="Brief one-liner about the project..."
            />
          </div>

          {/* Rich Text Editor */}
          <div>
            <label className="clay-label">Detailed Description (Rich Text)</label>
            <RichTextEditor
              value={editRichDescription}
              onChange={setEditRichDescription}
              placeholder="Write a detailed project description..."
            />
          </div>

          {/* Media divider */}
          <div className="flex items-center gap-3 pt-1">
            <span className="font-orbitron text-[9px] tracking-widest" style={{ color: "rgba(251,86,7,0.5)" }}>
              MEDIA
            </span>
            <div className="flex-1 h-px" style={{ background: "rgba(251,86,7,0.15)" }} />
          </div>

          {/* Multi Image URLs */}
          <div>
            <label className="clay-label">Image URLs (up to 4)</label>
            <MultiImageInput images={editImages} onChange={setEditImages} />
          </div>

          {/* Video Link */}
          <div>
            <label className="clay-label">Video Link (optional)</label>
            <input
              type="text"
              value={editVideo}
              onChange={(e) => setEditVideo(e.target.value)}
              className="clay-input"
              placeholder="https://youtube.com/... or direct video URL"
            />
          </div>

          {/* Tech Stack divider */}
          <div className="flex items-center gap-3 pt-1">
            <span className="font-orbitron text-[9px] tracking-widest" style={{ color: "rgba(251,86,7,0.5)" }}>
              TECH STACK
            </span>
            <div className="flex-1 h-px" style={{ background: "rgba(251,86,7,0.15)" }} />
          </div>

          {/* Tech Stack Pills */}
          <div>
            <label className="clay-label">Technologies Used</label>
            <TechStackInput
              value={editTechStack}
              onChange={setEditTechStack}
              placeholder="Type a tech and press Enter..."
            />
          </div>

          {/* Links divider */}
          <div className="flex items-center gap-3 pt-1">
            <span className="font-orbitron text-[9px] tracking-widest" style={{ color: "rgba(251,86,7,0.5)" }}>
              OPTIONAL LINKS
            </span>
            <div className="flex-1 h-px" style={{ background: "rgba(251,86,7,0.15)" }} />
          </div>

          <div>
            <label className="clay-label">Live URL (optional)</label>
            <input
              type="text"
              value={editLive}
              onChange={(e) => setEditLive(e.target.value)}
              className="clay-input"
              placeholder="https://..."
            />
          </div>
          <div>
            <label className="clay-label">Code / GitHub URL (optional)</label>
            <input
              type="text"
              value={editCode}
              onChange={(e) => setEditCode(e.target.value)}
              className="clay-input"
              placeholder="https://github.com/..."
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
              <h3 className="font-orbitron font-bold text-sm text-gradient-error mb-2 uppercase tracking-wider">Delete project?</h3>
              <p className="font-grotesk text-xs leading-relaxed" style={{ color: "rgba(240,227,164,0.6)" }}>
                You are about to delete <span style={{ color: "#fb5607", fontWeight: 600 }}>"{itemToDelete?.title}"</span>. 
                This will permanently remove the project and all its associated rich content from your portfolio.
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

export default ManageProjects;
