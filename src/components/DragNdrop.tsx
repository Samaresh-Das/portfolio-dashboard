import { useEffect, useRef, useState } from "react";
import Card from "./ui/Card";
import { getDatabase, ref, set } from "firebase/database";
import { app } from "@/firebase";
import useData from "@/hooks/useData";

//structure of individual items
interface Project {
  title: string;
  description: string;
  id: number;
  image: string;
}

export interface Exp {
  certificate: string;
  companyName: string;
  id: number;
  jobTitle: string;
  responsibility: string[];
  timeLine: string;
}

interface Url {
  url: string;
}

const DragNdrop = ({ url }: Url) => {
  const db = getDatabase(app);

  const { data, loading } = useData(url);

  // State to hold the array and metadata of datas
  const [itemsArray, setItemsArray] = useState<(Project | Exp)[]>([]);
  const [metadata, setMetadata] = useState<any>(null);

  useEffect(() => {
    let items;
    if (url === "/projects") {
      // Separate metadata from items
      const { metadata, ...projects } = data;
      setMetadata(metadata); //set metadata
      items = projects;
      setItemsArray(Object.values(items)); //setting items for specific use cases
    } else if (url === "/experience") {
      const { metadata, ...experience } = data;
      setMetadata(metadata); //set metdata
      items = experience;
      setItemsArray(Object.values(items));
    }
  }, [data]);

  // Refs to store the index of dragged and dropped item
  const dragItem = useRef<number>(0);
  const draggedOverItem = useRef<number>(0);

  // Function to handle sorting of item after drag and drop
  async function handleSort() {
    const itemClone = [...itemsArray]; //clone the item array
    const temp = itemClone[dragItem.current]; // Store dragged item
    // Swap positions of dragged and dropped items
    itemClone[dragItem.current] = itemClone[draggedOverItem.current];
    itemClone[draggedOverItem.current] = temp;
    setItemsArray(itemClone); // Update itemsArray with sorted items

    // Update the id of each item to match its position in the array
    itemClone.forEach((item, index) => {
      item.id = index;
    });

    // Get a reference to the database service
    let dbRef;
    if (url === "/projects") {
      dbRef = ref(db, "projects");
    } else if (url === "/experience") {
      dbRef = ref(db, "experience");
    } else {
      throw new Error(`Invalid URL: ${url}`);
    }

    // Update the data in Firebase
    await set(dbRef, { ...itemClone, metadata });
  }

  return (
    <div className="mt-20">
      {loading ? (
        <p>Loading...</p>
      ) : (
        itemsArray.map((item, index) => (
          <div
            key={index}
            draggable
            onDragStart={() => (dragItem.current = index)}
            onDragEnter={() => (draggedOverItem.current = index)}
            onDragEnd={handleSort}
            onDragOver={(e) => e.preventDefault()}
          >
            <Card item={item} url={url} />
          </div>
        ))
      )}
    </div>
  );
};

export default DragNdrop;
