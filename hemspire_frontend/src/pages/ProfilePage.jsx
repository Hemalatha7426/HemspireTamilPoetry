import { useEffect, useState } from "react";
import { getMyProfile } from "../api/profileApi";
import "./ProfilePage.css";

function ProfileIcon({ type }) {
  if (type === "briefcase") {
    return (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
        <rect x="3" y="7" width="18" height="13" rx="2" />
        <path d="M8 7V5a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
        <path d="M3 12h18" />
      </svg>
    );
  }
  if (type === "shield") {
    return (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
        <path d="M9 12l2 2 4-4" />
      </svg>
    );
  }
  if (type === "spark") {
    return (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
        <path d="M12 3l1.8 4.2L18 9l-4.2 1.8L12 15l-1.8-4.2L6 9l4.2-1.8L12 3z" />
        <path d="M5 15l.9 2.1L8 18l-2.1.9L5 21l-.9-2.1L2 18l2.1-.9L5 15z" />
      </svg>
    );
  }
  if (type === "user") {
    return (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
        <path d="M20 21a8 8 0 0 0-16 0" />
        <circle cx="12" cy="7" r="4" />
      </svg>
    );
  }
  if (type === "mail") {
    return (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
        <rect x="3" y="5" width="18" height="14" rx="2" />
        <path d="m3 7 9 6 9-6" />
      </svg>
    );
  }
  if (type === "role") {
    return (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
        <circle cx="8" cy="8" r="3" />
        <path d="M2 20a6 6 0 0 1 12 0" />
        <path d="M16 8h6M16 12h6M16 16h6" />
      </svg>
    );
  }
  if (type === "calendar") {
    return (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
        <rect x="3" y="4" width="18" height="17" rx="2" />
        <path d="M8 2v4M16 2v4M3 10h18" />
      </svg>
    );
  }
  if (type === "building") {
    return (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
        <path d="M3 21V7l9-4 9 4v14" />
        <path d="M9 21v-6h6v6M8 10h.01M12 10h.01M16 10h.01" />
      </svg>
    );
  }
  if (type === "pin") {
    return (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
        <path d="M12 22s7-6.2 7-12a7 7 0 1 0-14 0c0 5.8 7 12 7 12z" />
        <circle cx="12" cy="10" r="2.5" />
      </svg>
    );
  }
  if (type === "phone") {
    return (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
        <path d="M22 16.9v3a2 2 0 0 1-2.2 2A19.8 19.8 0 0 1 11.2 18a19.5 19.5 0 0 1-6-6A19.8 19.8 0 0 1 2.1 4.2 2 2 0 0 1 4.1 2h3a2 2 0 0 1 2 1.7c.1.9.4 1.8.8 2.6a2 2 0 0 1-.4 2.1L8.2 9.8a16 16 0 0 0 6 6l1.4-1.3a2 2 0 0 1 2.1-.4c.8.4 1.7.7 2.6.8A2 2 0 0 1 22 16.9z" />
      </svg>
    );
  }
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
      <path d="M4 4h10l6 6v10H4z" />
      <path d="M14 4v6h6M8 14h8M8 18h8" />
    </svg>
  );
}

