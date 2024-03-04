import { truncateDescription } from "@/functions/truncate";

interface Project {
  title: string;
  description: string;
  // id: number;
  image: string;
}

const Card = ({ project }: { project: Project }) => {
  const { title, description, image } = project;

  const desc = truncateDescription(description, 60);

  return (
    <div className="my-3 ">
      <div className="flex flex-col items-center rounded-lg shadow md:flex-row md:max-w-xl border border-[#fb5607]">
        <img
          className="object-cover w-full rounded-t-lg h-96 md:h-auto md:w-48 md:rounded-none md:rounded-s-lg"
          src={image}
          alt=""
        />
        <div className="flex flex-col justify-between leading-normal px-4">
          <h5 className="mb-2 text-2xl font-bold tracking-tight text-[#fb5607]">
            {title}
          </h5>
          <p className="mb-3 font-normal text-[#f0e3a4]">{desc}</p>
        </div>
      </div>
    </div>
  );
};

export default Card;
