import { useState, type FormEvent } from "react";
import { usePersona } from "../PersonaContext";
import type { Persona } from "../personas";

type PersonaFormState = {
  userName: string;
  bio: string;
  avatarUrl?: string;
};

const MAX_AVATAR_BYTES = 200 * 1024;
const AVATAR_SIZE = 128;

async function createAvatarDataUrl(file: File): Promise<string> {
  const url = URL.createObjectURL(file);
  try {
    const image = await new Promise<HTMLImageElement>((resolve, reject) => {
      const img = new Image();
      img.onload = () => resolve(img);
      img.onerror = (error) => reject(error);
      img.src = url;
    });
    const canvas = document.createElement("canvas");
    canvas.width = AVATAR_SIZE;
    canvas.height = AVATAR_SIZE;
    const ctx = canvas.getContext("2d");
    if (!ctx) {
      throw new Error("Canvas not supported");
    }
    const minSide = Math.min(image.width, image.height);
    const sx = (image.width - minSide) / 2;
    const sy = (image.height - minSide) / 2;
    ctx.save();
    ctx.beginPath();
    ctx.arc(AVATAR_SIZE / 2, AVATAR_SIZE / 2, AVATAR_SIZE / 2, 0, Math.PI * 2);
    ctx.closePath();
    ctx.clip();
    ctx.drawImage(image, sx, sy, minSide, minSide, 0, 0, AVATAR_SIZE, AVATAR_SIZE);
    ctx.restore();
    return canvas.toDataURL("image/png");
  } finally {
    URL.revokeObjectURL(url);
  }
}

