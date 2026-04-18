import { useEffect, useRef, useState } from "react";
import Card from "./ui/Card";
import { getDatabase, ref, set } from "firebase/database";
import { app } from "@/firebase";
import useData from "@/hooks/useData";
import { AnimatePresence, motion } from "framer-motion";

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

export interface Skills {
  logo: string;
  text: string;
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
    } else if (url === "/skills") {
      const { metadata, ...skills } = data;
      setMetadata(metadata); //set metdata
      items = skills;
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
    } else if (url === "/skills") {
      dbRef = ref(db, "skills");
    } else {
      throw new Error(`Invalid URL: ${url}`);
    }

    // Update the data in Firebase
    await set(dbRef, { ...itemClone, metadata });
  }

  return (
    <div className="w-full">
      {/* Header */}
      <div className="flex items-center gap-3 mb-4">
        <span className="font-orbitron text-[10px] tracking-widest" style={{ color: "rgba(251,86,7,0.6)" }}>
          LIVE DATA
        </span>
        <div className="flex-1 h-px" style={{ background: "linear-gradient(90deg, rgba(251,86,7,0.3), transparent)" }} />
        {!loading && (
          <span
            className="font-orbitron text-[9px] tracking-widest px-2 py-1 rounded"
            style={{
              background: "rgba(34,197,94,0.08)",
              color: "rgba(34,197,94,0.7)",
              border: "1px solid rgba(34,197,94,0.15)",
            }}
          >
            {itemsArray.length} ITEMS
          </span>
        )}
      </div>

      {/* Hint */}
      <div
        className="flex items-center gap-2 mb-4 px-3 py-2 rounded-lg"
        style={{
          background: "rgba(251,86,7,0.05)",
          border: "1px solid rgba(251,86,7,0.1)",
        }}
      >
        <span style={{ color: "rgba(251,86,7,0.5)", fontSize: 14 }}>⇅</span>
        <p className="font-grotesk text-xs" style={{ color: "rgba(240,227,164,0.4)" }}>
          Drag items to reorder — changes sync automatically to Firebase
        </p>
      </div>

      {/* List */}
      {loading ? (
        <div className="flex items-center justify-center gap-2 py-16">
          <div className="loader-dot" />
          <div className="loader-dot" />
          <div className="loader-dot" />
        </div>
      ) : (
        <AnimatePresence>
          <div className="space-y-2">
            {itemsArray.map((item, index) => (
              <motion.div
                key={index}
                layout
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ delay: index * 0.05, duration: 0.3 }}
                draggable
                onDragStart={() => (dragItem.current = index)}
                onDragEnter={() => (draggedOverItem.current = index)}
                onDragEnd={handleSort}
                onDragOver={(e) => e.preventDefault()}
              >
                <Card item={item} url={url} />
              </motion.div>
            ))}
          </div>
        </AnimatePresence>
      )}
    </div>
  );
};

export default DragNdrop;
