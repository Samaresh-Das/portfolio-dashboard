import { useEffect, useRef, useState } from "react";
import Card from "./Card";

//structure of individual projects
interface Project {
  title: string;
  description: string;
  id: number;
  image: string;
}

// Define a type for a collection of projects
interface ProjectsData {
  [key: string]: Project; // Key is a string, value is a Project
}

// Define the DragNdrop component which takes data as prop
const DragNdrop = ({ data }: { data: ProjectsData }) => {
  // Filter out metadata and convert data into an array of projects
  const projects = Object.entries(data)
    .filter(([key, value]) => key !== "metadata")
    .reduce((acc, [key, value]) => {
      acc[key] = value;
      return acc;
    }, {} as ProjectsData); //Convert to ProjectsData type

  // State to hold the array of projects
  const [projectsArray, setProjectsArray] = useState<Project[]>([]);

  // Update projectsArray when data prop changes
  useEffect(() => {
    setProjectsArray(Object.values(projects));
  }, [data]);

  // Refs to store the index of dragged and dropped projects
  const dragProject = useRef<number>(0);
  const draggedOverProject = useRef<number>(0);

  // Function to handle sorting of projects after drag and drop
  function handleSort() {
    const projectClone = [...projectsArray]; //clone the projects array
    const temp = projectClone[dragProject.current]; // Store dragged project
    // Swap positions of dragged and dropped projects
    projectClone[dragProject.current] =
      projectClone[draggedOverProject.current];
    projectClone[draggedOverProject.current] = temp;
    setProjectsArray(projectClone); // Update projectsArray with sorted projects
  }

  return (
    <div>
      {projectsArray.map((project, index) => (
        <div
          draggable
          onDragStart={() => (dragProject.current = index)}
          onDragEnter={() => (draggedOverProject.current = index)}
          onDragEnd={handleSort}
          onDragOver={(e) => e.preventDefault()}
        >
          <Card project={project} />
        </div>
      ))}
    </div>
  );
};

export default DragNdrop;
