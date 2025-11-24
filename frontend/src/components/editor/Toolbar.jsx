import { expAPI } from "../../api/endpoints";

const Toolbar = ({ d, pid, t, u }) => {
  const hAdd = () => {
    const id = Date.now().toString();
    u({
      ...d,
      sections: [...d.sections, { id, title: "New Section", content: "", order: d.sections.length }]
    });
  };

  const hTitle = (v, i) => {
    const ns = [...d.sections];
    ns[i].title = v;
    u({ ...d, sections: ns });
  };

  const hExp = () => {
    const fmt = t.includes("slide") ? "pptx" : "docx";
    window.open(expAPI.url(pid, fmt), "_blank");
  };

  return (
    <div className="w-72 bg-white border-l h-full flex flex-col shadow-lg">
      <div className="p-4 border-b bg-gray-50">
        <h3 className="font-bold text-gray-700">Outline</h3>
      </div>
      
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {d.sections.map((s, i) => (
          <div key={s.id} className="bg-white border p-3 rounded hover:border-blue-400 transition group">
            <div className="flex justify-between text-xs text-gray-400 mb-1 uppercase font-bold">
              <span>{t.includes("slide") ? "Slide" : "Section"} {i + 1}</span>
            </div>
            <input
              className="w-full bg-transparent font-medium text-sm focus:outline-none text-gray-800"
              value={s.title}
              onChange={(e) => hTitle(e.target.value, i)}
            />
          </div>
        ))}
        
        <button 
          onClick={hAdd}
          className="w-full py-3 border-2 border-dashed border-gray-300 rounded text-gray-500 hover:border-blue-500 hover:text-blue-500 text-sm font-bold transition"
        >
          + Add {t.includes("slide") ? "Slide" : "Section"}
        </button>
      </div>

      <div className="p-4 border-t bg-gray-50">
        <button
          onClick={hExp}
          className="w-full bg-green-600 text-white py-3 rounded font-bold shadow hover:bg-green-700 transition flex items-center justify-center gap-2"
        >
          <span>Download {t.includes("slide") ? ".PPTX" : ".DOCX"}</span>
        </button>
      </div>
    </div>
  );
};

export default Toolbar;