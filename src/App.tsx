import { createBrowserRouter, RouterProvider } from "react-router-dom";
import SignIn from "./components/Sign-In";

const router = createBrowserRouter([
  {
    path: "/",
    element: <SignIn />,
  },
]);

function App() {
  return (
    <div>
      <RouterProvider router={router} />
    </div>
  );
}

export default App;
