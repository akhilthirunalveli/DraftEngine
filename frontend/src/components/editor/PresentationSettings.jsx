import React, { useState, useEffect } from "react";
import { editAPI, expAPI } from "../../api/endpoints";

const PresentationSettings = ({ d, u, pid, title }) => {
  const [sections, setSections] = useState(d.sections || []);
  const [slideCount, setSlideCount] = useState(d.sections?.length || 1);
  const [aiSuggestions, setAiSuggestions] = useState(null);
  const [loading, setLoading] = useState(false);
  const [generating, setGenerating] = useState(false);

  useEffect(() => {
    const nextSections = d.sections && d.sections.length > 0 ? d.sections : [{
      id: `${Date.now()}-0`,
      title: "Slide 1",
      content: "",
      order: 0,
    }];
    setSections(nextSections);
    setSlideCount(nextSections.length);
  }, [d]);

  const ensureSlideStructure = (target, currentSections = sections) => {
    const desired = Math.max(1, target || 1);
    let updated = [...currentSections];

    if (desired > updated.length) {
      for (let i = updated.length; i < desired; i++) {
        updated.push({
          id: `${Date.now()}-${i}`,
          title: `Slide ${i + 1}`,
          content: "",
          order: i,
        });
      }
    } else if (desired < updated.length) {
      updated = updated.slice(0, desired);
    }

    updated = updated.map((slide, index) => ({
      ...slide,
      order: index,
      title: slide.title || `Slide ${index + 1}`,
    }));

    setSlideCount(desired);
    setSections(updated);
    u({ ...d, sections: updated });
  };

  const handleAddSlide = () => {
    const newSlide = {
      id: `${Date.now()}-${sections.length}`,
      title: "New Slide",
      content: "",
      order: sections.length,
    };
    const updated = [...sections, newSlide];
    setSections(updated);
    setSlideCount(updated.length);
    u({ ...d, sections: updated });
  };

  const handleRemoveSlide = (index) => {
    const updated = sections
      .filter((_, i) => i !== index)
      .map((s, i) => ({ ...s, order: i }));
    if (updated.length === 0) {
      ensureSlideStructure(1, []);
      return;
    }
    setSections(updated);
    setSlideCount(updated.length);
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

  const handleSlideCountChange = (value) => {
    const desired = Number(value);
    if (Number.isNaN(desired)) return;
    ensureSlideStructure(desired);
  };

  const handleGenerateSlides = async () => {
    if (!sections.length) return;
    setGenerating(true);
    try {
      const outline = sections
        .map((slide, index) => `${index + 1}. ${slide.title || `Slide ${index + 1}`}`)
        .join("\n");
      const baseTitle = title || "Presentation";
      const prompt = `Create content for a presentation titled "${baseTitle}". There should be ${sections.length} slides. Use these slide titles exactly:\n${outline}\nReturn detailed bullet-style content for each slide.`;
      const res = await editAPI.gen({ prompt, type: "slides" });
      const generated = res.data.sections || [];
      const updated = sections.map((slide, index) => ({
        ...slide,
        id: slide.id || generated[index]?.id || `${Date.now()}-${index}`,
        title: slide.title || generated[index]?.title || `Slide ${index + 1}`,
        content: generated[index]?.content || slide.content || "",
        order: index,
      }));
      setSections(updated);
      u({ ...d, sections: updated });
    } catch (err) {
      console.error(err);
      alert("Failed to generate slide content. Please try again.");
    } finally {
      setGenerating(false);
    }
  };

  const handleAiSuggest = async () => {
    setLoading(true);
    try {
      const res = await editAPI.suggestOutline({ title: "presentation" });
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
      title: s.title || `Slide ${i + 1}`,
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
    const newSections = aiSuggestions.map((s, i) => ({
      id: s.id || `${Date.now()}-${Math.random()}-${i}`,
      title: s.title || `Slide ${i + 1}`,
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
    <div className="w-96 bg-white h-full-screen flex flex-col border-2 border-black p-4 overflow-hidden rounded-xl">
      <h3 className="font-black text-2xl text-black mb-4 uppercase tracking-tight">Presentation Settings</h3>

      <button
        onClick={handleAiSuggest}
        disabled={loading}
        className="w-full mb-4 bg-black text-white py-3 px-4 border border-black font-black text-sm uppercase tracking-wide hover:bg-gray-800 active:translate-x-1 active:translate-y-1 active:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-black disabled:active:translate-x-0 disabled:active:translate-y-0 disabled:active:shadow-none transition-all rounded-lg"
      >
        {loading ? "Generating..." : "AI-Suggest Slides"}
      </button>

      {aiSuggestions && aiSuggestions.length > 0 && (
        <div className="mb-4 p-3 bg-gray-100 border border-black rounded-lg">
          <p className="text-xs text-black mb-2 font-black uppercase tracking-wide">AI-Generated Slides</p>
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

      <div className="mb-4">
        <label className="text-xs text-black font-black uppercase tracking-wide">Number of Slides</label>
        <input
          type="number"
          min={1}
          value={slideCount}
          onChange={(e) => handleSlideCountChange(e.target.value)}
          className="w-full mt-2 px-3 py-2 bg-white border border-black rounded text-sm font-bold focus:outline-none focus:bg-gray-100 focus:border-black"
        />
      </div>

      <div className="flex-1 overflow-y-auto space-y-3">
        <div className="text-xs text-black font-black uppercase tracking-wide mb-2">Slide Headers</div>
        {sections.map((slide, index) => (
          <div
            key={slide.id}
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
                onClick={() => handleRemoveSlide(index)}
                className="text-sm px-3 py-1 bg-black text-white border border-black font-black hover:bg-gray-800 active:translate-x-1 active:translate-y-1 active:shadow-[1px_1px_0px_0px_rgba(0,0,0,1)] ml-auto transition-all rounded"
                title="Remove"
              >
                ×
              </button>
            </div>
            <input
              type="text"
              value={slide.title}
              onChange={(e) => handleTitleChange(index, e.target.value)}
              placeholder={`Slide ${index + 1}`}
              className="w-full px-3 py-2 bg-white border border-black text-sm font-bold focus:outline-none focus:bg-gray-100 focus:border-black rounded"
            />
          </div>
        ))}
      </div>

      <button
        onClick={handleGenerateSlides}
        disabled={generating}
        className="mt-4 w-full py-3 border border-black bg-black text-white hover:bg-gray-800 font-black text-sm uppercase tracking-wide active:translate-x-1 active:translate-y-1 active:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] disabled:opacity-50 disabled:cursor-not-allowed transition-all rounded-lg"
      >
        {generating ? "Generating..." : "Generate Slides"}
      </button>

      <button
        onClick={handleAddSlide}
        className="mt-4 w-full py-3 border border-black bg-white text-black hover:bg-gray-100 font-black text-sm uppercase tracking-wide active:translate-x-1 active:translate-y-1 active:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] transition-all rounded-lg"
      >
        + Add Slide
      </button>

      {pid && (
        <button
          onClick={() => window.open(expAPI.url(pid, "pptx"), "_blank")}
          className="mt-4 w-full py-3 border border-black bg-black text-white hover:bg-gray-800 font-black text-sm uppercase tracking-wide active:translate-x-1 active:translate-y-1 active:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] transition-all rounded-lg"
        >
          Export .PPTX
        </button>
      )}
    </div>
  );
};

export default PresentationSettings;
