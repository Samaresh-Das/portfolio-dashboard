import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import SignIn from "./components/Sign-In";
import NotAllowed from "./components/NotAllowed";
import PrivateRoute from "./components/PrivateRoute";
import Dashboard from "./components/Dashboard";
import Projects from "./components/Dashboard/Projects";
import Experience from "./components/Dashboard/Experience";
import Skills from "./components/Dashboard/Skills";
import Navbar from "./components/ui/Navbar";
import GradientBackground from "./components/ui/GradientBackground";

function App() {
  return (
    <div style={{ minHeight: "100vh", backgroundColor: "#0d0c0a" }}>
      <Router>
        <GradientBackground />
        <Navbar />
        <Routes>
          <Route path="/" element={<SignIn />} />
          <Route
            path="/dashboard"
            element={
              <PrivateRoute>
                <Dashboard />
              </PrivateRoute>
            }
          />
          <Route
            path="/dashboard/projects"
            element={
              <PrivateRoute>
                <Projects />
              </PrivateRoute>
            }
          />
          <Route
            path="/dashboard/experience"
            element={
              <PrivateRoute>
                <Experience />
              </PrivateRoute>
            }
          />

          <Route
            path="/dashboard/skills"
            element={
              <PrivateRoute>
                <Skills />
              </PrivateRoute>
            }
          />
          <Route path="/not-authorized" element={<NotAllowed />} />
        </Routes>
      </Router>
    </div>
  );
}

export default App;
