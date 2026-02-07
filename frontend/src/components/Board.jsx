import React, { useState, useEffect, useMemo, useRef } from 'react';
import { useLocation, useSearchParams, useParams } from 'react-router-dom';
import {
    Plus, Search, Table as TableIcon, LayoutDashboard, Loader2, Calendar,
    UserCircle, Filter, ArrowUpDown, EyeOff, MoreHorizontal, Download, Upload, Check, Trash2, Edit, Star
} from 'lucide-react';
import Table from './Table';
import Dashboard from './Dashboard';
import CalendarView from './CalendarView';
import { boardService, itemService, userService } from '../services/api';
import { useAuth } from '../context/AuthContext';

const Board = () => {
    const { id: boardId } = useParams();
    const { user: currentUser } = useAuth();
    const location = useLocation();
    const [searchParams, setSearchParams] = useSearchParams();
    const path = location.pathname;

    const [boardData, setBoardData] = useState(null);
    const [allUsers, setAllUsers] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('table');
    const [searchTerm, setSearchTerm] = useState('');

    // UI States
    const [activePopover, setActivePopover] = useState(null); // 'person', 'filter', 'sort', 'hide', 'menu'
    const [selectedPersonIds, setSelectedPersonIds] = useState([]);
    const [hiddenColumnIds, setHiddenColumnIds] = useState([]);
    const [sortBy, setSortBy] = useState(null); // { colId, order: 'asc' | 'desc' }
    const [statusFilter, setStatusFilter] = useState(null);
    const [columns, setColumns] = useState([]);

    const fileInputRef = useRef(null);

    const defaultColumns = [
        { id: 'name', title: 'Item Name', type: 'text' },
        { id: 'person', title: 'Person', type: 'person' },
        { id: 'status', title: 'Status', type: 'status' },
        { id: 'timeline', title: 'Timeline', type: 'timeline' },
        { id: 'receivedDate', title: 'Received Date', type: 'date' },
        { id: 'progress', title: 'Progress', type: 'progress' },
        { id: 'payment', title: 'Payment (Numbers)', type: 'payment' },
        { id: 'timeTracking', title: 'Time Tracking', type: 'time_tracking' }
    ];

    const togglePopover = (name) => {
        setActivePopover(activePopover === name ? null : name);
    };

    useEffect(() => {
        fetchInitialData();
    }, [path, boardId]);

    // Close popovers on click outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (activePopover && !event.target.closest('.popover-container') && !event.target.closest('.tool-btn') && !event.target.closest('.sub-action-btn')) {
                setActivePopover(null);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [activePopover]);

    const fetchInitialData = async () => {
        setIsLoading(true);
        try {
            const [boardsRes, usersRes] = await Promise.all([
                boardService.getAllBoards(),
                userService.getAllUsers()
            ]);

            const boards = boardsRes.data;
            let currentBoard;

            if (boardId) {
                currentBoard = boards.find(b => b.id.toString() === boardId);
            } else {
                if (path.includes('ai-future-projects')) currentBoard = boards.find(b => b.name === 'AI Future Projects');
                else if (path.includes('pipeline')) currentBoard = boards.find(b => b.name === 'Project Pipeline');
                else if (path.includes('ai-roadmap')) currentBoard = boards.find(b => b.name === 'AI R&D Roadmap');
                else if (path.includes('commercial-sira')) currentBoard = boards.find(b => b.name === 'Commercial - SIRA');
                else if (path.includes('dm-inquiries')) currentBoard = boards.find(b => b.name === 'DM Inquiries');

                if (!currentBoard && boards.length > 0) currentBoard = boards[0];
            }

            if (currentBoard) {
                setBoardData(currentBoard);

                // Force columns for SIRA Projects to match user image perfectly
                if (currentBoard.name === 'SIRA Projects' || currentBoard.name === 'Commercial - SIRA') {
                    setColumns(defaultColumns);
                } else if (currentBoard.columns) {
                    try {
                        let parsedCols = typeof currentBoard.columns === 'string' ? JSON.parse(currentBoard.columns) : currentBoard.columns;

                        if (!Array.isArray(parsedCols)) {
                            console.warn('Parsed columns is not an array:', parsedCols);
                            parsedCols = [];
                        }

                        // Always ensure 'name' column exists or is handled
                        if (!parsedCols.find(c => c.id === 'name')) {
                            parsedCols = [{ id: 'name', title: 'Item Name', type: 'text' }, ...parsedCols];
                        }
                        setColumns(parsedCols);
                    } catch (e) {
                        console.error('Failed to parse columns', e);
                        setColumns(defaultColumns);
                    }
                } else {
                    setColumns(defaultColumns);
                }
            }

            setAllUsers(usersRes.data);
        } catch (err) {
            console.error('Error fetching board data:', err);
        } finally {
            setIsLoading(false);
        }
    };

    const handleUpdateItem = async (groupId, itemId, updates) => {
        try {
            await itemService.updateItem(itemId, updates);
            setBoardData(prev => {
                if (!prev) return prev;
                const groupKey = prev.Groups ? 'Groups' : 'groups';
                const nextGroups = (prev[groupKey] || []).map(g => {
                    if (g.id === groupId) {
                        return {
                            ...g,
                            items: (g.items || []).map(i => i.id === itemId ? { ...i, ...updates } : i)
                        };
                    }
                    return g;
                });
                return { ...prev, [groupKey]: nextGroups };
            });
        } catch (err) {
            console.error('Update failed:', err);
        }
    };

    const handleDeleteItem = async (groupId, itemId) => {
        try {
            await itemService.deleteItem(itemId);
            setBoardData(prev => {
                if (!prev) return prev;
                const next = { ...prev };
                const groupKey = next.Groups ? 'Groups' : 'groups';
                const group = (next[groupKey] || []).find(g => g.id === groupId);
                if (group) {
                    group.items = (group.items || []).filter(i => i.id !== itemId);
                }
                return next;
            });
        } catch (err) {
            console.error('Delete failed:', err);
        }
    };

    const handleClearBoard = async () => {
        if (!window.confirm('Are you sure you want to clear all items from this board?')) return;
        try {
            const groups = boardData.Groups || boardData.groups || [];
            for (const group of groups) {
                const items = group.items || [];
                for (const item of items) {
                    await itemService.deleteItem(item.id);
                }
            }
            fetchInitialData();
        } catch (err) {
            console.error('Clear board failed:', err);
        }
    };

    const handleAddItem = async (groupId, itemData = null) => {
        try {
            let targetGroupId = groupId;

            // If no group exists or groupId is undefined, create a default group
            if (!targetGroupId) {
                try {
                    const groupRes = await boardService.createGroup(boardData.id, { title: 'New Group', color: '#579bfc' });
                    targetGroupId = groupRes.data.id;
                    const newGroup = { ...groupRes.data, items: [] };
                    setBoardData(prev => ({
                        ...prev,
                        Groups: [...(prev.Groups || prev.groups || []), newGroup]
                    }));
                } catch (groupErr) {
                    console.error('Failed to create default group:', groupErr);
                    return;
                }
            }

            const newItemData = itemData || {
                name: 'New Item',
                status: 'Working on it',
                GroupId: targetGroupId
            };
            const res = await itemService.createItem(newItemData);
            setBoardData(prev => {
                if (!prev) return prev;
                const groupKey = prev.Groups ? 'Groups' : 'groups';
                const nextGroups = (prev[groupKey] || []).map(g => {
                    if (g.id === targetGroupId) {
                        return { ...g, items: [res.data, ...(g.items || [])] };
                    }
                    return g;
                });
                return { ...prev, [groupKey]: nextGroups };
            });
        } catch (err) {
            console.error('Creation failed:', err);
        }
    };

    // --- Export / Import ---
    const handleExport = () => {
        if (!boardData) return;
        const headers = ['Group', ...columns.map(c => c.title)];
        const rows = [];

        const groups = boardData.Groups || boardData.groups || [];
        groups.forEach(group => {
            (group.items || []).forEach(item => {
                const rowData = [group.title];
                columns.forEach(col => {
                    let val = item[col.id];
                    if (col.type === 'person' && val) {
                        const u = allUsers.find(user => user.id === val || user.id === item.assignedToId);
                        val = u ? u.email : val;
                    }
                    rowData.push(val);
                });
                rows.push(rowData.map(f => `"${String(f || '').replace(/"/g, '""')}"`).join(','));
            });
        });

        const csvContent = [headers.join(','), ...rows].join('\n');
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = `${boardData.name}_export.csv`;
        link.click();
    };

    const handleImportClick = () => {
        if (fileInputRef.current) fileInputRef.current.click();
    };

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = async (evt) => {
            const text = evt.target.result;
            const lines = text.split('\n').filter(l => l.trim());
            const targetGroupId = boardData.Groups?.[0]?.id;
            if (!targetGroupId) return;

            for (let i = 1; i < lines.length; i++) {
                const cols = lines[i].split(',').map(c => c.replace(/^"|"$/g, '').replace(/""/g, '"'));
                if (cols.length < 2) continue;

                // Very basic fallback import logic mapping by index
                // Ideally matches headers, but for now simple positional
                // Default structure: Group, Col1, Col2...
                const newItem = {
                    name: cols[1] || 'Imported Item',
                    GroupId: targetGroupId
                };

                // Try to map a few standard fields if they exist in columns
                // This part would need robust CSV header mapping to be perfect
                // For now, we just create the item with name.

                await handleAddItem(targetGroupId, newItem);
            }
            e.target.value = '';
        };
        reader.readAsText(file);
    };

    // --- Filters ---
    const togglePersonSelection = (userId) => {
        setSelectedPersonIds(prev =>
            prev.includes(userId) ? prev.filter(id => id !== userId) : [...prev, userId]
        );
    };

    const toggleColumnVisibility = (colId) => {
        setHiddenColumnIds(prev =>
            prev.includes(colId) ? prev.filter(id => id !== colId) : [...prev, colId]
        );
    };

    const handleSort = (colId) => {
        setSortBy(prev => {
            if (prev?.colId === colId) {
                if (prev.order === 'asc') return { colId: colId, order: 'desc' };
                return null;
            }
            return { colId: colId, order: 'asc' };
        });
        setActivePopover(null);
    };

    const filteredGroups = useMemo(() => {
        const groupsRes = boardData?.Groups || boardData?.groups || [];
        if (!groupsRes) return [];

        return groupsRes.map(group => {
            let items = [...(group.items || [])];

            // 1. Search filter
            if (searchTerm) {
                const s = searchTerm.toLowerCase();
                items = items.filter(item =>
                    (item.name || '').toLowerCase().includes(s) ||
                    (item.status || '').toLowerCase().includes(s)
                );
            }

            // 2. Person filter
            if (selectedPersonIds.length > 0) {
                items = items.filter(item => selectedPersonIds.includes(item.assignedToId));
            }

            // 3. Status filter
            if (statusFilter) {
                items = items.filter(item => item.status === statusFilter);
            }

            // 4. Sort logic
            if (sortBy) {
                const { colId, order } = sortBy;
                items.sort((a, b) => {
                    let valA = (a[colId] || '').toString();
                    let valB = (b[colId] || '').toString();

                    if (colId === 'person') {
                        const uA = allUsers.find(u => u.id === (a.assignedToId))?.name || '';
                        const uB = allUsers.find(u => u.id === (b.assignedToId))?.name || '';
                        valA = uA; valB = uB;
                    }

                    if (valA < valB) return order === 'asc' ? -1 : 1;
                    if (valA > valB) return order === 'asc' ? 1 : -1;
                    return 0;
                });
            }

            return { ...group, items };
        });
    }, [boardData, searchTerm, selectedPersonIds, statusFilter, sortBy, allUsers]);

    const visibleColumns = useMemo(() => {
        return columns.filter(col => !hiddenColumnIds.includes(col.id));
    }, [hiddenColumnIds, columns]);

    if (isLoading) {
        return (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh' }}>
                <Loader2 size={40} className="spin" color="var(--primary-color)" />
            </div>
        );
    }

    if (!boardData) {
        return <div style={{ padding: '40px', textAlign: 'center' }}>No boards found.</div>;
    }

    const statusOptions = [
        { label: 'Working on it', color: '#fdab3d' },
        { label: 'Done', color: '#00c875' },
        { label: 'Stuck', color: '#e2445c' },
        { label: 'Waiting', color: '#0085ff' },
        { label: 'For Client Review', color: '#ffcb00' },
        { label: 'Waiting for Details', color: '#0086c0' },
        { label: 'Waiting for VSS Cert', color: '#e2445c' },
        { label: '90% Payment', color: '#a25ddc' },
        { label: 'Lead', color: '#0085ff' },
        { label: 'Negotiation', color: '#fdab3d' },
        { label: 'Proposal Sent', color: '#ffcb00' },
        { label: 'Won', color: '#00c875' },
        { label: 'Lost', color: '#e2445c' },
        { label: 'Research', color: '#0085ff' },
        { label: 'POC', color: '#a25ddc' },
        { label: 'MVP', color: '#ffcb00' }
    ];

    const riskOptions = [
        { label: 'High', color: '#e2445c' },
        { label: 'Medium', color: '#ffcb00' },
        { label: 'Low', color: '#00c875' }
    ];

    const priorityOptions = [
        { label: 'Critical', color: '#e2445c' },
        { label: 'High', color: '#fdab3d' },
        { label: 'Medium', color: '#ffcb00' },
        { label: 'Low', color: '#0085ff' }
    ];

    return (
        <div className="board">
            <style>{`
                .board { display: flex; flex-direction: column; height: 100%; background: #ffffff; color: var(--text-main); }
                .board-header { padding: 24px 24px 0 24px; border-bottom: 1px solid #e1e1e1; background: #fff; }
                .board-title-row { display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px; }
                .board-title { display: flex; align-items: center; gap: 12px; }
                .board-title h1 { font-size: 32px; font-weight: 700; margin: 0; color: #323338; }
                .star-icon { color: #676879; cursor: pointer; transition: color 0.2s; }
                .star-icon:hover { color: #ffcb00; }
                
                .board-tabs { display: flex; gap: 8px; margin-top: 24px; }
                .tab-btn { background: transparent; border: none; padding: 8px 16px; font-size: 14px; color: #676879; cursor: pointer; border-bottom: 2px solid transparent; display: flex; align-items: center; gap: 8px; transition: all 0.2s; }
                .tab-btn:hover { background: #f5f6f8; border-radius: 4px 4px 0 0; }
                .tab-btn.active { color: #0085ff; border-bottom: 2px solid #0085ff; font-weight: 500; }
                
                .board-action-bar { display: flex; justify-content: space-between; align-items: center; padding: 12px 0; border-top: 1px solid #e1e1e1; margin-top: 0; }
                .action-left { display: flex; align-items: center; gap: 12px; }
                .new-item-btn { background: #0085ff; color: #fff; border: none; padding: 0 16px; border-radius: 4px; font-weight: 500; cursor: pointer; height: 32px; display: flex; align-items: center; gap: 8px; font-size: 14px; }
                .new-item-btn:hover { background: #0073e6; }
                
                .search-field { display: flex; align-items: center; gap: 8px; border: 1px solid #c3c6d4; border-radius: 4px; padding: 0 12px; height: 32px; background: #fff; transition: border-color 0.2s; }
                .search-field:focus-within { border-color: #0085ff; }
                .search-field input { border: none; outline: none; background: transparent; color: #323338; width: 140px; font-size: 14px; }
                
                .action-right { display: flex; align-items: center; gap: 4px; position: relative; }
                .tool-btn { background: transparent; border: none; padding: 6px 12px; display: flex; align-items: center; gap: 8px; font-size: 14px; color: #676879; cursor: pointer; border-radius: 4px; transition: background 0.2s; }
                .tool-btn:hover, .tool-btn.active { background: #f5f6f8; color: #323338; }
                
                .board-sub-actions { padding: 12px 24px; display: flex; gap: 12px; background: #fff; border-bottom: 1px solid #e1e1e1; }
                .sub-action-btn { background: #fff; border: 1px solid #c3c6d4; padding: 0 12px; border-radius: 4px; font-size: 14px; display: flex; align-items: center; gap: 8px; color: #676879; cursor: pointer; height: 32px; transition: all 0.2s; }
                .sub-action-btn:hover { background: #f5f6f8; border-color: #323338; color: #323338; }
                
                .popover-container { position: absolute; top: 100%; right: 0; background: #fff; border: 1px solid #e1e1e1; box-shadow: 0 8px 16px rgba(0,0,0,0.1); border-radius: 8px; z-index: 100; min-width: 220px; padding: 8px 0; margin-top: 8px; }
                .popover-header { padding: 12px 16px; font-weight: 700; font-size: 14px; color: #323338; border-bottom: 1px solid #e1e1e1; }
                .popover-item { padding: 10px 16px; display: flex; align-items: center; gap: 12px; cursor: pointer; font-size: 14px; color: #323338; transition: background 0.2s; }
                .popover-item:hover { background: #f5f6f8; }
                
                .avatar-small { width: 24px; height: 24px; border-radius: 50%; background: #0085ff; color: #fff; display: flex; align-items: center; justify-content: center; font-size: 11px; font-weight: 700; }
                
                .spin { animation: spin 1s linear infinite; }
                @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
            `}</style>

            <input
                type="file"
                ref={fileInputRef}
                style={{ display: 'none' }}
                accept=".csv"
                onChange={handleFileChange}
            />

            <div className="board-header">
                <div className="board-title-row">
                    <div className="board-title">
                        <h1>{boardData.name}</h1>
                        <Star size={24} className="star-icon" />
                    </div>
                    <div className="board-header-right">
                        <MoreHorizontal size={20} className="star-icon" />
                    </div>
                </div>

                <div className="board-tabs">
                    <button className={`tab-btn ${activeTab === 'table' ? 'active' : ''}`} onClick={() => setActiveTab('table')}>
                        <TableIcon size={16} /> Main Table
                    </button>
                    <button className={`tab-btn ${activeTab === 'calendar' ? 'active' : ''}`} onClick={() => setActiveTab('calendar')}>
                        <Calendar size={16} /> Calendar
                    </button>
                    <button className={`tab-btn ${activeTab === 'dashboard' ? 'active' : ''}`} onClick={() => setActiveTab('dashboard')}>
                        <LayoutDashboard size={16} /> Dashboard
                    </button>
                    <button className="tab-btn">
                        <Plus size={16} /> Add View
                    </button>
                </div>

                <div className="board-action-bar">
                    <div className="action-left">
                        <button className="new-item-btn" onClick={() => handleAddItem(boardData?.Groups?.[0]?.id || boardData?.groups?.[0]?.id)}>
                            <Plus size={18} /> New Item
                        </button>
                        <div className="search-field">
                            <Search size={16} color="#676879" />
                            <input placeholder="Search Board" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
                        </div>
                    </div>
                    <div className="action-right">
                        <div style={{ position: 'relative' }}>
                            <button className={`tool-btn ${activePopover === 'person' ? 'active' : ''}`} onClick={() => togglePopover('person')}>
                                <UserCircle size={18} /> Person
                            </button>
                            {activePopover === 'person' && (
                                <div className="popover-container">
                                    <div className="popover-header">Filter by Person</div>
                                    {allUsers.map(user => (
                                        <div key={user.id} className={`popover-item ${selectedPersonIds.includes(user.id) ? 'selected' : ''}`} onClick={() => togglePersonSelection(user.id)}>
                                            <div style={{ width: 16, height: 16, display: 'flex', alignItems: 'center', justifyItems: 'center' }}>
                                                {selectedPersonIds.includes(user.id) && <Check size={14} color="#0085ff" />}
                                            </div>
                                            <div className="avatar-small">{user.name[0]}</div>
                                            <span>{user.name}</span>
                                        </div>
                                    ))}
                                    {allUsers.length === 0 && <div className="popover-item">No users found</div>}
                                </div>
                            )}
                        </div>

                        <div style={{ position: 'relative' }}>
                            <button className={`tool-btn ${activePopover === 'filter' ? 'active' : ''}`} onClick={() => togglePopover('filter')}>
                                <Filter size={18} /> Filter
                            </button>
                            {activePopover === 'filter' && (
                                <div className="popover-container">
                                    <div className="popover-header">Filter by Status</div>
                                    <div className={`popover-item ${!statusFilter ? 'selected' : ''}`} onClick={() => { setStatusFilter(null); setActivePopover(null); }}>
                                        All Items
                                    </div>
                                    {statusOptions.slice(0, 5).map(opt => (
                                        <div key={opt.label} className={`popover-item ${statusFilter === opt.label ? 'selected' : ''}`} onClick={() => { setStatusFilter(opt.label); setActivePopover(null); }}>
                                            <div style={{ width: 12, height: 12, borderRadius: '2px', background: opt.color }}></div>
                                            <span>{opt.label}</span>
                                        </div>
                                    ))}
                                    <div style={{ borderTop: '1px solid #eee', marginTop: '8px' }}></div>
                                    <div className="popover-item" onClick={() => { setSearchTerm(''); setSelectedPersonIds([]); setStatusFilter(null); setActivePopover(null); }}>
                                        Clear All Filters
                                    </div>
                                </div>
                            )}
                        </div>

                        <div style={{ position: 'relative' }}>
                            <button className={`tool-btn ${activePopover === 'sort' ? 'active' : ''}`} onClick={() => togglePopover('sort')}>
                                <ArrowUpDown size={18} /> Sort
                            </button>
                            {activePopover === 'sort' && (
                                <div className="popover-container">
                                    <div className="popover-header">Sort items by</div>
                                    <div className="popover-item" onClick={() => handleSort('name')}>
                                        {sortBy?.colId === 'name' && <Check size={14} color="#0085ff" style={{ marginRight: '8px' }} />}
                                        Item Name
                                    </div>
                                    <div className="popover-item" onClick={() => handleSort('status')}>
                                        {sortBy?.colId === 'status' && <Check size={14} color="#0085ff" style={{ marginRight: '8px' }} />}
                                        Status
                                    </div>
                                    <div className="popover-item" onClick={() => handleSort('person')}>
                                        {sortBy?.colId === 'person' && <Check size={14} color="#0085ff" style={{ marginRight: '8px' }} />}
                                        Person
                                    </div>
                                </div>
                            )}
                        </div>

                        <div style={{ position: 'relative' }}>
                            <button className={`tool-btn ${activePopover === 'hide' ? 'active' : ''}`} onClick={() => togglePopover('hide')}>
                                <EyeOff size={18} /> Hide
                            </button>
                            {activePopover === 'hide' && (
                                <div className="popover-container">
                                    <div className="popover-header">Toggle Columns</div>
                                    {columns.map(col => (
                                        <div key={col.id} className="popover-item" onClick={() => toggleColumnVisibility(col.id)}>
                                            <div style={{ width: 16 }}>
                                                {!hiddenColumnIds.includes(col.id) && <Check size={14} color="#0085ff" />}
                                            </div>
                                            <span>{col.title}</span>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>

                        <div className="tool-btn" style={{ padding: '6px 8px' }}>
                            <MoreHorizontal size={20} />
                        </div>
                    </div>
                </div>

                <div className="board-sub-actions" style={{ padding: '0 24px 16px 24px', display: 'flex', gap: '8px' }}>
                    <button className="sub-action-btn" onClick={handleExport}>
                        <Download size={14} /> Export
                    </button>
                    <button className="sub-action-btn" onClick={handleImportClick}>
                        <Upload size={14} /> Import
                    </button>
                    <button className="sub-action-btn" style={{ borderColor: '#e2445c', color: '#e2445c' }} onClick={handleClearBoard}>
                        <Trash2 size={14} /> Clear Board Data
                    </button>
                </div>
            </div>

            <div className="board-content" style={{ flex: 1, overflow: 'auto', padding: '24px' }}>
                {activeTab === 'table' && (
                    filteredGroups.map(group => (
                        <Table
                            key={group.id}
                            group={group}
                            onUpdateItem={handleUpdateItem}
                            onAddItem={handleAddItem}
                            onDeleteItem={handleDeleteItem}
                            allUsers={allUsers}
                            columns={visibleColumns}
                            columnWidths={{
                                name: 320,
                                person: 100,
                                status: 140,
                                timeline: 140,
                                receivedDate: 120,
                                progress: 140,
                                payment: 140,
                                timeTracking: 120,
                                aiModel: 100,
                                risk: 100,
                                priority: 100,
                                dealValue: 120,
                                dealStatus: 120,
                                invoiceSent: 80
                            }}
                            statusOptions={statusOptions}
                            riskOptions={riskOptions}
                            priorityOptions={priorityOptions}
                            onResize={() => { }}
                        />
                    ))
                )}
                {activeTab === 'calendar' && (
                    <CalendarView
                        boardData={boardData}
                        onUpdateItem={handleUpdateItem}
                        onItemClick={() => { }}
                        statusOptions={statusOptions}
                    />
                )}
                {activeTab === 'dashboard' && (
                    <Dashboard boardData={boardData} />
                )}
            </div>
        </div>
    );
};

export default Board;
