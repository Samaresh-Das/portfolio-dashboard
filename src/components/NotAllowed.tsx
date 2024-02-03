import React from "react";
import { Link } from "react-router-dom";
import Button from "./ui/Button";

const NotAllowed = () => {
  return (
    <section className=" dark:bg-gray-900 ">
      <div className="container flex items-center min-h-screen px-6 py-12 mx-auto">
        <div className="flex flex-col items-center max-w-sm mx-auto text-center">
          <p className="p-3 text-sm font-medium text-[#fb5607] rounded-full bg-[#f0e3a4] dark:bg-gray-800">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth="2"
              stroke="currentColor"
              className="w-6 h-6"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z"
              />
            </svg>
          </p>
          <h1 className="mt-3 text-2xl font-semibold text-[#fb5607] md:text-3xl">
            Not Authorized
          </h1>
          <p className="mt-4 text-[#c9812f]">
            You're not authorized to access this page. You need administrator
            Privileges
          </p>

          <div className="flex items-center w-full mt-6 gap-x-3 shrink-0 sm:w-auto">
            <Link to="/">
              <Button className="tracking-wide transition-colors duration-200 rounded-lg shrink-0 sm:w-auto ">
                Take me home
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
};

export default NotAllowed;
