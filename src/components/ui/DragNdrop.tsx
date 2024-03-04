import { useEffect, useRef, useState } from "react";
import Card from "./Card";
import { getDatabase, ref, set } from "firebase/database";
import { app } from "@/firebase";

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
  const db = getDatabase(app);

  // Separate metadata from projects
  const { metadata, ...projects } = data;

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
  async function handleSort() {
    const projectClone = [...projectsArray]; //clone the projects array
    const temp = projectClone[dragProject.current]; // Store dragged project
    // Swap positions of dragged and dropped projects
    projectClone[dragProject.current] =
      projectClone[draggedOverProject.current];
    projectClone[draggedOverProject.current] = temp;
    setProjectsArray(projectClone); // Update projectsArray with sorted projects

    // Update the id of each project to match its position in the array
    projectClone.forEach((project, index) => {
      project.id = index;
    });

    // Get a reference to the database service
    const dbRef = ref(db, "projects");

    // Update the data in Firebase
    await set(dbRef, { ...projectClone, metadata });
  }

  return (
    <div className="mt-20">
      {projectsArray.map((project, index) => (
        <div
          key={index}
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
