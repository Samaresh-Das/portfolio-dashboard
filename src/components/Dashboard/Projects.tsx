import { useForm } from "react-hook-form";
import { getDatabase, ref, onValue, update } from "firebase/database";

import Button from "../ui/Button";
import { app } from "@/firebase";
import { useEffect, useState } from "react";
import Reorganize from "../ui/Reorganize";

type Inputs = {
  title: string;
  // id: number;
  description: string;
  image: "string";
  live: string;
  code: string;
};

const Projects = () => {
  const db = getDatabase(app);
  const [projectsLength, setProjectsLength] = useState(0);

  useEffect(() => {
    const starCountRef = ref(db, "projects/metadata");
    onValue(starCountRef, (snapshot) => {
      const data = snapshot.val();
      console.log(data);
      setProjectsLength(data.maxLength);
    });
  }, []);

  const handleSubmission = (data: Inputs) => {
    if (errors) return;

    const { title, description, live, code } = data;
    const db = getDatabase();

    const postData = {
      title,
      description,
      live,
      code,
    };

    const newPostKey = projectsLength + 1;
    console.log(newPostKey);
    const updates: Partial<Record<string, any>> = {};

    updates[`/projects/${newPostKey}`] = postData;
    updates["/projects/metadata/maxLength"] = newPostKey;

    return update(ref(db), updates);
  };

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<Inputs>();
  return (
    <div className="grid grid-cols-2">
      <div>
        <form
          className="w-full max-w-lg mx-auto mt-20"
          onSubmit={handleSubmit((data) => {
            handleSubmission(data);
          })}
        >
          {errors.title || errors.description || errors.code || errors.live ? (
            <p className="text-red-500 text-xs italic">
              All fields are necessary
            </p>
          ) : null}

          <div className=" -mx-3 mb-6 text-[#f0e3a4]">
            <div className="w-full px-3 mb-6 md:mb-0 ">
              <label
                className="block uppercase tracking-wide font-bold mb-2"
                htmlFor="grid-first-name"
              >
                Project Title
              </label>
              <input
                className="appearance-none block w-full bg-gray-200 text-gray-700 border border-red-500 rounded py-3 px-4 mb-3 leading-tight focus:outline-none focus:bg-white"
                id="grid-first-name"
                {...register("title", { required: true })}
              />
            </div>
          </div>
          <div className="flex flex-wrap -mx-3 mb-6 text-[#f0e3a4]">
            <div className="w-full px-3">
              <label
                className="block uppercase tracking-wide font-bold mb-2"
                htmlFor="grid-password"
              >
                Project Description
              </label>
              <textarea
                rows={12}
                className="appearance-none block w-full bg-gray-200 text-gray-700 border border-gray-200 rounded py-3 px-4 mb-3 leading-tight focus:outline-none focus:bg-white focus:border-gray-500"
                {...register("description", { required: true })}
              />
            </div>
          </div>
          <div className="flex flex-col flex-wrap -mx-3 mb-2 text-[#f0e3a4]">
            <div className="w-full  px-3 mb-6 md:mb-0">
              <label
                className="block uppercase tracking-wide font-bold mb-2"
                htmlFor="grid-city"
              >
                Image Link
              </label>
              <input
                className="appearance-none block w-full bg-gray-200 text-gray-700 border border-gray-200 rounded py-3 px-4 leading-tight focus:outline-none focus:bg-white focus:border-gray-500"
                {...register("image", { required: true })}
              />
            </div>
            <div className="w-full  px-3 mb-6 md:mb-0">
              <label
                className="block uppercase tracking-wide font-bold mb-2"
                htmlFor="grid-city"
              >
                Live
              </label>
              <input
                className="appearance-none block w-full bg-gray-200 text-gray-700 border border-gray-200 rounded py-3 px-4 leading-tight focus:outline-none focus:bg-white focus:border-gray-500"
                {...register("live", { required: true })}
              />
            </div>

            <div className="w-full  px-3 mb-6 md:mb-0">
              <label
                className="block uppercase tracking-wide font-bold mb-2"
                htmlFor="grid-zip"
              >
                Code
              </label>
              <input
                className="appearance-none block w-full bg-gray-200 text-gray-700 border border-gray-200 rounded py-3 px-4 leading-tight focus:outline-none focus:bg-white focus:border-gray-500"
                {...register("code", { required: true })}
              />
            </div>
          </div>

          <Button type="submit" className="w-[100px] my-5 text-center">
            Submit
          </Button>
        </form>
      </div>
      <Reorganize />
    </div>
  );
};

export default Projects;