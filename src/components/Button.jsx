import { Button as HeroButton } from '@heroui/react';

const variantMap = {
  primary: 'primary',
  secondary: 'secondary',
  outline: 'outline',
  danger: 'danger',
};

const Button = ({
  children,
  variant = 'primary',
  size = 'md',
  loading = false,
  disabled = false,
  className = '',
  type = 'button',
  onClick,
  ...props
}) => (
  <HeroButton
    type={type}
    variant={variantMap[variant] ?? variant}
    size={size}
    isLoading={loading}
    isDisabled={disabled || loading}
    className={className}
    onPress={onClick ? undefined : undefined}
    onClick={onClick}
    {...props}
  >
    {children}
  </HeroButton>
);

export default Button;
