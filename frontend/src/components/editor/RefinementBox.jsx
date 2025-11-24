import { useState } from "react";
import { editAPI } from "../../api/endpoints";
import { ThumbsUp, ThumbsDown } from "lucide-react";


const RefinementBox = ({ pid, s, onUpdate }) => {
  const [r, setR] = useState("");
  const [c, setC] = useState(s.comment || "");
  const [l, setL] = useState(false);

  const handleRefine = async () => {
    if (!r) return;
    setL(true);
    try {
      const res = await editAPI.refine({ text: s.content, instructions: r });
      onUpdate({ ...s, content: res.data.refined });
      setR("");
    } catch (e) {
      console.error(e);
    }
    setL(false);
  };

  const handleVote = async (v) => {
    try {
      await editAPI.vote(pid, s.id, v);
      onUpdate({ ...s, feedback: v });
    } catch (e) {
      console.error(e);
    }
  };

  const handleComment = async () => {
    try {
      await editAPI.comment(pid, s.id, c);
      onUpdate({ ...s, comment: c });
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="bg-gray-50 p-4 rounded border mt-4">
      <h4 className="font-bold text-sm mb-2">AI Refinement</h4>
      <div className="flex gap-2 mb-4">
        <input
          type="text"
          value={r}
          onChange={(e) => setR(e.target.value)}
          placeholder="E.g. Make it shorter..."
          className="flex-1 border p-2 rounded text-sm"
        />
        <button
          onClick={handleRefine}
          disabled={l}
          className="bg-black text-white px-4 py-2 rounded text-sm disabled:opacity-50"
        >
          {l ? "..." : "Refine"}
        </button>
      </div>

      <div className="flex justify-between items-center border-t pt-3">
        <div className="flex gap-2">
          <button
            onClick={() => handleVote("like")}
            className={`p-1 rounded ${s.feedback === "like" ? "bg-green-200" : "hover:bg-gray-200"}`}
          >
          <ThumbsUp size={18} />
          </button>
          <button
            onClick={() => handleVote("dislike")}
            className={`p-1 rounded ${s.feedback === "dislike" ? "bg-red-200" : "hover:bg-gray-200"}`}
          >
          <ThumbsDown size={18} />
          </button>
        </div>
        <div className="flex gap-2 items-center flex-1 ml-4">
          <input
            type="text"
            value={c}
            onChange={(e) => setC(e.target.value)}
            placeholder="Add a note..."
            className="flex-1 border p-1 rounded text-xs"
          />
          <button onClick={handleComment} className="text-xs text-black hover:underline">
            Save
          </button>
        </div>
      </div>
    </div>
  );
};

export default RefinementBox;
