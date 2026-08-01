"use client";

import { ChangeEvent, useEffect, useMemo, useRef, useState } from "react";
import { Check, ImagePlus, Images, LockKeyhole, ShieldCheck, Sparkles, UploadCloud, X, XCircle } from "lucide-react";
import { EventRecord, joinGuest, rememberGuestAccessToken, storedGuestAccessToken, uploadGuestPhotos } from "@/lib/api";

const MAX_FILE_SIZE = 25 * 1024 * 1024;
const acceptedPhotoTypes = new Set(["image/jpeg", "image/png", "image/webp", "image/heic", "image/heif"]);

type UploadResult = {
  id: string;
  name: string;
  ok: boolean;
  message: string;
};

export function GuestUpload({ slug, accessToken }: { slug: string; accessToken: string }) {
  const [event, setEvent] = useState<EventRecord | null>(null);
  const [remaining, setRemaining] = useState<number | null>(null);
  const [status, setStatus] = useState("Opening your private upload link…");
  const [busy, setBusy] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [results, setResults] = useState<UploadResult[]>([]);
  const [batchTotal, setBatchTotal] = useState(0);
  const [batchDone, setBatchDone] = useState(0);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [currentUpload, setCurrentUpload] = useState<File | null>(null);
  const [guestName, setGuestName] = useState("");
  const autoJoinAttempted = useRef(false);
  const fileInput = useRef<HTMLInputElement>(null);
  const activeToken = useMemo(() => normalizeToken(accessToken) || storedGuestAccessToken(slug), [accessToken, slug]);

  useEffect(() => {
    if (autoJoinAttempted.current) return;
    autoJoinAttempted.current = true;
    if (!activeToken) {
      setStatus("This upload link is incomplete. Scan the event QR code again.");
      return;
    }
    rememberGuestAccessToken(slug, activeToken);
    void join();
  }, [activeToken, slug]);

  async function join() {
    setBusy(true);
    setStatus("");
    try {
      const out = await joinGuest(slug, activeToken, "");
      if (out.event.guest_experience !== "web_upload") {
        setStatus("This event uses the private app experience. Open its original invitation instead.");
        return;
      }
      setEvent(out.event);
      setGuestName(out.guest_name || "");
      setRemaining(out.remaining_shots);
    } catch (error) {
      setStatus(error instanceof Error ? friendlyUploadError(error.message) : "Unable to open this upload link.");
    } finally {
      setBusy(false);
    }
  }

  function chooseFiles(inputEvent: ChangeEvent<HTMLInputElement>) {
    const incoming = Array.from(inputEvent.target.files || []);
    const availableSlots = remaining ?? event?.max_photos_per_guest ?? 0;
    const valid = incoming.filter((file) => file.size > 0 && file.size <= MAX_FILE_SIZE && isAcceptedPhoto(file));
    const chosen = valid.slice(0, availableSlots);
    setSelectedFiles(chosen);
    setResults([]);
    if (!chosen.length) {
      setStatus(availableSlots <= 0 ? "You’ve shared all the photos allowed for this event." : "Choose JPG, PNG, WebP, HEIC, or HEIF photos up to 25 MB each.");
    } else if (valid.length !== incoming.length) {
      setStatus("Some files were skipped because they were not supported photos or were larger than 25 MB.");
    } else if (incoming.length > chosen.length) {
      setStatus(`You can share ${availableSlots} more ${availableSlots === 1 ? "photo" : "photos"} with this event.`);
    } else {
      setStatus("");
    }
    inputEvent.target.value = "";
  }

  function removeSelected(index: number) {
    setSelectedFiles((files) => files.filter((_, fileIndex) => fileIndex !== index));
  }

  async function uploadSelected() {
    if (!selectedFiles.length || !event || uploading) return;
    const displayName = guestName.trim();
    if (!displayName) {
      setStatus("Enter your name before sharing photos.");
      return;
    }

    const files = selectedFiles.slice(0, remaining ?? event.max_photos_per_guest);
    setUploading(true);
    setStatus("");
    setResults([]);
    setBatchDone(0);
    setBatchTotal(files.length);
    setUploadProgress(0);
    setCurrentUpload(files[0] || null);

    try {
      const out = await uploadGuestPhotos(
        slug,
        activeToken,
        files,
        displayName,
        (file, result) => {
          setResults((current) => [...current, { id: `${file.name}-${crypto.randomUUID()}`, name: file.name, ok: result.ok, message: result.ok ? "Shared" : friendlyUploadError(result.message) }]);
          setBatchDone((value) => value + 1);
          if (result.remaining_shots !== undefined) setRemaining(result.remaining_shots);
        },
        ({ file, percent }) => {
          setCurrentUpload(file);
          setUploadProgress(percent);
        }
      );
      if (out.remaining_shots !== undefined) setRemaining(out.remaining_shots);
    } finally {
      setUploading(false);
      setCurrentUpload(null);
      setSelectedFiles([]);
    }
  }

  if (!event) {
    return (
      <main className="reveal-page grid place-items-center px-6 text-center">
        <img src="/pics/golden-event.jpg" alt="" className="reveal-bg opacity-45" />
        <div className="reveal-vignette" />
        <div className="reveal-dialog relative grid max-w-sm justify-items-center gap-5 p-7">
          <span className="flex h-16 w-16 items-center justify-center rounded-full border border-white/15 bg-white/10">
            <Sparkles className="h-7 w-7" aria-hidden="true" />
          </span>
          <div>
            <p className="reveal-kicker">Private photo sharing</p>
            <h1 className="mt-3 text-3xl font-semibold">{busy ? "Opening…" : "Upload link unavailable"}</h1>
            <p className="mt-3 text-sm leading-6 text-white/60">{status || "Preparing the event upload page."}</p>
          </div>
          {!busy && activeToken ? <button type="button" onClick={() => void join()} className="reveal-light-button">Try again</button> : null}
        </div>
      </main>
    );
  }

  const maxPhotos = event.max_photos_per_guest;
  const shotsRemaining = remaining ?? maxPhotos;
  const uploadedCount = Math.max(maxPhotos - shotsRemaining, 0);
  const canUpload = Boolean(guestName.trim()) && selectedFiles.length > 0 && !uploading && shotsRemaining > 0;
  const successfulUploads = results.filter((result) => result.ok).length;
  const coverURL = event.cover_url || "/pics/golden-event.jpg";

  return (
    <main className="reveal-page">
      <img src={coverURL} alt="" className="reveal-bg" />
      <div className="reveal-vignette" />

      <section className="relative z-10 mx-auto flex min-h-[100svh] w-full max-w-[540px] flex-col px-5 pb-[max(1.5rem,env(safe-area-inset-bottom))] pt-[max(1.25rem,env(safe-area-inset-top))]">
        <header className="flex items-center justify-end">
          <span className="reveal-chip"><LockKeyhole className="h-5 w-5" aria-hidden="true" /> Private upload</span>
        </header>

        <div className="mt-[8vh] sm:mt-[10vh]">
          <p className="reveal-kicker">Share the moments you captured</p>
          <h1 className="mt-3 text-[2.8rem] font-semibold leading-[0.96] min-[390px]:text-[3.35rem]">{event.name}</h1>
          <p className="mt-4 max-w-md text-sm leading-6 text-white/65">
            {(event.description || event.host_message || "Choose one photo or several at once. They’ll be delivered privately to the host.").trim()}
          </p>
        </div>

        <section className="mt-8 grid gap-4 rounded-[2rem] border border-white/10 bg-black/70 p-4 shadow-[0_24px_70px_rgb(0_0_0/0.42)] backdrop-blur-2xl sm:p-5">
          <div className="grid gap-2">
            <label htmlFor="guest-upload-name" className="text-sm font-semibold text-white/85">Your name</label>
            <input
              id="guest-upload-name"
              value={guestName}
              onChange={(inputEvent) => setGuestName(inputEvent.target.value)}
              type="text"
              autoComplete="name"
              maxLength={100}
              placeholder="Enter your name"
              disabled={uploading}
              className="min-h-14 rounded-2xl border border-white/12 bg-black/48 px-4 text-base font-medium text-white outline-none placeholder:text-white/36 focus:border-blue-400/70 focus:ring-4 focus:ring-blue-500/18 disabled:opacity-60"
            />
            <p className="text-xs leading-5 text-white/45">The host will see your name beside the photos you share.</p>
          </div>

          <input
            ref={fileInput}
            type="file"
            accept="image/jpeg,image/png,image/webp,image/heic,image/heif,.jpg,.jpeg,.png,.webp,.heic,.heif"
            multiple
            disabled={uploading || shotsRemaining <= 0}
            onChange={chooseFiles}
            className="sr-only"
            aria-label="Choose photos to share"
          />

          <button
            type="button"
            onClick={() => fileInput.current?.click()}
            disabled={uploading || shotsRemaining <= 0}
            className="group grid min-h-48 place-items-center rounded-[1.5rem] border border-dashed border-white/20 bg-white/[0.055] px-5 py-8 text-center disabled:opacity-45"
          >
            <span>
              <span className="mx-auto flex h-12 w-12 items-center justify-center rounded-full border border-white/12 bg-white/10">
                <ImagePlus className="h-5 w-5 text-white/70" aria-hidden="true" />
              </span>
              <span className="mt-4 block text-sm font-semibold">Choose photos</span>
              <span className="mt-1 block text-xs leading-5 text-white/48">JPG, PNG, WebP, HEIC or HEIF · up to 25 MB each</span>
            </span>
          </button>

          {selectedFiles.length ? (
            <div className="grid gap-2" aria-label="Selected photos">
              {selectedFiles.map((file, index) => (
                <div key={`${file.name}-${file.lastModified}-${index}`} className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/[0.05] p-3">
                  <Images className="h-5 w-5 shrink-0 text-white/55" aria-hidden="true" />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium">{file.name}</p>
                    <p className="mt-0.5 text-xs text-white/42">{formatFileSize(file.size)}</p>
                  </div>
                  <button type="button" disabled={uploading} onClick={() => removeSelected(index)} aria-label={`Remove ${file.name}`} className="rounded-full p-2 text-white/55 hover:bg-white/10 hover:text-white">
                    <X className="h-4 w-4" />
                  </button>
                </div>
              ))}
            </div>
          ) : null}

          {uploading ? (
            <div className="rounded-2xl border border-blue-400/20 bg-blue-500/[0.08] p-4" role="status" aria-live="polite">
              <div className="flex items-center gap-3">
                <UploadCloud className="h-5 w-5 shrink-0 animate-pulse text-blue-200" aria-hidden="true" />
                <div className="min-w-0 flex-1">
                  <div className="flex justify-between gap-3 text-sm font-semibold"><span>Sharing photos</span><span>{uploadProgress}%</span></div>
                  <p className="mt-1 truncate text-xs text-white/48">{currentUpload?.name || `${batchDone} of ${batchTotal} complete`}</p>
                </div>
              </div>
              <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-white/12" role="progressbar" aria-valuemin={0} aria-valuemax={100} aria-valuenow={uploadProgress}>
                <div className="h-full rounded-full bg-blue-500 transition-[width] duration-200" style={{ width: `${uploadProgress}%` }} />
              </div>
              <p className="mt-3 text-xs leading-5 text-white/52">Keep this page open until every photo finishes.</p>
            </div>
          ) : null}

          {results.length ? (
            <div className="grid gap-2" aria-live="polite">
              {results.map((result) => (
                <p key={result.id} className={`reveal-notice justify-start text-left ${result.ok ? "text-emerald-100" : "text-red-100"}`}>
                  {result.ok ? <Check className="h-4 w-4 shrink-0" /> : <XCircle className="h-4 w-4 shrink-0" />}
                  <span className="min-w-0 flex-1 truncate">{result.name}</span>
                  <span className="shrink-0 text-xs text-white/48">{result.message}</span>
                </p>
              ))}
              {!uploading && successfulUploads > 0 ? <p className="text-center text-sm font-semibold text-emerald-100">Your photos were shared with the host.</p> : null}
            </div>
          ) : null}

          {status ? <p className="reveal-notice text-amber-50" role="alert">{status}</p> : null}

          <button type="button" onClick={() => void uploadSelected()} disabled={!canUpload} className="reveal-primary-action w-full">
            <UploadCloud className="h-5 w-5" aria-hidden="true" />
            {uploading ? "Sharing…" : selectedFiles.length ? `Share ${selectedFiles.length} ${selectedFiles.length === 1 ? "photo" : "photos"}` : "Select photos to continue"}
          </button>

          <div className="grid grid-cols-2 gap-3">
            <UploadMetric icon={<Images className="h-5 w-5" />} label="Shared" value={uploadedCount} />
            <UploadMetric icon={<ShieldCheck className="h-5 w-5" />} label="Remaining" value={shotsRemaining} />
          </div>
        </section>

        <p className="mx-auto mt-5 max-w-sm text-center text-xs leading-5 text-white/38">Original-quality photos are sent securely and are visible only to the event host.</p>
      </section>
    </main>
  );
}