export default function ProfilePage() {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editMode, setEditMode] = useState(false);
  const [draftName, setDraftName] = useState("");
  const [avatar, setAvatar] = useState("");
  const [extraDetails, setExtraDetails] = useState({
    profession: "",
    location: "",
    phone: "",
    bio: "",
  });
  const [draftDetails, setDraftDetails] = useState({
    profession: "",
    location: "",
    phone: "",
    bio: "",
  });

  useEffect(() => {
    async function run() {
      try {
        const data = await getMyProfile();
        setProfile(data);
        setDraftName(data.name || "");
        const storageKey = `profile-avatar:${(data.email || "").toLowerCase()}`;
        const savedAvatar = localStorage.getItem(storageKey);
        if (savedAvatar) {
          setAvatar(savedAvatar);
        }
        const detailsKey = `profile-details:${(data.email || "").toLowerCase()}`;
        const savedDetails = localStorage.getItem(detailsKey);
        if (savedDetails) {
          try {
            const parsed = JSON.parse(savedDetails);
            const normalized = {
              profession: parsed.profession || "",
              location: parsed.location || "",
              phone: parsed.phone || "",
              bio: parsed.bio || "",
            };
            setExtraDetails(normalized);
            setDraftDetails(normalized);
          } catch {
            // Ignore invalid saved profile details
          }
        }
      } finally {
        setLoading(false);
      }
    }

    run();
  }, []);

  const getAvatarFallback = () => {
    if (!profile) return "";
    return `https://ui-avatars.com/api/?name=${encodeURIComponent(profile.name || "Hemspire User")}&background=fad1e7&color=5d1945&size=256`;
  };

  const handleAvatarChange = (event) => {
    const file = event.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      window.alert("Please select an image file.");
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      const result = typeof reader.result === "string" ? reader.result : "";
      setAvatar(result);
      if (profile?.email) {
        const storageKey = `profile-avatar:${profile.email.toLowerCase()}`;
        localStorage.setItem(storageKey, result);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleRemoveAvatar = () => {
    setAvatar("");
    if (profile?.email) {
      const storageKey = `profile-avatar:${profile.email.toLowerCase()}`;
      localStorage.removeItem(storageKey);
    }
  };

  const handleSaveProfile = () => {
    if (!profile) return;
    const sanitized = {
      profession: draftDetails.profession.trim(),
      location: draftDetails.location.trim(),
      phone: draftDetails.phone.trim(),
      bio: draftDetails.bio.trim(),
    };

    setProfile((current) => ({ ...current, name: draftName.trim() || current.name }));
    setExtraDetails(sanitized);
    if (profile.email) {
      const detailsKey = `profile-details:${profile.email.toLowerCase()}`;
      localStorage.setItem(detailsKey, JSON.stringify(sanitized));
    }
    setEditMode(false);
  };

  return (
    <section className="page container profile-page">
      <div className="page-heading">
        <h1>Profile</h1>
        <p>Your account details and role information.</p>
      </div>
      <div className="profile-banner panel">
        <div className="profile-banner-item">
          <span aria-hidden="true">
            <ProfileIcon type="briefcase" />
          </span>
          <p>Professional identity, all in one place</p>
        </div>
        <div className="profile-banner-item">
          <span aria-hidden="true">
            <ProfileIcon type="shield" />
          </span>
          <p>Privacy-first local customization</p>
        </div>
        <div className="profile-banner-item">
          <span aria-hidden="true">
            <ProfileIcon type="spark" />
          </span>
          <p>Unique profile styling for your presence</p>
        </div>
      </div>

      {loading && <p>Loading...</p>}
      {!loading && profile && (
        <article className="panel themed-panel profile-shell">
          <aside className="profile-visual">
            <div className="profile-avatar-wrap">
              <img
                src={avatar || getAvatarFallback()}
                alt="Profile avatar"
                className="profile-avatar"
              />
            </div>
            <label className="btn ghost small profile-upload">
              Change Photo
              <input type="file" accept="image/*" onChange={handleAvatarChange} hidden />
            </label>
            <button type="button" className="btn ghost small" onClick={handleRemoveAvatar}>
              Remove Photo
            </button>
          </aside>

          <div className="profile-main">
            <div className="profile-headline">
              <h2>{profile.name}</h2>
              <p>{profile.email}</p>
              <span className={`profile-role-badge ${profile.role === "ROLE_ADMIN" ? "is-admin" : "is-user"}`}>
                {profile.role === "ROLE_ADMIN" ? "Admin Account" : "User Account"}
              </span>
            </div>

            <div className="profile-grid">
              <div>
                <h3>
                  <span className="profile-label-icon" aria-hidden="true"><ProfileIcon type="user" /></span>
                  Name
                </h3>
                {editMode ? (
                  <input
                    type="text"
                    value={draftName}
                    onChange={(event) => setDraftName(event.target.value)}
                  />
                ) : (
                  <p>{profile.name}</p>
                )}
              </div>
              <div>
                <h3>
                  <span className="profile-label-icon" aria-hidden="true"><ProfileIcon type="mail" /></span>
                  Email
                </h3>
                <p>{profile.email}</p>
              </div>
              <div>
                <h3>
                  <span className="profile-label-icon" aria-hidden="true"><ProfileIcon type="role" /></span>
                  Role
                </h3>
                <p>{profile.role}</p>
              </div>
              <div>
                <h3>
                  <span className="profile-label-icon" aria-hidden="true"><ProfileIcon type="calendar" /></span>
                  Member Since
                </h3>
                <p>{new Date(profile.createdAt).toLocaleString()}</p>
              </div>
              <div>
                <h3>
                  <span className="profile-label-icon" aria-hidden="true"><ProfileIcon type="building" /></span>
                  Profession
                </h3>
                {editMode ? (
                  <input
                    type="text"
                    value={draftDetails.profession}
                    onChange={(event) =>
                      setDraftDetails((prev) => ({ ...prev, profession: event.target.value }))
                    }
                    placeholder="Your profession"
                  />
                ) : (
                  <p>{extraDetails.profession || "Not added yet"}</p>
                )}
              </div>
              <div>
                <h3>
                  <span className="profile-label-icon" aria-hidden="true"><ProfileIcon type="pin" /></span>
                  Location
                </h3>
                {editMode ? (
                  <input
                    type="text"
                    value={draftDetails.location}
                    onChange={(event) =>
                      setDraftDetails((prev) => ({ ...prev, location: event.target.value }))
                    }
                    placeholder="City, Country"
                  />
                ) : (
                  <p>{extraDetails.location || "Not added yet"}</p>
                )}
              </div>
              <div>
                <h3>
                  <span className="profile-label-icon" aria-hidden="true"><ProfileIcon type="phone" /></span>
                  Phone
                </h3>
                {editMode ? (
                  <input
                    type="text"
                    value={draftDetails.phone}
                    onChange={(event) =>
                      setDraftDetails((prev) => ({ ...prev, phone: event.target.value }))
                    }
                    placeholder="Contact number"
                  />
                ) : (
                  <p>{extraDetails.phone || "Not added yet"}</p>
                )}
              </div>
              <div className="profile-bio-card">
                <h3>
                  <span className="profile-label-icon" aria-hidden="true"><ProfileIcon type="doc" /></span>
                  Bio
                </h3>
                {editMode ? (
                  <textarea
                    rows="4"
                    value={draftDetails.bio}
                    onChange={(event) =>
                      setDraftDetails((prev) => ({ ...prev, bio: event.target.value }))
                    }
                    placeholder="Tell something about yourself"
                  />
                ) : (
                  <p>{extraDetails.bio || "Add a short bio to personalize your profile."}</p>
                )}
              </div>
            </div>

            <div className="inline-actions">
              {!editMode && (
                <button type="button" className="btn" onClick={() => setEditMode(true)}>
                  Edit Profile
                </button>
              )}
              {editMode && (
                <>
                  <button type="button" className="btn" onClick={handleSaveProfile}>
                    Save
                  </button>
                  <button
                    type="button"
                    className="btn ghost"
                    onClick={() => {
                      setDraftName(profile.name || "");
                      setDraftDetails(extraDetails);
                      setEditMode(false);
                    }}
                  >
                    Cancel
                  </button>
                </>
              )}
            </div>
          </div>
        </article>
      )}
    </section>
  );
}
