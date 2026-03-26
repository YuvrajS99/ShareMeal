import React, { useEffect, useMemo, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import ThemeToggle from "./ThemeToggle.jsx";
import { Bell, Menu, X } from "lucide-react";
import { api } from "../services/api.js";

export default function Navbar({ logoText, role, onLogout }) {
  const navigate = useNavigate();
  const dashboardPath =
    role === "ngo" ? "/ngo" : role === "donor" ? "/donor" : "/login";
  const roleLabel = role === "ngo" ? "NGO" : role === "donor" ? "Donor" : null;

  const isAuthed = Boolean(roleLabel);
  const [notifOpen, setNotifOpen] = useState(false);
  const [loadingNotifs, setLoadingNotifs] = useState(false);
  const [notifError, setNotifError] = useState("");
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const dropdownRef = useRef(null);
  const [mobileOpen, setMobileOpen] = useState(false);

  const visibleNotifs = useMemo(() => notifications.slice(0, 7), [notifications]);

  async function loadNotifications() {
    if (!isAuthed) return;
    setLoadingNotifs(true);
    setNotifError("");
    try {
      const data = await api.getNotifications();
      setNotifications(data?.notifications || []);
      setUnreadCount(data?.unreadCount || 0);
    } catch (err) {
      setNotifError(err.message || "Failed to load notifications");
    } finally {
      setLoadingNotifs(false);
    }
  }

  useEffect(() => {
    loadNotifications();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAuthed]);

  useEffect(() => {
    if (!notifOpen) return;

    function onDocMouseDown(e) {
      const el = dropdownRef.current;
      if (!el) return;
      if (!el.contains(e.target)) setNotifOpen(false);
    }

    document.addEventListener("mousedown", onDocMouseDown);
    return () => document.removeEventListener("mousedown", onDocMouseDown);
  }, [notifOpen]);

  async function onOpenNotifications() {
    setNotifOpen((v) => !v);
    const nextOpen = !notifOpen;
    if (nextOpen && unreadCount > 0) {
      try {
        await api.markAllNotificationsRead();
      } catch {
        // ignore; best-effort
      }
      await loadNotifications();
    } else if (nextOpen) {
      await loadNotifications();
    }
  }

  function goAndClose(path) {
    setMobileOpen(false);
    navigate(path);
  }

  return (
    <header className="navbar">
      <div className="navbarInner">
        <div className="navbarBrand" onClick={() => navigate(dashboardPath)}>
          {logoText}
        </div>

        <nav className="navbarNav navbarDesktopNav" aria-label="Primary navigation">
          <Link className="navbarLink" to="/about">
            About
          </Link>
          <Link className="navbarLink" to="/contact">
            Contact
          </Link>
          <Link className="navbarLink" to="/leaderboard">
            Leaderboard
          </Link>
          <Link className="navbarLink" to={dashboardPath}>
            Dashboard
          </Link>
          {roleLabel && <span className="roleBadge">{roleLabel}</span>}
          {roleLabel && (
            <button type="button" className="navbarButton" onClick={onLogout}>
              Logout
            </button>
          )}
        </nav>

        <div className="navbarActions">
          {isAuthed && (
            <div className="notifWrap" ref={dropdownRef}>
              <button
                type="button"
                className="notifButton"
                onClick={onOpenNotifications}
                aria-label="Notifications"
                title="Notifications"
              >
                <Bell size={18} />
                {unreadCount > 0 && (
                  <span className="notifCount">{unreadCount}</span>
                )}
              </button>

              {notifOpen && (
                <div className="notifDropdown" role="menu">
                  <div className="notifHeader">
                    <div className="notifTitle">Notifications</div>
                    <button
                      type="button"
                      className="notifMarkBtn"
                      onClick={async () => {
                        try {
                          await api.markAllNotificationsRead();
                          await loadNotifications();
                        } catch {
                          // ignore
                        }
                      }}
                    >
                      Mark read
                    </button>
                  </div>

                  {loadingNotifs ? (
                    <div className="notifBody">Loading...</div>
                  ) : notifError ? (
                    <div className="notifBody notifError">{notifError}</div>
                  ) : visibleNotifs.length === 0 ? (
                    <div className="notifBody smallText">
                      No notifications yet.
                    </div>
                  ) : (
                    <div className="notifList">
                      {visibleNotifs.map((n, i) => (
                        <div
                          key={`${n.createdAt || "t"}-${i}`}
                          className={`notifItem ${
                            n.read ? "" : "notifItemUnread"
                          }`}
                        >
                          {n.message}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          <ThemeToggle />

          <button
            type="button"
            className="navbarHamburger"
            onClick={() => setMobileOpen((v) => !v)}
            aria-label="Open navigation menu"
            title="Menu"
          >
            {mobileOpen ? <X size={18} /> : <Menu size={18} />}
          </button>
        </div>
      </div>

      {mobileOpen && (
        <nav className="navbarMobileNav" aria-label="Mobile navigation">
          <Link
            className="navbarLink navbarMobileLink"
            to="/about"
            onClick={() => setMobileOpen(false)}
          >
            About
          </Link>
          <Link
            className="navbarLink navbarMobileLink"
            to="/contact"
            onClick={() => setMobileOpen(false)}
          >
            Contact
          </Link>
          <Link
            className="navbarLink navbarMobileLink"
            to="/leaderboard"
            onClick={() => setMobileOpen(false)}
          >
            Leaderboard
          </Link>
          <Link
            className="navbarLink navbarMobileLink"
            to={dashboardPath}
            onClick={() => setMobileOpen(false)}
          >
            Dashboard
          </Link>
          {roleLabel && <span className="roleBadge" style={{ marginTop: 6 }}>{roleLabel}</span>}
          {roleLabel && (
            <button
              type="button"
              className="navbarButton"
              onClick={() => {
                setMobileOpen(false);
                onLogout();
              }}
            >
              Logout
            </button>
          )}
        </nav>
      )}
    </header>
  );
}