export function UsersPanel() {
  const {
    personas,
    activePersona,
    setActivePersona,
    status,
    error,
    createPersona,
    updatePersona,
    deletePersona,
  } = usePersona();
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formState, setFormState] = useState<PersonaFormState>({
    userName: "",
    bio: "",
    avatarUrl: "",
  });
  const [avatarPreview, setAvatarPreview] = useState<string | undefined>();
  const [formError, setFormError] = useState<string | undefined>();
  const [saving, setSaving] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | undefined>();

  const resetForm = () => {
    setEditingId(null);
    setFormState({ userName: "", bio: "", avatarUrl: "" });
    setAvatarPreview(undefined);
    setFormError(undefined);
    setSuccessMessage(undefined);
  };

  const beginEdit = (persona: Persona) => {
    setEditingId(persona.userId);
    setFormState({
      userName: persona.userName,
      bio: persona.bio ?? "",
      avatarUrl: persona.avatarUrl,
    });
    setAvatarPreview(persona.avatarUrl);
    setFormError(undefined);
    setSuccessMessage(undefined);
  };

  const submitForm = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!formState.userName.trim()) {
      setFormError("Display name is required");
      return;
    }
    setSaving(true);
    setFormError(undefined);
    try {
      if (editingId) {
        await updatePersona(editingId, {
          userName: formState.userName.trim(),
          bio: formState.bio?.trim(),
          avatarUrl: avatarPreview ?? formState.avatarUrl,
        });
        setSuccessMessage("Persona updated");
      } else {
        await createPersona({
          userName: formState.userName.trim(),
          bio: formState.bio?.trim(),
          avatarUrl: avatarPreview ?? formState.avatarUrl,
        });
        setSuccessMessage("Persona created");
      }
      resetForm();
    } catch (err) {
      setFormError(err instanceof Error ? err.message : "Failed to save persona");
    } finally {
      setSaving(false);
    }
  };

  const handleAvatarChange = async (file: File | undefined) => {
    if (!file) {
      setAvatarPreview(undefined);
      setFormState((prev) => ({ ...prev, avatarUrl: "" }));
      return;
    }
    if (!["image/png", "image/jpeg", "image/jpg"].includes(file.type)) {
      setFormError("Avatar must be a PNG or JPEG image");
      return;
    }
    if (file.size > MAX_AVATAR_BYTES) {
      setFormError("Avatar must be ≤ 200 KB");
      return;
    }
    try {
      const dataUrl = await createAvatarDataUrl(file);
      setAvatarPreview(dataUrl);
      setFormState((prev) => ({ ...prev, avatarUrl: dataUrl }));
      setFormError(undefined);
    } catch (err) {
      setFormError(
        err instanceof Error ? err.message : "Failed to process avatar image"
      );
    }
  };

  const handleDelete = async (persona: Persona) => {
    if (!confirm(`Delete ${persona.userName}? This cannot be undone.`)) {
      return;
    }
    try {
      await deletePersona(persona.userId);
    } catch (err) {
      alert(err instanceof Error ? err.message : "Failed to delete persona");
    }
  };

  return (
    <section className="rounded-3xl border border-slate-500/30 bg-white/70 px-5 py-5 space-y-5">
      <header className="flex flex-col gap-1 border-b border-slate-500/30 pb-4">
        <h3 className="font-display text-lg uppercase tracking-wide">Users</h3>
        <p className="text-sm text-slate-700">
          Create or edit personas used throughout TulipBroker. Upload 128×128 tulip-themed avatars
          to keep the UI lively.
        </p>
        <p className="text-xs uppercase tracking-[0.25em] text-slate-500">
          Status:{" "}
          {status === "ready"
            ? "Synced"
            : status === "loading"
            ? "Loading…"
            : status === "error"
            ? "Offline (using seeds)"
            : "Idle"}
        </p>
        {error && (
          <p className="text-xs uppercase tracking-[0.3em] text-tulip-red">API error: {error}</p>
        )}
      </header>

      <div className="grid gap-3">
        {personas.map((persona) => {
          const isActive = persona.userId === activePersona.userId;
          return (
            <article
              key={persona.userId}
              className="flex flex-wrap items-center justify-between gap-4 rounded-3xl border border-slate-400/40 bg-white/80 px-4 py-3"
            >
              <div className="flex items-center gap-3">
                {persona.avatarUrl ? (
                  <img
                    src={persona.avatarUrl}
                    alt={`${persona.userName} avatar`}
                    className="h-12 w-12 rounded-full object-cover"
                  />
                ) : (
                  <div className="flex h-12 w-12 items-center justify-center rounded-full border border-slate-300 text-sm font-semibold uppercase tracking-[0.25em] text-slate-500">
                    {persona.userName.charAt(0).toUpperCase()}
                  </div>
                )}
                <div>
                  <p className="font-semibold text-lg">{persona.userName}</p>
                  {persona.bio ? (
                    <p className="text-sm text-slate-600">{persona.bio}</p>
                  ) : (
                    <p className="text-xs uppercase tracking-[0.25em] text-slate-400">
                      {persona.userId}
                    </p>
                  )}
                </div>
              </div>
              <div className="flex flex-wrap gap-2">
                {isActive ? (
                  <span className="rounded-full bg-tulip-green/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.3em] text-tulip-green">
                    Active
                  </span>
                ) : (
                  <button
                    type="button"
                    className="rounded-full border border-slate-400/60 px-3 py-1 text-xs font-semibold uppercase tracking-[0.3em] text-slate-700 hover:border-slate-600"
                    onClick={() => setActivePersona(persona)}
                  >
                    Set active
                  </button>
                )}
                <button
                  type="button"
                  className="rounded-full border border-slate-400/60 px-3 py-1 text-xs font-semibold uppercase tracking-[0.3em] text-slate-700 hover:border-slate-600"
                  onClick={() => beginEdit(persona)}
                >
                  Edit
                </button>
                <button
                  type="button"
                  className="rounded-full border border-tulip-red/40 px-3 py-1 text-xs font-semibold uppercase tracking-[0.3em] text-tulip-red hover:border-tulip-red"
                  onClick={() => handleDelete(persona)}
                  disabled={personas.length <= 1}
                >
                  Remove
                </button>
              </div>
            </article>
          );
        })}
      </div>

      <div className="rounded-3xl border border-slate-400/40 bg-white/90 px-4 py-4">
        <div className="flex items-center justify-between">
          <h4 className="font-display text-base uppercase tracking-wide">
            {editingId ? "Edit user" : "Add new user"}
          </h4>
          {editingId && (
            <button
              type="button"
              onClick={resetForm}
              className="text-xs font-semibold uppercase tracking-[0.3em] text-slate-500 hover:text-slate-700"
            >
              Cancel edit
            </button>
          )}
        </div>
        <p className="text-sm text-slate-600">
          Upload a PNG/JPEG (≤200 KB). We recommend using DALL·E / Midjourney prompts such as
          “cartoon portrait of Carolus Clusius holding a tulip bulb, flat pastel background” to
          keep the style consistent.
        </p>
        <form className="mt-4 grid gap-4" onSubmit={submitForm}>
          <label className="grid gap-2 text-sm font-semibold text-slate-600 uppercase tracking-[0.25em]">
            Display name
            <input
              className="rounded-2xl border border-slate-400/60 px-3 py-2 text-base font-semibold text-navy-900 focus:border-navy-900 focus:outline-none"
              value={formState.userName}
              onChange={(event) =>
                setFormState((prev) => ({ ...prev, userName: event.target.value }))
              }
              placeholder="Maria van Oosterwijck"
            />
          </label>
          <label className="grid gap-2 text-sm font-semibold text-slate-600 uppercase tracking-[0.25em]">
            Bio / note
            <textarea
              className="rounded-2xl border border-slate-400/60 px-3 py-2 text-sm text-navy-900 focus:border-navy-900 focus:outline-none"
              rows={3}
              value={formState.bio}
              onChange={(event) =>
                setFormState((prev) => ({ ...prev, bio: event.target.value }))
              }
              placeholder="Dutch painter famous for richly detailed still lifes."
            />
          </label>
          <div className="grid gap-2">
            <label className="text-sm font-semibold uppercase tracking-[0.3em] text-slate-600" htmlFor="persona-avatar-input">
              Avatar
            </label>
            <div className="flex flex-wrap items-center gap-4">
              {avatarPreview ? (
                <img
                  src={avatarPreview}
                  alt="Avatar preview"
                  className="h-16 w-16 rounded-full border border-slate-300 object-cover"
                />
              ) : (
                <div className="flex h-16 w-16 items-center justify-center rounded-full border border-dashed border-slate-400 text-xs uppercase tracking-[0.3em] text-slate-400">
                  128×128
                </div>
              )}
              <input
                type="file"
                accept="image/png,image/jpeg"
                onChange={(event) => handleAvatarChange(event.target.files?.[0])}
                className="text-sm"
                id="persona-avatar-input"
                aria-label="Avatar"
              />
            </div>
          </div>
          {formError && (
            <p className="rounded-2xl bg-tulip-red/10 px-3 py-2 text-xs uppercase tracking-[0.3em] text-tulip-red">
              {formError}
            </p>
          )}
          {successMessage && (
            <p className="rounded-2xl bg-tulip-green/10 px-3 py-2 text-xs uppercase tracking-[0.3em] text-tulip-green">
              {successMessage}
            </p>
          )}
          <div className="flex gap-3">
            <button
              type="submit"
              disabled={saving}
              className="rounded-2xl bg-navy-900 px-5 py-2 text-sm font-semibold uppercase tracking-[0.3em] text-cream shadow-card transition hover:bg-navy-800 disabled:opacity-60"
            >
              {editingId ? "Update user" : "Create user"}
            </button>
            {!editingId && (
              <button
                type="button"
                className="rounded-2xl border border-slate-400 px-5 py-2 text-sm font-semibold uppercase tracking-[0.3em] text-slate-600 hover:text-navy-900"
                onClick={resetForm}
              >
                Clear
              </button>
            )}
          </div>
        </form>
      </div>
    </section>
  );
}
