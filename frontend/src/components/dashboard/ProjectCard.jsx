import { useNavigate } from "react-router-dom";
import { Trash } from "lucide-react";

const ProjectCard = ({ p, onDelete, deletingId }) => {
  const id = p.id || p._id;
  const n = useNavigate();

  const handleOpen = () => {
    n(`/editor/${id}`);
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      handleOpen();
    }
  };

  return (
    <div
      tabIndex={0}
      role="button"
      onClick={handleOpen}
      onKeyDown={handleKeyDown}
      className="border-2 border-black bg-white p-5 rounded-xl shadow-[6px_6px_0_#000] flex flex-col justify-between h-full transition-all group cursor-pointer hover:-translate-y-1"
    >
      <div>
        <div className="flex justify-between items-start mb-4 gap-3">
          <span className="border-2 border-black px-2 py-0.5 rounded-lg text-xs font-black uppercase tracking-wide inline-block text-black bg-white">
            {p.type}
          </span>
          <span className="text-xs text-gray-700 font-bold whitespace-nowrap">
            {p.last_modified ? new Date(p.last_modified).toLocaleDateString() : ""}
          </span>
        </div>
        <h3 className="font-black text-lg uppercase mb-2 truncate text-black">
          {p.title}
        </h3>
      </div>

      {onDelete && (
        <div className="mt-6 flex justify-end">
          <button
            onClick={(e) => {
              e.stopPropagation();
              onDelete(id);
            }}
            disabled={deletingId === id}
            className="w-10 h-10 flex items-center justify-center bg-red-600 text-white border-2 border-black rounded-md shadow-[3px_3px_0_#000] hover:bg-red-700 transition-all disabled:opacity-50"
            title="Delete project"
          >
            {deletingId === id ? (
              <span className="text-[10px] font-black">...</span>
            ) : (
              <Trash size={18} />
            )}
          </button>
        </div>
      )}
    </div>
  );
};

export default ProjectCard;