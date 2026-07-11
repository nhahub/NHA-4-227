import { useEffect, useState } from 'react';
import { Alert, Card, Chip, Spinner } from '@heroui/react';
import { getAdminSettings } from '../../services/adminService';

const SettingCard = ({ label, value, description, statusChip }) => (
  <Card className="border border-[#2A2E3E] bg-[#14161C]">
    <Card.Content className="p-5">
      <div className="flex items-start justify-between gap-3">
        <p className="text-xs uppercase tracking-wide text-[#8B91A8]">{label}</p>
        {statusChip}
      </div>
      <p className="mt-2 text-base font-semibold text-[#E8EAF0]">{value}</p>
      {description ? <p className="mt-2 text-sm leading-relaxed text-[#8B91A8]">{description}</p> : null}
    </Card.Content>
  </Card>
);

const AdminSettings = () => {
  const [settings, setSettings] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        setLoading(true);
        setError('');
        const data = await getAdminSettings();
        setSettings(data);
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to load settings.');
      } finally {
        setLoading(false);
      }
    };

    fetchSettings();
  }, []);

  return (
    <section className="space-y-4">
      <div className="admin-panel p-5">
        <h2 className="text-lg font-bold text-[var(--text)]">Platform Settings</h2>
        <p className="text-sm text-[var(--text2)]">Read-only system settings for the admin console.</p>
      </div>

      {loading && (
        <div className="flex items-center justify-center py-10">
          <Spinner size="lg" />
        </div>
      )}

      {error && (
        <Alert status="danger">
          <Alert.Indicator />
          <Alert.Content><Alert.Description>{error}</Alert.Description></Alert.Content>
        </Alert>
      )}

      {!loading && !error && settings && (
        <div className="grid gap-4 md:grid-cols-2">
          <SettingCard label="Platform Name" value={settings.platformName} />
          <SettingCard label="Currency" value={settings.currency} />
          <SettingCard
            label="Maintenance Mode"
            value={settings.maintenanceMode ? 'Enabled' : 'Disabled'}
            statusChip={
              <Chip size="sm" color={settings.maintenanceMode ? 'warning' : 'success'} variant="soft">
                {settings.maintenanceMode ? 'Enabled' : 'Disabled'}
              </Chip>
            }
            description="Temporarily disables customer-facing activity during system updates."
          />
          <SettingCard
            label="Allow Guest Checkout"
            value={settings.allowGuestCheckout ? 'Enabled' : 'Disabled'}
            statusChip={
              <Chip size="sm" color={settings.allowGuestCheckout ? 'warning' : 'success'} variant="soft">
                {settings.allowGuestCheckout ? 'Enabled' : 'Disabled'}
              </Chip>
            }
            description="Allows users to place orders without logging in. Disabled for better order tracking."
          />
          <div className="md:col-span-2">
            <SettingCard label="Support Email" value={settings.supportEmail} />
          </div>
        </div>
      )}
    </section>
  );
};

export default AdminSettings;
