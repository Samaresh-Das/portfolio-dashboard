import useData from "@/hooks/useData";
import { RootState } from "@/store/store";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { useSelector } from "react-redux";
import Button from "../ui/Button";
import DragNdrop from "../DragNdrop";
import { getDatabase, ref, update } from "firebase/database";
import { app } from "@/firebase";
import PageLayout from "../ui/PageLayout";
import ManageExperience from "./ManageExperience";
import { motion } from "framer-motion";

type Inputs = {
  certificate: string;
  companyName: string;
  jobTitle: string;
  responsibility1: string;
  responsibility2: string;
  responsibility3: string;
  timeline: string;
};

const Experience = () => {
  const db = getDatabase(app);
  const userId = useSelector((state: RootState) => state.auth.userId);
  const [experienceLength, setExperienceLength] = useState(0);
  const [submitStatus, setSubmitStatus] = useState<"idle" | "success" | "error">("idle");

  const { data, loading } = useData("experience/metadata");

  useEffect(() => {
    if (!loading && data) {
      setExperienceLength(data.maxLength);
    }
  }, [data, loading]);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<Inputs>();

  /**
   * FORM SUBMISSION LOGIC
   * 1. Authorization: Verify admin access via Redux userId.
   * 2. Data Structure: Responsibilities are collected from 3 fields into an array.
   * 3. Database Sync: Updates '/experience' and metadata.
   * 4. UI: reset() clears the long form for the next entry.
   */
  const handleSubmission = async (data: Inputs) => {
    console.log(data);
    try {
      if (userId !== import.meta.env.VITE_APP_OWNER_ID) {
        throw new Error("Not Authorized, You need administrator access");
      }
      const responsibilities = [
        data.responsibility1,
        data.responsibility2,
        data.responsibility3,
      ];

      const newExperience = {
        jobTitle: data.jobTitle,
        companyName: data.companyName,
        responsibility: responsibilities,
        timeLine: data.timeline,
        certificate: data.certificate || null,
      };
      console.log(newExperience);

      const newExperienceKey = experienceLength + 1;
      console.log(newExperienceKey);

      const updates: Partial<Record<string, any>> = {};
      updates[`/experience/${newExperienceKey}`] = newExperience;
      updates["/experience/metadata/maxLength"] = newExperienceKey;
      await update(ref(db), updates);
      setSubmitStatus("success");
      
      // reset() is provided by react-hook-form to clear all input fields on success
      reset();
      
      setTimeout(() => setSubmitStatus("idle"), 3000);
    } catch (err: any) {
      console.error(err);
      setSubmitStatus("error");
      setTimeout(() => setSubmitStatus("idle"), 3000);
    }
  };

  const inputClass = "clay-input";
  const labelClass = "clay-label";

  return (
    <PageLayout title="Experience" icon="◉" tag="CAREER">
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
                  background: "linear-gradient(135deg, rgba(255,159,28,0.2), rgba(251,86,7,0.1))",
                  border: "1px solid rgba(255,159,28,0.3)",
                }}
              >
                +
              </div>
              <div>
                <h2 className="font-orbitron font-bold text-sm text-gradient">ADD EXPERIENCE</h2>
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
                {submitStatus === "success" ? "✓ Experience entry added!" : "✗ Required fields missing."}
              </motion.div>
            )}

            <form
              onSubmit={handleSubmit((data) => {
                console.log(data);
                handleSubmission(data);
              })}
              className="space-y-4"
            >
              {/* Job Title */}
              <div>
                <label className={labelClass}>Job Title</label>
                <input
                  type="text"
                  placeholder="e.g. Frontend Developer"
                  className={inputClass}
                  {...register("jobTitle", { required: true })}
                />
                {errors.jobTitle && (
                  <p className="mt-1 font-grotesk text-xs" style={{ color: "#ef4444" }}>Required</p>
                )}
              </div>

              {/* Company Name */}
              <div>
                <label className={labelClass}>Company Name</label>
                <input
                  type="text"
                  placeholder="e.g. Acme Corp"
                  className={inputClass}
                  {...register("companyName", { required: true })}
                />
                {errors.companyName && (
                  <p className="mt-1 font-grotesk text-xs" style={{ color: "#ef4444" }}>Required</p>
                )}
              </div>

              {/* Timeline */}
              <div>
                <label className={labelClass}>Timeline</label>
                <input
                  type="text"
                  placeholder="e.g. Jan 2023 – Present"
                  className={inputClass}
                  {...register("timeline", { required: true })}
                />
                {errors.timeline && (
                  <p className="mt-1 font-grotesk text-xs" style={{ color: "#ef4444" }}>Required</p>
                )}
              </div>

              {/* Responsibility divider */}
              <div className="flex items-center gap-3 pt-2">
                <span className="font-orbitron text-[9px] tracking-widest" style={{ color: "rgba(251,86,7,0.5)" }}>
                  RESPONSIBILITIES
                </span>
                <div className="flex-1 h-px" style={{ background: "rgba(251,86,7,0.15)" }} />
              </div>

              {/* Responsibilities */}
              {[
                { field: "responsibility1" as const, label: "Responsibility 1" },
                { field: "responsibility2" as const, label: "Responsibility 2" },
                { field: "responsibility3" as const, label: "Responsibility 3" },
              ].map(({ field, label }) => (
                <div key={field}>
                  <label className={labelClass}>{label}</label>
                  <textarea
                    rows={2}
                    placeholder="Describe a key responsibility..."
                    className={`${inputClass} resize-none`}
                    {...register(field, { required: true })}
                  />
                  {errors[field] && (
                    <p className="mt-1 font-grotesk text-xs" style={{ color: "#ef4444" }}>Required</p>
                  )}
                </div>
              ))}

              {/* Certificate divider */}
              <div className="flex items-center gap-3 pt-2">
                <span className="font-orbitron text-[9px] tracking-widest" style={{ color: "rgba(251,86,7,0.5)" }}>
                  OPTIONAL
                </span>
                <div className="flex-1 h-px" style={{ background: "rgba(251,86,7,0.08)" }} />
              </div>

              {/* Certificate */}
              <div>
                <label className={labelClass}>Certificate URL (optional)</label>
                <input
                  type="text"
                  placeholder="https://..."
                  className={inputClass}
                  {...register("certificate")}
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
                  background: "linear-gradient(135deg, rgba(255,159,28,0.2), rgba(251,86,7,0.1))",
                  border: "1px solid rgba(255,159,28,0.3)",
                }}
              >
                ⇅
              </div>
              <div>
                <h2 className="font-orbitron font-bold text-sm text-gradient">REORDER EXPERIENCE</h2>
                <p className="font-grotesk text-xs" style={{ color: "rgba(240,227,164,0.4)" }}>
                  Drag cards to change display order
                </p>
              </div>
            </div>

            <div className="max-h-[70vh] overflow-y-auto pr-1">
              <DragNdrop url="/experience" />
            </div>
          </div>
        </motion.div>
      </div>

      {/* ── Manage Section (below) ── */}
      <ManageExperience />
    </PageLayout>
  );
};

export default Experience;
