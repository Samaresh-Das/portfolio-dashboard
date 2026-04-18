import { useForm } from "react-hook-form";
import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { getDatabase, ref, onValue, update } from "firebase/database";

import { app } from "@/firebase";
import { RootState } from "@/store/store";
import { GdriveUrlConverter } from "@/functions/GdriveUrlConverter";

import DragNdrop from "../DragNdrop";
import Button from "../ui/Button";
import PageLayout from "../ui/PageLayout";
import { motion } from "framer-motion";

type Inputs = {
  logo: string;
  text: string;
};

const Skills = () => {
  const db = getDatabase(app);
  const userId = useSelector((state: RootState) => state.auth.userId);
  const [skillsLength, setSkillsLength] = useState(0);
  const [submitStatus, setSubmitStatus] = useState<"idle" | "success" | "error">("idle");

  useEffect(() => {
    const metaRef = ref(db, "skills/metadata");
    onValue(metaRef, (snapshot) => {
      const data = snapshot.val();
      setSkillsLength(data.maxLength);
    });
  }, []);

  const handleSubmission = async (data: Inputs) => {
    try {
      if (userId !== import.meta.env.VITE_APP_OWNER_ID) {
        throw new Error("Not Authorized, You need administrator access");
      }

      const { text, logo } = data;
      const gdriveImageUrl = GdriveUrlConverter(logo);

      const newPostKey = skillsLength + 1;
      const postData = {
        id: newPostKey,
        text,
        logo: gdriveImageUrl,
      };
      console.log(postData);

      const updates: Partial<Record<string, any>> = {};
      updates[`/skills/${newPostKey}`] = postData;
      updates["/skills/metadata/maxLength"] = newPostKey;
      await update(ref(db), updates);
      setSubmitStatus("success");
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
    formState: { errors },
  } = useForm<Inputs>();

  return (
    <PageLayout title="Skills" icon="◎" tag="EXPERTISE">
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
                  background: "linear-gradient(135deg, rgba(240,227,164,0.15), rgba(251,86,7,0.1))",
                  border: "1px solid rgba(240,227,164,0.2)",
                }}
              >
                +
              </div>
              <div>
                <h2 className="font-orbitron font-bold text-sm text-gradient">ADD SKILL</h2>
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
                {submitStatus === "success" ? "✓ Skill added successfully!" : "✗ All fields are required."}
              </motion.div>
            )}

            <form
              onSubmit={handleSubmit((data) => {
                handleSubmission(data);
              })}
              className="space-y-4"
            >
              {/* Logo URL */}
              <div>
                <label className="clay-label">Logo URL</label>
                <input
                  type="text"
                  placeholder="Google Drive share link or direct image URL"
                  className="clay-input"
                  {...register("logo", { required: true })}
                />
                {errors.logo && (
                  <p className="mt-1 font-grotesk text-xs" style={{ color: "#ef4444" }}>Required</p>
                )}
                <p className="mt-1.5 font-grotesk text-xs" style={{ color: "rgba(240,227,164,0.3)" }}>
                  Google Drive links are automatically converted
                </p>
              </div>

              {/* Skill Name */}
              <div>
                <label className="clay-label">Skill Name</label>
                <input
                  type="text"
                  placeholder="e.g. React, TypeScript, Node.js"
                  className="clay-input"
                  {...register("text", { required: true })}
                />
                {errors.text && (
                  <p className="mt-1 font-grotesk text-xs" style={{ color: "#ef4444" }}>Required</p>
                )}
              </div>

              {/* Info box */}
              <div
                className="flex items-start gap-3 p-3 rounded-xl"
                style={{
                  background: "rgba(251,86,7,0.05)",
                  border: "1px solid rgba(251,86,7,0.1)",
                }}
              >
                <span className="text-sm mt-0.5" style={{ color: "rgba(251,86,7,0.5)" }}>ℹ</span>
                <p className="font-grotesk text-xs leading-relaxed" style={{ color: "rgba(240,227,164,0.4)" }}>
                  Skills are auto-numbered and assigned an ID. Use the drag panel to reorder them on your portfolio.
                </p>
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
                  background: "linear-gradient(135deg, rgba(240,227,164,0.15), rgba(251,86,7,0.1))",
                  border: "1px solid rgba(240,227,164,0.2)",
                }}
              >
                ⇅
              </div>
              <div>
                <h2 className="font-orbitron font-bold text-sm text-gradient">REORDER SKILLS</h2>
                <p className="font-grotesk text-xs" style={{ color: "rgba(240,227,164,0.4)" }}>
                  Drag cards to change display order
                </p>
              </div>
            </div>

            <div className="max-h-[70vh] overflow-y-auto pr-1">
              <DragNdrop url="/skills" />
            </div>
          </div>
        </motion.div>
      </div>
    </PageLayout>
  );
};

export default Skills;
