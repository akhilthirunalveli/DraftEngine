import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { projAPI } from "../api/endpoints";
import ProjectCard from "../components/dashboard/ProjectCard";

const Dashboard = () => {
  const [p, setP] = useState([]);
  const [l, setL] = useState(true);
  const [deletingId, setDeletingId] = useState(null);

  useEffect(() => {
    const f = async () => {
      try {
        const res = await projAPI.list();
        setP(res.data);
      } catch (e) {
        console.error(e);
      } finally {
        setL(false);
      }
    };
    f();
  }, []);

  const handleDelete = async (id) => {
    const ok = window.confirm("Delete this project? This action cannot be undone.");
    if (!ok) return;
    setDeletingId(id);
    try {
      await projAPI.delete(id);
      setP((prev) => prev.filter((x) => x.id !== id && x._id !== id));
    } catch (e) {
      console.error(e);
      alert("Failed to delete project. Please try again.");
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="w-full py-4">
        <div className="flex items-center justify-between w-full mb-8 px-2">
          <h1 className="text-3xl font-black text-black tracking-tight">Projects</h1>
          <Link
            to="/"
            className="button-74-navbar"
          >
            + New Draft
          </Link>
        </div>

        {l ? (
          <div className="text-center py-12 text-gray-500">Loading projects...</div>
        ) : p.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-lg border border-dashed">
            <h3 className="text-xl text-gray-400 font-medium mb-4">No projects yet</h3>
            <Link to="/" className="text-blue-600 hover:underline">
              Create your first draft
            </Link>
          </div>
          ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 px-2">
            {p.map((proj) => (
              <ProjectCard key={proj.id || proj._id} p={proj} onDelete={handleDelete} deletingId={deletingId} />
            ))}
          </div>
        )}
      </div>
  );
};

export default Dashboard;