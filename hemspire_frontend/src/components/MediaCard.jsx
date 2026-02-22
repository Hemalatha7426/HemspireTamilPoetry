import { resolveMediaUrl } from "../utils/helpers";

export default function MediaCard({
  item,
  type,
  canLike,
  onLike,
  likeLoading,
  likedOnce,
  onOpen,
  onShare,
  onDownload,
  onEdit,
  onDelete,
  isAdmin,
}) {
  const renderMedia = () => {
    if (type === "poem") {
      return (
        <div className="media-preview" onClick={() => onOpen(item)}>
          <img
            src={resolveMediaUrl(item.imagePath)}
            alt={item.title}
            className="media-thumb media-image"
          />
        </div>
      );
    }

    if (type === "audio") {
      return (
        <div className="media-preview" onClick={() => onOpen(item)}>
          <audio controls className="media-player media-audio">
            <source src={resolveMediaUrl(item.audioPath)} />
          </audio>
        </div>
      );
    }

    return (
      <div className="media-preview" onClick={() => onOpen(item)}>
        <video controls className="media-player media-video">
          <source src={resolveMediaUrl(item.videoPath)} />
        </video>
      </div>
    );
  };

  return (
    <article className="media-card">
      {renderMedia()}
      <div className="media-meta">
        <h3>{item.title}</h3>
        <p>{item.description || "No description"}</p>
      </div>
      <div className="media-actions">
        {canLike && (
          <button
            className={`btn ghost small icon-btn like-btn-icon ${likedOnce ? "liked" : ""}`}
            onClick={() => onLike(item.id)}
            disabled={likeLoading === item.id}
            aria-label={likedOnce ? "Liked" : "Like"}
            title={likedOnce ? "Liked" : "Like"}
          >
            {likeLoading === item.id ? "..." : "❤️"}
            <span className="icon-text">{likedOnce ? "Liked" : "Like"}</span>
            <span className="icon-count">{item.likes || 0}</span>
          </button>
        )}
        <button
          className="btn ghost small icon-btn"
          onClick={() => onShare(item)}
          aria-label="Share"
          title="Share"
        >
          🔗
          <span className="icon-text">Share</span>
        </button>
        <button
          className="btn ghost small icon-btn"
          onClick={() => onDownload(item)}
          aria-label="Download"
          title="Download"
        >
          ⬇
          <span className="icon-text">Download</span>
        </button>
        {isAdmin && (
          <>
            <button className="btn ghost small" onClick={() => onEdit(item)}>
              Edit
            </button>
            <button className="btn danger small" onClick={() => onDelete(item.id)}>
              Delete
            </button>
          </>
        )}
      </div>
    </article>
  );
}
