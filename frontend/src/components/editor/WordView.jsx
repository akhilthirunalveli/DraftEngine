import RefinementBox from "./RefinementBox";

const WordView = ({ d, pid, title, u }) => {
  const h = (ns, i) => {
    const sections = [...d.sections];
    sections[i] = ns;
    u({ ...d, sections });
  };

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
    <div className="min-h-screen overflow-y-auto scrollbar-hide border-2 border-black rounded-xl">
      <div className="max-w-[280mm] mx-auto bg-white shadow-xl min-h-[297mm] p-[20mm] text-gray-900 rounded-xl">
        <div className="mb-8 text-center border-b pb-4">
          <h1 className="text-4xl font-bold">{title || "Untitled Document"}</h1>
        </div>
        
        <div className="space-y-8">
          {d.sections.map((s, i) => (
            <div key={s.id} className="group relative">
              <div className="hover:bg-gray-50 p-4 rounded transition">
                <h2 className="text-xl font-bold mb-3 text-gray-800">{s.title}</h2>
                <p className="whitespace-pre-wrap leading-relaxed text-justify text-sm font-serif">
                  {renderContent(s.content)}
                </p>
              </div>
              
              <div className="mt-2">
                <RefinementBox pid={pid} s={s} onUpdate={(ns) => h(ns, i)} />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default WordView;