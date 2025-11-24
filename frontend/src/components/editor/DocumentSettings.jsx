import React, { useState, useEffect } from "react";
import { editAPI, expAPI } from "../../api/endpoints";

const DocumentSettings = ({ d, u, title, pid }) => {
  const [sections, setSections] = useState(d.sections || []);
  const [aiSuggestions, setAiSuggestions] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setSections(d.sections || []);
  }, [d]);

  const handleAddSection = () => {
    const newSection = {
      id: `${Date.now()}-${sections.length}`,
      title: "New Section",
      content: "",
      order: sections.length,
    };
    const updated = [...sections, newSection];
    setSections(updated);
    u({ ...d, sections: updated });
  };

  const handleRemoveSection = (index) => {
    const updated = sections.filter((_, i) => i !== index).map((s, i) => ({ ...s, order: i }));
    setSections(updated);
    u({ ...d, sections: updated });
  };

  const handleReorder = (index, direction) => {
    if (
      (direction === "up" && index === 0) ||
      (direction === "down" && index === sections.length - 1)
    ) {
      return;
    }

    const updated = [...sections];
    const newIndex = direction === "up" ? index - 1 : index + 1;
    [updated[index], updated[newIndex]] = [updated[newIndex], updated[index]];
    updated.forEach((s, i) => (s.order = i));
    setSections(updated);
    u({ ...d, sections: updated });
  };

  const handleTitleChange = (index, newTitle) => {
    const updated = [...sections];
    updated[index] = { ...updated[index], title: newTitle };
    setSections(updated);
    u({ ...d, sections: updated });
  };

  const handleAiSuggest = async () => {
    setLoading(true);
    try {
      const res = await editAPI.suggestOutline({ title: title || "document" });
      setAiSuggestions(res.data.sections || []);
    } catch (e) {
      console.error(e);
      alert("Failed to generate outline. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleAcceptSuggestions = () => {
    if (!aiSuggestions || aiSuggestions.length === 0) return;
    
    const newSections = aiSuggestions.map((s, i) => ({
      id: s.id || `${Date.now()}-${Math.random()}-${i}`,
      title: s.title || `Section ${i + 1}`,
      content: s.content || sections[i]?.content || "",
      order: i,
      history: sections[i]?.history || [],
    }));
    
    setSections(newSections);
    setAiSuggestions(null);
    u({ ...d, sections: newSections });
  };

  const handleEditSuggestions = () => {
    if (!aiSuggestions || aiSuggestions.length === 0) return;
    // Apply suggestions but keep them editable (user can modify before finalizing)
    const newSections = aiSuggestions.map((s, i) => ({
      id: s.id || `${Date.now()}-${Math.random()}-${i}`,
      title: s.title || `Section ${i + 1}`,
      content: s.content || sections[i]?.content || "",
      order: i,
      history: sections[i]?.history || [],
    }));
    setSections(newSections);
    setAiSuggestions(null);
    u({ ...d, sections: newSections });
  };

  const handleDiscardSuggestions = () => {
    setAiSuggestions(null);
  };

  return (
    <div className="w-96 flex-shrink-0 bg-white h-full flex flex-col border-2 border-black p-4 overflow-hidden rounded-xl">
      <h3 className="font-black text-2xl text-black mb-4 uppercase tracking-tight">Document Settings</h3>

      <button
        onClick={handleAiSuggest}
        disabled={loading}
        className="w-full mb-4 bg-black text-white py-3 px-4 border border-black font-black text-sm uppercase tracking-wide hover:bg-gray-800 active:translate-x-1 active:translate-y-1 active:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-black disabled:active:translate-x-0 disabled:active:translate-y-0 disabled:active:shadow-none transition-all rounded-lg"
      >
        {loading ? "Generating..." : "AI-Suggest Outline"}
      </button>

      {aiSuggestions && aiSuggestions.length > 0 && (
        <div className="mb-4 p-3 bg-gray-100 border border-black rounded-lg">
          <p className="text-xs text-black mb-2 font-black uppercase tracking-wide">AI-Generated Outline</p>
          <div className="space-y-1 mb-3 max-h-32 overflow-y-auto bg-white border border-black p-2 rounded">
            {aiSuggestions.map((s, i) => (
              <div key={i} className="text-xs text-black font-bold">
                {i + 1}. {s.title}
              </div>
            ))}
          </div>
          <div className="flex gap-2">
            <button
              onClick={handleAcceptSuggestions}
              className="flex-1 bg-black text-white py-2 px-2 border border-black text-xs font-black uppercase hover:bg-gray-800 active:translate-x-1 active:translate-y-1 active:shadow-[1px_1px_0px_0px_rgba(0,0,0,1)] transition-all rounded"
            >
              Accept
            </button>
            <button
              onClick={handleEditSuggestions}
              className="flex-1 bg-white text-black py-2 px-2 border border-black text-xs font-black uppercase hover:bg-gray-100 active:translate-x-1 active:translate-y-1 active:shadow-[1px_1px_0px_0px_rgba(0,0,0,1)] transition-all rounded"
            >
              Edit
            </button>
            <button
              onClick={handleDiscardSuggestions}
              className="flex-1 bg-gray-200 text-black py-2 px-2 border border-black text-xs font-black uppercase hover:bg-gray-300 active:translate-x-1 active:translate-y-1 active:shadow-[1px_1px_0px_0px_rgba(0,0,0,1)] transition-all rounded"
            >
              Discard
            </button>
          </div>
        </div>
      )}

      <div className="flex-1 overflow-y-auto space-y-3">
        <div className="text-xs text-black font-black uppercase tracking-wide mb-2">Section Headers</div>
        {sections.map((section, index) => (
          <div
            key={section.id}
            className="bg-gray-50 border border-black p-3 group rounded-lg"
          >
            <div className="flex items-center gap-2 mb-2">
              <button
                onClick={() => handleReorder(index, "up")}
                disabled={index === 0}
                className="text-sm px-3 py-1 bg-white border border-black font-black hover:bg-gray-100 active:translate-x-1 active:translate-y-1 active:shadow-[1px_1px_0px_0px_rgba(0,0,0,1)] disabled:opacity-30 disabled:cursor-not-allowed disabled:hover:bg-white disabled:active:translate-x-0 disabled:active:translate-y-0 disabled:active:shadow-none transition-all rounded"
                title="Move up"
              >
                ↑
              </button>
              <button
                onClick={() => handleReorder(index, "down")}
                disabled={index === sections.length - 1}
                className="text-sm px-3 py-1 bg-white border border-black font-black hover:bg-gray-100 active:translate-x-1 active:translate-y-1 active:shadow-[1px_1px_0px_0px_rgba(0,0,0,1)] disabled:opacity-30 disabled:cursor-not-allowed disabled:hover:bg-white disabled:active:translate-x-0 disabled:active:translate-y-0 disabled:active:shadow-none transition-all rounded"
                title="Move down"
              >
                ↓
              </button>
              <button
                onClick={() => handleRemoveSection(index)}
                className="text-sm px-3 py-1 bg-black text-white border border-black font-black hover:bg-gray-800 active:translate-x-1 active:translate-y-1 active:shadow-[1px_1px_0px_0px_rgba(0,0,0,1)] ml-auto transition-all rounded"
                title="Remove"
              >
                ×
              </button>
            </div>
            <input
              type="text"
              value={section.title}
              onChange={(e) => handleTitleChange(index, e.target.value)}
              placeholder={`Section ${index + 1}`}
              className="w-full px-3 py-2 bg-white border border-black text-sm font-bold focus:outline-none focus:bg-gray-100 focus:border-black rounded"
            />
          </div>
        ))}
      </div>

      <button
        onClick={handleAddSection}
        className="mt-4 w-full py-3 border border-black bg-white text-black hover:bg-gray-100 font-black text-sm uppercase tracking-wide active:translate-x-1 active:translate-y-1 active:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] transition-all rounded-lg"
      >
        + Add Section
      </button>

      <button
        onClick={() => window.open(expAPI.url(pid, "docx"), "_blank")}
        className="mt-4 w-full py-3 border border-black bg-black text-white hover:bg-gray-800 font-black text-sm uppercase tracking-wide active:translate-x-1 active:translate-y-1 active:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] transition-all rounded-lg"
      >
        Export .DOCX
      </button>
    </div>
  );
};

export default DocumentSettings;

