import { useCallback, useEffect, useRef, useState } from "react";
import { useApp } from "@/context/AppContext";
import { useResolvedAvatarUrl } from "@/hooks/useResolvedAvatarUrl";
import { PageHeader } from "@/components/ui-custom/SharedComponents";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Eye, EyeOff, ImagePlus, Loader2, Trash2, Upload } from "lucide-react";
import { toast } from "sonner";

const MAX_BYTES = 5 * 1024 * 1024;
const ACCEPT = "image/jpeg,image/png,image/webp,image/gif";

function pickImageFile(list: FileList | null): File | null {
  if (!list?.length) return null;
  for (let i = 0; i < list.length; i++) {
    const f = list[i];
    if (f.type.startsWith("image/")) return f;
  }
  return null;
}

export default function Settings() {
  const { currentUser, updateProfile, uploadAvatarImage } = useApp();
  const resolvedAvatar = useResolvedAvatarUrl(currentUser);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [saving, setSaving] = useState(false);
  /** Uploaded to S3; persisted when user saves profile */
  const [pendingS3Key, setPendingS3Key] = useState<string | null>(null);
  const [localPreviewUrl, setLocalPreviewUrl] = useState<string | null>(null);
  const [removeOnSave, setRemoveOnSave] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!currentUser) return;
    setName(currentUser.name ?? "");
    setEmail(currentUser.email ?? "");
  }, [currentUser?.id, currentUser?.name, currentUser?.email]);

  useEffect(() => {
    return () => {
      if (localPreviewUrl?.startsWith("blob:")) {
        URL.revokeObjectURL(localPreviewUrl);
      }
    };
  }, [localPreviewUrl]);

  const clearLocalPreview = useCallback(() => {
    setLocalPreviewUrl((prev) => {
      if (prev?.startsWith("blob:")) URL.revokeObjectURL(prev);
      return null;
    });
  }, []);

  const processImageFile = useCallback(
    async (file: File) => {
      if (!file.type.startsWith("image/")) {
        toast.error("Please use an image file (JPEG, PNG, WebP, or GIF).");
        return;
      }
      if (file.size > MAX_BYTES) {
        toast.error("Image must be 5 MB or smaller.");
        return;
      }
      setRemoveOnSave(false);
      setUploadingPhoto(true);
      const result = await uploadAvatarImage(file);
      setUploadingPhoto(false);
      if (!result.ok) {
        toast.error(result.message);
        return;
      }
      clearLocalPreview();
      const blobUrl = URL.createObjectURL(file);
      setLocalPreviewUrl(blobUrl);
      setPendingS3Key(result.s3Key);
      toast.success("Photo uploaded — save your profile to keep it.");
    },
    [uploadAvatarImage, clearLocalPreview],
  );

  const onDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setDragOver(false);
      const file = pickImageFile(e.dataTransfer.files);
      if (file) void processImageFile(file);
      else toast.error("Drop an image file here.");
    },
    [processImageFile],
  );

  if (!currentUser) return null;

  const displayPhoto = localPreviewUrl || (removeOnSave ? null : resolvedAvatar);

  const roleLabel =
    currentUser.role === "parent"
      ? "Parent"
      : currentUser.role === "teacher"
        ? "Teacher"
        : "Administrator";

  const handleRemovePhoto = () => {
    setPendingS3Key(null);
    clearLocalPreview();
    setRemoveOnSave(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentPassword.trim()) {
      toast.error("Enter your current password to save changes.");
      return;
    }
    if (newPassword || confirmPassword) {
      if (newPassword.length < 6) {
        toast.error("New password must be at least 6 characters.");
        return;
      }
      if (newPassword !== confirmPassword) {
        toast.error("New password and confirmation do not match.");
        return;
      }
    }

    setSaving(true);
    const result = await updateProfile({
      currentPassword: currentPassword,
      name: name.trim(),
      email: email.trim(),
      ...(newPassword.trim() ? { newPassword: newPassword.trim() } : {}),
      ...(removeOnSave ? { removeAvatar: true } : {}),
      ...(!removeOnSave && pendingS3Key ? { avatarS3Key: pendingS3Key } : {}),
    });
    setSaving(false);

    if (!result.ok) {
      toast.error(result.error);
      return;
    }
    toast.success("Profile saved");
    setCurrentPassword("");
    setNewPassword("");
    setConfirmPassword("");
    setPendingS3Key(null);
    setRemoveOnSave(false);
    clearLocalPreview();
  };

  const inputWrap = "space-y-2";
  const pwdBtn =
    "absolute right-2 top-1/2 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-lg text-dash-muted hover:bg-dash-canvas hover:text-dash-ink";

  return (
    <div className="dashboard-modern -mx-4 -mt-1 mb-8 rounded-[32px] bg-dash-canvas px-4 py-8 sm:px-6 lg:-mx-8 lg:px-8">
      <PageHeader title="Settings" description={`Profile & password · ${roleLabel}`} />

      <form onSubmit={handleSubmit} className="mx-auto max-w-xl space-y-8">
        <div className="rounded-[28px] border border-dash-subtle bg-dash-surface p-6 shadow-sm sm:p-8">
          <h2 className="text-base font-bold text-dash-ink">Profile</h2>
          <p className="mt-1 text-sm text-dash-muted">
            Your name and profile photo — images use the same school gallery S3 bucket as class photos.
          </p>

          <div className="mt-6 space-y-5">
            <div>
              <Label className="mb-2 block">Profile photo</Label>
              <div
                role="button"
                tabIndex={0}
                onDragEnter={(e) => {
                  e.preventDefault();
                  setDragOver(true);
                }}
                onDragLeave={(e) => {
                  e.preventDefault();
                  if (!e.currentTarget.contains(e.relatedTarget as Node)) setDragOver(false);
                }}
                onDragOver={(e) => {
                  e.preventDefault();
                  e.dataTransfer.dropEffect = "copy";
                }}
                onDrop={onDrop}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    fileInputRef.current?.click();
                  }
                }}
                onClick={() => !uploadingPhoto && fileInputRef.current?.click()}
                className={cn(
                  "relative flex min-h-[180px] cursor-pointer flex-col items-center justify-center gap-3 rounded-[24px] border-2 border-dashed px-4 py-8 text-center transition-colors outline-none focus-visible:ring-2 focus-visible:ring-dash-ink/20",
                  dragOver ? "border-dash-ink bg-dash-lime/15" : "border-dash-subtle bg-dash-canvas/60 hover:border-dash-ring hover:bg-dash-canvas",
                  uploadingPhoto && "pointer-events-none opacity-60",
                )}
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  accept={ACCEPT}
                  className="sr-only"
                  aria-label="Choose profile photo"
                  onChange={(e) => {
                    const file = pickImageFile(e.target.files);
                    e.target.value = "";
                    if (file) void processImageFile(file);
                  }}
                />
                {uploadingPhoto ? (
                  <Loader2 className="h-10 w-10 animate-spin text-dash-muted" aria-hidden />
                ) : displayPhoto ? (
                  <img
                    src={displayPhoto}
                    alt=""
                    className="max-h-36 max-w-[220px] rounded-2xl object-cover shadow-md ring-1 ring-black/5"
                  />
                ) : (
                  <>
                    <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-dash-lime/40 text-dash-ink">
                      <ImagePlus className="h-7 w-7" strokeWidth={1.75} aria-hidden />
                    </div>
                    <div>
                      <p className="text-sm font-bold text-dash-ink">Drag and drop a photo here</p>
                      <p className="mt-1 text-xs text-dash-muted">or click to browse · JPEG, PNG, WebP, or GIF · max 5 MB</p>
                    </div>
                  </>
                )}
              </div>
              <div className="mt-3 flex flex-wrap gap-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  disabled={uploadingPhoto}
                  className="rounded-full border-dash-subtle"
                  onClick={(e) => {
                    e.stopPropagation();
                    fileInputRef.current?.click();
                  }}
                >
                  <Upload className="mr-1.5 h-4 w-4" aria-hidden />
                  Choose file
                </Button>
                {(displayPhoto || currentUser.avatarS3Key || currentUser.avatar) && (
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    disabled={uploadingPhoto}
                    className="rounded-full border-dash-subtle text-red-600 hover:bg-red-50"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleRemovePhoto();
                    }}
                  >
                    <Trash2 className="mr-1.5 h-4 w-4" aria-hidden />
                    Remove photo
                  </Button>
                )}
              </div>
              {pendingS3Key && !removeOnSave && (
                <p className="mt-2 text-xs font-medium text-amber-800">Remember to save your profile to keep this photo.</p>
              )}
              {removeOnSave && (
                <p className="mt-2 text-xs font-medium text-dash-muted">Save changes to remove your profile photo.</p>
              )}
            </div>

            <div className={inputWrap}>
              <Label htmlFor="settings-name">Display name</Label>
              <Input
                id="settings-name"
                autoComplete="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="min-h-[44px] rounded-2xl border-dash-subtle bg-dash-canvas"
                required
              />
            </div>
            <div className={inputWrap}>
              <Label htmlFor="settings-email">Email</Label>
              <Input
                id="settings-email"
                type="email"
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="min-h-[44px] rounded-2xl border-dash-subtle bg-dash-canvas"
                required
              />
            </div>
          </div>
        </div>

        <div className="rounded-[28px] border border-dash-subtle bg-dash-surface p-6 shadow-sm sm:p-8">
          <h2 className="text-base font-bold text-dash-ink">Password</h2>
          <p className="mt-1 text-sm text-dash-muted">
            Your current password is required to save profile changes or set a new password.
          </p>
          <div className="mt-6 space-y-5">
            <div className={inputWrap}>
              <Label htmlFor="settings-current-pw">Current password</Label>
              <div className="relative">
                <Input
                  id="settings-current-pw"
                  type={showCurrent ? "text" : "password"}
                  autoComplete="current-password"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  className="min-h-[44px] rounded-2xl border-dash-subtle bg-dash-canvas pr-11"
                />
                <button type="button" className={pwdBtn} onClick={() => setShowCurrent(!showCurrent)} aria-label="Toggle visibility">
                  {showCurrent ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>
            <div className={inputWrap}>
              <Label htmlFor="settings-new-pw">New password (optional)</Label>
              <div className="relative">
                <Input
                  id="settings-new-pw"
                  type={showNew ? "text" : "password"}
                  autoComplete="new-password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="min-h-[44px] rounded-2xl border-dash-subtle bg-dash-canvas pr-11"
                  placeholder="Leave blank to keep current"
                />
                <button type="button" className={pwdBtn} onClick={() => setShowNew(!showNew)} aria-label="Toggle visibility">
                  {showNew ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>
            <div className={inputWrap}>
              <Label htmlFor="settings-confirm-pw">Confirm new password</Label>
              <div className="relative">
                <Input
                  id="settings-confirm-pw"
                  type={showConfirm ? "text" : "password"}
                  autoComplete="new-password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="min-h-[44px] rounded-2xl border-dash-subtle bg-dash-canvas pr-11"
                />
                <button type="button" className={pwdBtn} onClick={() => setShowConfirm(!showConfirm)} aria-label="Toggle visibility">
                  {showConfirm ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>
          </div>
        </div>

        <Button
          type="submit"
          disabled={saving}
          className="flex min-h-[48px] w-full items-center justify-center gap-2 rounded-full bg-dash-ink text-sm font-bold text-white hover:bg-dash-ink/90 sm:w-auto sm:min-w-[200px]"
        >
          {saving ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin shrink-0" aria-hidden />
              Saving…
            </>
          ) : (
            "Save changes"
          )}
        </Button>
      </form>
    </div>
  );
}
