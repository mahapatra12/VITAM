import { useEffect, useState } from 'react';
import {
  Calendar,
  Camera,
  CreditCard,
  Globe,
  Mail,
  Phone,
  Save,
  ShieldCheck,
  UploadCloud,
  User
} from 'lucide-react';
import DashboardLayout from '../../layouts/DashboardLayout';
import { GlassCard } from '../../components/ui/DashboardComponents';
import WorkspaceHero from '../../components/ui/WorkspaceHero';
import { useAuth } from '../../context/AuthContext';
import api from '../../utils/api';
import { safeLocalStorage } from '../../utils/browserStorage';
import { useToast } from '../../components/ui/ToastSystem';
import { getMediaUploadErrorMessage, validateProfileImageFile } from '../../utils/mediaUpload';
import { loadSystemHealth } from '../../utils/systemHealth';

const PROFILE_FIELDS = [
  { label: 'Display Name', key: 'name', icon: User, placeholder: 'Enter full name' },
  { label: 'Official Email', key: 'email', icon: Mail, readOnly: true },
  { label: 'Contact Number', key: 'mobileNo', icon: Phone, placeholder: '+91 00000 00000' },
  { label: 'Aadhaar Reference', key: 'aadharNo', icon: CreditCard, placeholder: 'XXXX XXXX XXXX' },
  { label: 'Date of Birth', key: 'dob', icon: Calendar, type: 'date' },
  { label: 'Department', key: 'branch', icon: Globe, placeholder: 'Department or stream' }
];

const roleLabel = (user) => {
  const subRole = String(user?.subRole || '').replace(/_/g, ' ').trim();
  if (subRole && subRole !== 'none') {
    return subRole.toUpperCase();
  }
  return String(user?.role || 'USER').toUpperCase();
};

