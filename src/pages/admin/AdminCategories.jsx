import { useEffect, useMemo, useState } from 'react';
import { Alert, Button, Chip } from '@heroui/react';
import {
  createCategory,
  deleteCategory,
  getCategories,
  updateCategory,
} from '../../services/categoryService';

const initialForm = {
  name: '',
  description: '',
  isActive: true,
};

const inputClass =
  'w-full rounded-lg border border-[#2A2E3E] bg-[#1C1F29] px-3 py-2 text-sm text-[#E8EAF0] focus:border-[#6366F1] focus:outline-none';

const AdminCategories = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [search, setSearch] = useState('');
  const [form, setForm] = useState(initialForm);
  const [formError, setFormError] = useState('');
  const [saving, setSaving] = useState(false);
  const [editingId, setEditingId] = useState('');
  const [deletingId, setDeletingId] = useState('');

  const fetchCategories = async () => {
    try {
      setLoading(true);
      setError('');
      const data = await getCategories({ includeInactive: true });
      setCategories(Array.isArray(data) ? data : []);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load categories.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const filteredCategories = useMemo(() => {
    const query = search.trim().toLowerCase();
    if (!query) return categories;

    return categories.filter((item) =>
      [item.name, item.slug, item.description]
        .filter(Boolean)
        .some((value) => String(value).toLowerCase().includes(query))
    );
  }, [categories, search]);

  const resetForm = () => {
    setForm(initialForm);
    setEditingId('');
    setFormError('');
  };

  const handleChange = (event) => {
    const { name, value, type, checked } = event.target;
    setForm((prev) => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
    setFormError('');
  };

  const handleEdit = (category) => {
    setEditingId(category._id);
    setForm({
      name: category.name || '',
      description: category.description || '',
      isActive: Boolean(category.isActive),
    });
    setFormError('');
    setSuccess('');
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    const cleanName = String(form.name || '').trim();
    if (!cleanName) {
      setFormError('Category name is required.');
      return;
    }

    try {
      setSaving(true);
      setFormError('');
      setError('');
      setSuccess('');

      const payload = {
        name: cleanName,
        description: String(form.description || '').trim(),
        isActive: Boolean(form.isActive),
      };

      if (editingId) {
        await updateCategory(editingId, payload);
        setSuccess('Category updated successfully.');
      } else {
        await createCategory(payload);
        setSuccess('Category created successfully.');
      }

      resetForm();
      await fetchCategories();
    } catch (err) {
      setFormError(err.response?.data?.message || 'Failed to save category.');
    } finally {
      setSaving(false);
    }
  };

  const handleDeactivate = async (category) => {
    const confirmed = window.confirm(`Deactivate "${category.name}"?`);
    if (!confirmed) return;

    try {
      setDeletingId(category._id);
      setError('');
      setSuccess('');
      await deleteCategory(category._id);
      setSuccess('Category deactivated successfully.');
      await fetchCategories();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to deactivate category.');
    } finally {
      setDeletingId('');
    }
  };

  return (
    <section className="space-y-4">
      <div className="admin-panel p-5">
        <h2 className="text-lg font-bold text-[var(--text)]">Categories</h2>
        <p className="text-sm text-[var(--text2)]">Create, edit, and deactivate product categories.</p>
      </div>

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

      <div className="grid gap-4 lg:grid-cols-[1fr_1.4fr]">
        <div className="rounded-2xl border border-[#2A2E3E] bg-[#14161C] p-5">
          <h3 className="mb-3 text-base font-bold text-[#E8EAF0]">
            {editingId ? 'Edit Category' : 'Add Category'}
          </h3>

          {formError && (
            <div className="mb-3">
              <Alert status="danger">
                <Alert.Indicator />
                <Alert.Content><Alert.Description>{formError}</Alert.Description></Alert.Content>
              </Alert>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-3">
            <label className="block space-y-1">
              <span className="text-sm text-[#8B91A8]">Name</span>
              <input name="name" value={form.name} onChange={handleChange} className={inputClass} />
            </label>

            <label className="block space-y-1">
              <span className="text-sm text-[#8B91A8]">Description</span>
              <textarea
                name="description"
                rows={3}
                value={form.description}
                onChange={handleChange}
                className={inputClass}
              />
            </label>

            <label className="inline-flex items-center gap-2 text-sm text-[#C4C9DB]">
              <input
                type="checkbox"
                name="isActive"
                checked={Boolean(form.isActive)}
                onChange={handleChange}
                className="h-4 w-4 rounded border-[#2A2E3E] bg-[#1C1F29] text-[#6366F1] focus:ring-[#6366F1]"
              />
              Active
            </label>

            <div className="flex flex-wrap gap-2 pt-2">
              <Button
                type="submit"
                isLoading={saving}
                isDisabled={saving}
                className="border border-indigo-500/35 bg-indigo-500/15 text-indigo-300 hover:bg-indigo-500/25"
                variant="ghost"
              >
                {editingId ? 'Save Changes' : 'Create Category'}
              </Button>
              {editingId && (
                <Button
                  type="button"
                  variant="ghost"
                  onClick={resetForm}
                  className="border border-[#2A2E3E] text-[#A4ABC0] hover:text-[#E8EAF0]"
                >
                  Cancel
                </Button>
              )}
            </div>
          </form>
        </div>

        <div className="rounded-2xl border border-[#2A2E3E] bg-[#14161C] p-5">
          <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
            <h3 className="text-base font-bold text-[#E8EAF0]">All Categories</h3>
            <input
              type="text"
              placeholder="Search categories..."
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              className="w-full max-w-xs rounded-lg border border-[#2A2E3E] bg-[#1C1F29] px-3 py-2 text-sm text-[#E8EAF0] placeholder:text-[#8B91A8] focus:border-[#6366F1] focus:outline-none"
            />
          </div>

          {loading ? (
            <p className="text-sm text-[#8B91A8]">Loading categories...</p>
          ) : filteredCategories.length === 0 ? (
            <p className="text-sm text-[#8B91A8]">No categories found.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[680px]">
                <thead>
                  <tr className="border-b border-[#2A2E3E] text-left text-xs uppercase tracking-wide text-[#8B91A8]">
                    <th className="py-2 pr-3">Name</th>
                    <th className="py-2 pr-3">Slug</th>
                    <th className="py-2 pr-3">Description</th>
                    <th className="py-2 pr-3">Status</th>
                    <th className="py-2 pr-3">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredCategories.map((item) => (
                    <tr key={item._id} className="border-b border-[#2A2E3E] text-sm text-[#C4C9DB]">
                      <td className="py-3 pr-3 font-medium text-[#E8EAF0]">{item.name}</td>
                      <td className="py-3 pr-3 text-[#8B91A8]">{item.slug}</td>
                      <td className="py-3 pr-3 text-[#8B91A8]">{item.description || '-'}</td>
                      <td className="py-3 pr-3">
                        <Chip size="sm" color={item.isActive ? 'success' : 'warning'} variant="soft">
                          {item.isActive ? 'Active' : 'Inactive'}
                        </Chip>
                      </td>
                      <td className="py-3 pr-3">
                        <div className="flex flex-wrap gap-2">
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => handleEdit(item)}
                            className="border border-indigo-500/30 bg-indigo-500/10 text-xs text-indigo-300 hover:bg-indigo-500/20"
                          >
                            Edit
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            isDisabled={!item.isActive || deletingId === item._id}
                            isLoading={deletingId === item._id}
                            onClick={() => handleDeactivate(item)}
                            className="border border-rose-500/30 bg-rose-500/10 text-xs text-rose-300 hover:bg-rose-500/20"
                          >
                            Deactivate
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </section>
  );
};

export default AdminCategories;
