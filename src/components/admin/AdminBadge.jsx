import { Chip } from '@heroui/react';

const colorMap = {
  success: 'success',
  warning: 'warning',
  info:    'accent',
  danger:  'danger',
  neutral: 'default',
};

const AdminBadge = ({ children, variant = 'neutral' }) => (
  <Chip size="sm" color={colorMap[variant] ?? 'default'} variant="soft">
    {children}
  </Chip>
);

export default AdminBadge;
