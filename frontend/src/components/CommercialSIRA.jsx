import React from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import {
    DollarSign,
    Plus,
    Search,
    Filter,
    ArrowUpDown,
    Download,
    Upload,
    TrendingUp,
    X
} from 'lucide-react';
import Table from './Table';
import ItemDetailPanel from './ItemDetailPanel';
import { commercialSIRAData } from '../data/demoData';

const CommercialSIRA = () => {
    const navigate = useNavigate();
    const [searchParams, setSearchParams] = useSearchParams();
    const [boardData, setBoardData] = React.useState(commercialSIRAData);
    const [selectedItem, setSelectedItem] = React.useState(null);
    const [searchTerm, setSearchTerm] = React.useState('');
    const [runningTimers, setRunningTimers] = React.useState({});
    const [columnWidths, setColumnWidths] = React.useState({});
    const fileInputRef = React.useRef(null);

    // Filter state
    const [showFilterModal, setShowFilterModal] = React.useState(false);
    const [filters, setFilters] = React.useState({
        status: [],
        person: [],
        invoiceSent: null
    });

    // Sort state
    const [showSortModal, setShowSortModal] = React.useState(false);
    const [sortConfig, setSortConfig] = React.useState({ field: 'dealValue', direction: 'desc' });

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
            id: `crm_${Date.now()}`,
            name: 'New Deal',
            person: '',
            dealValue: 0,
            status: 'Lead',
            progress: 0,
            invoiceSent: false,
            closeDate: '',
            timeTracking: '00:00:00'
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
        if (category === 'invoiceSent') {
            setFilters(prev => ({
                ...prev,
                invoiceSent: prev.invoiceSent === value ? null : value
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
            status: [],
            person: [],
            invoiceSent: null
        });
    };

    const applyFilters = (items) => {
        return items.filter(item => {
            if (filters.status.length && !filters.status.includes(item.status)) return false;
            if (filters.person.length && !filters.person.includes(item.person)) return false;
            if (filters.invoiceSent !== null && item.invoiceSent !== filters.invoiceSent) return false;
            return true;
        });
    };

    // Sort functions
    const applySorting = (items) => {
        if (!sortConfig.field) return items;

        return [...items].sort((a, b) => {
            let aVal = a[sortConfig.field];
            let bVal = b[sortConfig.field];

            // Handle numbers (dealValue, progress)
            if (sortConfig.field === 'dealValue' || sortConfig.field === 'progress') {
                aVal = parseFloat(aVal) || 0;
                bVal = parseFloat(bVal) || 0;
            }

            // Handle dates
            if (sortConfig.field === 'closeDate') {
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
                'Deal Name': item.name,
                'Account Manager': item.person || '-',
                'Deal Value': `$${item.dealValue?.toLocaleString() || 0}`,
                'Deal Status': item.status || '-',
                'Payment %': `${item.progress || 0}%`,
                'Invoice Sent': item.invoiceSent ? 'Yes' : 'No',
                'Expected Close Date': item.closeDate || '-'
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
        a.download = `commercial-sira-${new Date().toISOString().split('T')[0]}.csv`;
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
                        h.toLowerCase() === 'deal name' ||
                        h.toLowerCase() === 'name'
                ),
                person: headers.findIndex(
                    (h) =>
                        h.toLowerCase() === 'account manager' ||
                        h.toLowerCase() === 'owner'
                ),
                dealValue: headers.findIndex((h) => h.toLowerCase() === 'deal value'),
                status: headers.findIndex(
                    (h) =>
                        h.toLowerCase() === 'deal status' ||
                        h.toLowerCase() === 'status'
                ),
                progress: headers.findIndex((h) =>
                    h.toLowerCase().startsWith('payment')
                ),
                invoiceSent: headers.findIndex(
                    (h) =>
                        h.toLowerCase() === 'invoice sent' ||
                        h.toLowerCase() === 'invoice'
                ),
                closeDate: headers.findIndex(
                    (h) =>
                        h.toLowerCase() === 'expected close date' ||
                        h.toLowerCase() === 'close date'
                )
            };

            if (idx.group === -1 || idx.name === -1) {
                alert(
                    'CSV must include "Group" and "Deal Name" (or "Name") columns.'
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
                const name = cells[idx.name] || 'Imported Deal';

                if (!groupsMap.has(groupTitle)) {
                    groupsMap.set(groupTitle, {
                        id: `g_import_${groupsMap.size + 1}`,
                        title: groupTitle,
                        color: '#0085ff',
                        items: []
                    });
                }

                const group = groupsMap.get(groupTitle);
                const dealValueRaw =
                    idx.dealValue !== -1 ? cells[idx.dealValue] || '' : '';
                const progressRaw =
                    idx.progress !== -1 ? cells[idx.progress] || '' : '';
                const invoiceRaw =
                    idx.invoiceSent !== -1 ? cells[idx.invoiceSent] || '' : '';

                const item = {
                    id: `crm_import_${Date.now()}_${i}`,
                    name,
                    person: idx.person !== -1 ? cells[idx.person] || '' : '',
                    dealValue: parseFloat(
                        dealValueRaw.replace(/[^0-9.-]/g, '')
                    ) || 0,
                    status: idx.status !== -1 ? cells[idx.status] || '' : '',
                    progress:
                        parseFloat(progressRaw.replace(/[^0-9.-]/g, '')) || 0,
                    invoiceSent: (() => {
                        const lower = invoiceRaw.toLowerCase();
                        return (
                            lower === 'yes' ||
                            lower === 'true' ||
                            lower === '1' ||
                            lower === 'y'
                        );
                    })(),
                    closeDate: idx.closeDate !== -1 ? cells[idx.closeDate] || '' : '',
                    timeTracking: '00:00:00'
                };

                group.items.push(item);
            }

            const importedGroups = Array.from(groupsMap.values());
            if (!importedGroups.length) {
                alert('No valid deals were found in the CSV.');
                return;
            }

            setBoardData((prev) => ({
                ...prev,
                groups: importedGroups
            }));

            alert('Commercial SIRA deals imported successfully.');
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

    // Calculate total revenue
    const totalRevenue = boardData.groups.reduce((total, group) => {
        return total + group.items.reduce((sum, item) => sum + (item.dealValue || 0), 0);
    }, 0);

    const filteredGroups = boardData.groups.map(group => ({
        ...group,
        items: applySorting(applyFilters(group.items.filter(item =>
            item.name.toLowerCase().includes(searchTerm.toLowerCase())
        )))
    })).filter(group => group.items.length > 0);

    const activeFilterCount = filters.status.length + filters.person.length + (filters.invoiceSent !== null ? 1 : 0);

    const styles = `
        .commercial-sira-container {
            display: flex;
            flex-direction: column;
            height: 100%;
            background: #fff;
        }

        .crm-header {
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

        .revenue-badge {
            background: linear-gradient(135deg, #00c875 0%, #00a65a 100%);
            color: white;
            padding: 8px 16px;
            border-radius: 20px;
            font-size: 14px;
            font-weight: 600;
            display: flex;
            align-items: center;
            gap: 8px;
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

        .crm-content {
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
            .crm-header {
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

            .revenue-badge {
                font-size: 12px;
                padding: 6px 12px;
            }

            .modal {
                width: 95%;
                max-height: 90vh;
            }
        }
    `;

    return (
        <div className="commercial-sira-container">
            <style>{styles}</style>
            <input
                ref={fileInputRef}
                type="file"
                accept=".csv"
                style={{ display: 'none' }}
                onChange={handleImport}
            />

            <div className="crm-header">
                <div className="header-top">
                    <div style={{ display: 'flex', alignItems: 'center', gap: '16px', flexWrap: 'wrap' }}>
                        <div className="board-title">
                            <DollarSign size={24} color="#00c875" />
                            {boardData.boardName}
                        </div>
                        <div className="revenue-badge">
                            <TrendingUp size={16} />
                            Total Revenue: ${totalRevenue.toLocaleString()}
                        </div>
                    </div>
                    <div className="header-actions">
                        <button className="btn btn-secondary" onClick={() => setShowFilterModal(true)}>
                            <Filter size={16} />
                            Filter
                            {activeFilterCount > 0 && <span className="filter-badge">{activeFilterCount}</span>}
                        </button>
                        <button className="btn btn-secondary" onClick={() => setShowSortModal(true)}>
                            <ArrowUpDown size={16} />
                            Sort by Value
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
                        placeholder="Search deals..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
            </div>

            <div className="crm-content">
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
                        <h3>No deals match your filters</h3>
                        <p>Try adjusting your filters or search term</p>
                    </div>
                )}
            </div>

            {/* Filter Modal */}
            {showFilterModal && (
                <div className="modal-overlay" onClick={() => setShowFilterModal(false)}>
                    <div className="modal" onClick={(e) => e.stopPropagation()}>
                        <div className="modal-header">
                            <div className="modal-title">Filter Deals</div>
                            <button className="modal-close" onClick={() => setShowFilterModal(false)}>
                                <X size={20} />
                            </button>
                        </div>
                        <div className="modal-body">
                            <div className="filter-section">
                                <div className="filter-section-title">Deal Status</div>
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
                                <div className="filter-section-title">Account Manager</div>
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
                                <div className="filter-section-title">Invoice Status</div>
                                <div className="filter-options">
                                    <div
                                        className={`filter-chip ${filters.invoiceSent === true ? 'active' : ''}`}
                                        onClick={() => toggleFilter('invoiceSent', true)}
                                    >
                                        Sent
                                    </div>
                                    <div
                                        className={`filter-chip ${filters.invoiceSent === false ? 'active' : ''}`}
                                        onClick={() => toggleFilter('invoiceSent', false)}
                                    >
                                        Not Sent
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
                                { field: 'dealValue', label: 'Deal Value' },
                                { field: 'name', label: 'Deal Name' },
                                { field: 'person', label: 'Account Manager' },
                                { field: 'status', label: 'Deal Status' },
                                { field: 'progress', label: 'Payment %' },
                                { field: 'closeDate', label: 'Close Date' }
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

export default CommercialSIRA;
