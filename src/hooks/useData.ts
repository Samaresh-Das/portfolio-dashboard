import { app } from "@/firebase";
import { getDatabase, onValue, ref } from "firebase/database";
import { useEffect, useState } from "react";

const useData = (url: string) => {
  const db = getDatabase(app);

  const [data, setData] = useState<Record<string, any>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const data = ref(db, url);
    try {
      onValue(
        data,
        (snapshot) => {
          const response = snapshot.val();
          setData(response);
          setLoading(false);
        },
        (error) => {
          setError(error); // Handle errors inside the onValue callback
          setLoading(false); // Make sure to set loading to false on error
        }
      );
    } catch (err: any) {
      setError(err); // Catch any errors that might occur during the Firebase operation
      setLoading(false); // Make sure to set loading to false on error
    }
  }, [db, url]); // Include db and url in the dependency array

  return { data, loading, error };
};

export default useData;
