import { useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

const SlideView = ({ d, pid, u }) => {
  const [idx, setIdx] = useState(0);
  const sections = d.sections || [];

  const prev = () => setIdx((i) => Math.max(0, i - 1));
  const nextSlide = () => setIdx((i) => Math.min(sections.length - 1, i + 1));

  const current = sections[idx] || { title: "", content: "" };

  const renderContent = (content) => {
    if (!content) return "";
    // Convert **text** to bold - handle multiple instances
    const parts = content.split(/(\*\*[^*]+\*\*)/g);
    return parts.map((part, index) => {
      if (part.startsWith("**") && part.endsWith("**") && part.length > 4) {
        const boldText = part.slice(2, -2);
        return <strong key={index} className="font-bold">{boldText}</strong>;
      }
      return <span key={index}>{part}</span>;
    });
  };

  return (
    <div className="">
      <div className="min-h-full flex flex-col items-center gap-8">
        {/* Main Slide Area */}
        <div className="w-full max-w-6xl">
        <div className="bg-white border-2 border-black rounded-lg p-12 aspect-video flex flex-col items-center justify-center relative">
          <h2 className="text-4xl font-bold text-black mb-6 text-center">{current.title || "Title Slide"}</h2>
          {current.content && (
            <div className="text-xl text-gray-700 whitespace-pre-wrap leading-relaxed text-center max-w-4xl">
              {renderContent(current.content)}
            </div>
          )}
        </div>
      </div>

        {/* Navigation Bar */}
        <div className="w-full max-w-6xl">
          <div className="flex items-center justify-between">
          <button
            onClick={prev}
            disabled={idx === 0}
            className="px-4 py-2 bg-gray-800 text-white rounded-lg border-2 border-black hover:bg-black disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 font-medium"
          >
            <ChevronLeft size={18} />
            Previous
          </button>
          <div className="text-sm text-gray-600 font-medium">
            Slide {idx + 1} of {sections.length || 1}
          </div>
            <button
              onClick={nextSlide}
              disabled={idx === sections.length - 1}
              className="px-4 py-2 bg-black text-white rounded-lg border-2 border-black hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 font-medium"
            >
              Next
              <ChevronRight size={18} />
            </button>
          </div>
        </div>

        {/* Thumbnail Row */}
        <div className="w-full max-w-6xl pb-4">
          <div className="flex gap-3 overflow-x-auto">
            {sections.map((s, i) => (
              <div
                key={s.id || i}
                onClick={() => setIdx(i)}
                className={`min-w-[180px] cursor-pointer p-4 rounded-lg border-2 transition-all ${
                  i === idx
                    ? "bg-white border-black shadow-md"
                    : "bg-white border-gray-300 hover:border-gray-400"
                }`}
              >
                <div className={`text-sm font-medium text-center ${
                  i === idx ? "text-black" : "text-gray-800"
                }`}>
                  {s.title || `Slide ${i + 1}`}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SlideView;