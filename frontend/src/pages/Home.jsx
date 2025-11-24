import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { projAPI } from "../api/endpoints";
import { BeatLoader } from "react-spinners";

const Home = () => {
  const [prompt, setPrompt] = useState("");
  const [loadingType, setLoadingType] = useState(null);
  const { user } = useAuth();
  const n = useNavigate();
  

  const handleCreate = async (type) => {
    if (!user) {
      n("/login");
      return;
    }
    if (!prompt.trim()) return;

    setLoadingType(type);
    try {
      // Auto-generate a title from the first few words of the prompt
      const title = prompt.split(" ").slice(0, 4).join(" ") || "New Project";
      
      const res = await projAPI.create({
        title,
        type,
        prompt
      });
      
      n(`/editor/${res.data.id}`);
    } catch (e) {
      console.error(e);
      alert("Failed to generate draft. Please try again.");
      setLoadingType(null);
    } finally {
      setLoadingType(null);
    }
  };

  

  return (
      <div className="flex flex-col items-center justify-center min-h-[calc(100vh-200px)] p-4">
        <div className="max-w-2xl w-full text-center space-y-8">
          <h1 className="text-4xl font-bold text-gray-900 tracking-tight">
            What do you want to create today?
          </h1>
          
          <div className="text-left">
            <textarea
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="Describe your document or presentation (e.g., 'A marketing proposal for organic coffee brand expansion')..."
              className="w-full h-32 p-4 text-lg border-2 rounded-xl border-black resize-none bg-gray-10"
            />

            <div className="flex gap-4 mt-4 justify-end">
              <button
                onClick={() => handleCreate("word")}
                disabled={loadingType !== null || !prompt}
                className="button-74-navbar disabled:opacity-50 disabled:cursor-not-allowed"
                role="button"
              >
                {loadingType === "word" ? (
                  <BeatLoader size={8} color="#422800" />
                ) : (
                  "Document"
                )}
              </button>

              <button
                onClick={() => handleCreate("powerpoint")}
                disabled={loadingType !== null || !prompt}
                className="button-74-navbar disabled:opacity-50 disabled:cursor-not-allowed"
                role="button"
              >
                {loadingType === "powerpoint" ? (
                  <BeatLoader size={8} color="#422800" />
                ) : (
                  "Presentation"
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
  );
};

export default Home;