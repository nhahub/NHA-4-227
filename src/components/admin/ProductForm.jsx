import { useEffect, useMemo, useState } from 'react';
import { Alert, Button, Spinner } from '@heroui/react';
import { resolveImageUrl } from '../../utils/image';
import { uploadProductImage } from '../../services/productService';
import { getCategories } from '../../services/categoryService';

const defaultValues = {
  name: '',
  description: '',
  price: '',
  image: '',
  category: '',
  brand: '',
  countInStock: '',
  isFeatured: false,
};

const MANUAL_CATEGORY_VALUE = '__manual__';

const inputClass =
  'w-full rounded-lg border border-[#2A2E3E] bg-[#1C1F29] px-3 py-2 text-sm text-[#E8EAF0] focus:border-[#6366F1] focus:outline-none';

const ProductForm = ({
  initialValues = defaultValues,
  onSubmit,
  onSubmitDraft,   // if provided, shows "Save as Draft" button
  onCancel,
  submitText = 'Save Product',
  submitting = false,
  externalError = '',
}) => {
  const [form, setForm] = useState(defaultValues);
  const [errors, setErrors] = useState({});
  const [localError, setLocalError] = useState('');
  const [uploadingImage, setUploadingImage] = useState(false);
  const [categoryOptions, setCategoryOptions] = useState([]);
  const [categoriesLoadFailed, setCategoriesLoadFailed] = useState(false);
  const [useManualCategory, setUseManualCategory] = useState(false);

  useEffect(() => {
    setForm({
      ...defaultValues,
      ...initialValues,
      price:
        initialValues?.price === null || initialValues?.price === undefined
          ? ''
          : String(initialValues.price),
      countInStock:
        initialValues?.countInStock === null || initialValues?.countInStock === undefined
          ? ''
          : String(initialValues.countInStock),
      isFeatured: Boolean(initialValues?.isFeatured),
    });
    setErrors({});
    setLocalError('');
    setUseManualCategory(false);
  }, [initialValues]);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const data = await getCategories();
        const names = (Array.isArray(data) ? data : [])
          .map((item) => (typeof item === 'string' ? item : item.name))
          .filter(Boolean);

        setCategoryOptions(Array.from(new Set(names)));
        setCategoriesLoadFailed(false);
      } catch {
        setCategoryOptions([]);
        setCategoriesLoadFailed(true);
      }
    };

    fetchCategories();
  }, []);

  useEffect(() => {
    if (categoriesLoadFailed) {
      return;
    }

    const current = String(form.category || '').trim();
    if (!current) {
      return;
    }

    if (categoryOptions.length > 0 && !categoryOptions.includes(current)) {
      setUseManualCategory(true);
    }
  }, [categoryOptions, categoriesLoadFailed, form.category]);

  const validation = useMemo(() => {
    const nextErrors = {};

    if (!String(form.name || '').trim()) nextErrors.name = 'Name is required';
    if (!String(form.description || '').trim()) nextErrors.description = 'Description is required';
    if (!String(form.category || '').trim()) {
      nextErrors.category = 'Category is required';
    }
    if (!String(form.image || '').trim()) nextErrors.image = 'Image is required';

    const priceValue = Number(form.price);
    if (Number.isNaN(priceValue) || priceValue < 0) {
      nextErrors.price = 'Price must be a valid number';
    }

    const stockValue = Number(form.countInStock);
    if (Number.isNaN(stockValue) || stockValue < 0) {
      nextErrors.countInStock = 'Stock must be a valid non-negative number';
    }

    return nextErrors;
  }, [form]);

  const handleChange = (event) => {
    const { name, value, type, checked } = event.target;

    if (name === 'category') {
      if (value === MANUAL_CATEGORY_VALUE) {
        setUseManualCategory(true);
        setForm((prev) => ({ ...prev, category: '' }));
      } else {
        setUseManualCategory(false);
        setForm((prev) => ({ ...prev, category: value }));
      }
      setErrors((prev) => ({ ...prev, [name]: '' }));
      setLocalError('');
      return;
    }

    setForm((prev) => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
    setErrors((prev) => ({ ...prev, [name]: '' }));
    setLocalError('');
  };

  const handleImageUpload = async (event) => {
    const file = event.target.files?.[0];
    if (!file) {
      return;
    }

    try {
      setUploadingImage(true);
      setLocalError('');
      const response = await uploadProductImage(file);
      setForm((prev) => ({ ...prev, image: response.image || '' }));
      setErrors((prev) => ({ ...prev, image: '' }));
    } catch (err) {
      setLocalError(err.response?.data?.message || 'Failed to upload image.');
    } finally {
      setUploadingImage(false);
      event.target.value = '';
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setErrors(validation);

    if (Object.keys(validation).length > 0) {
      return;
    }

    const payload = {
      name: form.name.trim(),
      description: form.description.trim(),
      price: Number(form.price),
      image: form.image.trim(),
      category: form.category.trim(),
      brand: form.brand?.trim() || '',
      countInStock: Number(form.countInStock || 0),
      isFeatured: Boolean(form.isFeatured),
    };

    await onSubmit(payload);
  };

  const handleDraftSubmit = async () => {
    setErrors(validation);
    if (Object.keys(validation).length > 0) return;

    const payload = {
      name: form.name.trim(),
      description: form.description.trim(),
      price: Number(form.price),
      image: form.image.trim(),
      category: form.category.trim(),
      brand: form.brand?.trim() || '',
      countInStock: Number(form.countInStock || 0),
      isFeatured: Boolean(form.isFeatured),
    };

    await onSubmitDraft(payload);
  };

  return (
    <form onSubmit={handleSubmit} className="grid gap-4 md:grid-cols-2">
      {(externalError || localError) && (
        <div className="md:col-span-2">
          <Alert status="danger">
            <Alert.Indicator />
            <Alert.Content>
              <Alert.Description>{externalError || localError}</Alert.Description>
            </Alert.Content>
          </Alert>
        </div>
      )}

      <label className="space-y-1">
        <span className="text-sm text-[#8B91A8]">Name</span>
        <input name="name" value={form.name} onChange={handleChange} className={inputClass} />
        {errors.name && <p className="text-xs text-rose-300">{errors.name}</p>}
      </label>

      <label className="space-y-1">
        <span className="text-sm text-[#8B91A8]">Category</span>
        {categoriesLoadFailed ? (
          <input name="category" value={form.category} onChange={handleChange} className={inputClass} />
        ) : (
          <>
            <select
              name="category"
              value={useManualCategory ? MANUAL_CATEGORY_VALUE : form.category}
              onChange={handleChange}
              className={inputClass}
            >
              <option value="">Select category</option>
              {categoryOptions.map((item) => (
                <option key={item} value={item}>{item}</option>
              ))}
              <option value={MANUAL_CATEGORY_VALUE}>Other (manual)</option>
            </select>
            {useManualCategory && (
              <input
                name="category"
                value={form.category}
                onChange={handleChange}
                placeholder="Type custom category"
                className={`mt-2 ${inputClass}`}
              />
            )}
          </>
        )}
        {errors.category && <p className="text-xs text-rose-300">{errors.category}</p>}
      </label>

      <label className="space-y-1">
        <span className="text-sm text-[#8B91A8]">Price</span>
        <input
          name="price"
          type="number"
          min="0"
          step="0.01"
          value={form.price}
          onChange={handleChange}
          className={inputClass}
        />
        {errors.price && <p className="text-xs text-rose-300">{errors.price}</p>}
      </label>

      <label className="space-y-1">
        <span className="text-sm text-[#8B91A8]">Count In Stock</span>
        <input
          name="countInStock"
          type="number"
          min="0"
          value={form.countInStock}
          onChange={handleChange}
          className={inputClass}
        />
        {errors.countInStock && <p className="text-xs text-rose-300">{errors.countInStock}</p>}
      </label>

      <label className="space-y-1 md:col-span-2">
        <span className="text-sm text-[#8B91A8]">Image URL</span>
        <input name="image" value={form.image} onChange={handleChange} className={inputClass} />
        {errors.image && <p className="text-xs text-rose-300">{errors.image}</p>}
      </label>

      <label className="space-y-1 md:col-span-2">
        <span className="text-sm text-[#8B91A8]">Upload Image</span>
        <input
          type="file"
          accept="image/*"
          onChange={handleImageUpload}
          className="w-full rounded-lg border border-[#2A2E3E] bg-[#1C1F29] px-3 py-2 text-sm text-[#E8EAF0] file:mr-3 file:rounded-md file:border-0 file:bg-[#6366F1]/20 file:px-3 file:py-1 file:text-xs file:font-semibold file:text-[#C9CEFF] focus:border-[#6366F1] focus:outline-none"
        />
        {uploadingImage && (
          <p className="flex items-center gap-2 text-xs text-[#8B91A8]">
            <Spinner size="sm" /> Uploading image...
          </p>
        )}
      </label>

      {form.image && (
        <div className="md:col-span-2">
          <img
            src={resolveImageUrl(form.image)}
            alt="Product preview"
            className="h-28 w-28 rounded-lg border border-[#2A2E3E] object-cover"
          />
        </div>
      )}

      <label className="space-y-1">
        <span className="text-sm text-[#8B91A8]">Brand</span>
        <input name="brand" value={form.brand} onChange={handleChange} className={inputClass} />
      </label>

      <label className="mt-7 inline-flex items-center gap-2 text-sm text-[#C4C9DB]">
        <input
          name="isFeatured"
          type="checkbox"
          checked={form.isFeatured}
          onChange={handleChange}
          className="h-4 w-4 rounded border-[#2A2E3E] bg-[#1C1F29] text-[#6366F1] focus:ring-[#6366F1]"
        />
        Featured Product
      </label>

      <label className="space-y-1 md:col-span-2">
        <span className="text-sm text-[#8B91A8]">Description</span>
        <textarea
          name="description"
          rows={4}
          value={form.description}
          onChange={handleChange}
          className={inputClass}
        />
        {errors.description && <p className="text-xs text-rose-300">{errors.description}</p>}
      </label>

      <div className="md:col-span-2 flex flex-wrap gap-2 pt-2">
        {onSubmitDraft && (
          <Button
            type="button"
            variant="ghost"
            isDisabled={submitting || uploadingImage}
            onClick={handleDraftSubmit}
            className="border border-[#2A2E3E] text-[#8B91A8] hover:bg-[#1C1F29] hover:text-[#E8EAF0]"
          >
            Save as Draft
          </Button>
        )}
        <Button
          type="submit"
          isLoading={submitting}
          isDisabled={submitting || uploadingImage}
          className="bg-indigo-600 text-white hover:bg-indigo-500"
        >
          {onSubmitDraft ? 'Submit for Review' : submitText}
        </Button>
        {onCancel && (
          <Button
            type="button"
            variant="ghost"
            onClick={onCancel}
            className="border border-[#2A2E3E] text-[#A4ABC0]"
          >
            Cancel
          </Button>
        )}
      </div>
    </form>
  );
};

export default ProductForm;
