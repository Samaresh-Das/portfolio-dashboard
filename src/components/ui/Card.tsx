import { truncateDescription } from "@/functions/truncate";
import { Exp } from "../DragNdrop";

interface Project {
  title: string;
  description: string;
  image: string;
}

const Card = ({ item, url }: { item: Project | Exp; url: string }) => {
  if (url === "/projects") {
    const { title, description, image } = item as Project;
    const desc = truncateDescription(description, 60);

    return (
      <div className="my-3 hover:cursor-grab">
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
  } else if (url === "/experience") {
    const { companyName, timeLine, jobTitle, responsibility } = item as Exp;

    return (
      <div className="my-3 hover:cursor-grab">
        <div className="flex flex-col items-center rounded-lg shadow md:flex-row md:max-w-xl border border-[#fb5607]">
          <div className="flex flex-col justify-between leading-normal px-4">
            <h5 className="mb-2 text-2xl font-bold tracking-tight text-[#fb5607] pt-3">
              {companyName}
              <span className="text-xl tracking-tight text-[#cabdb7] ml-5 text-right">
                {timeLine}
              </span>
            </h5>
            <p className="mb-3 font-normal text-[#f0e3a4]">{jobTitle}</p>

            <ul className="list-decimal p-5">
              {responsibility.map((resp, i) => (
                <li key={i} className="text-[#f0e3a4]">
                  {resp}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    );
  }
};

export default Card;
