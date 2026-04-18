import { app } from "@/firebase";
import {
  getAuth,
  signInWithPopup,
  GoogleAuthProvider,
  signOut,
} from "firebase/auth";
import { useDispatch, useSelector } from "react-redux";
import { logOut, signInSuccess } from "@/store/authSlice";
import { RootState } from "@/store/store";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";

const SignIn = () => {
  const dispatch = useDispatch();
  const { isAuthenticated } = useSelector((state: RootState) => state.auth);
  const navigate = useNavigate();
  const provider = new GoogleAuthProvider();
  const auth = getAuth(app);

  const authHandler = () => {
    signInWithPopup(auth, provider)
      .then((result) => {
        const userData = result.user;
        dispatch(
          signInSuccess({
            userId: userData.uid,
            email: userData.email || "",
            imageUrl: userData.photoURL || "",
          })
        );
        navigate("/dashboard");
      })
      .catch((error: any) => {
        console.log(error);
      });
  };

  const signOutHandler = () => {
    signOut(auth)
      .then(() => {
        dispatch(logOut());
        navigate("/");
      })
      .catch((error: any) => {
        console.log(error);
      });
  };

  return (
    <div className="page-container flex items-center justify-center min-h-[90vh]">
      <motion.div 
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="w-full max-w-md px-6"
      >
        {/* Logo mark */}
        <motion.div
          initial={{ opacity: 0, scale: 0.5 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ type: "spring", stiffness: 200, damping: 20, delay: 0.2 }}
          className="flex justify-center mb-8"
        >
          <div className="relative">
            <div
              className="w-20 h-20 rounded-2xl flex items-center justify-center relative z-10"
              style={{
                background: "linear-gradient(135deg, rgba(251,86,7,0.2), rgba(255,159,28,0.1))",
                border: "1px solid rgba(251,86,7,0.4)",
                backdropFilter: "blur(20px)",
                boxShadow: "0 0 40px rgba(251,86,7,0.3), inset 0 1px 0 rgba(255,255,255,0.1)",
              }}
            >
              <span className="font-orbitron font-black text-3xl text-gradient">P</span>
            </div>
            {/* Glow rings */}
            <div
              className="absolute -inset-3 rounded-3xl opacity-40 animate-ping z-0"
              style={{
                background: "transparent",
                border: "1.5px solid rgba(251,86,7,0.6)",
                animationDuration: "3s",
              }}
            />
          </div>
        </motion.div>

        {/* Main card */}
        <div className="clay-card-strong p-8 relative overflow-visible z-20">
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="font-orbitron font-black text-2xl mb-2 text-gradient">
              ACCESS TERMINAL
            </h1>
            <p className="font-grotesk text-sm" style={{ color: "rgba(240,227,164,0.7)" }}>
              Restricted zone. Administrator credentials required.
            </p>
          </div>

          {/* Divider */}
          <div className="flex items-center gap-3 mb-6">
            <div className="flex-1 h-px" style={{ background: "linear-gradient(90deg, transparent, rgba(251,86,7,0.4))" }} />
            <span className="font-orbitron text-[9px] tracking-widest" style={{ color: "rgba(251,86,7,0.7)" }}>
              AUTHENTICATION
            </span>
            <div className="flex-1 h-px" style={{ background: "linear-gradient(270deg, transparent, rgba(251,86,7,0.4))" }} />
          </div>

          {/* Warning notice */}
          <div
            className="mb-8 p-4 rounded-xl flex items-start gap-3"
            style={{
              background: "rgba(251,86,7,0.08)",
              border: "1px solid rgba(251,86,7,0.2)",
            }}
          >
            <span className="text-lg mt-0.5 text-[#fb5607]">⚠</span>
            <p className="font-grotesk text-sm leading-relaxed" style={{ color: "rgba(240,227,164,0.7)" }}>
              This is a private admin dashboard. Only the registered administrator account can access this system.
            </p>
          </div>

          {/* Auth buttons */}
          {!isAuthenticated ? (
            <motion.button
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              onClick={authHandler}
              className="w-full relative group overflow-hidden flex items-center justify-center gap-3 py-4 px-6 rounded-xl font-grotesk font-bold text-base transition-all duration-300 shadow-xl"
              style={{
                background: "linear-gradient(135deg, #fb5607, #ff7730)",
                border: "1px solid rgba(255,255,255,0.2)",
                color: "white",
              }}
            >
              {/* Shine effect */}
              <div className="absolute inset-0 -translate-x-full group-hover:animate-[shimmer_1.5s_infinite] bg-gradient-to-r from-transparent via-white/20 to-transparent pointer-events-none" />
              
              {/* Google icon */}
              <svg className="w-5 h-5 opacity-90" viewBox="0 0 488 512" fill="currentColor">
                <path d="M488 261.8C488 403.3 391.1 504 248 504 110.8 504 0 393.2 0 256S110.8 8 248 8c66.8 0 123 24.5 166.3 64.9l-67.5 64.9C258.5 52.6 94.3 116.6 94.3 256c0 86.5 69.1 156.6 153.7 156.6 98.2 0 135-70.4 140.8-106.9H248v-85.3h236.1c2.3 12.7 3.9 24.9 3.9 41.4z" />
              </svg>
              <span>CONNECT SECURELY WITH GOOGLE</span>
            </motion.button>
          ) : (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex flex-col gap-3"
            >
              <Link
                to="/dashboard"
                className="w-full flex items-center justify-center gap-2 py-4 px-6 rounded-xl font-grotesk font-bold text-base transition-all duration-300"
                style={{
                  background: "linear-gradient(135deg, #fb5607, #ff7730)",
                  color: "white",
                  boxShadow: "0 4px 20px rgba(251,86,7,0.4)",
                  textDecoration: "none",
                }}
              >
                <span>→</span>
                Enter Command Center
              </Link>
              <button
                onClick={signOutHandler}
                className="w-full py-2.5 px-6 rounded-xl font-grotesk text-sm transition-all"
                style={{
                  background: "rgba(255,255,255,0.04)",
                  border: "1px solid rgba(255,255,255,0.08)",
                  color: "rgba(240,227,164,0.7)",
                }}
              >
                Sign Out / Disconnect
              </button>
            </motion.div>
          )}
        </div>

        {/* Footer */}
        <p
          className="text-center mt-8 font-orbitron text-[9px] tracking-widest"
          style={{ color: "rgba(251,86,7,0.4)" }}
        >
          ◈ PORTFOLIO COMMAND CENTER v2.0 ◈
        </p>
      </motion.div>
    </div>
  );
};

export default SignIn;
