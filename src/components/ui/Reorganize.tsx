import { getDatabase, ref, onValue } from "firebase/database";
import DragNdrop from "./DragNdrop";
import { useEffect, useState } from "react";
import { app } from "@/firebase";

const Reorganize = () => {
  const db = getDatabase(app);
  const [projects, setProjects] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const projectList = ref(db, "/projects");
    onValue(projectList, (snapshot) => {
      const data = snapshot.val();
      setProjects(data);
      setLoading(false);
    });
  }, []);

  return (
    <div>{loading ? <p>Loading...</p> : <DragNdrop data={projects} />}</div>
  );
};

export default Reorganize;
