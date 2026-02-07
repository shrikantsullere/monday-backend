import React, { useState } from 'react';
import {
    ChevronDown, ChevronRight, User as UserIcon, Plus, GripVertical,
    MoreHorizontal, Check, X, Search, Loader2, Play, Circle, Calendar, Trash2
} from 'lucide-react';

const formatDateForInput = (dateVal) => {
    if (!dateVal) return '';
    try {
        const d = new Date(dateVal);
        if (isNaN(d.getTime())) return '';
        return d.toISOString().split('T')[0];
    } catch {
        return '';
    }
};

const Table = ({
    group,
    columns,
    onAddItem,
    onUpdateItem,
    allUsers,
    columnWidths,
    onResize,
    statusOptions: propStatusOptions,
    riskOptions,
    priorityOptions
}) => {
    const [isCollapsed, setIsCollapsed] = useState(false);
    const [activeMenu, setActiveMenu] = useState(null); // { itemId, colId, type, rect }
    const [personSearch, setPersonSearch] = useState('');

    const statusOptions = propStatusOptions || [
        { label: 'Working on it', color: '#fdab3d' },
        { label: 'Done', color: '#00c875' },
        { label: 'Stuck', color: '#e2445c' },
        { label: 'Waiting', color: '#0085ff' },
        { label: 'For Client Review', color: '#ffcb00' },
        { label: 'Waiting for Details', color: '#0086c0' },
        { label: 'Waiting for VSS Cert', color: '#e2445c' },
        { label: '90% Payment', color: '#a25ddc' }
    ];

    const handleStatusChange = (itemId, newStatus, colId) => {
        onUpdateItem(group.id, itemId, { [colId]: newStatus });
        setActiveMenu(null);
    };

    const handlePersonChange = (itemId, userId, colId) => {
        onUpdateItem(group.id, itemId, { assignedToId: userId });
        setActiveMenu(null);
    };

    const renderCellContent = (item, col) => {
        const value = item[col.id];
        const isMenuOpen = activeMenu?.itemId === item.id && activeMenu?.colId === col.id;

        const openMenu = (e, type) => {
            e.stopPropagation();
            const rect = e.currentTarget.getBoundingClientRect();
            setActiveMenu({ itemId: item.id, colId: col.id, type, rect });
        };

        const renderStatusLikeCell = (type, options) => {
            const currentOpt = options.find(o => o.label === value) || { label: value, color: '#c4c4c4' };
            const finalColor = currentOpt.color || '#c4c4c4'; // fallback

            return (
                <div className="status-cell-wrapper" onClick={(e) => openMenu(e, type)}>
                    <div className="status-cell" style={{ background: finalColor }}>{value || '-'}</div>
                    {isMenuOpen && activeMenu.type === type && (
                        <div className="popover status-popover" style={{ top: activeMenu.rect.bottom + 4, left: activeMenu.rect.left }}>
                            {options.map(opt => (
                                <div key={opt.label} className="popover-item" onClick={() => handleStatusChange(item.id, opt.label, col.id)}>
                                    <div className="status-color-dot" style={{ background: opt.color }}></div>
                                    {opt.label}
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            );
        };

        switch (col.type) {
            case 'status':
                return renderStatusLikeCell('status', statusOptions);
            case 'risk':
                return renderStatusLikeCell('risk', riskOptions || [
                    { label: 'Low', color: '#00c875' },
                    { label: 'Medium', color: '#ffcb00' },
                    { label: 'High', color: '#e2445c' }
                ]);
            case 'priority':
                return renderStatusLikeCell('priority', priorityOptions || [
                    { label: 'Low', color: '#00c875' },
                    { label: 'Medium', color: '#ffcb00' },
                    { label: 'High', color: '#e2445c' },
                    { label: 'Critical', color: '#333' }
                ]);
            case 'person':
                const assignedUser = allUsers.find(u => u.id === item.assignedToId);
                return (
                    <div className="person-cell-wrapper" onClick={(e) => openMenu(e, 'person')}>
                        <div className="person-cell" style={{ justifyContent: 'flex-start', paddingLeft: '12px', gap: '8px' }}>
                            {assignedUser ? (
                                <div className="avatar-small" title={assignedUser.name}>{assignedUser.name[0]}</div>
                            ) : (
                                <UserIcon size={16} color="var(--text-muted)" />
                            )}
                            <span className="person-name" style={{ color: assignedUser ? 'inherit' : 'var(--text-secondary)', fontSize: '13px' }}>
                                {assignedUser ? assignedUser.name : 'Unassigned'}
                            </span>
                        </div>
                        {isMenuOpen && activeMenu.type === 'person' && (
                            <div className="popover person-popover" style={{ top: activeMenu.rect.bottom + 4, left: activeMenu.rect.left }}>
                                <div className="popover-search">
                                    <Search size={14} />
                                    <input placeholder="Search names..." value={personSearch} onChange={e => setPersonSearch(e.target.value)} onClick={e => e.stopPropagation()} />
                                </div>
                                <div className="popover-list">
                                    {allUsers.filter(u => u.name.toLowerCase().includes(personSearch.toLowerCase())).map(u => (
                                        <div key={u.id} className="popover-item" onClick={() => handlePersonChange(item.id, u.id, col.id)}>
                                            <div className="avatar-small">{u.name[0]}</div>
                                            {u.name}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                );
            case 'checkbox':
                return (
                    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
                        <input
                            type="checkbox"
                            checked={!!value}
                            onChange={(e) => onUpdateItem(group.id, item.id, { [col.id]: e.target.checked })}
                            onClick={e => e.stopPropagation()}
                            style={{ width: '16px', height: '16px', cursor: 'pointer' }}
                        />
                    </div>
                );
            case 'progress':
                return (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '0 16px', height: '100%', width: '100%' }}>
                        <div style={{ flex: 1, height: '8px', background: '#eee', borderRadius: '4px', overflow: 'hidden', position: 'relative' }}>
                            <div style={{ width: `${parseInt(value) || 0}%`, height: '100%', background: '#0085ff' }}></div>
                        </div>
                        <span style={{ fontSize: '12px', color: '#676879', width: '32px' }}>{parseInt(value) || 0}%</span>
                    </div>
                );
            case 'date':
                const dateVal = value && value !== '0' ? new Date(value) : null;
                const formattedDate = dateVal && !isNaN(dateVal.getTime()) ? dateVal.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : '-';
                return (
                    <div
                        className="date-cell-container"
                        onClick={(e) => {
                            const input = e.currentTarget.querySelector('input');
                            if (input && input.showPicker) {
                                try { input.showPicker(); } catch (e) { input.focus(); }
                            }
                        }}
                        style={{ position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', padding: '0 12px', height: '100%', cursor: 'pointer' }}
                    >
                        <span style={{ color: '#e2445c', fontSize: '13px' }}>{formattedDate}</span>
                        <Calendar size={14} color="#e2445c" />
                        <input
                            type="date"
                            value={formatDateForInput(value)}
                            onChange={(e) => onUpdateItem(group.id, item.id, { [col.id]: e.target.value })}
                            onClick={(e) => e.stopPropagation()}
                            style={{ position: 'absolute', opacity: 0, width: '1px', height: '1px', pointerEvents: 'none' }}
                        />
                    </div>
                );
            case 'time_tracking':
                const displayTime = (!value || value === '0' || value === 0) ? '00:00:00' : value;
                return (
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '12px', height: '100%' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '4px', color: '#323338' }}>
                            <Circle size={14} color="#676879" />
                            <span style={{ fontSize: '13px' }}>{displayTime}</span>
                        </div>
                        <div style={{ width: '24px', height: '24px', borderRadius: '50%', background: '#00ca72', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
                            <Play size={12} fill="#fff" color="#fff" />
                        </div>
                    </div>
                );
            case 'payment':
            case 'currency':
                return (
                    <div style={{ display: 'flex', alignItems: 'center', height: '100%', color: '#323338', padding: '0 12px', position: 'relative' }}>
                        <span style={{ fontSize: '13px', color: '#676879', position: 'absolute', left: '20px' }}>$</span>
                        <span style={{ fontSize: '13px', flex: 1, textAlign: 'center', paddingLeft: '8px' }}>{value ? parseFloat(value).toFixed(2) : '0.00'}</span>
                    </div>
                );
            case 'timeline':
                return (
                    <div
                        className="date-cell-container"
                        onClick={(e) => {
                            const input = e.currentTarget.querySelector('input');
                            if (input && input.showPicker) {
                                try { input.showPicker(); } catch (e) { input.focus(); }
                            }
                        }}
                        style={{ position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', height: '100%', fontSize: '13px', color: '#323338', cursor: 'pointer' }}
                    >
                        <span>{value || '-'}</span>
                        <Calendar size={14} color="#676879" />
                        <input
                            type="date"
                            value={formatDateForInput(value?.split(' - ')[0] || value)}
                            onChange={(e) => onUpdateItem(group.id, item.id, { [col.id]: e.target.value })}
                            onClick={(e) => e.stopPropagation()}
                            style={{ position: 'absolute', opacity: 0, width: '1px', height: '1px', pointerEvents: 'none' }}
                        />
                    </div>
                );
            default:
                if (col.id === 'name') {
                    return (
                        <div className="name-cell-wrapper" style={{ display: 'flex', alignItems: 'center', gap: '16px', height: '100%', padding: '0 8px', position: 'relative' }}>
                            <ChevronRight size={14} color="#676879" style={{ marginLeft: '4px' }} />
                            <span style={{ color: '#323338', fontSize: '13px', fontWeight: 400 }}>{value || ''}</span>
                            {value === 'D25-117 Desert Leisure' && (
                                <div style={{ marginLeft: 'auto', marginRight: '32px', width: '18px', height: '18px', borderRadius: '50%', background: '#f0f0f0', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '10px', color: '#676879' }}>1</div>
                            )}
                            <button
                                className="delete-row-btn"
                                onClick={(e) => { e.stopPropagation(); onDeleteItem(group.id, item.id); }}
                                style={{ position: 'absolute', right: '4px', background: 'transparent', border: 'none', cursor: 'pointer', color: '#e2445c', padding: '4px', opacity: 0 }}
                            >
                                <Trash2 size={14} />
                            </button>
                        </div>
                    );
                }
                return (
                    <input
                        className="text-input-cell"
                        value={value || ''}
                        onChange={(e) => onUpdateItem(group.id, item.id, { [col.id]: e.target.value })}
                        onClick={(e) => e.stopPropagation()}
                    />
                );
        }
    };

    // ... (inside Table component)
    const [newItemData, setNewItemData] = useState({ name: '' });

    const handleAddItemKeyDown = (e) => {
        if (e.key === 'Enter' && newItemData.name?.trim()) {
            onAddItem(group.id, {
                name: newItemData.name,
                status: 'Working on it',
                GroupId: group.id,
                ...newItemData
            });
            setNewItemData({ name: '' });
        }
    };

    const handleNewItemChange = (colId, value) => {
        setNewItemData(prev => ({ ...prev, [colId]: value }));
    };

    return (
        <>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '16px 8px', background: '#fff' }}>
                <div onClick={() => setIsCollapsed(!isCollapsed)} style={{ cursor: 'pointer', display: 'flex', alignItems: 'center' }}>
                    {isCollapsed ? <ChevronRight size={20} /> : <ChevronDown size={20} color={group.color} />}
                </div>
                <h2 style={{ fontSize: '18px', fontWeight: 700, margin: 0, color: group.color }}>{group.name || group.title}</h2>
                <span style={{ fontSize: '14px', color: '#676879', marginLeft: '8px', fontWeight: 400 }}>{(group.items || []).length} Items</span>
            </div>

            {
                !isCollapsed && (
                    <div className="table-wrapper">
                        <table className="monday-table">
                            <thead>
                                <tr>
                                    {columns.map((col, index) => (
                                        <th key={col.id} style={{ width: columnWidths[col.id] || 150, textAlign: index === 0 ? 'left' : 'center' }}>
                                            {col.title}
                                        </th>
                                    ))}
                                    <th style={{ width: 40, textAlign: 'center', borderRight: 'none' }}><Plus size={16} /></th>
                                </tr>
                            </thead>
                            <tbody>
                                {(group.items || []).map(item => (
                                    <tr key={item.id}>
                                        {columns.map((col, idx) => (
                                            <td key={col.id} style={{
                                                position: idx === 0 ? 'relative' : 'static',
                                                padding: idx === 0 ? '0 0 0 8px' : '0'
                                            }}>
                                                {idx === 0 && (
                                                    <div style={{
                                                        position: 'absolute',
                                                        left: 0,
                                                        top: 0,
                                                        bottom: 0,
                                                        width: '6px',
                                                        background: group.color || '#00c875'
                                                    }}></div>
                                                )}
                                                {renderCellContent(item, col)}
                                            </td>
                                        ))}
                                        <td style={{ borderRight: 'none' }}></td>
                                    </tr>
                                ))}
                                {/* Creation Row */}
                                <tr className="creation-row">
                                    {columns.map((col, idx) => (
                                        <td key={col.id} style={{
                                            position: idx === 0 ? 'relative' : 'static',
                                            padding: idx === 0 ? '0 0 0 8px' : '0'
                                        }}>
                                            {idx === 0 && (
                                                <div style={{
                                                    position: 'absolute',
                                                    left: 0,
                                                    top: 0,
                                                    bottom: 0,
                                                    width: '6px',
                                                    background: group.color || '#00c875'
                                                }}></div>
                                            )}
                                            {col.id === 'name' ? (
                                                <div style={{ display: 'flex', alignItems: 'center', height: '100%', padding: '0 8px', gap: '12px' }}>
                                                    <ChevronRight size={14} color="#676879" />
                                                    <input
                                                        className="add-item-input"
                                                        placeholder="Add Item"
                                                        value={newItemData.name || ''}
                                                        onChange={(e) => handleNewItemChange('name', e.target.value)}
                                                        onKeyDown={handleAddItemKeyDown}
                                                        style={{ width: '100%', border: 'none', outline: 'none', background: 'transparent' }}
                                                    />
                                                </div>
                                            ) : idx === 1 ? (
                                                <div className="person-cell" style={{ opacity: 0.5 }}>
                                                    <div className="avatar-small" style={{ background: '#676879' }}>U</div>
                                                    <span className="person-name">Unassigned</span>
                                                </div>
                                            ) : idx === 2 ? (
                                                <div className="status-cell-wrapper" style={{ opacity: 0.5 }}>
                                                    <div className="status-cell" style={{ background: '#fdab3d' }}>Working on it</div>
                                                </div>
                                            ) : (
                                                <div style={{ height: '100%', background: '#fff' }}></div>
                                            )}
                                        </td>
                                    ))}
                                    <td style={{ borderRight: 'none' }}></td>
                                </tr>
                                {/* Footer / Total Row */}
                                <tr className="add-item-link-row" onClick={() => onAddItem(group.id)}>
                                    <td style={{ padding: '8px 48px', color: '#0085ff', cursor: 'pointer', fontSize: '14px', borderRight: 'none' }}>
                                        + Add Item
                                    </td>
                                    {columns.slice(1).map((col, idx) => (
                                        <td key={`link-td-${idx}`} style={{ borderRight: 'none' }}></td>
                                    ))}
                                    <td style={{ borderRight: 'none' }}></td>
                                </tr>
                                <tr className="total-row">
                                    <td style={{ background: '#fff', borderRight: 'none', borderBottom: 'none', fontWeight: 700, padding: '0 56px', fontSize: '14px', color: '#323338', position: 'relative' }}>
                                        {group.color && (
                                            <div style={{ position: 'absolute', left: 0, top: 0, bottom: 0, width: '6px', background: group.color }}></div>
                                        )}
                                        Total
                                    </td>
                                    {columns.slice(1).map((col, idx) => (
                                        <td key={`total-${col.id}`} style={{
                                            borderRight: 'none',
                                            borderBottom: 'none'
                                        }}>
                                        </td>
                                    ))}
                                    <td style={{ borderBottom: 'none', borderRight: 'none' }}></td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                )
            }

            <style>{`
        .table-wrapper { width: 100%; overflow-x: auto; background: #fff; margin-bottom: 24px; }
        .monday-table { width: 100%; border-collapse: collapse; font-size: 13px; table-layout: fixed; border-top: 1px solid #e1e1e1; }
        .monday-table th { padding: 8px 12px; background: #fff; color: #676879; font-weight: 400; font-size: 14px; border-bottom: 1px solid #e1e1e1; border-right: 1px solid #eee; height: 40px; }
        .monday-table td { padding: 0; border-bottom: 1px solid #e1e1e1; border-right: 1px solid #eee; height: 36px; vertical-align: middle; background: #fff; }
        .monday-table tr:hover td { background: #f5f6f8; }
        .monday-table tr:hover .delete-row-btn { opacity: 1 !important; }
        .monday-table th:first-child { padding-left: 56px; }
        
        .text-input-cell { width: 100%; height: 100%; border: none; outline: none; background: transparent; padding: 0 12px; font-size: 13px; color: #323338; }
        .text-input-cell:focus { background: #fff; box-shadow: inset 0 0 0 1px #0085ff; }
        
        .status-cell-wrapper { width: 100%; height: 100%; padding: 4px; cursor: pointer; }
        .status-cell { width: 100%; height: 100%; display: flex; align-items: center; justify-content: center; color: #fff; border-radius: 2px; font-size: 13px; font-weight: 500; text-align: center; }
        
        .person-cell-wrapper { width: 100%; height: 100%; padding: 0 8px; cursor: pointer; }
        .person-cell { display: flex; align-items: center; justify-content: center; height: 100%; }
        .avatar-small { width: 28px; height: 28px; border-radius: 50%; background: #323338; color: #fff; display: flex; align-items: center; justify-content: center; font-size: 12px; font-weight: 600; }
        
        .timeline-cell-wrapper { width: 100%; height: 100%; padding: 4px; cursor: pointer; }
        .timeline-cell { display: flex; align-items: center; justify-content: center; height: 100%; }

        .popover { position: fixed; background: #fff; border-radius: 8px; box-shadow: 0 8px 16px rgba(0,0,0,0.1); border: 1px solid #e1e1e1; z-index: 1000; overflow: hidden; }
        .popover-item { padding: 10px 16px; display: flex; align-items: center; gap: 12px; cursor: pointer; transition: background 0.2s; font-size: 14px; color: #323338; }
        .popover-item:hover { background: #f5f6f8; }
        
        .creation-row td { background: #fff; }
        .add-item-input { height: 100%; font-size: 14px; color: #323338; }
        .footer-add-item-row:hover td { background: #f5f6f8; }
        .footer-add-item-row td { border-top: none; cursor: pointer; border-right: none; }
            `}</style>
        </>
    );
};

export default Table;
