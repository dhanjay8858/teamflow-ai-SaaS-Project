import React, { useState, useEffect } from 'react';
import { useAuthStore } from '../../../stores/auth.store';
import { useAuth } from '../hooks/useAuth';
import {
  User as UserIcon,
  Shield,
  Upload,
  Lock,
  LogOut,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
  Calendar,
  AtSign,
  Mail,
} from 'lucide-react';

export const ProfilePage: React.FC = () => {
  const { user } = useAuthStore();
  const { logout, isLoggingOut, updateProfile, isUpdatingProfile, updateProfileError, changePassword, isChangingPassword, changePasswordError } = useAuth();

  const [activeTab, setActiveTab] = useState<'details' | 'edit' | 'password'>('details');

  // Edit Profile Form State
  const [profileData, setProfileData] = useState({
    name: user?.name || '',
    username: user?.username || '',
  });
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(user?.avatar || null);
  const [profileSuccessMsg, setProfileSuccessMsg] = useState<string | null>(null);

  // Change Password Form State
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
  });
  const [passwordSuccessMsg, setPasswordSuccessMsg] = useState<string | null>(null);
  const [passwordClientError, setPasswordClientError] = useState<string | null>(null);

  // Memory cleanup for image previews
  useEffect(() => {
    return () => {
      if (avatarPreview && avatarPreview.startsWith('blob:')) {
        URL.revokeObjectURL(avatarPreview);
      }
    };
  }, [avatarPreview]);

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      if (avatarPreview && avatarPreview.startsWith('blob:')) {
        URL.revokeObjectURL(avatarPreview);
      }
      setAvatarFile(file);
      setAvatarPreview(URL.createObjectURL(file));
    }
  };

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setProfileSuccessMsg(null);

    try {
      await updateProfile({
        name: profileData.name,
        username: profileData.username,
        avatarFile: avatarFile || undefined,
      });
      setProfileSuccessMsg('Profile updated successfully');
    } catch {
      // Error handled by updateProfileError
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordSuccessMsg(null);
    setPasswordClientError(null);

    if (passwordData.newPassword.length < 8) {
      setPasswordClientError('New password must be at least 8 characters long');
      return;
    }

    try {
      await changePassword(passwordData);
      setPasswordSuccessMsg('Password updated successfully');
      setPasswordData({ currentPassword: '', newPassword: '' });
    } catch {
      // Error handled by changePasswordError
    }
  };

  if (!user) return null;

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Profile Header Banner */}
      <div className="bg-[#0e0e12]/80 backdrop-blur-xl border border-zinc-800/90 rounded-2xl p-6 md:p-8 shadow-xl flex flex-col md:flex-row items-center justify-between gap-6 relative overflow-hidden">
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-indigo-500 via-purple-500 to-indigo-600" />

        <div className="flex items-center gap-5 w-full md:w-auto">
          <div className="relative group">
            <div className="h-20 w-20 rounded-2xl bg-zinc-900 border-2 border-indigo-500/30 overflow-hidden flex items-center justify-center shadow-lg">
              {user.avatar ? (
                <img src={user.avatar} alt={user.name} className="h-full w-full object-cover" />
              ) : (
                <UserIcon className="h-10 w-10 text-indigo-400" />
              )}
            </div>
          </div>

          <div className="space-y-1">
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-bold text-white">{user.name}</h1>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                {user.role}
              </span>
            </div>
            <div className="flex items-center gap-3 text-xs text-zinc-400">
              <span className="flex items-center gap-1"><AtSign className="h-3.5 w-3.5 text-zinc-500" />@{user.username}</span>
              <span>•</span>
              <span className="flex items-center gap-1"><Mail className="h-3.5 w-3.5 text-zinc-500" />{user.email}</span>
            </div>
          </div>
        </div>

        <button
          onClick={() => logout()}
          disabled={isLoggingOut}
          className="w-full md:w-auto px-4 py-2.5 rounded-xl bg-zinc-900 hover:bg-rose-500/10 text-zinc-300 hover:text-rose-400 border border-zinc-800 hover:border-rose-500/30 text-xs font-medium flex items-center justify-center gap-2 transition-all"
        >
          <LogOut className="h-4 w-4" />
          <span>Sign Out</span>
        </button>
      </div>

      {/* Navigation Tabs */}
      <div className="flex items-center gap-2 border-b border-zinc-800 pb-1">
        <button
          onClick={() => setActiveTab('details')}
          className={`px-4 py-2 text-xs font-medium rounded-lg transition-colors ${
            activeTab === 'details' ? 'bg-zinc-800 text-white font-semibold' : 'text-zinc-400 hover:text-white'
          }`}
        >
          Account Overview
        </button>
        <button
          onClick={() => setActiveTab('edit')}
          className={`px-4 py-2 text-xs font-medium rounded-lg transition-colors ${
            activeTab === 'edit' ? 'bg-zinc-800 text-white font-semibold' : 'text-zinc-400 hover:text-white'
          }`}
        >
          Edit Profile & Avatar
        </button>
        <button
          onClick={() => setActiveTab('password')}
          className={`px-4 py-2 text-xs font-medium rounded-lg transition-colors ${
            activeTab === 'password' ? 'bg-zinc-800 text-white font-semibold' : 'text-zinc-400 hover:text-white'
          }`}
        >
          Security & Password
        </button>
      </div>

      {/* Tab 1: Account Overview */}
      {activeTab === 'details' && (
        <div className="bg-[#0e0e12]/60 border border-zinc-800/80 rounded-2xl p-6 space-y-6">
          <h3 className="text-base font-semibold text-white">Account Details</h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            <div className="p-4 rounded-xl bg-zinc-950/80 border border-zinc-800 space-y-1">
              <span className="text-zinc-500">Full Name</span>
              <p className="text-white font-medium text-sm">{user.name}</p>
            </div>
            <div className="p-4 rounded-xl bg-zinc-950/80 border border-zinc-800 space-y-1">
              <span className="text-zinc-500">Username</span>
              <p className="text-white font-medium text-sm">@{user.username}</p>
            </div>
            <div className="p-4 rounded-xl bg-zinc-950/80 border border-zinc-800 space-y-1">
              <span className="text-zinc-500">Email Address</span>
              <p className="text-white font-medium text-sm">{user.email}</p>
            </div>
            <div className="p-4 rounded-xl bg-zinc-950/80 border border-zinc-800 space-y-1">
              <span className="text-zinc-500">Role Authority</span>
              <div className="flex items-center gap-1.5 text-indigo-400 font-medium">
                <Shield className="h-4 w-4" />
                <span>{user.role}</span>
              </div>
            </div>
            <div className="p-4 rounded-xl bg-zinc-950/80 border border-zinc-800 space-y-1">
              <span className="text-zinc-500">Member Since</span>
              <div className="flex items-center gap-1.5 text-zinc-300 font-medium">
                <Calendar className="h-3.5 w-3.5 text-zinc-500" />
                <span>{new Date(user.createdAt).toLocaleDateString()}</span>
              </div>
            </div>
            <div className="p-4 rounded-xl bg-zinc-950/80 border border-zinc-800 space-y-1">
              <span className="text-zinc-500">Last Login Timestamp</span>
              <p className="text-zinc-300 font-medium">
                {user.lastLoginAt ? new Date(user.lastLoginAt).toLocaleString() : 'First session active'}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: Edit Profile */}
      {activeTab === 'edit' && (
        <form onSubmit={handleUpdateProfile} className="bg-[#0e0e12]/60 border border-zinc-800/80 rounded-2xl p-6 space-y-6">
          <h3 className="text-base font-semibold text-white">Edit Profile Details</h3>

          {profileSuccessMsg && (
            <div className="p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4" />
              <span>{profileSuccessMsg}</span>
            </div>
          )}

          {updateProfileError && (
            <div className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs flex items-center gap-2">
              <AlertCircle className="h-4 w-4" />
              <span>{updateProfileError.message || 'Profile update failed'}</span>
            </div>
          )}

          {/* Avatar Upload */}
          <div className="flex items-center gap-6">
            <div className="h-16 w-16 rounded-2xl bg-zinc-900 border border-zinc-700 overflow-hidden flex items-center justify-center shrink-0">
              {avatarPreview ? (
                <img src={avatarPreview} alt="Avatar Preview" className="h-full w-full object-cover" />
              ) : (
                <UserIcon className="h-8 w-8 text-zinc-500" />
              )}
            </div>

            <div>
              <label className="cursor-pointer inline-flex items-center gap-2 px-3 py-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-xs font-medium text-zinc-200 transition-colors border border-zinc-700">
                <Upload className="h-3.5 w-3.5" />
                <span>Upload New Avatar</span>
                <input type="file" accept="image/*" onChange={handleAvatarChange} className="hidden" />
              </label>
              <p className="text-[11px] text-zinc-500 mt-1">JPEG, PNG or WebP up to 5MB (Uploaded to Cloudinary)</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-zinc-300">Full Name</label>
              <input
                type="text"
                value={profileData.name}
                onChange={(e) => setProfileData({ ...profileData, name: e.target.value })}
                className="w-full bg-zinc-950/80 border border-zinc-800 rounded-xl px-4 py-2.5 text-sm text-white focus:border-indigo-500 focus:outline-none"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-zinc-300">Username</label>
              <input
                type="text"
                value={profileData.username}
                onChange={(e) => setProfileData({ ...profileData, username: e.target.value })}
                className="w-full bg-zinc-950/80 border border-zinc-800 rounded-xl px-4 py-2.5 text-sm text-white focus:border-indigo-500 focus:outline-none"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isUpdatingProfile}
            className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-medium flex items-center gap-2 transition-colors disabled:opacity-50"
          >
            {isUpdatingProfile ? <RefreshCw className="h-4 w-4 animate-spin" /> : null}
            <span>Save Profile Changes</span>
          </button>
        </form>
      )}

      {/* Tab 3: Change Password */}
      {activeTab === 'password' && (
        <form onSubmit={handleChangePassword} className="bg-[#0e0e12]/60 border border-zinc-800/80 rounded-2xl p-6 space-y-6">
          <h3 className="text-base font-semibold text-white">Change Security Password</h3>

          {passwordSuccessMsg && (
            <div className="p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4" />
              <span>{passwordSuccessMsg}</span>
            </div>
          )}

          {(passwordClientError || changePasswordError) && (
            <div className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs flex items-center gap-2">
              <AlertCircle className="h-4 w-4" />
              <span>{passwordClientError || changePasswordError?.message || 'Password update failed'}</span>
            </div>
          )}

          <div className="space-y-4 max-w-md">
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-zinc-300">Current Password</label>
              <input
                type="password"
                value={passwordData.currentPassword}
                onChange={(e) => setPasswordData({ ...passwordData, currentPassword: e.target.value })}
                className="w-full bg-zinc-950/80 border border-zinc-800 rounded-xl px-4 py-2.5 text-sm text-white focus:border-indigo-500 focus:outline-none"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-zinc-300">New Password</label>
              <input
                type="password"
                value={passwordData.newPassword}
                onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                className="w-full bg-zinc-950/80 border border-zinc-800 rounded-xl px-4 py-2.5 text-sm text-white focus:border-indigo-500 focus:outline-none"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isChangingPassword}
            className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-medium flex items-center gap-2 transition-colors disabled:opacity-50"
          >
            {isChangingPassword ? <RefreshCw className="h-4 w-4 animate-spin" /> : <Lock className="h-4 w-4" />}
            <span>Update Password</span>
          </button>
        </form>
      )}
    </div>
  );
};
