import React, { useState, useEffect } from 'react';
import {
  Users, Plus, Trash2, Edit, Search, Mail, Phone, MapPin,
  Shield, CheckCircle, XCircle, X, Loader2, Save
} from 'lucide-react';
import { userService } from '../services/api';
import { useAuth } from '../context/AuthContext';

const UsersPage = () => {
  const { user: currentUser } = useAuth();
  const [users, setUsers] = useState([]);
  const [initialLoading, setInitialLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    phone: '',
    address: '',
    role: 'User',
    status: 'active'
  });

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const res = await userService.getAllUsers();
      // Exclude current user from the list to keep it 'clean' for the admin
      setUsers(res.data.filter(u => u.id !== currentUser?.id));
    } catch (err) {
      console.error('Failed to fetch users:', err);
    } finally {
      setInitialLoading(false);
    }
  };

  const handleCreateOrUpdateUser = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      if (isEditing) {
        await userService.updateUser(selectedUser.id, formData);
        await fetchUsers();
      } else {
        await userService.createUser(formData);
        await fetchUsers();
      }
      setIsModalOpen(false);
      setIsEditing(false);
      setSelectedUser(null);
      resetForm();
    } catch (err) {
      alert(err.response?.data?.msg || 'Error saving user');
    } finally {
      setIsLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      email: '',
      password: '',
      phone: '',
      address: '',
      role: 'User',
      status: 'active'
    });
  };

  const handleDeleteUser = async (id) => {
    if (window.confirm('Are you sure you want to delete this user?')) {
      try {
        await userService.deleteUser(id);
        setUsers(users.filter(u => u.id !== id));
      } catch (err) {
        alert('Error deleting user');
      }
    }
  };

  const handleEditUser = (user) => {
    setSelectedUser(user);
    setFormData({
      name: user.name,
      email: user.email,
      password: '',
      phone: user.phone || '',
      address: user.address || '',
      role: user.role,
      status: user.status
    });
    setIsEditing(true);
    setIsModalOpen(true);
  };

  const handleViewUser = (user) => {
    setSelectedUser(user);
    setIsViewModalOpen(true);
  };

  const filteredUsers = users.filter(user =>
    user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.role.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getAvatar = (name) => {
    if (!name) return '??';
    return name.split(' ').map(n => n[0]).join('').toUpperCase().substring(0, 2);
  };

  const styles = `
        .users-container { padding: 40px; background: var(--bg-page); min-height: 100%; color: var(--text-main); }
        .page-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 32px; }
        .page-title { font-size: 24px; font-weight: 700; color: var(--text-main); display: flex; align-items: center; gap: 12px; }
        
        .controls-section { display: flex; gap: 16px; margin-bottom: 24px; }
        .search-wrapper { position: relative; flex: 1; max-width: 400px; }
        .search-icon { position: absolute; left: 12px; top: 50%; transform: translateY(-50%); color: var(--text-secondary); }
        .search-input { width: 100%; padding: 10px 10px 10px 40px; border: 1px solid var(--border-color); border-radius: 4px; outline: none; background: var(--bg-card); color: var(--text-main); }
        .search-input:focus { border-color: var(--primary-color); }
        
        .user-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(350px, 1fr)); gap: 24px; }
        .user-card { background: var(--bg-card); border-radius: 8px; border: 1px solid var(--border-color); padding: 24px; box-shadow: 0 4px 12px rgba(0,0,0,0.1); transition: transform 0.2s; }
        .user-card:hover { transform: translateY(-4px); box-shadow: 0 8px 24px rgba(0,0,0,0.2); }
        
        .user-header { display: flex; gap: 16px; margin-bottom: 20px; }
        .avatar-large { width: 60px; height: 60px; border-radius: 12px; background: var(--primary-color); color: #fff; display: flex; align-items: center; justify-content: center; font-size: 20px; font-weight: 700; }
        .user-info-main { flex: 1; }
        .user-name { font-size: 18px; font-weight: 700; color: var(--text-main); margin-bottom: 4px; }
        .role-badge { display: inline-block; padding: 2px 8px; border-radius: 4px; font-size: 11px; font-weight: 700; text-transform: uppercase; }
        .role-admin { background: rgba(0, 133, 255, 0.1); color: var(--primary-color); }
        .role-manager { background: rgba(253, 171, 61, 0.1); color: var(--warning-color); }
        .role-user { background: var(--bg-hover); color: var(--text-secondary); }
        
        .user-details { display: flex; flex-direction: column; gap: 10px; }
        .detail-item { display: flex; align-items: center; gap: 10px; font-size: 13px; color: var(--text-secondary); }
        
        .status-badge { display: flex; align-items: center; gap: 4px; font-size: 12px; font-weight: 600; margin-top: 16px; }
        .status-active { color: var(--success-color); }
        .status-inactive { color: var(--danger-color); }
        
        .card-actions { display: flex; justify-content: flex-end; gap: 8px; border-top: 1px solid var(--border-color); margin-top: 20px; padding-top: 16px; }
        .action-btn { padding: 8px; border-radius: 4px; border: 1px solid transparent; cursor: pointer; transition: all 0.2s; background: transparent; color: var(--text-secondary); }
        .btn-view:hover { background: var(--bg-hover); color: var(--primary-color); }
        .btn-edit:hover { background: var(--bg-hover); color: var(--warning-color); }
        .btn-delete:hover { background: var(--bg-hover); color: var(--danger-color); }

        .modal-overlay { position: fixed; top: 0; left: 0; right: 0; bottom: 0; background: rgba(0,0,0,0.7); display: flex; align-items: center; justify-content: center; z-index: 1000; backdrop-filter: blur(2px); }
        .modal-content { background: var(--bg-card); border-radius: 8px; width: 100%; max-width: 600px; max-height: 90vh; overflow-y: auto; padding: 32px; position: relative; border: 1px solid var(--border-color); color: var(--text-main); }
        .modal-close { position: absolute; right: 24px; top: 24px; cursor: pointer; color: var(--text-secondary); transition: color 0.2s; }
        .modal-close:hover { color: var(--text-main); }
        .form-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-top: 24px; }
        .form-group { margin-bottom: 20px; }
        .form-label { display: block; font-size: 14px; font-weight: 600; color: var(--text-main); margin-bottom: 8px; }
        .form-input { width: 100%; padding: 10px; border: 1px solid var(--border-color); border-radius: 4px; outline: none; background: var(--bg-page); color: var(--text-main); }
        .form-input:focus { border-color: var(--primary-color); }
        
        .btn { padding: 10px 20px; border-radius: 4px; font-weight: 600; cursor: pointer; display: inline-flex; align-items: center; gap: 8px; border: none; transition: opacity 0.2s; }
        .btn-primary { background: var(--primary-color); color: #fff; }
        .btn-primary:hover { opacity: 0.9; }
        .btn-secondary { background: var(--bg-hover); color: var(--text-main); }

        .spin { animation: spin 1s linear infinite; }
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }

        .view-detail-row { display: flex; border-bottom: 1px solid var(--border-color); padding: 12px 0; }
        .view-detail-label { width: 120px; font-weight: 600; color: var(--text-secondary); font-size: 14px; }
        .view-detail-value { flex: 1; color: var(--text-main); font-size: 14px; }
    `;

  if (initialLoading) {
    return (
      <div className="users-container" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <Loader2 size={40} className="spin" color="var(--primary-color)" />
      </div>
    );
  }

  return (
    <div className="users-container">
      <style>{styles}</style>

      <div className="page-header">
        <div className="page-title"><Users size={28} color="var(--primary-color)" /> Users & Roles</div>
        <button className="btn btn-primary" onClick={() => { setIsEditing(false); resetForm(); setIsModalOpen(true); }}>
          <Plus size={20} /> Create New User
        </button>
      </div>

      <div className="controls-section">
        <div className="search-wrapper">
          <Search className="search-icon" size={18} />
          <input
            className="search-input"
            placeholder="Search team members..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      <div className="user-grid">
        {filteredUsers.length > 0 ? filteredUsers.map(user => (
          <div key={user.id} className="user-card">
            <div className="user-header">
              <div className="avatar-large" style={{ background: user.role === 'Admin' ? 'var(--primary-color)' : 'var(--text-secondary)' }}>
                {getAvatar(user.name)}
              </div>
              <div className="user-info-main">
                <div className="user-name">{user.name}</div>
                <span className={`role-badge role-${user.role ? user.role.toLowerCase() : 'user'}`}>{user.role}</span>
                <div className={`status-badge status-${user.status}`}>
                  {user.status === 'active' ? <CheckCircle size={14} /> : <XCircle size={14} />}
                  {user.status ? user.status.charAt(0).toUpperCase() + user.status.slice(1) : 'Active'}
                </div>
              </div>
            </div>

            <div className="user-details">
              <div className="detail-item"><Mail size={16} /> {user.email}</div>
              <div className="detail-item"><Phone size={16} /> {user.phone || 'N/A'}</div>
              <div className="detail-item"><MapPin size={16} /> {user.address || 'N/A'}</div>
            </div>

            <div className="card-actions">
              <button className="action-btn btn-view" title="View Details" onClick={() => handleViewUser(user)}><Shield size={18} /></button>
              <button className="action-btn btn-edit" title="Edit User" onClick={() => handleEditUser(user)}><Edit size={18} /></button>
              <button className="action-btn btn-delete" title="Delete User" onClick={() => handleDeleteUser(user.id)}><Trash2 size={18} /></button>
            </div>
          </div>
        )) : (
          <div style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '100px', color: 'var(--text-secondary)' }}>
            <Users size={64} style={{ opacity: 0.1, marginBottom: '20px' }} />
            <h3>No team members yet</h3>
            <p>Click "Create New User" to add your team.</p>
          </div>
        )}
      </div>

      {isModalOpen && (
        <div className="modal-overlay">
          <div className="modal-content">
            <X className="modal-close" onClick={() => setIsModalOpen(false)} />
            <h2 style={{ fontSize: '20px', fontWeight: 700, marginBottom: '8px' }}>{isEditing ? 'Edit User' : 'Create New User'}</h2>
            <p style={{ color: 'var(--text-secondary)', fontSize: '14px' }}>{isEditing ? 'Update team member information' : 'Add a new team member to your workspace'}</p>

            <form onSubmit={handleCreateOrUpdateUser}>
              <div className="form-grid">
                <div className="form-group">
                  <label className="form-label">Full Name</label>
                  <input
                    className="form-input"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="e.g. John Doe"
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Email Address</label>
                  <input
                    className="form-input"
                    type="email"
                    required
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="john@example.com"
                  />
                </div>
                {(!isEditing || formData.password !== '') && (
                  <div className="form-group">
                    <label className="form-label">{isEditing ? 'New Password (Optional)' : 'Password'}</label>
                    <input
                      className="form-input"
                      type="password"
                      required={!isEditing}
                      value={formData.password}
                      onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                      placeholder="••••••••"
                    />
                  </div>
                )}
                <div className="form-group">
                  <label className="form-label">Phone Number</label>
                  <input
                    className="form-input"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    placeholder="+1 234 567 890"
                  />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Address</label>
                <input
                  className="form-input"
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  placeholder="Full street address"
                />
              </div>

              <div className="form-grid">
                <div className="form-group">
                  <label className="form-label">Role</label>
                  <select
                    className="form-input"
                    value={formData.role}
                    onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                  >
                    <option value="User">User</option>
                    <option value="Admin">Admin</option>
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Status</label>
                  <select
                    className="form-input"
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                  >
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                  </select>
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '24px' }}>
                <button type="button" className="btn btn-secondary" onClick={() => setIsModalOpen(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary" disabled={isLoading}>
                  {isLoading ? <Loader2 size={18} className="spin" /> : <Save size={18} />}
                  {isLoading ? (isEditing ? 'Updating...' : 'Creating...') : (isEditing ? 'Update User' : 'Create User')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {isViewModalOpen && selectedUser && (
        <div className="modal-overlay">
          <div className="modal-content">
            <X className="modal-close" onClick={() => setIsViewModalOpen(false)} />
            <div style={{ display: 'flex', alignItems: 'center', gap: '20px', marginBottom: '32px' }}>
              <div className="avatar-large" style={{ width: '80px', height: '80px', fontSize: '28px', background: selectedUser.role === 'Admin' ? 'var(--primary-color)' : 'var(--text-secondary)' }}>
                {getAvatar(selectedUser.name)}
              </div>
              <div>
                <h2 style={{ margin: 0, fontSize: '24px' }}>{selectedUser.name}</h2>
                <span className={`role-badge role-${selectedUser.role ? selectedUser.role.toLowerCase() : 'user'}`} style={{ marginTop: '8px' }}>{selectedUser.role}</span>
              </div>
            </div>

            <div className="view-details">
              <div className="view-detail-row">
                <div className="view-detail-label">Email</div>
                <div className="view-detail-value">{selectedUser.email}</div>
              </div>
              <div className="view-detail-row">
                <div className="view-detail-label">Phone</div>
                <div className="view-detail-value">{selectedUser.phone || 'N/A'}</div>
              </div>
              <div className="view-detail-row">
                <div className="view-detail-label">Address</div>
                <div className="view-detail-value">{selectedUser.address || 'N/A'}</div>
              </div>
              <div className="view-detail-row">
                <div className="view-detail-label">Status</div>
                <div className="view-detail-value">
                  <span style={{ color: selectedUser.status === 'active' ? 'var(--success-color)' : 'var(--danger-color)', fontWeight: 600 }}>
                    {(selectedUser.status || 'active').toUpperCase()}
                  </span>
                </div>
              </div>
              <div className="view-detail-row">
                <div className="view-detail-label">User ID</div>
                <div className="view-detail-value">#{selectedUser.id}</div>
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '32px' }}>
              <button className="btn btn-primary" onClick={() => setIsViewModalOpen(false)}>Close</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UsersPage;
