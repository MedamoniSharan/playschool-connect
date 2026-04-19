import { useState, useRef, useCallback } from "react";
import { useApp } from "@/context/AppContext";
import { PageHeader } from "@/components/ui-custom/SharedComponents";
import { X, Plus, Trash2, ImagePlus, Upload, CheckCircle2, AlertCircle, Loader2, FileImage } from "lucide-react";
import { MediaItem } from "@/types";
import { toast } from "sonner";

/* ─── Media Detail Modal ─── */
function MediaModal({ item, onClose }: { item: MediaItem; onClose: () => void }) {
  const { students: allStudents } = useApp();
  const tagged = allStudents.filter((s) => item.studentIds.includes(s.id));
  return (
    <div className="fixed inset-0 bg-foreground/40 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-dash-surface rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden animate-in fade-in zoom-in-95 duration-200" onClick={(e) => e.stopPropagation()}>
        <div className="relative">
          <img src={item.url} alt={item.title} className="w-full h-64 sm:h-80 object-cover" />
          <button onClick={onClose} className="absolute top-3 right-3 p-1.5 bg-dash-surface/80 rounded-full backdrop-blur-sm hover:bg-dash-surface transition-colors">
            <X size={18} />
          </button>
        </div>
        <div className="p-5">
          <h3 className="font-semibold text-lg">{item.title}</h3>
          <p className="text-sm text-dash-muted mt-1">{item.event} · {item.date}</p>
          <div className="flex flex-wrap gap-2 mt-3">
            {tagged.map((s) => (
              <span key={s.id} className="px-2.5 py-1 bg-primary-light text-dash-lime-deep text-xs rounded-full font-medium">{s.name}</span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

/* ─── File Preview Item ─── */
interface FilePreviewProps {
  file: File;
  status: "pending" | "uploading" | "done" | "error";
  progress: number;
  onRemove: () => void;
}

function FilePreview({ file, status, progress, onRemove }: FilePreviewProps) {
  const previewUrl = URL.createObjectURL(file);
  const sizeMB = (file.size / (1024 * 1024)).toFixed(1);

  return (
    <div className="flex items-center gap-3 p-3 bg-dash-canvas rounded-2xl border border-dash-subtle group">
      <img src={previewUrl} alt={file.name} className="w-14 h-14 rounded-xl object-cover flex-shrink-0" />
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium truncate">{file.name}</p>
        <p className="text-xs text-dash-muted">{sizeMB} MB</p>
        {status === "uploading" && (
          <div className="mt-1.5 h-1.5 bg-dash-subtle rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-emerald-400 to-emerald-500 rounded-full transition-all duration-300 ease-out"
              style={{ width: `${progress}%` }}
            />
          </div>
        )}
        {status === "done" && (
          <p className="text-xs text-emerald-500 mt-1 flex items-center gap-1">
            <CheckCircle2 size={12} /> Uploaded
          </p>
        )}
        {status === "error" && (
          <p className="text-xs text-red-500 mt-1 flex items-center gap-1">
            <AlertCircle size={12} /> Failed
          </p>
        )}
      </div>
      <div className="flex items-center gap-1.5">
        {status === "uploading" && <Loader2 size={16} className="animate-spin text-dash-muted" />}
        {(status === "pending" || status === "error") && (
          <button onClick={onRemove} className="p-1.5 rounded-full hover:bg-dash-subtle transition-colors text-dash-muted hover:text-destructive">
            <X size={14} />
          </button>
        )}
      </div>
    </div>
  );
}

/* ─── Upload Modal ─── */
interface FileEntry {
  file: File;
  status: "pending" | "uploading" | "done" | "error";
  progress: number;
}

function UploadModal({ onClose }: { onClose: () => void }) {
  const { currentUser, getStudentsForTeacher, uploadGalleryImage } = useApp();
  const myStudents = currentUser ? getStudentsForTeacher(currentUser.id) : [];
  const [title, setTitle] = useState("");
  const [event, setEvent] = useState("");
  const [selectedStudents, setSelectedStudents] = useState<string[]>([]);
  const [files, setFiles] = useState<FileEntry[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10 MB
  const ACCEPTED_TYPES = ["image/jpeg", "image/png", "image/gif", "image/webp"];

  const validateAndAddFiles = useCallback((incoming: FileList | File[]) => {
    const newFiles: FileEntry[] = [];
    for (const f of Array.from(incoming)) {
      if (!ACCEPTED_TYPES.includes(f.type)) {
        toast.error(`"${f.name}" is not a supported image format`);
        continue;
      }
      if (f.size > MAX_FILE_SIZE) {
        toast.error(`"${f.name}" exceeds 10 MB limit`);
        continue;
      }
      // Skip duplicates
      if (files.some((e) => e.file.name === f.name && e.file.size === f.size)) continue;
      newFiles.push({ file: f, status: "pending", progress: 0 });
    }
    if (newFiles.length > 0) setFiles((prev) => [...prev, ...newFiles]);
  }, [files]);

  const handleDragOver = (e: React.DragEvent) => { e.preventDefault(); setIsDragging(true); };
  const handleDragLeave = (e: React.DragEvent) => { e.preventDefault(); setIsDragging(false); };
  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files.length > 0) validateAndAddFiles(e.dataTransfer.files);
  };

  const removeFile = (idx: number) => setFiles((prev) => prev.filter((_, i) => i !== idx));

  const toggleStudent = (id: string) => {
    setSelectedStudents((prev) => prev.includes(id) ? prev.filter((s) => s !== id) : [...prev, id]);
  };

  const handleUpload = async () => {
    if (!currentUser || !title || !event || files.length === 0) {
      toast.error("Please fill in all fields and add at least one image");
      return;
    }

    setIsUploading(true);

    for (let i = 0; i < files.length; i++) {
      const entry = files[i];
      if (entry.status === "done") continue;

      // Mark as uploading
      setFiles((prev) => prev.map((f, idx) => idx === i ? { ...f, status: "uploading", progress: 10 } : f));

      // Simulate progress ticks while the upload runs
      const progressInterval = setInterval(() => {
        setFiles((prev) => prev.map((f, idx) => {
          if (idx !== i || f.status !== "uploading") return f;
          return { ...f, progress: Math.min(f.progress + 15, 85) };
        }));
      }, 300);

      const result = await uploadGalleryImage(entry.file, title, event, selectedStudents);
      clearInterval(progressInterval);

      if (result.ok) {
        setFiles((prev) => prev.map((f, idx) => idx === i ? { ...f, status: "done", progress: 100 } : f));
        toast.success(`"${entry.file.name}" uploaded successfully`);
      } else {
        setFiles((prev) => prev.map((f, idx) => idx === i ? { ...f, status: "error", progress: 0 } : f));
        toast.error(result.message || `Failed to upload "${entry.file.name}"`);
      }
    }

    setIsUploading(false);

    // Auto-close after a brief pause if all succeeded
    const allDone = files.every((f) => f.status === "done");
    if (allDone) setTimeout(onClose, 800);
  };

  const pendingCount = files.filter((f) => f.status === "pending").length;
  const doneCount = files.filter((f) => f.status === "done").length;

  return (
    <div className="fixed inset-0 bg-foreground/40 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-dash-surface rounded-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto animate-in fade-in zoom-in-95 duration-200" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="flex justify-between items-center p-6 pb-0">
          <div>
            <h3 className="font-semibold text-lg">Upload Photos</h3>
            <p className="text-xs text-dash-muted mt-0.5">Drag & drop or click to select images</p>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-full hover:bg-dash-canvas transition-colors">
            <X size={18} />
          </button>
        </div>

        <div className="p-6 space-y-4">
          {/* Drop zone */}
          <div
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
            className={`relative border-2 border-dashed rounded-2xl p-8 text-center cursor-pointer transition-all duration-200 flex flex-col items-center gap-3
              ${isDragging
                ? "border-emerald-400 bg-emerald-50/10 scale-[1.02]"
                : "border-dash-subtle hover:border-dash-muted hover:bg-dash-canvas/50"
              }`}
          >
            <div className={`flex h-14 w-14 items-center justify-center rounded-2xl transition-colors duration-200 ${
              isDragging ? "bg-emerald-500/15 text-emerald-500" : "bg-dash-canvas text-dash-lime-deep"
            }`}>
              <ImagePlus size={26} strokeWidth={1.8} aria-hidden />
            </div>
            <div>
              <p className="text-sm font-medium">
                {isDragging ? "Drop images here" : "Click to browse or drag & drop"}
              </p>
              <p className="text-xs text-dash-muted mt-1">PNG, JPG, GIF, WebP · Max 10 MB each</p>
            </div>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              multiple
              className="hidden"
              onChange={(e) => { if (e.target.files) validateAndAddFiles(e.target.files); e.target.value = ""; }}
            />
          </div>

          {/* File previews */}
          {files.length > 0 && (
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <p className="text-sm font-medium flex items-center gap-1.5">
                  <FileImage size={14} className="text-dash-muted" />
                  {files.length} file{files.length > 1 ? "s" : ""} selected
                  {doneCount > 0 && <span className="text-emerald-500 text-xs ml-1">({doneCount} uploaded)</span>}
                </p>
                {pendingCount > 0 && !isUploading && (
                  <button onClick={() => setFiles([])} className="text-xs text-dash-muted hover:text-destructive transition-colors">
                    Clear all
                  </button>
                )}
              </div>
              <div className="space-y-2 max-h-40 overflow-y-auto pr-1">
                {files.map((entry, idx) => (
                  <FilePreview
                    key={`${entry.file.name}-${idx}`}
                    file={entry.file}
                    status={entry.status}
                    progress={entry.progress}
                    onRemove={() => removeFile(idx)}
                  />
                ))}
              </div>
            </div>
          )}

          {/* Title & Event */}
          <div className="grid grid-cols-2 gap-3">
            <input
              placeholder="Title *"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-input bg-background text-sm outline-none focus:ring-2 focus:ring-ring transition-shadow"
            />
            <input
              placeholder="Event name *"
              value={event}
              onChange={(e) => setEvent(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-input bg-background text-sm outline-none focus:ring-2 focus:ring-ring transition-shadow"
            />
          </div>

          {/* Tag Students */}
          {myStudents.length > 0 && (
            <div>
              <p className="text-sm font-medium mb-2">Tag Students</p>
              <div className="flex flex-wrap gap-2">
                {myStudents.map((s) => (
                  <button key={s.id} onClick={() => toggleStudent(s.id)}
                    className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all duration-150 ${
                      selectedStudents.includes(s.id)
                        ? "bg-dash-ink text-white shadow-md shadow-dash-ink/20 scale-[1.02]"
                        : "bg-dash-canvas text-dash-ink hover:bg-dash-subtle"
                    }`}>{s.name}</button>
                ))}
              </div>
            </div>
          )}

          {/* Upload button */}
          <button
            onClick={handleUpload}
            disabled={isUploading || files.length === 0 || !title || !event}
            className="w-full py-3 bg-dash-ink text-white shadow-md shadow-dash-ink/20 rounded-xl text-sm font-semibold hover:opacity-90 transition-all duration-150 disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {isUploading ? (
              <><Loader2 size={16} className="animate-spin" /> Uploading...</>
            ) : (
              <><Upload size={16} /> Upload {files.length > 0 ? `${files.length} Image${files.length > 1 ? "s" : ""}` : ""}</>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

/* ─── Gallery Page ─── */
export default function Gallery() {
  const { currentUser, gallery, setGallery, getChildrenForParent, classes } = useApp();
  const [selectedItem, setSelectedItem] = useState<MediaItem | null>(null);
  const [showUpload, setShowUpload] = useState(false);
  const [filterEvent, setFilterEvent] = useState("");

  if (!currentUser) return null;

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

  const canUpload = currentUser.role === "teacher" || currentUser.role === "admin";

  return (
    <div>
      <PageHeader
        title="Gallery"
        description={currentUser.role === "parent" ? "Photos of your children" : "Manage media gallery"}
        action={
          <div className="flex gap-2">
            {events.length > 0 && (
              <select value={filterEvent} onChange={(e) => setFilterEvent(e.target.value)}
                className="px-3 py-2 rounded-[16px] border border-input bg-background text-sm outline-none">
                <option value="">All Events</option>
                {events.map((e) => <option key={e} value={e}>{e}</option>)}
              </select>
            )}
            {canUpload && (
              <button onClick={() => setShowUpload(true)} className="flex items-center gap-2 px-4 py-2 bg-dash-ink text-white shadow-md shadow-dash-ink/20 rounded-[16px] text-sm font-medium hover:opacity-90 transition-opacity">
                <Plus size={16} /> Upload
              </button>
            )}
          </div>
        }
      />

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredGallery.map((item) => (
          <div key={item.id} className="bg-dash-surface rounded-[24px] border border-dash-subtle overflow-hidden group cursor-pointer" onClick={() => setSelectedItem(item)}>
            <div className="relative">
              <img src={item.url} alt={item.title} className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300" />
              {currentUser.role === "admin" && (
                <button onClick={(e) => { e.stopPropagation(); handleDelete(item.id); }}
                  className="absolute top-2 right-2 p-1.5 bg-dash-surface/80 rounded-full opacity-0 group-hover:opacity-100 transition-opacity text-destructive">
                  <Trash2 size={14} />
                </button>
              )}
            </div>
            <div className="p-3">
              <p className="text-sm font-medium">{item.title}</p>
              <p className="text-xs text-dash-muted">{item.event} · {item.date}</p>
            </div>
          </div>
        ))}
      </div>

      {filteredGallery.length === 0 && (
        <div className="text-center py-16 text-dash-muted">
          <div className="flex flex-col items-center gap-3">
            <div className="h-16 w-16 rounded-2xl bg-dash-canvas flex items-center justify-center">
              <ImagePlus size={28} className="text-dash-muted" />
            </div>
            <div>
              <p className="font-medium">No media found</p>
              {canUpload && <p className="text-sm mt-1">Upload your first photo to get started</p>}
            </div>
          </div>
        </div>
      )}

      {selectedItem && <MediaModal item={selectedItem} onClose={() => setSelectedItem(null)} />}
      {showUpload && <UploadModal onClose={() => setShowUpload(false)} />}
    </div>
  );
}
