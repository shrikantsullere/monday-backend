import React, { useState, useEffect, useRef } from 'react';
import {
    User, Settings, Users, Shield, Palette, Save, Plus, Trash2,
    Check, Moon, Sun, Monitor, Globe, Mail, Bell, Lock, ChevronRight,
    Loader2, Eye, EyeOff, AlertCircle, CheckCircle
} from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';
import { userService } from '../services/api';

const SettingsPage = () => {
    const { theme, toggleTheme } = useTheme();
    const { user, updateUser } = useAuth();
    const [currentUserRole, setCurrentUserRole] = useState('User');
    const [saveStatus, setSaveStatus] = useState({ show: false, type: '', message: '' });
    const [isLoading, setIsLoading] = useState(false);
    const fileInputRef = useRef(null);

    // Profile State
    const [profileForm, setProfileForm] = useState({
        name: '',
        email: '',
        avatar: '',
        phone: '',
        address: ''
    });

    // Password state
    const [showCurrentPassword, setShowCurrentPassword] = useState(false);
    const [showNewPassword, setShowNewPassword] = useState(false);
    const [passwordForm, setPasswordForm] = useState({
        current: '',
        new: '',
        confirm: ''
    });

    useEffect(() => {
        if (user) {
            setProfileForm({
                name: user.name || '',
                email: user.email || '',
                avatar: user.avatar || '',
                phone: user.phone || '',
                address: user.address || ''
            });
            setCurrentUserRole(user.role || 'User');
        }
    }, [user]);

    const showSaveFeedback = (type, message) => {
        setSaveStatus({ show: true, type, message });
        setTimeout(() => setSaveStatus({ show: false, type: '', message: '' }), 3000);
    };

    const handleAvatarClick = () => {
        if (fileInputRef.current) fileInputRef.current.click();
    };

    const handleFileChange = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        const formData = new FormData();
        formData.append('avatar', file);

        try {
            const res = await userService.uploadAvatar(formData);
            setProfileForm(prev => ({ ...prev, avatar: res.data.avatarUrl }));
            // Optional: User usually expects immediate feedback on image selection, 
            // but we still require "Save Profile" to persist the association effectively 
            // if we treat the form as atomic. However, uploadAvatar is separate API.
        } catch (err) {
            console.error(err);
            showSaveFeedback('error', 'Failed to upload avatar');
        }
    };

    const handleSaveProfile = async () => {
        setIsLoading(true);
        try {
            const res = await userService.updateProfile(profileForm);
            updateUser(res.data);
            showSaveFeedback('success', 'Profile updated successfully!');
        } catch (err) {
            console.error(err);
            showSaveFeedback('error', 'Failed to update profile');
        } finally {
            setIsLoading(false);
        }
    };

    const handleChangePassword = async () => {
        if (passwordForm.new !== passwordForm.confirm) {
            showSaveFeedback('error', 'New passwords do not match!');
            return;
        }
        if (passwordForm.new.length < 8) {
            showSaveFeedback('error', 'Password must be at least 8 characters!');
            return;
        }

        setIsLoading(true);
        try {
            await userService.changePassword({
                currentPassword: passwordForm.current,
                newPassword: passwordForm.new
            });
            setPasswordForm({ current: '', new: '', confirm: '' });
            showSaveFeedback('success', 'Password changed successfully!');
        } catch (err) {
            console.error(err);
            showSaveFeedback('error', err.response?.data?.msg || 'Failed to change password');
        } finally {
            setIsLoading(false);
        }
    };

    const styles = `
        .settings-container { display: flex; min-height: 100%; background: var(--bg-page); color: var(--text-main); }
        .settings-content { flex: 1; padding: 40px; overflow-y: auto; position: relative; }
        
        .section-card { background: var(--bg-card); border-radius: 8px; border: 1px solid var(--border-color); padding: 32px; margin-bottom: 24px; box-shadow: 0 1px 3px rgba(0,0,0,0.05); }
        .section-title { font-size: 20px; font-weight: 700; color: var(--text-main); margin-bottom: 24px; display: flex; align-items: center; gap: 10px; }
        
        .form-group { margin-bottom: 24px; }
        .form-label { display: block; font-size: 14px; font-weight: 600; color: var(--text-main); margin-bottom: 8px; }
        .form-input { 
            width: 100%; max-width: 400px; padding: 10px 14px; border: 1px solid var(--border-color); border-radius: 4px; 
            font-size: 14px; outline: none; transition: border-color 0.2s; background: var(--bg-page); color: var(--text-main);
        }
        .form-input:focus { border-color: var(--primary-color); }
        
        .password-input-wrapper {
            position: relative;
            max-width: 400px;
        }
        .password-input-wrapper input {
            padding-right: 40px;
        }
        .password-toggle {
            position: absolute;
            right: 10px;
            top: 50%;
            transform: translateY(-50%);
            background: transparent;
            border: none;
            cursor: pointer;
            color: var(--text-secondary);
            padding: 4px;
            display: flex;
            align-items: center;
        }
        
        .btn { padding: 10px 20px; border-radius: 4px; font-weight: 600; cursor: pointer; display: inline-flex; align-items: center; gap: 8px; font-size: 14px; border: none; transition: all 0.2s; }
        .btn:disabled { opacity: 0.5; cursor: not-allowed; }
        .btn-primary { background: var(--primary-color); color: #fff; }
        .btn-primary:hover:not(:disabled) { background: var(--primary-hover); }
        .btn-outline { background: transparent; border: 1px solid var(--border-color); color: var(--text-main); }
        .btn-outline:hover { background: var(--bg-hover); }
        
        .theme-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(200px, 1fr)); gap: 20px; }
        .theme-card { border: 2px solid var(--border-color); border-radius: 12px; cursor: pointer; text-align: center; transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1); background: var(--bg-card); color: var(--text-main); position: relative; }
        .theme-card:hover { border-color: var(--primary-color); transform: translateY(-2px); }
        .theme-card.active { border-color: var(--primary-color); background: var(--bg-card); box-shadow: 0 8px 20px rgba(0, 133, 255, 0.15); }
        .theme-preview { height: 100px; border-radius: 8px; margin-bottom: 4px; display: flex; align-items: center; justify-content: center; border: 1px solid var(--border-color); }
    
        .save-notification {
            position: fixed;
            top: 80px;
            right: 24px;
            padding: 16px 24px;
            border-radius: 8px;
            box-shadow: 0 4px 12px rgba(0,0,0,0.15);
            display: flex;
            align-items: center;
            gap: 12px;
            font-size: 14px;
            font-weight: 500;
            z-index: 1000;
            animation: slideIn 0.3s ease-out;
        }
        .save-notification.success {
            background: #e5ffe5;
            color: #00854d;
            border: 1px solid #00c875;
        }
        [data-theme='dark'] .save-notification.success { background: #1a3326; color: #00ca72; border-color: #00ca72; }
        .save-notification.error {
            background: #fff1f3;
            color: #e2445c;
            border: 1px solid #e2445c;
        }
        @keyframes slideIn {
            from { transform: translateX(400px); opacity: 0; }
            to { transform: translateX(0); opacity: 1; }
        }
        
        .role-badge {
            display: inline-block;
            padding: 4px 12px;
            border-radius: 12px;
            font-size: 11px;
            font-weight: 600;
            text-transform: uppercase;
        }
        .role-badge.admin { background: rgba(0, 133, 255, 0.1); color: var(--primary-color); }
        .role-badge.manager { background: rgba(253, 171, 61, 0.1); color: var(--warning-color); }
        .role-badge.user { background: var(--bg-hover); color: var(--text-secondary); }
    `;

    return (
        <div className="settings-container">
            <style>{styles}</style>

            <input
                type="file"
                ref={fileInputRef}
                style={{ display: 'none' }}
                accept="image/*"
                onChange={handleFileChange}
            />

            {/* Save Notification */}
            {saveStatus.show && (
                <div className={`save-notification ${saveStatus.type}`}>
                    {saveStatus.type === 'success' ? <CheckCircle size={20} /> : <AlertCircle size={20} />}
                    {saveStatus.message}
                </div>
            )}

            <div className="settings-content" style={{ padding: '20px' }}>
                <div style={{ maxWidth: '800px', margin: '0 auto' }}>
                    <div style={{ marginBottom: '32px' }}>
                        <h1 style={{ fontSize: '24px', fontWeight: '700', color: 'var(--text-main)' }}>Account Settings</h1>
                        <p style={{ color: 'var(--text-secondary)', fontSize: '14px' }}>Manage your profile, security and appearance</p>
                    </div>

                    {/* Personal Profile Section */}
                    <div className="section-card">
                        <div className="section-title"><User size={24} /> Personal Profile</div>
                        <div style={{ display: 'flex', gap: '32px', alignItems: 'center', marginBottom: '40px' }}>
                            <div style={{ width: '80px', height: '80px', background: 'var(--warning-color)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '28px', color: '#fff', fontWeight: 'bold', overflow: 'hidden' }}>
                                {profileForm.avatar ? (
                                    <img src={profileForm.avatar} alt="Avatar" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                ) : (
                                    profileForm.name ? profileForm.name[0] : 'U'
                                )}
                            </div>
                            <div>
                                <button className="btn btn-outline" style={{ marginBottom: '8px' }} onClick={handleAvatarClick}>Change Photo</button>
                                <div style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>JPG or PNG. Max size 2MB.</div>
                            </div>
                        </div>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
                            <div className="form-group">
                                <label className="form-label">Full Name</label>
                                <input
                                    className="form-input"
                                    style={{ maxWidth: '100%' }}
                                    value={profileForm.name}
                                    onChange={e => setProfileForm({ ...profileForm, name: e.target.value })}
                                />
                            </div>
                            <div className="form-group">
                                <label className="form-label">Email Address</label>
                                <input
                                    className="form-input"
                                    style={{ maxWidth: '100%' }}
                                    value={profileForm.email}
                                    onChange={e => setProfileForm({ ...profileForm, email: e.target.value })}
                                />
                            </div>
                        </div>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
                            <div className="form-group">
                                <label className="form-label">Phone</label>
                                <input
                                    className="form-input"
                                    style={{ maxWidth: '100%' }}
                                    value={profileForm.phone}
                                    onChange={e => setProfileForm({ ...profileForm, phone: e.target.value })}
                                    placeholder="+1 (555) 000-0000"
                                />
                            </div>
                            <div className="form-group">
                                <label className="form-label">Address</label>
                                <input
                                    className="form-input"
                                    style={{ maxWidth: '100%' }}
                                    value={profileForm.address}
                                    onChange={e => setProfileForm({ ...profileForm, address: e.target.value })}
                                    placeholder="City, Country"
                                />
                            </div>
                        </div>
                        <div className="form-group">
                            <label className="form-label">Current Role</label>
                            <div>
                                <span className={`role-badge ${currentUserRole.toLowerCase()}`}>{currentUserRole}</span>
                            </div>
                        </div>
                        <button className="btn btn-primary" onClick={handleSaveProfile} disabled={isLoading}>
                            {isLoading ? <Loader2 size={18} className="spin" /> : <Save size={18} />}
                            {isLoading ? 'Saving...' : 'Save Profile Changes'}
                        </button>
                    </div>

                    {/* Change Password Section */}
                    <div className="section-card">
                        <div className="section-title"><Lock size={24} /> Security & Password</div>
                        <div className="form-group">
                            <label className="form-label">Current Password</label>
                            <div className="password-input-wrapper">
                                <input
                                    className="form-input"
                                    type={showCurrentPassword ? 'text' : 'password'}
                                    value={passwordForm.current}
                                    onChange={(e) => setPasswordForm({ ...passwordForm, current: e.target.value })}
                                    placeholder="Enter current password"
                                    style={{ maxWidth: '100%' }}
                                />
                                <button
                                    className="password-toggle"
                                    onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                                >
                                    {showCurrentPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                </button>
                            </div>
                        </div>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
                            <div className="form-group">
                                <label className="form-label">New Password</label>
                                <div className="password-input-wrapper">
                                    <input
                                        className="form-input"
                                        type={showNewPassword ? 'text' : 'password'}
                                        value={passwordForm.new}
                                        onChange={(e) => setPasswordForm({ ...passwordForm, new: e.target.value })}
                                        placeholder="Enter new password"
                                        style={{ maxWidth: '100%' }}
                                    />
                                    <button
                                        className="password-toggle"
                                        onClick={() => setShowNewPassword(!showNewPassword)}
                                    >
                                        {showNewPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                    </button>
                                </div>
                                <div style={{ fontSize: '11px', color: 'var(--text-secondary)', marginTop: '4px' }}>
                                    Must be at least 8 characters
                                </div>
                            </div>
                            <div className="form-group">
                                <label className="form-label">Confirm New Password</label>
                                <input
                                    className="form-input"
                                    type="password"
                                    value={passwordForm.confirm}
                                    onChange={(e) => setPasswordForm({ ...passwordForm, confirm: e.target.value })}
                                    placeholder="Confirm new password"
                                    style={{ maxWidth: '100%' }}
                                />
                            </div>
                        </div>
                        <button
                            className="btn btn-primary"
                            onClick={handleChangePassword}
                            disabled={isLoading || !passwordForm.current || !passwordForm.new || !passwordForm.confirm}
                        >
                            {isLoading ? <Loader2 size={18} className="spin" /> : <Lock size={18} />}
                            {isLoading ? 'Updating...' : 'Update Password'}
                        </button>
                    </div>

                    {/* Appearance Section */}
                    <div className="section-card">
                        <div className="section-title"><Palette size={24} /> Appearance</div>
                        <p style={{ color: 'var(--text-secondary)', fontSize: '14px', marginBottom: '20px' }}>
                            Choose your preferred interface style.
                        </p>
                        <div className="theme-grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))' }}>
                            <div
                                className={`theme-card ${theme === 'light' ? 'active' : ''}`}
                                onClick={() => toggleTheme('light')}
                                style={{
                                    display: 'flex',
                                    flexDirection: 'column',
                                    padding: '16px',
                                    gap: '12px'
                                }}
                            >
                                <div className="theme-preview" style={{ background: '#f8f9fb', position: 'relative', height: '100px' }}>
                                    <div style={{ width: '40px', height: '40px', background: '#fff', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }}>
                                        <Sun size={20} color="#0085ff" />
                                    </div>
                                    {theme === 'light' && (
                                        <div style={{ position: 'absolute', top: '8px', right: '8px', background: 'var(--primary-color)', color: '#fff', borderRadius: '50%', padding: '2px' }}>
                                            <Check size={12} strokeWidth={3} />
                                        </div>
                                    )}
                                </div>
                                <div style={{ fontWeight: 600, fontSize: '15px' }}>Light Mode</div>
                            </div>

                            <div
                                className={`theme-card ${theme === 'dark' ? 'active' : ''}`}
                                onClick={() => toggleTheme('dark')}
                                style={{
                                    display: 'flex',
                                    flexDirection: 'column',
                                    padding: '16px',
                                    gap: '12px'
                                }}
                            >
                                <div className="theme-preview" style={{ background: '#1c222d', position: 'relative', height: '100px' }}>
                                    <div style={{ width: '40px', height: '40px', background: '#2b3445', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 4px 12px rgba(0,0,0,0.2)' }}>
                                        <Moon size={20} color="#fff" />
                                    </div>
                                    {theme === 'dark' && (
                                        <div style={{ position: 'absolute', top: '8px', right: '8px', background: 'var(--primary-color)', color: '#fff', borderRadius: '50%', padding: '2px' }}>
                                            <Check size={12} strokeWidth={3} />
                                        </div>
                                    )}
                                </div>
                                <div style={{ fontWeight: 600, fontSize: '15px' }}>Dark Mode</div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};


export default SettingsPage;
