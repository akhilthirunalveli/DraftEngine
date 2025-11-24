import axios from "axios";

const c = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || "http://127.0.0.1:8000",
});

c.interceptors.request.use((req) => {
  const t = localStorage.getItem("token");
  if (t) req.headers.Authorization = `Bearer ${t}`;
  return req;
});

export default c;