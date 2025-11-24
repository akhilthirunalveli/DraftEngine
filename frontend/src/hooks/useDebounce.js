import { useState, useEffect } from "react";

export default function useDebounce(v, d) {
  const [dv, setDv] = useState(v);

  useEffect(() => {
    const h = setTimeout(() => {
      setDv(v);
    }, d);

    return () => {
      clearTimeout(h);
    };
  }, [v, d]);

  return dv;
}