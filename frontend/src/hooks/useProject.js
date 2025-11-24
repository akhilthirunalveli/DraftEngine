import { useState, useEffect } from "react";
import { projAPI } from "../api/endpoints";

export default function useProject(id) {
  const [p, setP] = useState(null);
  const [l, setL] = useState(true);
  const [e, setE] = useState(null);

  useEffect(() => {
    if (!id) return;
    const f = async () => {
      try {
        setL(true);
        const res = await projAPI.get(id);
        setP(res.data);
      } catch (err) {
        setE(err);
      } finally {
        setL(false);
      }
    };
    f();
  }, [id]);

  return { p, l, e, setP };
}