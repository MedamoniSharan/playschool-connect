import { useState } from "react";
import { useApp } from "@/context/AppContext";
import { PageHeader, StatusBadge } from "@/components/ui-custom/SharedComponents";
import { X, Plus, Trash2, Filter } from "lucide-react";
import { MediaItem } from "@/types";
import { students as allStudents } from "@/data/mockData";

function MediaModal({ item, onClose }: { item: MediaItem; onClose: () => void }) {
  const tagged = allStudents.filter((s) => item.studentIds.includes(s.id));
  return (
    <div className="fixed inset-0 bg-foreground/40 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-card rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden" onClick={(e) => e.stopPropagation()}>
        <div className="relative">
          <img src={item.url} alt={item.title} className="w-full h-64 sm:h-80 object-cover" />
          <button onClick={onClose} className="absolute top-3 right-3 p-1.5 bg-card/80 rounded-full backdrop-blur-sm">
            <X size={18} />
          </button>
        </div>
        <div className="p-5">
          <h3 className="font-semibold text-lg">{item.title}</h3>
          <p className="text-sm text-muted-foreground mt-1">{item.event} · {item.date}</p>
          <div className="flex flex-wrap gap-2 mt-3">
            {tagged.map((s) => (
              <span key={s.id} className="px-2.5 py-1 bg-primary-light text-primary text-xs rounded-full font-medium">{s.name}</span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function UploadModal({ onClose, onSave }: { onClose: () => void; onSave: (item: MediaItem) => void }) {
  const { currentUser, getStudentsForTeacher } = useApp();
  const myStudents = getStudentsForTeacher(currentUser.id);
  const [title, setTitle] = useState("");
  const [event, setEvent] = useState("");
  const [selectedStudents, setSelectedStudents] = useState<string[]>([]);

  const handleSave = () => {
    if (!title || !event || selectedStudents.length === 0) return;
    const newItem: MediaItem = {
      id: `m${Date.now()}`,
      url: "https://images.unsplash.com/photo-1560421683-6856ea585c78?w=400",
      type: "photo",
      title,
      event,
      date: new Date().toISOString().split("T")[0],
      studentIds: selectedStudents,
      uploadedBy: currentUser.id,
    };
    onSave(newItem);
    onClose();
  };

  const toggleStudent = (id: string) => {
    setSelectedStudents((prev) => prev.includes(id) ? prev.filter((s) => s !== id) : [...prev, id]);
  };

  return (
    <div className="fixed inset-0 bg-foreground/40 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-card rounded-2xl max-w-md w-full p-6" onClick={(e) => e.stopPropagation()}>
        <div className="flex justify-between items-center mb-4">
          <h3 className="font-semibold text-lg">Upload Media</h3>
          <button onClick={onClose}><X size={18} /></button>
        </div>
        <div className="space-y-4">
          <div className="border-2 border-dashed border-border rounded-xl p-8 text-center">
            <p className="text-muted-foreground text-sm">Click to upload or drag & drop</p>
            <p className="text-xs text-muted-foreground mt-1">PNG, JPG up to 10MB</p>
          </div>
          <input placeholder="Title" value={title} onChange={(e) => setTitle(e.target.value)} className="w-full px-3 py-2 rounded-lg border border-input bg-background text-sm outline-none focus:ring-2 focus:ring-ring" />
          <input placeholder="Event name" value={event} onChange={(e) => setEvent(e.target.value)} className="w-full px-3 py-2 rounded-lg border border-input bg-background text-sm outline-none focus:ring-2 focus:ring-ring" />
          <div>
            <p className="text-sm font-medium mb-2">Tag Students</p>
            <div className="flex flex-wrap gap-2">
              {myStudents.map((s) => (
                <button key={s.id} onClick={() => toggleStudent(s.id)}
                  className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${
                    selectedStudents.includes(s.id) ? "bg-primary text-primary-foreground" : "bg-secondary text-secondary-foreground"
                  }`}>{s.name}</button>
              ))}
            </div>
          </div>
          <button onClick={handleSave} className="w-full py-2.5 bg-primary text-primary-foreground rounded-lg text-sm font-medium hover:opacity-90 transition-opacity">
            Save
          </button>
        </div>
      </div>
    </div>
  );
}

export default function Gallery() {
  const { currentUser, gallery, setGallery, getChildrenForParent, classes } = useApp();
  const [selectedItem, setSelectedItem] = useState<MediaItem | null>(null);
  const [showUpload, setShowUpload] = useState(false);
  const [filterEvent, setFilterEvent] = useState("");

  let filteredGallery = gallery;

  if (currentUser.role === "parent") {
    const childIds = getChildrenForParent(currentUser.id).map((c) => c.id);
    filteredGallery = gallery.filter((m) => m.studentIds.some((id) => childIds.includes(id)));
  } else if (currentUser.role === "teacher") {
    const myClass = classes.find((c) => c.teacherId === currentUser.id);
    if (myClass) {
      filteredGallery = gallery.filter((m) => m.studentIds.some((id) => myClass.studentIds.includes(id)));
    }
  }

  if (filterEvent) {
    filteredGallery = filteredGallery.filter((m) => m.event === filterEvent);
  }

  const events = [...new Set(filteredGallery.map((m) => m.event))];

  const handleDelete = (id: string) => setGallery((prev) => prev.filter((m) => m.id !== id));
  const handleUpload = (item: MediaItem) => setGallery((prev) => [item, ...prev]);

  return (
    <div>
      <PageHeader
        title="Gallery"
        description={currentUser.role === "parent" ? "Photos of your children" : "Manage media gallery"}
        action={
          <div className="flex gap-2">
            {events.length > 0 && (
              <select value={filterEvent} onChange={(e) => setFilterEvent(e.target.value)}
                className="px-3 py-2 rounded-lg border border-input bg-background text-sm outline-none">
                <option value="">All Events</option>
                {events.map((e) => <option key={e} value={e}>{e}</option>)}
              </select>
            )}
            {currentUser.role === "teacher" && (
              <button onClick={() => setShowUpload(true)} className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-medium hover:opacity-90">
                <Plus size={16} /> Upload
              </button>
            )}
          </div>
        }
      />

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredGallery.map((item) => (
          <div key={item.id} className="bg-card rounded-xl border border-border overflow-hidden group cursor-pointer" onClick={() => setSelectedItem(item)}>
            <div className="relative">
              <img src={item.url} alt={item.title} className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300" />
              {currentUser.role === "admin" && (
                <button onClick={(e) => { e.stopPropagation(); handleDelete(item.id); }}
                  className="absolute top-2 right-2 p-1.5 bg-card/80 rounded-full opacity-0 group-hover:opacity-100 transition-opacity text-destructive">
                  <Trash2 size={14} />
                </button>
              )}
            </div>
            <div className="p-3">
              <p className="text-sm font-medium">{item.title}</p>
              <p className="text-xs text-muted-foreground">{item.event} · {item.date}</p>
            </div>
          </div>
        ))}
      </div>

      {filteredGallery.length === 0 && (
        <div className="text-center py-16 text-muted-foreground">
          <p>No media found</p>
        </div>
      )}

      {selectedItem && <MediaModal item={selectedItem} onClose={() => setSelectedItem(null)} />}
      {showUpload && <UploadModal onClose={() => setShowUpload(false)} onSave={handleUpload} />}
    </div>
  );
}
