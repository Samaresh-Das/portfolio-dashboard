import { useForm } from "react-hook-form";
import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { getDatabase, ref, onValue, update } from "firebase/database";

import { app } from "@/firebase";
import { RootState } from "@/store/store";
import { GdriveUrlConverter } from "@/functions/GdriveUrlConverter";

import DragNdrop from "../DragNdrop";
import Button from "../ui/Button";

type Inputs = {
  logo: string;
  text: string;
};

const Skills = () => {
  const db = getDatabase(app);

  const userId = useSelector((state: RootState) => state.auth.userId); //getting userID

  const [skillsLength, setSkillsLength] = useState(0);

  useEffect(() => {
    //getting metadata
    const metaRef = ref(db, "skills/metadata");
    onValue(metaRef, (snapshot) => {
      const data = snapshot.val();
      setSkillsLength(data.maxLength);
    });
  }, []);

  const handleSubmission = async (data: Inputs) => {
    try {
      //if the user is not matching the owner, then cancel
      if (userId !== import.meta.env.VITE_APP_OWNER_ID) {
        throw new Error("Not Authorized, You need administrator access");
      }

      const { text, logo } = data;
      const gdriveImageUrl = GdriveUrlConverter(logo);

      const newPostKey = skillsLength + 1; //increase the count as we're going to update the metadata
      const postData = {
        id: newPostKey,
        text,
        logo: gdriveImageUrl,
      };
      console.log(postData);

      const updates: Partial<Record<string, any>> = {};

      updates[`/skills/${newPostKey}`] = postData;
      updates["/skills/metadata/maxLength"] = newPostKey; //update metadata

      await update(ref(db), updates);
    } catch (error) {
      console.error(error);
    }
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
          {errors.logo || errors.text ? (
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
                Logo URL
              </label>
              <input
                className="appearance-none block w-full bg-gray-200 text-gray-700 border border-red-500 rounded py-3 px-4 mb-3 leading-tight focus:outline-none focus:bg-white"
                id="grid-first-name"
                {...register("logo", { required: true })}
              />
            </div>
          </div>
          <div className="flex flex-wrap -mx-3 mb-6 text-[#f0e3a4]">
            <div className="w-full px-3">
              <label
                className="block uppercase tracking-wide font-bold mb-2"
                htmlFor="grid-password"
              >
                Skill Name
              </label>
              <input
                className="appearance-none block w-full bg-gray-200 text-gray-700 border border-gray-200 rounded py-3 px-4 mb-3 leading-tight focus:outline-none focus:bg-white focus:border-gray-500"
                {...register("text", { required: true })}
              />
            </div>
          </div>

          <Button type="submit" className="w-[100px] my-5 text-center">
            Submit
          </Button>
        </form>
      </div>
      <DragNdrop url="/skills" />
    </div>
  );
};

export default Skills;
