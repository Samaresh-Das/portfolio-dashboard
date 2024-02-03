import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import SignIn from "./components/Sign-In";
import NotAllowed from "./components/NotAllowed";
import PrivateRoute from "./components/PrivateRoute";
import Dashboard from "./components/Dashboard";

// const router = createBrowserRouter([
//   {
//     path: "/",
//     element: <SignIn />,
//   },
//   {
//     path: "/dashboard",
//     element: <PrivateRoute element={<Dashboard />} path="/dashboard" />,
//   },
//   {
//     path: "/not-authorized",
//     element: <NotAllowed />,
//   },
// ]);

function App() {
  return (
    <div>
      <Router>
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
          <Route path="/not-authorized" element={<NotAllowed />} />
        </Routes>
      </Router>
    </div>
  );
}

export default App;
