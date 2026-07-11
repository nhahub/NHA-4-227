import { useEffect, useMemo, useState } from 'react';
import { Alert } from '@heroui/react';
import AdminTable from '../../components/admin/AdminTable';
import AdminBadge from '../../components/admin/AdminBadge';
import { getAdminUsers } from '../../services/adminService';

const AdminUsers = () => {
  const [users, setUsers] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        setLoading(true);
        setError('');
        const data = await getAdminUsers();
        setUsers(data);
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to load users.');
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, []);

  const filteredUsers = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) {
      return users;
    }

    return users.filter(
      (user) => user.name.toLowerCase().includes(q) || user.email.toLowerCase().includes(q)
    );
  }, [users, search]);

  const roleVariant = (role) => {
    if (role === 'admin') return 'info';
    if (role === 'seller') return 'success';
    if (role === 'support') return 'warning';
    return 'neutral';
  };

  const columns = [
    { key: 'name', label: 'Name', render: (row) => <span className="font-medium text-[var(--text)]">{row.name}</span> },
    { key: 'email', label: 'Email' },
    {
      key: 'role',
      label: 'Role',
      render: (row) => <AdminBadge variant={roleVariant(row.role)}>{row.role}</AdminBadge>,
    },
    {
      key: 'createdAt',
      label: 'Created',
      render: (row) => new Date(row.createdAt).toLocaleDateString(),
    },
  ];

  return (
    <section className="space-y-4">
      <div className="admin-panel p-5">
        <h2 className="text-lg font-bold text-[var(--text)]">Users</h2>
        <p className="text-sm text-[var(--text2)]">Manage platform users and roles.</p>
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search by name or email..."
          className="mt-4 w-full rounded-lg border border-[var(--border)] bg-[var(--bg3)] px-3 py-2 text-sm text-[var(--text)] outline-none transition focus:border-[var(--accent)]"
        />
      </div>

      {loading && <div className="admin-panel p-5 text-sm text-[var(--text2)]">Loading users...</div>}

      {error && (
        <Alert status="danger">
          <Alert.Indicator />
          <Alert.Content><Alert.Description>{error}</Alert.Description></Alert.Content>
        </Alert>
      )}

      {!loading && !error && (
        <AdminTable columns={columns} data={filteredUsers} emptyText="No users found" />
      )}
    </section>
  );
};

export default AdminUsers;
