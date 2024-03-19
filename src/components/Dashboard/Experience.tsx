import useData from "@/hooks/useData";
import { RootState } from "@/store/store";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { useSelector } from "react-redux";
import Button from "../ui/Button";
import DragNdrop from "../DragNdrop";
import { getDatabase, ref, update } from "firebase/database";
import { app } from "@/firebase";

type Inputs = {
  certificate: string;
  // id: number;
  companyName: string;
  jobTitle: string;
  responsibility1: string;
  responsibility2: string;
  responsibility3: string;
  timeline: string;
};

const Experience = () => {
  const db = getDatabase(app);
  const userId = useSelector((state: RootState) => state.auth.userId); //getting userID

  const [experienceLength, setExperienceLength] = useState(0);

  const { data, loading } = useData("experience/metadata");

  useEffect(() => {
    if (!loading && data) {
      setExperienceLength(data.maxLength);
    }
  }, [data, loading]);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<Inputs>();

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

      const newExperienceKey = experienceLength + 1; //increase the count as we're going to update the metadata
      console.log(newExperienceKey);

      const updates: Partial<Record<string, any>> = {};

      updates[`/experience/${newExperienceKey}`] = newExperience;
      updates["/experience/metadata/maxLength"] = newExperienceKey; //update metadata

      await update(ref(db), updates);
    } catch (err: any) {
      console.error(err);
    }
  };

  return (
    <div className="grid grid-cols-2">
      <div>
        <form
          className="w-full max-w-lg mx-auto mt-20"
          onSubmit={handleSubmit((data) => {
            console.log(data);
            handleSubmission(data);
          })}
        >
          {errors.jobTitle || errors.timeline || errors.companyName ? (
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
                Job Title
              </label>
              <input
                className="appearance-none block w-full bg-gray-200 text-gray-700 border border-red-500 rounded py-3 px-4 mb-3 leading-tight focus:outline-none focus:bg-white"
                id="grid-first-name"
                {...register("jobTitle", { required: true })}
              />
            </div>
          </div>
          <div className="flex flex-wrap -mx-3 mb-6 text-[#f0e3a4]">
            <div className="w-full px-3">
              <label
                className="block uppercase tracking-wide font-bold mb-2"
                htmlFor="grid-password"
              >
                Responsibility 1
              </label>
              <textarea
                className="appearance-none block w-full bg-gray-200 text-gray-700 border border-gray-200 rounded py-3 px-4 mb-3 leading-tight focus:outline-none focus:bg-white focus:border-gray-500"
                {...register("responsibility1", { required: true })}
              />
            </div>
          </div>
          <div className="flex flex-wrap -mx-3 mb-6 text-[#f0e3a4]">
            <div className="w-full px-3">
              <label
                className="block uppercase tracking-wide font-bold mb-2"
                htmlFor="grid-password"
              >
                Responsibility 2
              </label>
              <textarea
                className="appearance-none block w-full bg-gray-200 text-gray-700 border border-gray-200 rounded py-3 px-4 mb-3 leading-tight focus:outline-none focus:bg-white focus:border-gray-500"
                {...register("responsibility2", { required: true })}
              />
            </div>
          </div>
          <div className="flex flex-wrap -mx-3 mb-6 text-[#f0e3a4]">
            <div className="w-full px-3">
              <label
                className="block uppercase tracking-wide font-bold mb-2"
                htmlFor="grid-password"
              >
                Responsibility 3
              </label>
              <textarea
                className="appearance-none block w-full bg-gray-200 text-gray-700 border border-gray-200 rounded py-3 px-4 mb-3 leading-tight focus:outline-none focus:bg-white focus:border-gray-500"
                {...register("responsibility3", { required: true })}
              />
            </div>
          </div>
          <div className="flex flex-col flex-wrap -mx-3 mb-2 text-[#f0e3a4]">
            <div className="w-full  px-3 mb-6 md:mb-0">
              <label
                className="block uppercase tracking-wide font-bold mb-2"
                htmlFor="grid-city"
              >
                Company Name
              </label>
              <input
                className="appearance-none block w-full bg-gray-200 text-gray-700 border border-gray-200 rounded py-3 px-4 leading-tight focus:outline-none focus:bg-white focus:border-gray-500"
                {...register("companyName", { required: true })}
              />
            </div>
            <div className="w-full  px-3 mb-6 md:mb-0">
              <label
                className="block uppercase tracking-wide font-bold mb-2"
                htmlFor="grid-city"
              >
                Timeline
              </label>
              <input
                className="appearance-none block w-full bg-gray-200 text-gray-700 border border-gray-200 rounded py-3 px-4 leading-tight focus:outline-none focus:bg-white focus:border-gray-500"
                {...register("timeline", { required: true })}
              />
            </div>

            <div className="w-full  px-3 mb-6 md:mb-0">
              <label
                className="block uppercase tracking-wide font-bold mb-2"
                htmlFor="grid-zip"
              >
                Certificate
              </label>
              <input
                className="appearance-none block w-full bg-gray-200 text-gray-700 border border-gray-200 rounded py-3 px-4 leading-tight focus:outline-none focus:bg-white focus:border-gray-500"
                {...register("certificate")}
              />
            </div>
          </div>

          <Button type="submit" className="w-[100px] my-5 text-center">
            Submit
          </Button>
        </form>
      </div>
      <DragNdrop url="/experience" />
    </div>
  );
};

export default Experience;
