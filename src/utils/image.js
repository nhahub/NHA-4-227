const API_ORIGIN = import.meta.env.VITE_API_ORIGIN || 'http://localhost:5000';

export const resolveImageUrl = (imagePath) => {
  if (!imagePath || typeof imagePath !== 'string') {
    return '';
  }

  const value = imagePath.trim();
  if (!value) return '';

  const normalized = value.replace(/\\/g, '/');

  if (normalized.startsWith('http://') || normalized.startsWith('https://')) {
    return normalized;
  }

  if (normalized.startsWith('data:') || normalized.startsWith('blob:')) {
    return normalized;
  }

  if (normalized.startsWith('/uploads')) {
    return `${API_ORIGIN}${normalized}`;
  }

  if (normalized.startsWith('uploads/')) {
    return `${API_ORIGIN}/${normalized}`;
  }

  // Unrecognised path — treat as a bare filename inside /uploads
  // (handles cases where only the filename was stored, e.g. "photo.jpg")
  if (normalized && !normalized.includes('/')) {
    return `${API_ORIGIN}/uploads/${normalized}`;
  }

  return '';
};
