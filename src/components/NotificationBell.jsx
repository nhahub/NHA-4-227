import { useEffect, useMemo, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Badge, Spinner } from '@heroui/react';
import {
  getNotifications,
  markAllAsRead,
  markAsRead,
} from '../services/notificationService';

const BellIcon = () => (
  <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M6 9a6 6 0 1 1 12 0c0 6 2 7 2 7H4s2-1 2-7" />
    <path d="M10 20a2 2 0 0 0 4 0" />
  </svg>
);

const NotificationBell = () => {
  const navigate = useNavigate();
  const wrapperRef = useRef(null);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [notifications, setNotifications] = useState([]);

  const unreadCount = useMemo(
    () => notifications.filter((n) => !n.isRead).length,
    [notifications]
  );

  const latestNotifications = useMemo(() => notifications.slice(0, 5), [notifications]);

  const loadNotifications = async () => {
    try {
      setLoading(true);
      const data = await getNotifications();
      setNotifications(Array.isArray(data) ? data : []);
    } catch {
      setNotifications([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadNotifications();
  }, []);

  useEffect(() => {
    const handleOutside = (e) => {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handleOutside);
    return () => document.removeEventListener('mousedown', handleOutside);
  }, []);

  const handleOpen = async () => {
    const next = !open;
    setOpen(next);
    if (next) await loadNotifications();
  };

  const handleMarkAll = async () => {
    try {
      await markAllAsRead();
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
    } catch { /* keep UI stable */ }
  };

  const handleClick = async (item) => {
    try {
      if (!item.isRead) {
        await markAsRead(item._id);
        setNotifications((prev) =>
          prev.map((n) => (n._id === item._id ? { ...n, isRead: true } : n))
        );
      }
    } catch { /* keep navigation even if API fails */ }
    setOpen(false);
    navigate(item.link || '/notifications');
  };

  return (
    <div className="relative" ref={wrapperRef}>
      <button
        type="button"
        onClick={handleOpen}
        aria-label="Notifications"
        className="relative inline-flex h-8 w-8 items-center justify-center rounded-lg border border-[#2A2E3E] bg-[#1C1F29] text-[#8B91A8] transition hover:border-[#353A50] hover:text-[#E8EAF0]"
      >
        <BellIcon />
        {unreadCount > 0 && (
          <span className="absolute -right-1 -top-1 inline-flex h-4 min-w-4 items-center justify-center rounded-full bg-indigo-500 px-1 text-[10px] font-bold text-white">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 z-[120] mt-2 w-80 overflow-hidden rounded-xl border border-[#2A2E3E] bg-[#14161C] shadow-xl shadow-black/40">
          <div className="flex items-center justify-between border-b border-[#2A2E3E] px-3 py-2.5">
            <p className="text-sm font-semibold text-[#E8EAF0]">Notifications</p>
            <button
              type="button"
              onClick={handleMarkAll}
              className="text-xs font-medium text-indigo-400 transition hover:text-indigo-300"
            >
              Mark all read
            </button>
          </div>

          <div className="max-h-80 overflow-y-auto">
            {loading ? (
              <div className="flex items-center justify-center py-6">
                <Spinner size="sm" />
              </div>
            ) : latestNotifications.length === 0 ? (
              <p className="px-4 py-5 text-sm text-[#8B91A8]">No notifications yet.</p>
            ) : (
              latestNotifications.map((item) => (
                <button
                  key={item._id}
                  type="button"
                  onClick={() => handleClick(item)}
                  className={`w-full border-b border-[#2A2E3E] px-4 py-3 text-left transition last:border-b-0 hover:bg-[#1C1F29] ${
                    item.isRead ? 'opacity-60' : ''
                  }`}
                >
                  <div className="flex items-start gap-2">
                    {!item.isRead && (
                      <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-indigo-400" />
                    )}
                    <div className={item.isRead ? '' : ''}>
                      <p className="text-xs font-semibold text-[#E8EAF0]">{item.title}</p>
                      <p className="mt-0.5 text-xs text-[#8B91A8]">{item.message}</p>
                      <p className="mt-1 text-[10px] text-[#555D78]">
                        {new Date(item.createdAt).toLocaleString()}
                      </p>
                    </div>
                  </div>
                </button>
              ))
            )}
          </div>

          <Link
            to="/notifications"
            onClick={() => setOpen(false)}
            className="block border-t border-[#2A2E3E] px-4 py-2.5 text-center text-xs font-medium text-indigo-400 transition hover:bg-[#1C1F29] hover:text-indigo-300"
          >
            View all notifications
          </Link>
        </div>
      )}
    </div>
  );
};

export default NotificationBell;