export default function Profile() {
  const { user, setUser } = useAuth();
  const { push } = useToast();
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [mediaUploadReady, setMediaUploadReady] = useState(true);
  const [profileData, setProfileData] = useState({
    name: '',
    email: '',
    mobileNo: '',
    aadharNo: '',
    dob: '',
    branch: '',
    profilePhoto: ''
  });

  const applyProfilePayload = (profileUser = {}) => {
    setProfileData({
      name: profileUser.name || user?.name || '',
      email: profileUser.email || user?.email || '',
      mobileNo: profileUser.mobileNo || '',
      aadharNo: profileUser.aadharNo || '',
      dob: profileUser.dob ? String(profileUser.dob).split('T')[0] : '',
      branch: profileUser.branch || profileUser.department || '',
      profilePhoto: profileUser.profilePhoto || user?.profilePhoto || ''
    });
  };

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        setLoading(true);
        const { data } = await api.get('/auth/profile', {
          cache: {
            maxAge: 20000,
            staleWhileRevalidate: true,
            revalidateAfter: 9000,
            persist: true,
            onUpdate: (response) => applyProfilePayload(response?.data?.user || {})
          }
        });
        applyProfilePayload(data?.user || {});
      } catch (err) {
        setProfileData((current) => ({
          ...current,
          name: user?.name || '',
          email: user?.email || '',
          profilePhoto: user?.profilePhoto || ''
        }));
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [user?.email, user?.name, user?.profilePhoto]);

  useEffect(() => {
    let active = true;

    const checkMediaHealth = async () => {
      const snapshot = await loadSystemHealth(api);
      if (!active || !snapshot || typeof snapshot.mediaUploadReady !== 'boolean') {
        return;
      }
      setMediaUploadReady(snapshot.mediaUploadReady);
    };

    checkMediaHealth();
    return () => {
      active = false;
    };
  }, []);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setProfileData((current) => ({ ...current, [name]: value }));
  };

  const handlePhotoUpload = async (event) => {
    if (!mediaUploadReady) {
      push({
        type: 'warning',
        title: 'Media Uplink Offline',
        body: 'Profile media uploads are temporarily unavailable. You can still update the rest of your profile.'
      });
      return;
    }

    const file = event.target.files?.[0];
    const validationError = validateProfileImageFile(file);
    if (validationError) {
      push({ type: 'warning', title: 'Upload Blocked', body: validationError });
      return;
    }

    const formData = new FormData();
    formData.append('file', file);

    try {
      setSaving(true);
      const { data } = await api.post('/upload/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      setProfileData((current) => ({ ...current, profilePhoto: data.url }));
      push({
        type: 'success',
        title: 'Photo Uploaded',
        body: 'Your profile image is ready. Save your profile to commit the change.'
      });
    } catch (err) {
      push({
        type: 'error',
        title: 'Upload Failed',
        body: getMediaUploadErrorMessage(err, 'Unable to upload profile media right now.')
      });
    } finally {
      setSaving(false);
    }
  };

  const handleUpdate = async () => {
    try {
      setSaving(true);
      const payload = {
        name: profileData.name,
        mobileNo: profileData.mobileNo,
        aadharNo: profileData.aadharNo,
        dob: profileData.dob,
        branch: profileData.branch,
        profilePhoto: profileData.profilePhoto
      };

      const { data } = await api.put('/auth/update-profile', payload);
      const updatedUser = { ...user, ...(data?.user || payload) };
      safeLocalStorage.setItem('vitam_user', JSON.stringify(updatedUser));
      if (typeof setUser === 'function') {
        setUser(updatedUser);
      }

      push({
        type: 'success',
        title: 'Profile Synchronized',
        body: 'Your institutional identity record has been updated successfully.'
      });
    } catch (err) {
      push({
        type: 'error',
        title: 'Update Failed',
        body: err.response?.data?.msg || err.message || 'Unable to update the profile right now.'
      });
    } finally {
      setSaving(false);
    }
  };

  return (
    <DashboardLayout title="Institutional Profile" role={user?.role?.toUpperCase() || 'STUDENT'}>
      <WorkspaceHero
        eyebrow="Profile workspace"
        title={profileData.name || user?.name || 'Institutional Identity'}
        description="Keep your verified identity, communication details, and core profile records current from one calmer workspace designed for everyday updates."
        icon={ShieldCheck}
        badges={[
          roleLabel(user),
          mediaUploadReady ? 'Media uplink ready' : 'Media uplink limited',
          loading ? 'Refreshing records' : 'Identity verified'
        ]}
        actions={[
          {
            label: saving ? 'Saving...' : 'Save Profile',
            icon: Save,
            tone: 'primary',
            disabled: saving,
            onClick: handleUpdate
          }
        ]}
        stats={[
          { label: 'Official email', value: profileData.email || 'Not linked' },
          { label: 'Role', value: roleLabel(user) },
          { label: 'Department', value: profileData.branch || 'Not assigned' },
          { label: 'Profile state', value: profileData.profilePhoto ? 'Complete' : 'Needs photo' }
        ]}
        aside={(
          <div className="glass-panel h-full p-6 md:p-7">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-[10px] font-extrabold uppercase tracking-[0.24em] text-slate-400">
                  Identity Portrait
                </p>
                <h3 className="mt-2 text-2xl font-black text-white">
                  Verified profile media
                </h3>
              </div>
              <div className="rounded-2xl border border-blue-500/20 bg-blue-500/10 p-3 text-blue-200">
                <Camera size={18} />
              </div>
            </div>

            <div className="mt-6 flex flex-col items-center gap-5">
              <div className="relative h-40 w-40 overflow-hidden rounded-[2rem] border border-white/10 bg-slate-950/80 shadow-2xl">
                {profileData.profilePhoto ? (
                  <img src={profileData.profilePhoto} alt="Profile" className="h-full w-full object-cover" />
                ) : (
                  <div className="flex h-full w-full items-center justify-center text-slate-500">
                    <User size={56} />
                  </div>
                )}
              </div>

              <label className={`btn-secondary ${mediaUploadReady ? 'cursor-pointer' : 'cursor-not-allowed opacity-60'}`}>
                <UploadCloud size={14} />
                Upload Photo
                <input
                  type="file"
                  className="hidden"
                  accept="image/jpeg,image/png"
                  onChange={handlePhotoUpload}
                  disabled={!mediaUploadReady}
                />
              </label>

              <p className="text-center text-xs leading-6 text-slate-300">
                {mediaUploadReady
                  ? 'Use a clear formal photo so your profile looks consistent across dashboards and identity checks.'
                  : 'Media uploads are paused right now, but your written profile details can still be updated safely.'}
              </p>
            </div>
          </div>
        )}
      />

      <div className="grid gap-8 lg:grid-cols-[1.2fr_0.8fr]">
        <GlassCard title="Identity Ledger" subtitle="Verified institutional details">
          <div className="mt-4 grid gap-4 md:grid-cols-2">
            {PROFILE_FIELDS.map((field) => {
              const Icon = field.icon;
              return (
                <div key={field.key} className="surface-card p-4">
                  <div className="mb-3 flex items-center gap-3">
                    <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-2.5 text-blue-200">
                      <Icon size={16} />
                    </div>
                    <span className="text-[10px] font-extrabold uppercase tracking-[0.24em] text-slate-400">
                      {field.label}
                    </span>
                  </div>
                  <input
                    type={field.type || 'text'}
                    name={field.key}
                    value={profileData[field.key] || ''}
                    onChange={handleChange}
                    readOnly={field.readOnly}
                    placeholder={field.placeholder}
                    className={`w-full rounded-2xl border px-4 py-3 text-sm font-semibold outline-none transition-all ${
                      field.readOnly
                        ? 'cursor-not-allowed border-white/5 bg-white/[0.03] text-slate-400'
                        : 'border-white/10 bg-slate-950/70 text-white focus:border-blue-500/40'
                    }`}
                  />
                </div>
              );
            })}
          </div>
        </GlassCard>

        <div className="space-y-8">
          <GlassCard title="Profile Guidance" subtitle="Keep your identity record strong">
            <div className="mt-4 space-y-4">
              {[
                'Use your official phone number so alerts and verification codes arrive without delay.',
                'Keep your department and personal details current for cleaner dashboard recommendations.',
                'A clear profile photo improves trust and consistency across secure workflows.'
              ].map((tip) => (
                <div key={tip} className="surface-card p-4">
                  <p className="text-sm leading-6 text-slate-200">
                    {tip}
                  </p>
                </div>
              ))}
            </div>
          </GlassCard>

          <GlassCard title="Profile Status" subtitle="Current readiness snapshot">
            <div className="mt-4 grid gap-3">
              {[
                { label: 'Photo readiness', value: profileData.profilePhoto ? 'Uploaded' : 'Pending' },
                { label: 'Media service', value: mediaUploadReady ? 'Available' : 'Limited' },
                { label: 'Save state', value: saving ? 'Synchronizing' : 'Ready' }
              ].map((item) => (
                <div key={item.label} className="surface-card flex items-center justify-between p-4">
                  <span className="text-[10px] font-extrabold uppercase tracking-[0.22em] text-slate-400">
                    {item.label}
                  </span>
                  <span className="text-sm font-black text-white">
                    {item.value}
                  </span>
                </div>
              ))}
            </div>
          </GlassCard>
        </div>
      </div>
    </DashboardLayout>
  );
}
