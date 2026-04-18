import { Link, useLocation, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "@/store/store";
import { getAuth, signOut } from "firebase/auth";
import { logOut } from "@/store/authSlice";
import { app } from "@/firebase";
import { motion } from "framer-motion";
import { useEffect, useRef, useState } from "react";
import { gsap } from "gsap";

const navItems = [
  { path: "/dashboard", label: "COMMAND", icon: "⬡" },
  { path: "/dashboard/projects", label: "PROJECTS", icon: "◈" },
  { path: "/dashboard/experience", label: "EXPERIENCE", icon: "◉" },
  { path: "/dashboard/skills", label: "SKILLS", icon: "◎" },
];

const Navbar = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { email, isAuthenticated } = useSelector((state: RootState) => state.auth);
  const auth = getAuth(app);
  const logoRef = useRef<HTMLDivElement>(null);
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    if (logoRef.current) {
      gsap.from(logoRef.current, {
        opacity: 0,
        x: -20,
        duration: 0.8,
        ease: "power3.out",
      });
    }
  }, []);

  const handleSignOut = () => {
    signOut(auth).then(() => {
      dispatch(logOut());
      navigate("/");
    });
  };

  return (
    <nav className="navbar">
      <div className="content-wrapper h-full flex items-center justify-between">
        {/* Logo */}
        <div ref={logoRef} className="flex items-center gap-3">
          <div className="relative">
            <div
              className="w-9 h-9 rounded-lg flex items-center justify-center"
              style={{
                background: "linear-gradient(135deg, #fb5607, #ff9f1c)",
                boxShadow: "0 0 16px rgba(251,86,7,0.5)",
              }}
            >
              <span className="font-orbitron font-black text-white text-sm">P</span>
            </div>
            <div
              className="absolute -inset-1 rounded-xl opacity-30 blur-sm"
              style={{ background: "linear-gradient(135deg, #fb5607, #ff9f1c)" }}
            />
          </div>
          <div>
            <div className="font-orbitron font-bold text-sm text-gradient">PORTFOLIO</div>
            <div className="font-orbitron text-[9px] tracking-wider" style={{ color: "rgba(251,86,7,0.6)" }}>
              COMMAND CENTER
            </div>
          </div>
        </div>

        {/* Nav links - only show when authenticated */}
        {isAuthenticated && (
          <div className="flex items-center gap-1">
            {navItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className={`nav-link ${location.pathname === item.path ? "active" : ""}`}
              >
                <span className="mr-1 opacity-60">{item.icon}</span>
                {item.label}
              </Link>
            ))}
          </div>
        )}

        {/* Right side */}
        <div className="flex items-center gap-4">
          {/* Clock */}
          <div className="hidden md:flex flex-col items-end">
            <div className="font-orbitron text-[11px] font-semibold" style={{ color: "rgba(251,86,7,0.8)" }}>
              {time.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" })}
            </div>
            <div className="font-orbitron text-[9px]" style={{ color: "rgba(240,227,164,0.4)" }}>
              {time.toLocaleDateString([], { day: "2-digit", month: "short", year: "numeric" }).toUpperCase()}
            </div>
          </div>

          {isAuthenticated && (
            <>
              {/* Status badge */}
              <div className="status-badge" style={{ background: "rgba(34,197,94,0.1)", color: "#22c55e", border: "1px solid rgba(34,197,94,0.2)" }}>
                <div className="status-dot" style={{ background: "#22c55e" }} />
                <span className="hidden sm:block">ACTIVE</span>
              </div>
              {/* Email */}
              <div className="hidden lg:block font-grotesk text-xs" style={{ color: "rgba(240,227,164,0.5)" }}>
                {email}
              </div>
              {/* Sign out */}
              <button
                onClick={handleSignOut}
                className="btn-clay btn-ghost text-xs px-3 py-1.5"
                style={{ fontFamily: "'Orbitron', monospace", fontSize: "10px", letterSpacing: "0.1em" }}
              >
                EXIT
              </button>
            </>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
