import React, { useState } from 'react';
import {
    ChevronDown, ChevronRight, User as UserIcon, Plus, GripVertical,
    MoreHorizontal, Check, X, Search, Loader2
} from 'lucide-react';

const Table = ({
    group,
    columns,
    onAddItem,
    onUpdateItem,
    allUsers,
    columnWidths,
    onResize
}) => {
    const [isCollapsed, setIsCollapsed] = useState(false);
    const [activeMenu, setActiveMenu] = useState(null); // { itemId, colId, type, rect }
    const [personSearch, setPersonSearch] = useState('');

    const statusOptions = [
        { label: 'Working on it', color: '#fdab3d' },
        { label: 'Done', color: '#00c875' },
        { label: 'Stuck', color: '#e2445c' },
        { label: 'Waiting', color: '#0085ff' }
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

        switch (col.type) {
            case 'status':
                const statusColor = statusOptions.find(o => o.label === value)?.color || '#c4c4c4';
                return (
                    <div className="status-cell-wrapper" onClick={(e) => openMenu(e, 'status')}>
                        <div className="status-cell" style={{ background: statusColor }}>{value || 'Working on it'}</div>
                        {isMenuOpen && activeMenu.type === 'status' && (
                            <div className="popover status-popover" style={{ top: activeMenu.rect.bottom + 4, left: activeMenu.rect.left }}>
                                {statusOptions.map(opt => (
                                    <div key={opt.label} className="popover-item" onClick={() => handleStatusChange(item.id, opt.label, col.id)}>
                                        <div className="status-color-dot" style={{ background: opt.color }}></div>
                                        {opt.label}
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                );
            case 'person':
                const assignedUser = allUsers.find(u => u.id === item.assignedToId);
                return (
                    <div className="person-cell-wrapper" onClick={(e) => openMenu(e, 'person')}>
                        <div className="person-cell">
                            {assignedUser ? (
                                <div className="avatar-small" title={assignedUser.name}>{assignedUser.name[0]}</div>
                            ) : (
                                <UserIcon size={16} color="var(--text-muted)" />
                            )}
                            <span>{assignedUser ? assignedUser.name : 'Assign'}</span>
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
            default:
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

    return (
        <div className="table-group">
            <style>{`
                .table-group { margin-bottom: 32px; }
                .group-header { display: flex; align-items: center; gap: 8px; padding: 12px 0; cursor: pointer; color: var(--text-main); }
                .group-title { font-size: 18px; font-weight: 600; }
                .table-wrapper { background: var(--bg-card); border: 1px solid var(--border-color); border-radius: 4px; overflow: hidden; }
                .monday-table { width: 100%; border-collapse: collapse; table-layout: fixed; }
                .monday-table th { background: var(--bg-page); padding: 8px 12px; text-align: left; font-size: 13px; color: var(--text-secondary); border-right: 1px solid var(--border-color); font-weight: 500; }
                .monday-table td { padding: 0; border: 1px solid var(--border-color); height: 36px; vertical-align: middle; }
                .status-cell { height: 100%; display: flex; align-items: center; justify-content: center; color: #fff; font-size: 12px; font-weight: 500; cursor: pointer; }
                .status-cell-wrapper, .person-cell-wrapper { height: 100%; position: relative; }
                .person-cell { display: flex; align-items: center; gap: 8px; padding: 0 12px; height: 100%; cursor: pointer; }
                .avatar-small { width: 24px; height: 24px; border-radius: 50%; background: var(--primary-color); color: #fff; display: flex; align-items: center; justify-content: center; font-size: 11px; }
                .text-input-cell { width: 100%; height: 100%; border: none; background: transparent; padding: 0 12px; color: var(--text-main); outline: none; }
                .text-input-cell:focus { background: var(--bg-hover); }
                .popover { position: fixed; z-index: 1000; background: var(--bg-card); border: 1px solid var(--border-color); border-radius: 4px; box-shadow: 0 4px 12px rgba(0,0,0,0.2); min-width: 180px; padding: 4px; }
                .popover-item { display: flex; align-items: center; gap: 8px; padding: 8px; cursor: pointer; font-size: 13px; color: var(--text-main); border-radius: 3px; }
                .popover-item:hover { background: var(--bg-hover); }
                .status-color-dot { width: 12px; height: 12px; border-radius: 2px; }
                .popover-search { display: flex; align-items: center; gap: 8px; padding: 8px; border-bottom: 1px solid var(--border-color); }
                .popover-search input { border: none; outline: none; background: transparent; color: var(--text-main); font-size: 13px; width: 100%; }
                .popover-list { max-height: 200px; overflow-y: auto; }
                .add-row { padding: 8px 12px; color: var(--text-secondary); font-size: 13px; cursor: pointer; border-top: 1px solid var(--border-color); display: flex; align-items: center; gap: 8px; }
                .add-row:hover { background: var(--bg-hover); color: var(--primary-color); }
            `}</style>

            <div className="group-header" onClick={() => setIsCollapsed(!isCollapsed)}>
                {isCollapsed ? <ChevronRight size={18} /> : <ChevronDown size={18} />}
                <span className="group-title" style={{ color: group.color || 'var(--primary-color)' }}>{group.title}</span>
            </div>

            {!isCollapsed && (
                <div className="table-wrapper">
                    <table className="monday-table">
                        <thead>
                            <tr>
                                <th style={{ width: columnWidths.name }}>Item</th>
                                <th style={{ width: columnWidths.person }}>Person</th>
                                <th style={{ width: columnWidths.status }}>Status</th>
                            </tr>
                        </thead>
                        <tbody>
                            {(group.items || []).map(item => (
                                <tr key={item.id}>
                                    <td>{renderCellContent(item, columns[0])}</td>
                                    <td>{renderCellContent(item, columns[1])}</td>
                                    <td>{renderCellContent(item, columns[2])}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                    <div className="add-row" onClick={() => onAddItem(group.id)}>
                        <Plus size={16} /> Add Item
                    </div>
                </div>
            )}
            
            {activeMenu && <div style={{ position: 'fixed', inset: 0, zIndex: 999 }} onClick={() => setActiveMenu(null)}></div>}
        </div>
    );
};

export default Table;
