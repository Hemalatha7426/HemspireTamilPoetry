import { useEffect, useMemo, useState } from "react";
import MediaCard from "./MediaCard";
import { useAuth } from "../contexts/AuthContext";
import { API_BASE_URL } from "../api/client";
import { resolveMediaUrl, shareContent } from "../utils/helpers";

export default function MediaPage({ title, type, api }) {
  const ITEMS_PER_PAGE = 9;
  const { isAuthenticated, isAdmin, token } = useAuth();
  const [items, setItems] = useState([]);
  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [likeLoading, setLikeLoading] = useState(null);
  const [error, setError] = useState("");
  const [formMode, setFormMode] = useState("create");
  const [editingId, setEditingId] = useState(null);
  const [activeItem, setActiveItem] = useState(null);
  const [likedItems, setLikedItems] = useState({});

  const [form, setForm] = useState({ title: "", description: "", file: null });

  const loadItems = async (keyword = "") => {
    setLoading(true);
    setError("");
    try {
      const data = keyword ? await api.search(keyword) : await api.getAll();
      setItems(Array.isArray(data) ? data : []);
      setCurrentPage(1);
    } catch (err) {
      setError(err.message || "Failed to load content");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadItems();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const pageLabel = useMemo(() => title.toLowerCase(), [title]);

  const userKey = useMemo(() => {
    if (!token) return "guest";
    try {
      const base64Url = token.split(".")[1];
      const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
      const json = decodeURIComponent(
        atob(base64)
          .split("")
          .map((c) => `%${`00${c.charCodeAt(0).toString(16)}`.slice(-2)}`)
          .join("")
      );
      const payload = JSON.parse(json);
      return payload.sub || "user";
    } catch {
      return "user";
    }
  }, [token]);

  const likesStorageKey = useMemo(() => `liked:${type}:${userKey}`, [type, userKey]);

  useEffect(() => {
    let mounted = true;
    const loadLikedItems = async () => {
      const saved = localStorage.getItem(likesStorageKey);
      if (mounted && saved) {
        try {
          setLikedItems(JSON.parse(saved));
        } catch {
          setLikedItems({});
        }
      }

      if (!isAuthenticated || typeof api.getMyLikedIds !== "function") {
        if (mounted && !saved) setLikedItems({});
        return;
      }

      try {
        const ids = await api.getMyLikedIds();
        if (!mounted) return;
        const map = {};
        (Array.isArray(ids) ? ids : []).forEach((id) => {
          map[id] = true;
        });
        setLikedItems(map);
        localStorage.setItem(likesStorageKey, JSON.stringify(map));
      } catch {
        // Keep local state/storage as fallback if backend fetch fails.
      }
    };

    loadLikedItems();
    return () => {
      mounted = false;
    };
  }, [api, isAuthenticated, likesStorageKey]);

  const handleSearchSubmit = (event) => {
    event.preventDefault();
    loadItems(search);
  };

  const handleLike = async (id) => {
    if (!isAuthenticated) {
      window.alert("Please login to like");
      return;
    }

    setLikeLoading(id);
    try {
      const wasLiked = Boolean(likedItems[id]);
      const updatedItem = await api.like(id);
      setItems((current) =>
        current.map((item) =>
          item.id === id
            ? {
                ...item,
                likes:
                  typeof updatedItem?.likes === "number"
                    ? updatedItem.likes
                    : Math.max((item.likes || 0) + (wasLiked ? -1 : 1), 0),
              }
            : item
        )
      );
      setLikedItems((current) => {
        const next = { ...current };
        if (wasLiked) {
          delete next[id];
        } else {
          next[id] = true;
        }
        localStorage.setItem(likesStorageKey, JSON.stringify(next));
        return next;
      });
    } catch (err) {
      window.alert(err.message || "Unable to like");
    } finally {
      setLikeLoading(null);
    }
  };

  const getRouteName = () => {
    if (type === "poem") return "poems";
    if (type === "audio") return "audios";
    return "videos";
  };

  const getMediaUrl = (item) => {
    if (type === "poem") return resolveMediaUrl(item.imagePath);
    if (type === "audio") return resolveMediaUrl(item.audioPath);
    return resolveMediaUrl(item.videoPath);
  };

  const getFilenameFromDisposition = (contentDisposition) => {
    if (!contentDisposition) return null;

    const utf8Match = contentDisposition.match(/filename\*=UTF-8''([^;]+)/i);
    if (utf8Match?.[1]) {
      try {
        return decodeURIComponent(utf8Match[1]);
      } catch {
        return utf8Match[1];
      }
    }

    const plainMatch = contentDisposition.match(/filename="?([^"]+)"?/i);
    return plainMatch?.[1] || null;
  };

  const getFallbackFilename = (item) => {
    const mediaPath =
      type === "poem" ? item.imagePath : type === "audio" ? item.audioPath : item.videoPath;
    const extension = mediaPath?.split(".").pop()?.toLowerCase() || "bin";
    const safeTitle = (item.title || `${type}-${item.id}`).replace(/[^a-zA-Z0-9-_ ]/g, "_").trim();
    const baseName = safeTitle || `${type}-${item.id}`;
    return `${baseName}.${extension}`;
  };

  const handleShare = async (item) => {
    const message = await shareContent({
      title: item.title,
      text: `Check out this ${type} on Hemspire`,
      url: getMediaUrl(item),
    });
    if (message) window.alert(message);
  };

  const handleDownload = async (item) => {
    const url = `${API_BASE_URL}/api/${getRouteName()}/${item.id}/download`;

    try {
      const response = await fetch(url, { method: "GET" });

      if (!response.ok) {
        const contentType = response.headers.get("content-type") || "";
        const payload = contentType.includes("application/json")
          ? await response.json()
          : await response.text();
        const message =
          (typeof payload === "object" && payload?.message) ||
          (typeof payload === "string" && payload) ||
          `Download failed with status ${response.status}`;
        throw new Error(message);
      }

      const blob = await response.blob();
      const headerName = getFilenameFromDisposition(response.headers.get("content-disposition"));
      const filename = headerName || getFallbackFilename(item);
      const objectUrl = window.URL.createObjectURL(blob);

      const anchor = document.createElement("a");
      anchor.href = objectUrl;
      anchor.download = filename;
      document.body.appendChild(anchor);
      anchor.click();
      document.body.removeChild(anchor);
      window.URL.revokeObjectURL(objectUrl);
    } catch (err) {
      window.alert(err.message || "Unable to download file.");
    }
  };

  const resetForm = () => {
    setForm({ title: "", description: "", file: null });
    setFormMode("create");
    setEditingId(null);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!form.title.trim()) {
      window.alert("Title is required");
      return;
    }

    if (formMode === "create" && !form.file) {
      window.alert("File is required");
      return;
    }

    const data = new FormData();
    data.append("title", form.title.trim());
    data.append("description", form.description.trim());
    if (form.file) {
      data.append("file", form.file);
    }

    try {
      if (formMode === "create") {
        await api.create(data);
      } else {
        await api.update(editingId, data);
      }
      resetForm();
      loadItems(search);
    } catch (err) {
      window.alert(err.message || "Action failed");
    }
  };

  const handleEdit = (item) => {
    setFormMode("edit");
    setEditingId(item.id);
    setForm({
      title: item.title || "",
      description: item.description || "",
      file: null,
    });
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this item?")) return;

    try {
      await api.remove(id);
      setItems((current) => {
        const next = current.filter((item) => item.id !== id);
        const nextTotalPages = Math.max(1, Math.ceil(next.length / ITEMS_PER_PAGE));
        setCurrentPage((page) => Math.min(page, nextTotalPages));
        return next;
      });
    } catch (err) {
      window.alert(err.message || "Delete failed");
    }
  };

  const totalPages = Math.max(1, Math.ceil(items.length / ITEMS_PER_PAGE));
  const pageStart = (currentPage - 1) * ITEMS_PER_PAGE;
  const paginatedItems = items.slice(pageStart, pageStart + ITEMS_PER_PAGE);

  useEffect(() => {
    setCurrentPage((page) => Math.min(page, totalPages));
  }, [totalPages]);

  return (
    <section className={`page container media-page ${isAdmin ? "media-page-admin" : ""}`}>
      <div className="page-heading">
        <h1>{title}</h1>
        <p>Search, explore, share and download your favorite {pageLabel} content.</p>
      </div>

      <form className="search-row" onSubmit={handleSearchSubmit}>
        <input
          type="text"
          placeholder={`Search ${pageLabel}...`}
          value={search}
          onChange={(event) => setSearch(event.target.value)}
        />
        <button type="submit" className="btn">
          Search
        </button>
      </form>

      {isAdmin && (
        <form className="panel" onSubmit={handleSubmit}>
          <h2>{formMode === "create" ? `Upload ${title}` : `Edit ${title}`}</h2>
          <div className="field-grid">
            <input
              type="text"
              placeholder="Title"
              value={form.title}
              onChange={(event) => setForm((prev) => ({ ...prev, title: event.target.value }))}
            />
            <input
              type="text"
              placeholder="Description"
              value={form.description}
              onChange={(event) => setForm((prev) => ({ ...prev, description: event.target.value }))}
            />
            <input
              type="file"
              onChange={(event) =>
                setForm((prev) => ({ ...prev, file: event.target.files?.[0] || null }))
              }
            />
          </div>
          <div className="inline-actions">
            <button type="submit" className="btn">
              {formMode === "create" ? "Upload" : "Update"}
            </button>
            {formMode === "edit" && (
              <button type="button" className="btn ghost" onClick={resetForm}>
                Cancel Edit
              </button>
            )}
          </div>
        </form>
      )}

      {error && <p className="error-text">{error}</p>}
      {loading && <p>Loading...</p>}

      {!loading && (
        <div className="media-grid">
          {items.length === 0 && <p>No content found.</p>}
          {paginatedItems.map((item) => (
            <MediaCard
              key={item.id}
              item={item}
              type={type}
              canLike={isAuthenticated}
              onLike={handleLike}
              likeLoading={likeLoading}
              likedOnce={Boolean(likedItems[item.id])}
              onOpen={setActiveItem}
              onShare={handleShare}
              onDownload={handleDownload}
              onEdit={handleEdit}
              onDelete={handleDelete}
              isAdmin={isAdmin}
            />
          ))}
        </div>
      )}
      {!loading && items.length > ITEMS_PER_PAGE && (
        <div className="pagination-row">
          <button
            type="button"
            className="btn ghost small"
            onClick={() => setCurrentPage((page) => Math.max(1, page - 1))}
            disabled={currentPage === 1}
          >
            Previous
          </button>
          <span className="pagination-label">
            Page {currentPage} of {totalPages}
          </span>
          <button
            type="button"
            className="btn ghost small"
            onClick={() => setCurrentPage((page) => Math.min(totalPages, page + 1))}
            disabled={currentPage === totalPages}
          >
            Next
          </button>
        </div>
      )}

      {activeItem && (
        <div className="media-modal-backdrop" onClick={() => setActiveItem(null)}>
          <div className="media-modal" onClick={(event) => event.stopPropagation()}>
            <button type="button" className="media-modal-close" aria-label="Close preview" onClick={() => setActiveItem(null)}>&times;</button>
            {type === "poem" && (
              <img
                src={resolveMediaUrl(activeItem.imagePath)}
                alt={activeItem.title}
                className="media-modal-image"
              />
            )}
            {type === "audio" && (
              <audio controls autoPlay className="media-modal-player">
                <source src={resolveMediaUrl(activeItem.audioPath)} />
              </audio>
            )}
            {type === "video" && (
              <video controls autoPlay className="media-modal-player">
                <source src={resolveMediaUrl(activeItem.videoPath)} />
              </video>
            )}
            <h3>{activeItem.title}</h3>
            <p>{activeItem.description || "No description"}</p>
          </div>
        </div>
      )}
    </section>
  );
}