function UploadMetric({ icon, label, value }: { icon: React.ReactNode; label: string; value: number }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.055] p-4">
      <div className="flex items-center justify-between gap-3 text-white/54">{icon}<span className="text-[0.65rem] font-semibold uppercase">{label}</span></div>
      <p className="mt-3 text-3xl leading-none">{value}</p>
    </div>
  );
}

function isAcceptedPhoto(file: File) {
  return acceptedPhotoTypes.has(file.type) || /\.(jpe?g|png|webp|heic|heif)$/i.test(file.name);
}

function normalizeToken(value: string) {
  const trimmed = value.trim();
  if (!trimmed) return "";
  try {
    const url = new URL(trimmed);
    return url.searchParams.get("t") ?? url.searchParams.get("token") ?? trimmed;
  } catch {
    return trimmed;
  }
}

function friendlyUploadError(message: string) {
  const normalized = message.toLowerCase();
  if (normalized.includes("event_not_started") || normalized.includes("not started")) return "This event has not started yet. Come back when the celebration begins.";
  if (normalized.includes("event_ended") || normalized.includes("has ended")) return "Photo sharing has closed for this event.";
  if (normalized.includes("event_locked") || normalized.includes("not open")) return "The host has paused photo sharing for now.";
  if (normalized.includes("upload_limit") || normalized.includes("photo limit")) return "You’ve shared all the photos allowed for this event.";
  if (normalized.includes("unauthorized")) return "This upload link is invalid or incomplete. Scan the event QR code again.";
  return message;
}

function formatFileSize(bytes: number) {
  if (bytes < 1024 * 1024) return `${Math.max(1, Math.round(bytes / 1024))} KB`;
  return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
}
