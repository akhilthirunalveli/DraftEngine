import { useParams } from "react-router-dom";
import WordView from "../components/editor/WordView";
import SlideView from "../components/editor/SlideView";
import PresentationSettings from "../components/editor/PresentationSettings";
import DocumentSettings from "../components/editor/DocumentSettings";
import useProject from "../hooks/useProject";
import { SyncLoader } from "react-spinners";

const Editor = () => {
  const { id } = useParams();
  const { p, l, e, setP } = useProject(id);

  if (l)
    return (
      <div className="text-center mt-20">
        <SyncLoader />
      </div>
    );
  if (e) return <div className="text-center mt-20 text-red-500">Error</div>;
  if (!p) return null;

  const isSlide = p.type && (
    p.type.toLowerCase().includes("slide") || 
    p.type.toLowerCase().includes("ppt") || 
    p.type.toLowerCase().includes("powerpoint") ||
    p.type.toLowerCase().includes("presentation")
  );

  return (
    <div className="min-h-screen flex flex-col">
      <div className="flex-1 flex gap-5">
        <div className="flex-1 bg-transparent relative">
          {isSlide ? (
            <SlideView d={p.data} pid={p.id} title={p.title} u={(d) => setP({ ...p, data: d })} />
          ) : (
            <WordView d={p.data} pid={p.id} title={p.title} u={(d) => setP({ ...p, data: d })} />
          )}
        </div>
        {isSlide ? (
          <PresentationSettings d={p.data} u={(d) => setP({ ...p, data: d })} pid={p.id} title={p.title} />
        ) : (
          <DocumentSettings d={p.data} u={(d) => setP({ ...p, data: d })} title={p.title} pid={p.id} />
        )}
      </div>
    </div>
  );
};

export default Editor;