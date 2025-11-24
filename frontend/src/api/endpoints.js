import c from "./client";

export const authAPI = {
  login: (d) => c.post("/auth/login", d),
  reg: (d) => c.post("/auth/register", d),
};

export const projAPI = {
  create: (d) => c.post("/projects/", d),
  list: () => c.get("/projects/"),
  get: (id) => c.get(`/projects/${id}`),
  delete: (id) => c.delete(`/projects/${id}`),
};

export const editAPI = {
  gen: (d) => c.post("/editor/generate", d),
  refine: (d) => c.post("/editor/refine", d),
  vote: (pid, sid, v) => c.post(`/editor/feedback/${pid}/${sid}`, { vote: v }),
  comment: (pid, sid, t) => c.post(`/editor/comment/${pid}/${sid}`, { text: t }),
  suggestOutline: (d) => c.post("/editor/suggest-outline", d),
};

export const expAPI = {
  url: (pid, fmt) => `${c.defaults.baseURL}/export/download/${pid}/${fmt}`,
};

