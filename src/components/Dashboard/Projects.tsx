import { useForm } from "react-hook-form";
import { getDatabase, ref, onValue, update } from "firebase/database";
import { app } from "@/firebase";
import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { RootState } from "@/store/store";
import DragNdrop from "../DragNdrop";
import Button from "../ui/Button";
import PageLayout from "../ui/PageLayout";
import ManageProjects from "./ManageProjects";
import RichTextEditor from "../ui/RichTextEditor";
import TechStackInput from "../ui/TechStackInput";
import MultiImageInput from "../ui/MultiImageInput";
import { motion } from "framer-motion";

/**
 * FORM INPUTS TYPE
 * - title, description: required text fields (registered with react-hook-form).
 * - live, code, video: optional URL fields.
 * - images, richDescription, techStack: managed via useState (not react-hook-form)
 *   because they use custom components that don't integrate with register().
 */
type Inputs = {
  title: string;
  description: string;
  live: string;
  code: string;
  video: string;
};

const Projects = () => {
  const db = getDatabase(app);
  const userId = useSelector((state: RootState) => state.auth.userId);
  const [projectsLength, setProjectsLength] = useState(0);
  const [submitStatus, setSubmitStatus] = useState<"idle" | "success" | "error">("idle");

  /**
   * STATE FOR CUSTOM COMPONENTS (not managed by react-hook-form)
   * - images: Array of up to 4 image URLs. Starts with 1 empty slot.
   * - richDescription: HTML string from the RichTextEditor.
   * - techStack: Array of tech stack tag strings.
   */
  const [images, setImages] = useState<string[]>([""]);
  const [richDescription, setRichDescription] = useState("");
  const [techStack, setTechStack] = useState<string[]>([]);

  useEffect(() => {
    const metaRef = ref(db, "projects/metadata");
    onValue(metaRef, (snapshot) => {
      const data = snapshot.val();
      setProjectsLength(data.maxLength);
    });
  }, []);

  /**
   * FORM SUBMISSION LOGIC
   * 1. Authorization: Verify admin access via Redux userId.
   * 2. Data Preparation: Collects react-hook-form data + custom state.
   *    - images[0] is used as the primary 'image' field for backward compatibility.
   *    - All image URLs stored as 'images' array.
   *    - richDescription stored separately from short 'description'.
   *    - techStack stored as string array.
   * 3. Sync: Real-time update to '/projects' node.
   * 4. UI: Clear all fields and show confirmation.
   */
  const handleSubmission = async (data: Inputs) => {
    try {
      if (userId !== import.meta.env.VITE_APP_OWNER_ID) {
        throw new Error("Not Authorized, You need administrator access");
      }

      const { title, description, live, code, video } = data;

      // Build the project data object
      const postData = {
        title,
        description,
        image: images[0] || "",              // Primary image for backward compat
        images: images.filter(Boolean),       // All non-empty image URLs
        richDescription: richDescription,     // HTML content from RTE
        techStack: techStack,                 // Array of tech tags
        video: video || "",                   // Optional video link
        live: live || "",
        code: code || "",
      };

      const newPostKey = projectsLength + 1;
      const updates: Partial<Record<string, any>> = {};
      updates[`/projects/${newPostKey}`] = postData;
      updates["/projects/metadata/maxLength"] = newPostKey;
      await update(ref(db), updates);
      setSubmitStatus("success");

      // Reset all fields — react-hook-form fields + custom state
      reset();
      setImages([""]);
      setRichDescription("");
      setTechStack([]);

      setTimeout(() => setSubmitStatus("idle"), 3000);
    } catch (error) {
      console.error(error);
      setSubmitStatus("error");
      setTimeout(() => setSubmitStatus("idle"), 3000);
    }
  };

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<Inputs>();

  return (
    <PageLayout title="Projects" icon="◈" tag="CONTENT">
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
        {/* ── Form Panel ── */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
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
                +
              </div>
              <div>
                <h2 className="font-orbitron font-bold text-sm text-gradient">ADD NEW PROJECT</h2>
                <p className="font-grotesk text-xs" style={{ color: "rgba(240,227,164,0.4)" }}>
                  Fill all fields and submit
                </p>
              </div>
            </div>

            {/* Status banner */}
            {submitStatus !== "idle" && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-4 px-4 py-3 rounded-xl font-grotesk text-sm"
                style={{
                  background: submitStatus === "success" ? "rgba(34,197,94,0.08)" : "rgba(239,68,68,0.08)",
                  border: `1px solid ${submitStatus === "success" ? "rgba(34,197,94,0.2)" : "rgba(239,68,68,0.2)"}`,
                  color: submitStatus === "success" ? "#22c55e" : "#ef4444",
                }}
              >
                {submitStatus === "success" ? "✓ Project added successfully!" : "✗ Required fields missing."}
              </motion.div>
            )}

            <form
              onSubmit={handleSubmit((data) => {
                // Validate that at least the primary image is provided
                if (!images[0]?.trim()) {
                  setSubmitStatus("error");
                  setTimeout(() => setSubmitStatus("idle"), 3000);
                  return;
                }
                handleSubmission(data);
              })}
              className="space-y-4"
            >
              {/* ── Project Title ── */}
              <div>
                <label className="clay-label">Project Title</label>
                <input
                  type="text"
                  placeholder="e.g. Portfolio Website"
                  className="clay-input"
                  {...register("title", { required: true })}
                />
                {errors.title && (
                  <p className="mt-1 font-grotesk text-xs" style={{ color: "#ef4444" }}>
                    This field is required
                  </p>
                )}
              </div>

              {/* ── Short Description ── */}
              <div>
                <label className="clay-label">Short Description</label>
                <textarea
                  rows={3}
                  placeholder="Brief one-liner about the project..."
                  className="clay-input resize-none"
                  {...register("description", { required: true })}
                />
                {errors.description && (
                  <p className="mt-1 font-grotesk text-xs" style={{ color: "#ef4444" }}>
                    This field is required
                  </p>
                )}
              </div>

              {/* ── Rich Text Editor for detailed description ── */}
              <div>
                <label className="clay-label">Detailed Description (Rich Text)</label>
                <RichTextEditor
                  value={richDescription}
                  onChange={setRichDescription}
                  placeholder="Write a detailed project description with formatting..."
                />
                <p className="mt-1.5 font-grotesk text-xs" style={{ color: "rgba(240,227,164,0.3)" }}>
                  Supports bold, italic, underline, lists, and headings
                </p>
              </div>

              {/* ── Image URLs divider ── */}
              <div className="flex items-center gap-3 pt-2">
                <span className="font-orbitron text-[9px] tracking-widest" style={{ color: "rgba(251,86,7,0.5)" }}>
                  MEDIA
                </span>
                <div className="flex-1 h-px" style={{ background: "rgba(251,86,7,0.15)" }} />
              </div>

              {/* ── Multi Image URLs ── */}
              <div>
                <label className="clay-label">Image URLs (up to 4)</label>
                <MultiImageInput images={images} onChange={setImages} />
              </div>

              {/* ── Video Link ── */}
              <div>
                <label className="clay-label">Video Link (optional)</label>
                <input
                  type="text"
                  placeholder="https://youtube.com/... or direct video URL"
                  className="clay-input"
                  {...register("video")}
                />
                <p className="mt-1.5 font-grotesk text-xs" style={{ color: "rgba(240,227,164,0.3)" }}>
                  YouTube, Vimeo, or direct video URL for project demo
                </p>
              </div>

              {/* ── Tech Stack divider ── */}
              <div className="flex items-center gap-3 pt-2">
                <span className="font-orbitron text-[9px] tracking-widest" style={{ color: "rgba(251,86,7,0.5)" }}>
                  TECH STACK
                </span>
                <div className="flex-1 h-px" style={{ background: "rgba(251,86,7,0.15)" }} />
              </div>

              {/* ── Tech Stack Pills ── */}
              <div>
                <label className="clay-label">Technologies Used</label>
                <TechStackInput
                  value={techStack}
                  onChange={setTechStack}
                  placeholder="Type a tech and press Enter..."
                />
              </div>

              {/* ── Optional Links divider ── */}
              <div className="flex items-center gap-3 pt-2">
                <span className="font-orbitron text-[9px] tracking-widest" style={{ color: "rgba(251,86,7,0.5)" }}>
                  OPTIONAL LINKS
                </span>
                <div className="flex-1 h-px" style={{ background: "rgba(251,86,7,0.15)" }} />
              </div>

              {/* ── Live URL ── */}
              <div>
                <label className="clay-label">Live URL (optional)</label>
                <input
                  type="text"
                  placeholder="https://..."
                  className="clay-input"
                  {...register("live")}
                />
              </div>

              {/* ── GitHub URL ── */}
              <div>
                <label className="clay-label">Code / GitHub URL (optional)</label>
                <input
                  type="text"
                  placeholder="https://github.com/..."
                  className="clay-input"
                  {...register("code")}
                />
              </div>

              <div className="pt-2">
                <Button type="submit" className="w-full">
                  <span className="font-orbitron text-xs tracking-wider">PUSH TO DATABASE</span>
                </Button>
              </div>
            </form>
          </div>
        </motion.div>

        {/* ── Drag & Drop Panel ── */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
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
                ⇅
              </div>
              <div>
                <h2 className="font-orbitron font-bold text-sm text-gradient">REORDER PROJECTS</h2>
                <p className="font-grotesk text-xs" style={{ color: "rgba(240,227,164,0.4)" }}>
                  Drag cards to change display order
                </p>
              </div>
            </div>

            <div className="max-h-[70vh] overflow-y-auto pr-1">
              <DragNdrop url="/projects" />
            </div>
          </div>
        </motion.div>
      </div>

      {/* ── Manage Section (below) ── */}
      <ManageProjects />
    </PageLayout>
  );
};

export default Projects;
