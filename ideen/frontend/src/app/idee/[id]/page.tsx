"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { apiFetch } from "@/lib/api";
import { useAuth } from "@/lib/auth";
import StarRating from "@/components/StarRating";
import {
  Idea,
  Comment,
  RatingOverview,
  STATUS_LABELS,
  STATUS_COLORS,
} from "@/lib/types";

interface Attachment {
  id: number;
  idea_id: number;
  filename: string;
  original_filename: string;
  content_type: string;
  size: number;
  created_at: string;
}

interface Tag {
  id: number;
  name: string;
  slug: string;
}

export default function IdeaDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { user, token } = useAuth();
  const ideaId = params.id as string;

  const [idea, setIdea] = useState<Idea | null>(null);
  const [comments, setComments] = useState<Comment[]>([]);
  const [ratingInfo, setRatingInfo] = useState<RatingOverview | null>(null);
  const [myRating, setMyRating] = useState(0);
  const [commentText, setCommentText] = useState("");
  const [loading, setLoading] = useState(true);
  const [submittingComment, setSubmittingComment] = useState(false);
  const [attachments, setAttachments] = useState<Attachment[]>([]);
  const [uploading, setUploading] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const [tags, setTags] = useState<Tag[]>([]);
  const [allTags, setAllTags] = useState<Tag[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const loadData = useCallback(async () => {
    if (!token) return;
    try {
      const [i, c, r, a, t] = await Promise.all([
        apiFetch<Idea>(`/ideas/${ideaId}`, { token }),
        apiFetch<Comment[]>(`/ideas/${ideaId}/comments`, { token }),
        apiFetch<RatingOverview>(`/ideas/${ideaId}/ratings`, { token }),
        apiFetch<Attachment[]>(`/ideas/${ideaId}/attachments`, { token }),
        apiFetch<Tag[]>(`/ideas/${ideaId}/tags`),
      ]);
      setIdea(i);
      setComments(c);
      setRatingInfo(r);
      setAttachments(a);
      setTags(t);
      const mine = r.ratings.find((rt) => rt.user_id === user?.id);
      if (mine) setMyRating(mine.score);
    } catch {
      router.push("/");
    } finally {
      setLoading(false);
    }
  }, [ideaId, token, user?.id, router]);

  useEffect(() => {
    if (!token) {
      router.push("/login");
      return;
    }
    loadData();
    apiFetch<Tag[]>("/tags").then(setAllTags).catch(() => {});
  }, [token, router, loadData]);

  async function handleRate(score: number) {
    if (!token) return;
    setMyRating(score);
    await apiFetch(`/ideas/${ideaId}/rate`, {
      method: "POST",
      token,
      body: { score },
    });
    loadData();
  }

  async function handleComment(e: React.FormEvent) {
    e.preventDefault();
    if (!token || !commentText.trim()) return;
    setSubmittingComment(true);
    try {
      await apiFetch(`/ideas/${ideaId}/comments`, {
        method: "POST",
        token,
        body: { text: commentText },
      });
      setCommentText("");
      loadData();
    } finally {
      setSubmittingComment(false);
    }
  }

  async function handleDeleteComment(commentId: number) {
    if (!token) return;
    await apiFetch(`/comments/${commentId}`, { method: "DELETE", token });
    loadData();
  }

  async function uploadFile(file: File) {
    if (!token) return;
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      const res = await fetch(`/api/ideas/${ideaId}/attachments`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });
      if (!res.ok) {
        const err = await res.json();
        alert(err.detail || "Upload fehlgeschlagen");
        return;
      }
      loadData();
    } finally {
      setUploading(false);
    }
  }

  function handleDrop(e: React.DragEvent) {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files[0];
    if (file) uploadFile(file);
  }

  async function handleDeleteAttachment(attachmentId: number) {
    if (!token) return;
    await apiFetch(`/ideas/${ideaId}/attachments/${attachmentId}`, {
      method: "DELETE",
      token,
    });
    loadData();
  }

  async function handleAddTag(tagId: number) {
    if (!token) return;
    await apiFetch(`/ideas/${ideaId}/tags/${tagId}`, {
      method: "POST",
      token,
    });
    loadData();
  }

  async function handleRemoveTag(tagId: number) {
    if (!token) return;
    await apiFetch(`/ideas/${ideaId}/tags/${tagId}`, {
      method: "DELETE",
      token,
    });
    loadData();
  }

  function formatFileSize(bytes: number): string {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  }

  if (loading) {
    return <div className="text-center py-12 text-gray-500">Laden...</div>;
  }

  if (!idea) return null;

  const unassignedTags = allTags.filter(
    (t) => !tags.some((it) => it.id === t.id)
  );

  return (
    <div className="max-w-3xl mx-auto">
      <Link
        href="/"
        className="text-sm text-mopilot-green hover:underline mb-4 inline-block"
      >
        &larr; Zur&uuml;ck
      </Link>

      {/* Idea Header */}
      <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
        <div className="flex items-start justify-between gap-4 mb-4">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">{idea.title}</h2>
            <div className="flex items-center gap-2 mt-2">
              {idea.title.startsWith("\u{1F680}") && (
                <span className="text-xs px-2.5 py-1 rounded-full bg-orange-100 text-orange-700">
                  Vision&auml;r
                </span>
              )}
              {idea.title.startsWith("\u{1F916}") && (
                <span className="text-xs px-2.5 py-1 rounded-full bg-green-100 text-green-700">
                  KI-umsetzbar
                </span>
              )}
            </div>
          </div>
          <span
            className={`text-xs px-3 py-1 rounded-full whitespace-nowrap ${
              STATUS_COLORS[idea.status]
            }`}
          >
            {STATUS_LABELS[idea.status]}
          </span>
        </div>

        {/* Tags */}
        {(tags.length > 0 || unassignedTags.length > 0) && (
          <div className="flex flex-wrap items-center gap-2 mb-4">
            {tags.map((tag) => (
              <span
                key={tag.id}
                className="inline-flex items-center gap-1 bg-mopilot-green/10 text-mopilot-green text-xs px-2.5 py-1 rounded-full"
              >
                {tag.name}
                {(user?.user_type === "admin" ||
                  user?.user_type === "team") && (
                  <button
                    onClick={() => handleRemoveTag(tag.id)}
                    className="hover:text-red-500 ml-0.5"
                  >
                    &times;
                  </button>
                )}
              </span>
            ))}
            {(user?.user_type === "admin" || user?.user_type === "team") &&
              unassignedTags.length > 0 && (
                <select
                  onChange={(e) => {
                    if (e.target.value) handleAddTag(Number(e.target.value));
                    e.target.value = "";
                  }}
                  className="text-xs border border-dashed border-gray-300 rounded-full px-2 py-1 text-gray-400 focus:outline-none focus:border-mopilot-green"
                >
                  <option value="">+ Tag</option>
                  {unassignedTags.map((t) => (
                    <option key={t.id} value={t.id}>
                      {t.name}
                    </option>
                  ))}
                </select>
              )}
          </div>
        )}

        <div className="prose prose-gray max-w-none mb-6">
          <p className="text-gray-700 whitespace-pre-wrap">
            {idea.description}
          </p>
        </div>

        <div className="flex items-center justify-between border-t pt-4 text-sm text-gray-400">
          <div className="flex items-center gap-4">
            <span>Von {idea.author_name}</span>
            <span>
              {new Date(idea.created_at).toLocaleDateString("de-DE", {
                day: "2-digit",
                month: "2-digit",
                year: "numeric",
                hour: "2-digit",
                minute: "2-digit",
              })}
            </span>
          </div>
        </div>
      </div>

      {/* Attachments Section */}
      <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-3">
          Anh&auml;nge ({attachments.length})
        </h3>

        {/* Drag & Drop Zone */}
        <div
          onDragOver={(e) => {
            e.preventDefault();
            setDragOver(true);
          }}
          onDragLeave={() => setDragOver(false)}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
          className={`border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition mb-4 ${
            dragOver
              ? "border-mopilot-green bg-mopilot-green/5"
              : "border-gray-300 hover:border-gray-400"
          }`}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept=".jpg,.jpeg,.png,.pdf,.docx"
            className="hidden"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) uploadFile(file);
              e.target.value = "";
            }}
          />
          <p className="text-sm text-gray-500">
            {uploading
              ? "Wird hochgeladen..."
              : "Datei hierher ziehen oder klicken (JPG, PNG, PDF, DOCX, max. 10 MB)"}
          </p>
        </div>

        {/* File List */}
        {attachments.length > 0 && (
          <div className="space-y-2">
            {attachments.map((att) => {
              const isImage = att.content_type.startsWith("image/");
              return (
                <div
                  key={att.id}
                  className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg"
                >
                  {isImage ? (
                    <img
                      src={`/api/ideas/${ideaId}/attachments/${att.id}/download`}
                      alt={att.original_filename}
                      className="w-16 h-16 object-cover rounded"
                    />
                  ) : (
                    <div className="w-16 h-16 bg-gray-200 rounded flex items-center justify-center text-xs text-gray-500">
                      {att.original_filename.split(".").pop()?.toUpperCase()}
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">
                      {att.original_filename}
                    </p>
                    <p className="text-xs text-gray-400">
                      {formatFileSize(att.size)}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <a
                      href={`/api/ideas/${ideaId}/attachments/${att.id}/download`}
                      className="text-xs text-mopilot-green hover:underline"
                    >
                      Download
                    </a>
                    {(user?.id === idea.author_id ||
                      user?.user_type === "admin") && (
                      <button
                        onClick={() => handleDeleteAttachment(att.id)}
                        className="text-xs text-red-400 hover:text-red-600"
                      >
                        L&ouml;schen
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Rating Section */}
      <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-3">Bewertung</h3>
        <div className="flex items-center gap-6">
          <div>
            <p className="text-sm text-gray-500 mb-1">Ihre Bewertung:</p>
            <StarRating value={myRating} onChange={handleRate} size="lg" />
          </div>
          {ratingInfo && ratingInfo.average !== null && (
            <div className="border-l pl-6">
              <p className="text-sm text-gray-500 mb-1">Durchschnitt</p>
              <div className="flex items-center gap-2">
                <span className="text-2xl font-bold text-gray-900">
                  {ratingInfo.average.toFixed(1)}
                </span>
                <StarRating
                  value={Math.round(ratingInfo.average)}
                  readonly
                  size="sm"
                />
                <span className="text-sm text-gray-400">
                  ({ratingInfo.count}{" "}
                  {ratingInfo.count === 1 ? "Bewertung" : "Bewertungen"})
                </span>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Comments Section */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Kommentare ({comments.length})
        </h3>

        <form onSubmit={handleComment} className="mb-6">
          <textarea
            value={commentText}
            onChange={(e) => setCommentText(e.target.value)}
            rows={3}
            placeholder="Schreiben Sie einen Kommentar..."
            className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-mopilot-green focus:border-transparent resize-y mb-2"
          />
          <button
            type="submit"
            disabled={submittingComment || !commentText.trim()}
            className="bg-mopilot-green text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-mopilot-green-dark transition disabled:opacity-50"
          >
            {submittingComment ? "Wird gesendet..." : "Kommentar senden"}
          </button>
        </form>

        {comments.length === 0 ? (
          <p className="text-gray-400 text-sm">Noch keine Kommentare.</p>
        ) : (
          <div className="space-y-4">
            {comments.map((comment) => (
              <div key={comment.id} className="border-b pb-4 last:border-0">
                <div className="flex items-center justify-between mb-1">
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-gray-900 text-sm">
                      {comment.user_name}
                    </span>
                    <span className="text-xs text-gray-400">
                      {new Date(comment.created_at).toLocaleDateString(
                        "de-DE",
                        {
                          day: "2-digit",
                          month: "2-digit",
                          year: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                        }
                      )}
                    </span>
                  </div>
                  {(user?.id === comment.user_id ||
                    user?.user_type === "admin") && (
                    <button
                      onClick={() => handleDeleteComment(comment.id)}
                      className="text-xs text-red-400 hover:text-red-600"
                    >
                      L&ouml;schen
                    </button>
                  )}
                </div>
                <p className="text-gray-700 text-sm whitespace-pre-wrap">
                  {comment.text}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
