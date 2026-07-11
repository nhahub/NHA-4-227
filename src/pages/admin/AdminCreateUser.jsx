import { useState } from 'react';
import { Alert, Button } from '@heroui/react';
import { createAdminUser } from '../../services/adminService';

const roleOptions = ['customer', 'seller', 'admin', 'support'];

const inputClass =
  'w-full rounded-lg border border-[var(--border)] bg-[var(--bg3)] px-3 py-2 text-sm text-[var(--text)] outline-none transition focus:border-[var(--accent)]';

const AdminCreateUser = () => {
  const [formData, setFormData] = useState({
    name: '',
    displayName: '',
    email: '',
    password: '',
    role: 'customer',
    address: '',
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
      ...(name === 'role' && value !== 'customer' ? { address: '' } : {}),
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!formData.name.trim() || !formData.email.trim() || !formData.password.trim() || !formData.role) {
      setError('Name, email, password, and role are required.');
      return;
    }

    setLoading(true);

    try {
      const payload = {
        name: formData.name.trim(),
        displayName: formData.displayName.trim(),
        email: formData.email.trim(),
        password: formData.password,
        role: formData.role,
        address: formData.role === 'customer' ? formData.address.trim() : '',
      };

      const created = await createAdminUser(payload);
      setSuccess(`User created successfully: ${created.email}`);
      setFormData({
        name: '',
        displayName: '',
        email: '',
        password: '',
        role: 'customer',
        address: '',
      });
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create user.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="space-y-4">
      <div className="admin-panel p-5">
        <h2 className="text-lg font-bold text-[var(--text)]">Create User</h2>
        <p className="text-sm text-[var(--text2)]">
          Create customer, seller, admin, or support accounts.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="admin-panel space-y-4 p-5">
        {error && (
          <Alert status="danger">
            <Alert.Indicator />
            <Alert.Content><Alert.Description>{error}</Alert.Description></Alert.Content>
          </Alert>
        )}
        {success && (
          <Alert status="success">
            <Alert.Indicator />
            <Alert.Content><Alert.Description>{success}</Alert.Description></Alert.Content>
          </Alert>
        )}

        <div className="grid gap-4 md:grid-cols-2">
          <div>
            <label className="mb-1.5 block text-sm font-medium text-[var(--text2)]">Name</label>
            <input type="text" name="name" value={formData.name} onChange={handleChange} className={inputClass} />
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-medium text-[var(--text2)]">Display Name</label>
            <input type="text" name="displayName" value={formData.displayName} onChange={handleChange} className={inputClass} />
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-medium text-[var(--text2)]">Email</label>
            <input type="email" name="email" value={formData.email} onChange={handleChange} className={inputClass} />
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-medium text-[var(--text2)]">Password</label>
            <input type="password" name="password" value={formData.password} onChange={handleChange} className={inputClass} />
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-medium text-[var(--text2)]">Role</label>
            <select name="role" value={formData.role} onChange={handleChange} className={`${inputClass} capitalize`}>
              {roleOptions.map((role) => (
                <option key={role} value={role} className="capitalize">{role}</option>
              ))}
            </select>
          </div>
        </div>

        {formData.role === 'customer' && (
          <div>
            <label className="mb-1.5 block text-sm font-medium text-[var(--text2)]">Address</label>
            <textarea
              rows={3}
              name="address"
              value={formData.address}
              onChange={handleChange}
              placeholder="Customer address"
              className={inputClass}
            />
          </div>
        )}

        <div className="pt-2">
          <Button
            type="submit"
            isLoading={loading}
            isDisabled={loading}
            className="bg-[var(--accent)] text-white hover:brightness-110"
          >
            Create User
          </Button>
        </div>
      </form>
    </section>
  );
};

export default AdminCreateUser;
