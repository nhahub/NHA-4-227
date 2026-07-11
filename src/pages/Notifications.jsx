import { useCallback, useEffect, useMemo, useState } from 'react';
import { Link, Navigate, useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { Alert, Button, Card, Chip, Spinner } from '@heroui/react';
import {
  getNotifications,
  markAllAsRead,
  markAsRead,
} from '../services/notificationService';

const Notifications = () => {
  const navigate = useNavigate();
  const userInfo = useSelector((state) => state.auth.userInfo);
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const unreadCount = useMemo(
    () => notifications.filter((item) => !item.isRead).length,
    [notifications]
  );

  const fetchNotifications = useCallback(async () => {
    try {
      setLoading(true);
      setError('');
      const data = await getNotifications();
      setNotifications(Array.isArray(data) ? data : []);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load notifications.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (userInfo) {
      fetchNotifications();
    }
  }, [fetchNotifications, userInfo]);

  if (!userInfo) {
    return <Navigate to="/login" replace />;
  }

  const handleMarkRead = async (notification) => {
    try {
      if (!notification.isRead) {
        await markAsRead(notification._id);
        setNotifications((prev) =>
          prev.map((item) =>
            item._id === notification._id ? { ...item, isRead: true } : item
          )
        );
      }

      if (notification.link) {
        navigate(notification.link);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update notification.');
    }
  };

  const handleMarkAllRead = async () => {
    try {
      await markAllAsRead();
      setNotifications((prev) => prev.map((item) => ({ ...item, isRead: true })));
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to mark all as read.');
    }
  };

  return (
    <Card className="border border-[#2A2E3E] bg-[#14161C]">
      <Card.Header className="border-b border-[#2A2E3E] px-5 py-5 md:px-8">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <Card.Title className="font-syne text-2xl font-bold text-[#E8EAF0]">Notifications</Card.Title>
            <Card.Description className="text-[#8B91A8]">
              <Chip size="sm" color="accent" variant="soft">{unreadCount} unread</Chip>
            </Card.Description>
          </div>
          <div className="flex items-center gap-2">
            <Button
              type="button"
              size="sm"
              variant="ghost"
              onClick={handleMarkAllRead}
              className="border border-[#6366F1]/40 bg-[#6366F1]/15 text-[#C9CEFF] hover:bg-[#6366F1]/25"
            >
              Mark all as read
            </Button>
            <Link to="/products">
              <Button
                type="button"
                size="sm"
                variant="ghost"
                className="border border-[#2A2E3E] bg-[#1C1F29] text-[#C4C9DB] hover:text-[#E8EAF0]"
              >
                Continue Shopping
              </Button>
            </Link>
          </div>
        </div>
      </Card.Header>

      <Card.Content className="space-y-4 p-5 md:p-8">
        {loading && (
          <div className="flex items-center justify-center py-8">
            <Spinner size="md" />
          </div>
        )}

        {error && (
          <Alert status="danger">
            <Alert.Indicator />
            <Alert.Content><Alert.Description>{error}</Alert.Description></Alert.Content>
          </Alert>
        )}

        {!loading && !error && notifications.length === 0 && (
          <div className="rounded-xl border border-[#2A2E3E] bg-[#1C1F29] p-5 text-sm text-[#8B91A8]">
            No notifications available.
          </div>
        )}

        {!loading && !error && notifications.length > 0 && (
          <div className="space-y-2">
            {notifications.map((notification) => (
              <article
                key={notification._id}
                className={`rounded-xl border p-4 ${
                  notification.isRead
                    ? 'border-[#2A2E3E] bg-[#1C1F29]'
                    : 'border-[#6366F1]/40 bg-[#6366F1]/10'
                }`}
              >
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <p className="text-sm font-semibold text-[#E8EAF0]">{notification.title}</p>
                    <p className="mt-1 text-sm text-[#C4C9DB]">{notification.message}</p>
                    <p className="mt-2 text-xs text-[#8B91A8]">
                      {new Date(notification.createdAt).toLocaleString()}
                    </p>
                  </div>
                  <Button
                    type="button"
                    size="sm"
                    variant="ghost"
                    onClick={() => handleMarkRead(notification)}
                    className="border border-[#2A2E3E] bg-[#14161C] text-[#C4C9DB] hover:text-[#E8EAF0]"
                  >
                    {notification.link ? 'Open' : 'Mark Read'}
                  </Button>
                </div>
              </article>
            ))}
          </div>
        )}
      </Card.Content>
    </Card>
  );
};

export default Notifications;
