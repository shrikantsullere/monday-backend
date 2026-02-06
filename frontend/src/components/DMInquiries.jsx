import React from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import {
    MessageSquare,
    Plus,
    Search,
    Filter,
    ArrowUpDown,
    Download,
    Upload,
    AlertCircle,
    X
} from 'lucide-react';
import Table from './Table';
import ItemDetailPanel from './ItemDetailPanel';
import { dmInquiriesData } from '../data/demoData';

const DMInquiries = () => {
    const navigate = useNavigate();
    const [searchParams, setSearchParams] = useSearchParams();
    const [boardData, setBoardData] = React.useState(dmInquiriesData);
    const [selectedItem, setSelectedItem] = React.useState(null);
    const [searchTerm, setSearchTerm] = React.useState('');
    const [runningTimers, setRunningTimers] = React.useState({});
    const [columnWidths, setColumnWidths] = React.useState({});
    const fileInputRef = React.useRef(null);

    // Filter state
    const [showFilterModal, setShowFilterModal] = React.useState(false);
    const [filters, setFilters] = React.useState({
        source: [],
        person: [],
        urgency: [],
        status: [],
        isUnread: null
    });

    // Sort state
    const [showSortModal, setShowSortModal] = React.useState(false);
    const [sortConfig, setSortConfig] = React.useState({ field: 'urgency', direction: 'desc' });

    // Handle URL-based item selection
    React.useEffect(() => {
        const itemId = searchParams.get('item');
        if (itemId && boardData) {
            let foundItem = null;
            boardData.groups.forEach(group => {
                const item = group.items.find(i => i.id === itemId);
                if (item) foundItem = item;
            });
            if (foundItem) {
                setSelectedItem(foundItem);
            }
        }
    }, [searchParams, boardData]);

    const handleUpdateItem = (groupId, itemId, updates, isSub, parentId) => {
        setBoardData(prev => ({
            ...prev,
            groups: prev.groups.map(group =>
                group.id === groupId
                    ? {
                        ...group,
                        items: group.items.map(item =>
                            item.id === itemId ? { ...item, ...updates } : item
                        )
                    }
                    : group
            )
        }));

        if (selectedItem && selectedItem.id === itemId) {
            setSelectedItem(prev => ({ ...prev, ...updates }));
        }
    };

    const handleAddItem = (groupId) => {
        const newItem = {
            id: `dm_${Date.now()}`,
            name: 'New Inquiry',
            messagePreview: '',
            source: 'Website',
            person: '',
            urgency: 'Medium',
            status: 'New',
            receivedDate: new Date().toISOString().split('T')[0],
            timeTracking: '00:00:00',
            isUnread: true
        };

        setBoardData(prev => ({
            ...prev,
            groups: prev.groups.map(group =>
                group.id === groupId
                    ? { ...group, items: [...group.items, newItem] }
                    : group
            )
        }));
    };

    const handleItemClick = (item) => {
        setSelectedItem(item);
        setSearchParams({ item: item.id });

        // Mark as read when clicked
        if (item.isUnread) {
            const groupId = boardData.groups.find(g =>
                g.items.some(i => i.id === item.id)
            )?.id;
            if (groupId) {
                handleUpdateItem(groupId, item.id, { isUnread: false });
            }
        }
    };

    const handleClosePanel = () => {
        setSelectedItem(null);
        setSearchParams({});
    };

    const handleReorder = (groupId, draggedId, targetId) => {
        setBoardData(prev => ({
            ...prev,
            groups: prev.groups.map(group => {
                if (group.id !== groupId) return group;

                const items = [...group.items];
                const draggedIndex = items.findIndex(i => i.id === draggedId);
                const targetIndex = items.findIndex(i => i.id === targetId);

                if (draggedIndex === -1 || targetIndex === -1) return group;

                const [draggedItem] = items.splice(draggedIndex, 1);
                items.splice(targetIndex, 0, draggedItem);

                return { ...group, items };
            })
        }));
    };

    const handleToggleTimer = (itemId) => {
        setRunningTimers(prev => ({
            ...prev,
            [itemId]: !prev[itemId]
        }));
    };

    const onResize = (columnId, width) => {
        setColumnWidths(prev => ({
            ...prev,
            [columnId]: width
        }));
    };

    // Filter functions
    const toggleFilter = (category, value) => {
        if (category === 'isUnread') {
            setFilters(prev => ({
                ...prev,
                isUnread: prev.isUnread === value ? null : value
            }));
        } else {
            setFilters(prev => ({
                ...prev,
                [category]: prev[category].includes(value)
                    ? prev[category].filter(v => v !== value)
                    : [...prev[category], value]
            }));
        }
    };

    const clearFilters = () => {
        setFilters({
            source: [],
            person: [],
            urgency: [],
            status: [],
            isUnread: null
        });
    };

    const applyFilters = (items) => {
        return items.filter(item => {
            if (filters.source.length && !filters.source.includes(item.source)) return false;
            if (filters.person.length && !filters.person.includes(item.person)) return false;
            if (filters.urgency.length && !filters.urgency.includes(item.urgency)) return false;
            if (filters.status.length && !filters.status.includes(item.status)) return false;
            if (filters.isUnread !== null && item.isUnread !== filters.isUnread) return false;
            return true;
        });
    };

    // Sort functions
    const applySorting = (items) => {
        if (!sortConfig.field) return items;

        return [...items].sort((a, b) => {
            let aVal = a[sortConfig.field];
            let bVal = b[sortConfig.field];

            // Handle urgency priority
            if (sortConfig.field === 'urgency') {
                const urgencyMap = { 'High': 3, 'Medium': 2, 'Low': 1 };
                aVal = urgencyMap[aVal] || 0;
                bVal = urgencyMap[bVal] || 0;
            }

            // Handle dates
            if (sortConfig.field === 'receivedDate') {
                aVal = aVal ? new Date(aVal).getTime() : 0;
                bVal = bVal ? new Date(bVal).getTime() : 0;
            }

            // Handle strings
            if (typeof aVal === 'string') {
                aVal = aVal.toLowerCase();
                bVal = bVal.toLowerCase();
            }

            if (aVal < bVal) return sortConfig.direction === 'asc' ? -1 : 1;
            if (aVal > bVal) return sortConfig.direction === 'asc' ? 1 : -1;
            return 0;
        });
    };

    const handleSort = (field) => {
        setSortConfig(prev => ({
            field,
            direction: prev.field === field && prev.direction === 'asc' ? 'desc' : 'asc'
        }));
        setShowSortModal(false);
    };

    const parseCSVLine = (line) => {
        const result = [];
        let current = '';
        let inQuotes = false;

        for (let i = 0; i < line.length; i++) {
            const char = line[i];

            if (char === '"') {
                if (inQuotes && line[i + 1] === '"') {
                    current += '"';
                    i++;
                } else {
                    inQuotes = !inQuotes;
                }
            } else if (char === ',' && !inQuotes) {
                result.push(current);
                current = '';
            } else {
                current += char;
            }
        }

        result.push(current);
        return result;
    };

    // Export function
    const handleExport = () => {
        const allItems = boardData.groups.flatMap(group =>
            group.items.map(item => ({
                Group: group.title,
                'Inquiry Name': item.name,
                Source: item.source || '-',
                'Assigned Agent': item.person || '-',
                Urgency: item.urgency || '-',
                Status: item.status || '-',
                'Received Date': item.receivedDate || '-',
                'Unread': item.isUnread ? 'Yes' : 'No'
            }))
        );

        // Convert to CSV
        const headers = Object.keys(allItems[0]);
        const csv = [
            headers.join(','),
            ...allItems.map(row =>
                headers.map(header => `"${row[header]}"`).join(',')
            )
        ].join('\n');

        // Download
        const blob = new Blob([csv], { type: 'text/csv' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `dm-inquiries-${new Date().toISOString().split('T')[0]}.csv`;
        a.click();
        window.URL.revokeObjectURL(url);
    };

    const handleImport = (event) => {
        const file = event.target.files?.[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (e) => {
            const text = e.target.result;
            if (typeof text !== 'string') return;

            const lines = text.split(/\r?\n/).filter((l) => l.trim().length > 0);
            if (lines.length < 2) {
                alert('CSV file does not contain any data rows.');
                return;
            }

            const headers = parseCSVLine(lines[0]).map((h) =>
                h.replace(/^"|"$/g, '').trim()
            );

            const idx = {
                group: headers.findIndex((h) => h.toLowerCase() === 'group'),
                name: headers.findIndex(
                    (h) =>
                        h.toLowerCase() === 'inquiry name' ||
                        h.toLowerCase() === 'name'
                ),
                source: headers.findIndex((h) => h.toLowerCase() === 'source'),
                person: headers.findIndex(
                    (h) =>
                        h.toLowerCase() === 'assigned agent' ||
                        h.toLowerCase() === 'owner'
                ),
                urgency: headers.findIndex((h) => h.toLowerCase() === 'urgency'),
                status: headers.findIndex((h) => h.toLowerCase() === 'status'),
                receivedDate: headers.findIndex(
                    (h) =>
                        h.toLowerCase() === 'received date' ||
                        h.toLowerCase() === 'date'
                ),
                unread: headers.findIndex(
                    (h) => h.toLowerCase() === 'unread' || h.toLowerCase() === 'is unread'
                )
            };

            if (idx.group === -1 || idx.name === -1) {
                alert(
                    'CSV must include "Group" and "Inquiry Name" (or "Name") columns.'
                );
                return;
            }

            const groupsMap = new Map();

            for (let i = 1; i < lines.length; i++) {
                const line = lines[i];
                if (!line.trim()) continue;

                const cells = parseCSVLine(line).map((c) =>
                    c.replace(/^"|"$/g, '').trim()
                );

                const groupTitle = cells[idx.group] || 'Imported Group';
                const name = cells[idx.name] || 'Imported Inquiry';

                if (!groupsMap.has(groupTitle)) {
                    groupsMap.set(groupTitle, {
                        id: `g_import_${groupsMap.size + 1}`,
                        title: groupTitle,
                        color: '#0085ff',
                        items: []
                    });
                }

                const group = groupsMap.get(groupTitle);
                const unreadRaw =
                    idx.unread !== -1 ? cells[idx.unread] || '' : '';

                const item = {
                    id: `dm_import_${Date.now()}_${i}`,
                    name,
                    messagePreview: '',
                    source: idx.source !== -1 ? cells[idx.source] || '' : '',
                    person: idx.person !== -1 ? cells[idx.person] || '' : '',
                    urgency: idx.urgency !== -1 ? cells[idx.urgency] || '' : '',
                    status: idx.status !== -1 ? cells[idx.status] || '' : '',
                    receivedDate:
                        idx.receivedDate !== -1 ? cells[idx.receivedDate] || '' : '',
                    timeTracking: '00:00:00',
                    isUnread: (() => {
                        const lower = unreadRaw.toLowerCase();
                        return (
                            lower === 'yes' ||
                            lower === 'true' ||
                            lower === '1' ||
                            lower === 'y'
                        );
                    })()
                };

                group.items.push(item);
            }

            const importedGroups = Array.from(groupsMap.values());
            if (!importedGroups.length) {
                alert('No valid inquiries were found in the CSV.');
                return;
            }

            setBoardData((prev) => ({
                ...prev,
                groups: importedGroups
            }));

            alert('DM inquiries imported successfully.');
        };

        reader.readAsText(file);
        event.target.value = '';
    };

    // Get unique values for filters
    const getUniqueValues = (field) => {
        const values = new Set();
        boardData.groups.forEach(group => {
            group.items.forEach(item => {
                if (item[field]) values.add(item[field]);
            });
        });
        return Array.from(values);
    };

    // Count unread messages
    const unreadCount = boardData.groups.reduce((total, group) => {
        return total + group.items.filter(item => item.isUnread).length;
    }, 0);

    const filteredGroups = boardData.groups.map(group => ({
        ...group,
        items: applySorting(applyFilters(group.items.filter(item =>
            item.name.toLowerCase().includes(searchTerm.toLowerCase())
        )))
    })).filter(group => group.items.length > 0);

    const activeFilterCount = filters.source.length + filters.person.length +
        filters.urgency.length + filters.status.length +
        (filters.isUnread !== null ? 1 : 0);

    const styles = `
        .dm-inquiries-container {
            display: flex;
            flex-direction: column;
            height: 100%;
            background: #fff;
        }

        .inbox-header {
            padding: 24px 32px;
            border-bottom: 1px solid #e1e1e1;
            background: #fff;
            position: sticky;
            top: 0;
            z-index: 5;
        }

        .header-top {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 16px;
            flex-wrap: wrap;
            gap: 12px;
        }

        .board-title {
            font-size: 24px;
            font-weight: 700;
            color: #333;
            display: flex;
            align-items: center;
            gap: 12px;
        }

        .unread-badge {
            background: #e2445c;
            color: white;
            padding: 4px 12px;
            border-radius: 12px;
            font-size: 12px;
            font-weight: 600;
            display: flex;
            align-items: center;
            gap: 6px;
        }

        .header-actions {
            display: flex;
            gap: 12px;
            flex-wrap: wrap;
        }

        .btn {
            padding: 8px 16px;
            border-radius: 4px;
            font-size: 14px;
            font-weight: 500;
            cursor: pointer;
            display: flex;
            align-items: center;
            gap: 8px;
            border: none;
            transition: all 0.2s;
            position: relative;
        }

        .btn-primary {
            background: #0085ff;
            color: white;
        }

        .btn-primary:hover {
            background: #0073e6;
        }

        .btn-secondary {
            background: white;
            color: #676879;
            border: 1px solid #c3c6d4;
        }

        .btn-secondary:hover {
            background: #f5f6f8;
        }

        .filter-badge {
            position: absolute;
            top: -6px;
            right: -6px;
            background: #e2445c;
            color: white;
            border-radius: 10px;
            padding: 2px 6px;
            font-size: 10px;
            font-weight: 700;
        }

        .search-bar {
            display: flex;
            align-items: center;
            gap: 8px;
            padding: 8px 12px;
            border: 1px solid #c3c6d4;
            border-radius: 4px;
            background: white;
            max-width: 300px;
            width: 100%;
        }

        .search-bar input {
            border: none;
            outline: none;
            font-size: 14px;
            flex: 1;
            min-width: 0;
        }

        .inbox-content {
            flex: 1;
            overflow: auto;
            padding: 0;
        }

        .modal-overlay {
            position: fixed;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background: rgba(0, 0, 0, 0.5);
            display: flex;
            align-items: center;
            justify-content: center;
            z-index: 1000;
        }

        .modal {
            background: white;
            border-radius: 8px;
            width: 90%;
            max-width: 500px;
            max-height: 80vh;
            overflow: auto;
            box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
        }

        .modal-header {
            padding: 20px 24px;
            border-bottom: 1px solid #e1e1e1;
            display: flex;
            justify-content: space-between;
            align-items: center;
        }

        .modal-title {
            font-size: 18px;
            font-weight: 700;
            color: #333;
        }

        .modal-close {
            background: transparent;
            border: none;
            cursor: pointer;
            padding: 4px;
            color: #676879;
        }

        .modal-body {
            padding: 24px;
        }

        .filter-section {
            margin-bottom: 24px;
        }

        .filter-section:last-child {
            margin-bottom: 0;
        }

        .filter-section-title {
            font-size: 14px;
            font-weight: 600;
            color: #333;
            margin-bottom: 12px;
        }

        .filter-options {
            display: flex;
            flex-wrap: wrap;
            gap: 8px;
        }

        .filter-chip {
            padding: 6px 12px;
            border-radius: 16px;
            font-size: 13px;
            cursor: pointer;
            border: 1px solid #c3c6d4;
            background: white;
            color: #676879;
            transition: all 0.2s;
        }

        .filter-chip:hover {
            border-color: #0085ff;
        }

        .filter-chip.active {
            background: #0085ff;
            color: white;
            border-color: #0085ff;
        }

        .modal-footer {
            padding: 16px 24px;
            border-top: 1px solid #e1e1e1;
            display: flex;
            justify-content: flex-end;
            gap: 12px;
        }

        .sort-option {
            padding: 12px 16px;
            border-radius: 4px;
            cursor: pointer;
            display: flex;
            justify-content: space-between;
            align-items: center;
            transition: background 0.2s;
        }

        .sort-option:hover {
            background: #f5f6f8;
        }

        .sort-option.active {
            background: #e6f4ff;
            color: #0085ff;
        }

        @media (max-width: 768px) {
            .inbox-header {
                padding: 16px;
            }

            .header-top {
                flex-direction: column;
                align-items: flex-start;
            }

            .header-actions {
                width: 100%;
            }

            .btn {
                flex: 1;
                justify-content: center;
            }

            .search-bar {
                max-width: 100%;
            }

            .board-title {
                font-size: 20px;
            }

            .modal {
                width: 95%;
                max-height: 90vh;
            }
        }
    `;

    return (
        <div className="dm-inquiries-container">
            <style>{styles}</style>
            <input
                ref={fileInputRef}
                type="file"
                accept=".csv"
                style={{ display: 'none' }}
                onChange={handleImport}
            />

            <div className="inbox-header">
                <div className="header-top">
                    <div style={{ display: 'flex', alignItems: 'center', gap: '16px', flexWrap: 'wrap' }}>
                        <div className="board-title">
                            <MessageSquare size={24} color="#0085ff" />
                            {boardData.boardName}
                        </div>
                        {unreadCount > 0 && (
                            <div className="unread-badge">
                                <AlertCircle size={14} />
                                {unreadCount} Unread
                            </div>
                        )}
                    </div>
                    <div className="header-actions">
                        <button className="btn btn-secondary" onClick={() => setShowFilterModal(true)}>
                            <Filter size={16} />
                            Filter by Agent
                            {activeFilterCount > 0 && <span className="filter-badge">{activeFilterCount}</span>}
                        </button>
                        <button className="btn btn-secondary" onClick={() => setShowSortModal(true)}>
                            <ArrowUpDown size={16} />
                            Sort by Urgency
                        </button>
                        <button className="btn btn-primary" onClick={handleExport}>
                            <Download size={16} />
                            Export
                        </button>
                        <button
                            className="btn btn-secondary"
                            onClick={() =>
                                fileInputRef.current && fileInputRef.current.click()
                            }
                        >
                            <Upload size={16} />
                            Import
                        </button>
                    </div>
                </div>
                <div className="search-bar">
                    <Search size={18} color="#676879" />
                    <input
                        type="text"
                        placeholder="Search inquiries..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
            </div>

            <div className="inbox-content">
                {filteredGroups.map(group => (
                    <Table
                        key={group.id}
                        group={group}
                        columns={boardData.columns}
                        columnWidths={columnWidths}
                        onResize={onResize}
                        onItemClick={handleItemClick}
                        onAddItem={() => handleAddItem(group.id)}
                        onUpdateItem={(itemId, updates, isSub, parentId) =>
                            handleUpdateItem(group.id, itemId, updates, isSub, parentId)
                        }
                        onReorder={(draggedId, targetId) => handleReorder(group.id, draggedId, targetId)}
                        runningTimers={runningTimers}
                        onToggleTimer={handleToggleTimer}
                    />
                ))}
                {filteredGroups.length === 0 && (
                    <div style={{ padding: '60px', textAlign: 'center', color: '#676879' }}>
                        <Search size={48} style={{ opacity: 0.2, marginBottom: '16px' }} />
                        <h3>No inquiries match your filters</h3>
                        <p>Try adjusting your filters or search term</p>
                    </div>
                )}
            </div>

            {/* Filter Modal */}
            {showFilterModal && (
                <div className="modal-overlay" onClick={() => setShowFilterModal(false)}>
                    <div className="modal" onClick={(e) => e.stopPropagation()}>
                        <div className="modal-header">
                            <div className="modal-title">Filter Inquiries</div>
                            <button className="modal-close" onClick={() => setShowFilterModal(false)}>
                                <X size={20} />
                            </button>
                        </div>
                        <div className="modal-body">
                            <div className="filter-section">
                                <div className="filter-section-title">Source</div>
                                <div className="filter-options">
                                    {getUniqueValues('source').map(source => (
                                        <div
                                            key={source}
                                            className={`filter-chip ${filters.source.includes(source) ? 'active' : ''}`}
                                            onClick={() => toggleFilter('source', source)}
                                        >
                                            {source}
                                        </div>
                                    ))}
                                </div>
                            </div>
                            <div className="filter-section">
                                <div className="filter-section-title">Assigned Agent</div>
                                <div className="filter-options">
                                    {getUniqueValues('person').map(person => (
                                        <div
                                            key={person}
                                            className={`filter-chip ${filters.person.includes(person) ? 'active' : ''}`}
                                            onClick={() => toggleFilter('person', person)}
                                        >
                                            {person}
                                        </div>
                                    ))}
                                </div>
                            </div>
                            <div className="filter-section">
                                <div className="filter-section-title">Urgency</div>
                                <div className="filter-options">
                                    {getUniqueValues('urgency').map(urgency => (
                                        <div
                                            key={urgency}
                                            className={`filter-chip ${filters.urgency.includes(urgency) ? 'active' : ''}`}
                                            onClick={() => toggleFilter('urgency', urgency)}
                                        >
                                            {urgency}
                                        </div>
                                    ))}
                                </div>
                            </div>
                            <div className="filter-section">
                                <div className="filter-section-title">Status</div>
                                <div className="filter-options">
                                    {getUniqueValues('status').map(status => (
                                        <div
                                            key={status}
                                            className={`filter-chip ${filters.status.includes(status) ? 'active' : ''}`}
                                            onClick={() => toggleFilter('status', status)}
                                        >
                                            {status}
                                        </div>
                                    ))}
                                </div>
                            </div>
                            <div className="filter-section">
                                <div className="filter-section-title">Read Status</div>
                                <div className="filter-options">
                                    <div
                                        className={`filter-chip ${filters.isUnread === true ? 'active' : ''}`}
                                        onClick={() => toggleFilter('isUnread', true)}
                                    >
                                        Unread
                                    </div>
                                    <div
                                        className={`filter-chip ${filters.isUnread === false ? 'active' : ''}`}
                                        onClick={() => toggleFilter('isUnread', false)}
                                    >
                                        Read
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className="modal-footer">
                            <button className="btn btn-secondary" onClick={clearFilters}>
                                Clear All
                            </button>
                            <button className="btn btn-primary" onClick={() => setShowFilterModal(false)}>
                                Apply Filters
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Sort Modal */}
            {showSortModal && (
                <div className="modal-overlay" onClick={() => setShowSortModal(false)}>
                    <div className="modal" onClick={(e) => e.stopPropagation()}>
                        <div className="modal-header">
                            <div className="modal-title">Sort By</div>
                            <button className="modal-close" onClick={() => setShowSortModal(false)}>
                                <X size={20} />
                            </button>
                        </div>
                        <div className="modal-body">
                            {[
                                { field: 'urgency', label: 'Urgency' },
                                { field: 'receivedDate', label: 'Received Date' },
                                { field: 'name', label: 'Inquiry Name' },
                                { field: 'source', label: 'Source' },
                                { field: 'person', label: 'Assigned Agent' },
                                { field: 'status', label: 'Status' }
                            ].map(option => (
                                <div
                                    key={option.field}
                                    className={`sort-option ${sortConfig.field === option.field ? 'active' : ''}`}
                                    onClick={() => handleSort(option.field)}
                                >
                                    <span>{option.label}</span>
                                    {sortConfig.field === option.field && (
                                        <span>{sortConfig.direction === 'asc' ? '↑' : '↓'}</span>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            )}

            {selectedItem && (
                <ItemDetailPanel
                    item={selectedItem}
                    onClose={handleClosePanel}
                    columns={boardData.columns}
                    onUpdate={(updates) => {
                        const groupId = boardData.groups.find(g =>
                            g.items.some(i => i.id === selectedItem.id)
                        )?.id;
                        if (groupId) {
                            handleUpdateItem(groupId, selectedItem.id, updates);
                        }
                    }}
                />
            )}
        </div>
    );
};

export default DMInquiries;
