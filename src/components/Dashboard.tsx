import { RootState } from "@/store/store";
import { useSelector } from "react-redux";
import { Link } from "react-router-dom";

const Dashboard = () => {
  const email = useSelector((state: RootState) => state.auth.email); //getting email
  return (
    <div>
      <h1 className="text-[#f0e3a4] text-center text-[20px] mb-6">
        OWNER - {email}
      </h1>
      <h1 className="text-[#fb5607] text-[30px] text-center mt-5 font-bold">
        <Link to="/">Home</Link>
      </h1>
      <h1 className="text-[#fb5607] text-[30px] text-center mt-5 font-bold">
        Dashboard
      </h1>

      <div className="mx-56">
        <h3 className="text-center text-[#f0e3a4] my-5 text-xl font-bold">
          Go to
        </h3>
        <div className="my-10 flex flex-row justify-center">
          <Link
            to="/dashboard/projects"
            className="text-[#fb5607] hover:text-[#f0e3a4] border border-[#fb5607] hover:border-[#f0e3a4] font-medium rounded-lg text-sm px-5 py-2.5 text-center me-2 mb-2 "
          >
            Projects
          </Link>
          <Link
            to="/dashboard/experience"
            className="text-[#fb5607] hover:text-[#f0e3a4] border border-[#fb5607] hover:border-[#f0e3a4] font-medium rounded-lg text-sm px-5 py-2.5 text-center me-2 mb-2 "
          >
            Experience
          </Link>

          <Link
            to="/dashboard/skills"
            className="text-[#fb5607] hover:text-[#f0e3a4] border border-[#fb5607] hover:border-[#f0e3a4] font-medium rounded-lg text-sm px-5 py-2.5 text-center me-2 mb-2 "
          >
            Skills
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
