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
import { motion } from "framer-motion";

type Inputs = {
  title: string;
  description: string;
  image: string;
  live: string;
  code: string;
};

const fieldConfig = [
  { name: "title" as const, label: "Project Title", type: "input", required: true, placeholder: "e.g. Portfolio Website" },
  { name: "description" as const, label: "Description", type: "textarea", required: true, placeholder: "Brief description of the project..." },
  { name: "image" as const, label: "Image URL", type: "input", required: true, placeholder: "https://..." },
];

const optionalFieldConfig = [
  { name: "live" as const, label: "Live URL (optional)", type: "input", required: false, placeholder: "https://..." },
  { name: "code" as const, label: "Code / GitHub URL (optional)", type: "input", required: false, placeholder: "https://github.com/..." },
];

const Projects = () => {
  const db = getDatabase(app);
  const userId = useSelector((state: RootState) => state.auth.userId);
  const [projectsLength, setProjectsLength] = useState(0);
  const [submitStatus, setSubmitStatus] = useState<"idle" | "success" | "error">("idle");

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
   * 2. Data Preparation: 'live' and 'code' links are optional, defaulted to empty strings.
   * 3. Sync: Real-time update to '/projects' node.
   * 4. UI: Clear fields using reset() and show confirmation.
   */
  const handleSubmission = async (data: Inputs) => {
    try {
      if (userId !== import.meta.env.VITE_APP_OWNER_ID) {
        throw new Error("Not Authorized, You need administrator access");
      }

      const { title, description, live, code, image } = data;
      const postData = { title, description, image, live: live || "", code: code || "" };
      const newPostKey = projectsLength + 1;
      const updates: Partial<Record<string, any>> = {};
      updates[`/projects/${newPostKey}`] = postData;
      updates["/projects/metadata/maxLength"] = newPostKey;
      await update(ref(db), updates);
      setSubmitStatus("success");
      
      // reset() is provided by react-hook-form to clear all input fields on success
      reset();
      
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
                handleSubmission(data);
              })}
              className="space-y-4"
            >
              {/* Required fields */}
              {fieldConfig.map((field) => (
                <div key={field.name}>
                  <label className="clay-label">{field.label}</label>
                  {field.type === "textarea" ? (
                    <textarea
                      rows={4}
                      placeholder={field.placeholder}
                      className="clay-input resize-none"
                      {...register(field.name, { required: field.required })}
                    />
                  ) : (
                    <input
                      type="text"
                      placeholder={field.placeholder}
                      className="clay-input"
                      {...register(field.name, { required: field.required })}
                    />
                  )}
                  {errors[field.name] && (
                    <p className="mt-1 font-grotesk text-xs" style={{ color: "#ef4444" }}>
                      This field is required
                    </p>
                  )}
                </div>
              ))}

              {/* Optional links divider */}
              <div className="flex items-center gap-3 pt-2">
                <span className="font-orbitron text-[9px] tracking-widest" style={{ color: "rgba(251,86,7,0.5)" }}>
                  OPTIONAL LINKS
                </span>
                <div className="flex-1 h-px" style={{ background: "rgba(251,86,7,0.15)" }} />
              </div>

              {/* Optional fields (live + code) */}
              {optionalFieldConfig.map((field) => (
                <div key={field.name}>
                  <label className="clay-label">{field.label}</label>
                  <input
                    type="text"
                    placeholder={field.placeholder}
                    className="clay-input"
                    {...register(field.name)}
                  />
                </div>
              ))}

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
