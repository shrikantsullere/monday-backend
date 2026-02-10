import React, { useState, useEffect, useRef } from 'react';
import { File as FileIcon, Download, Search, Upload, Loader2, HardDrive, Trash2, Eye } from 'lucide-react';
import { fileService } from '../services/api';

const FileCenter = () => {
    const [files, setFiles] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isUploading, setIsUploading] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const fileInputRef = useRef(null);

    useEffect(() => {
        fetchFiles();
    }, []);

    const fetchFiles = async () => {
        try {
            const res = await fileService.getFiles();
            setFiles(res.data);
        } catch (err) {
            console.error('Failed to fetch files:', err);
        } finally {
            setIsLoading(false);
        }
    };

    const handleUploadClick = () => {
        fileInputRef.current.click();
    };

    const handleFileChange = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        const formData = new FormData();
        formData.append('file', file);

        setIsUploading(true);
        try {
            const res = await fileService.uploadFile(formData);
            setFiles([res.data, ...files]);
        } catch (err) {
            console.error('Upload failed:', err);
            alert('Failed to upload file');
        } finally {
            setIsUploading(false);
            e.target.value = null; // Reset input
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Delete this file?')) return;
        try {
            await fileService.deleteFile(id);
            setFiles(files.filter(f => f.id !== id));
        } catch (err) {
            console.error('Delete failed:', err);
        }
    };

    const handleDownload = (file) => {
        const link = document.createElement('a');
        link.href = `http://localhost:5000${file.url}`;
        link.setAttribute('download', file.name);
        document.body.appendChild(link);
        link.click();
        link.remove();
    };

    const handleView = (file) => {
        window.open(`http://localhost:5000${file.url}`, '_blank');
    };

    const filteredFiles = files.filter(f =>
        f.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        f.Item?.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const styles = `
        .file-center { padding: 48px; background: var(--bg-page); min-height: 100%; color: var(--text-main); }
        .file-header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 32px; gap: 20px; }
        .file-actions { display: flex; gap: 12px; }
        .search-field { display: flex; align-items: center; gap: 8px; border: 1px solid var(--border-color); border-radius: 4px; padding: 6px 12px; background: var(--bg-card); transition: border-color 0.2s; }
        .search-field:focus-within { border-color: var(--primary-color); }
        .search-field input { border: none; outline: none; background: transparent; color: inherit; width: 250px; font-size: 14px; }
        .upload-btn { background: var(--primary-color); color: white; border: none; padding: 8px 16px; border-radius: 4px; display: flex; align-items: center; gap: 8px; cursor: pointer; font-weight: 500; transition: opacity 0.2s; white-space: nowrap; height: 36px; }
        .upload-btn:hover { opacity: 0.9; }
        .upload-btn:disabled { opacity: 0.5; cursor: not-allowed; }
        .file-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(220px, 1fr)); gap: 24px; }
        .file-card { background: var(--bg-card); border: 1px solid var(--border-color); border-radius: 12px; overflow: hidden; transition: transform 0.2s, box-shadow 0.2s; cursor: pointer; position: relative; }
        .file-card:hover { transform: translateY(-4px); box-shadow: 0 8px 24px rgba(0,0,0,0.1); border-color: var(--primary-color); }
        .file-preview { height: 140px; background: var(--bg-hover); display: flex; align-items: center; justify-content: center; color: var(--primary-color); position: relative; overflow: hidden; }
        .file-preview img { width: 100%; height: 100%; object-fit: cover; }
        .file-overlay { position: absolute; inset: 0; background: rgba(0,0,0,0.5); opacity: 0; display: flex; align-items: center; justify-content: center; gap: 12px; transition: opacity 0.2s; }
        .file-card:hover .file-overlay { opacity: 1; }
        .overlay-icon { width: 36px; height: 36px; background: white; border-radius: 50%; display: flex; align-items: center; justify-content: center; color: var(--text-main); transition: transform 0.2s; border: none; cursor: pointer; }
        .overlay-icon:hover { transform: scale(1.1); }
        .overlay-icon.delete { color: var(--danger-color); }
        .file-info { padding: 16px; }
        .file-name { font-weight: 600; font-size: 14px; margin-bottom: 4px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
        .file-meta { font-size: 11px; color: var(--text-secondary); text-transform: uppercase; letter-spacing: 0.5px; }

        @media (max-width: 768px) {
            .file-center { padding: 24px 16px; }
            .file-header { flex-direction: column; align-items: stretch; margin-bottom: 24px; }
            .file-actions { flex-direction: column; }
            .search-field { width: 100%; }
            .search-field input { width: 100%; }
            .upload-btn { width: 100%; justify-content: center; }
            .file-grid { grid-template-columns: repeat(auto-fill, minmax(160px, 1fr)); gap: 16px; }
            .header h1 { font-size: 24px; }
        }
    `;

    if (isLoading) {
        return (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh' }}>
                <Loader2 size={40} className="spin" color="var(--primary-color)" />
            </div>
        );
    }

    const isImage = (type) => type && type.startsWith('image/');

    return (
        <div className="file-center">
            <style>{styles}</style>
            <input
                type="file"
                ref={fileInputRef}
                style={{ display: 'none' }}
                onChange={handleFileChange}
            />
            <div className="file-header">
                <div>
                    <h1>File Center</h1>
                    <p style={{ color: 'var(--text-secondary)' }}>Manage your workspace documents and multimedia</p>
                </div>
                <div className="file-actions">
                    <div className="search-field">
                        <Search size={18} />
                        <input
                            placeholder="Find a file..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                    <button className="upload-btn" onClick={handleUploadClick} disabled={isUploading}>
                        {isUploading ? <Loader2 size={18} className="spin" /> : <Upload size={18} />}
                        {isUploading ? 'Uploading...' : 'Upload File'}
                    </button>
                </div>
            </div>

            {filteredFiles.length > 0 ? (
                <div className="file-grid">
                    {filteredFiles.map(file => (
                        <div key={file.id} className="file-card">
                            <div className="file-preview">
                                {isImage(file.type) ? (
                                    <img src={`http://localhost:5000${file.url}`} alt={file.name} />
                                ) : (
                                    <FileIcon size={48} strokeWidth={1.5} />
                                )}
                                <div className="file-overlay">
                                    <button className="overlay-icon" onClick={() => handleView(file)} title="View"><Eye size={18} /></button>
                                    <button className="overlay-icon" onClick={() => handleDownload(file)} title="Download"><Download size={18} /></button>
                                    <button className="overlay-icon delete" onClick={() => handleDelete(file.id)} title="Delete"><Trash2 size={18} /></button>
                                </div>
                            </div>
                            <div className="file-info">
                                <div className="file-name" title={file.name}>{file.name}</div>
                                <div className="file-meta">
                                    {(file.size / 1024 / 1024).toFixed(2)} MB • {file.uploadedBy || 'Unknown'}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                <div style={{ textAlign: 'center', padding: '100px', color: 'var(--text-secondary)' }}>
                    <HardDrive size={64} style={{ opacity: 0.1, marginBottom: '20px' }} />
                    <h3>No files found</h3>
                    <p>Click "Upload File" to add documents to your workspace.</p>
                </div>
            )}
        </div>
    );
};

export default FileCenter;
