import React, { useState, useEffect, useMemo } from 'react';
import { useLocation, useSearchParams, useParams } from 'react-router-dom';
import {
    Plus, Search, Table as TableIcon, LayoutDashboard, Loader2
} from 'lucide-react';
import Table from './Table';
import Dashboard from './Dashboard';
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
    const [personFilter, setPersonFilter] = useState([]);

    useEffect(() => {
        fetchInitialData();
    }, [path, boardId]);

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

                if (!currentBoard) currentBoard = boards[0];
            }

            setBoardData(currentBoard);
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
                const next = { ...prev };
                const group = next.Groups.find(g => g.id === groupId);
                if (group) {
                    const item = group.items.find(i => i.id === itemId);
                    if (item) Object.assign(item, updates);
                }
                return next;
            });
        } catch (err) {
            console.error('Update failed:', err);
        }
    };

    const handleAddItem = async (groupId) => {
        try {
            const newItemData = {
                name: 'New Item',
                status: 'Working on it',
                GroupId: groupId
            };
            const res = await itemService.createItem(newItemData);
            setBoardData(prev => {
                const next = { ...prev };
                const group = next.Groups.find(g => g.id === groupId);
                if (group) {
                    if (!group.items) group.items = [];
                    group.items.push(res.data);
                }
                return next;
            });
        } catch (err) {
            console.error('Creation failed:', err);
        }
    };

    const filterItem = (item) => {
        const query = searchTerm.toLowerCase();
        const matchesSearch = !searchTerm || item.name.toLowerCase().includes(query);
        // Map assignedToId to name for person filtering if needed, or filter by ID
        return matchesSearch;
    };

    const filteredGroups = useMemo(() => {
        if (!boardData?.Groups) return [];
        return boardData.Groups.map(group => ({
            ...group,
            items: (group.items || []).filter(filterItem)
        }));
    }, [boardData, searchTerm]);

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

    return (
        <div className="board">
            <style>{`
                .board { display: flex; flex-direction: column; height: 100%; background: var(--bg-card); color: var(--text-main); }
                .board-header { padding: 24px 24px 0 24px; border-bottom: 1px solid var(--border-color); }
                .board-title-row { display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px; }
                .board-title h1 { font-size: 26px; font-weight: 700; margin: 0; }
                .board-tabs { display: flex; gap: 4px; }
                .tab-btn { background: transparent; border: none; padding: 10px 16px; font-size: 14px; color: var(--text-secondary); cursor: pointer; border-bottom: 3px solid transparent; }
                .tab-btn.active { color: var(--primary-color); border-bottom-color: var(--primary-color); }
                .board-action-bar { display: flex; justify-content: space-between; align-items: center; padding: 12px 0; border-top: 1px solid var(--border-color); }
                .new-item-btn { background: var(--primary-color); color: #fff; border: none; padding: 7px 16px; border-radius: 4px; font-weight: 600; cursor: pointer; }
                .search-field { display: flex; align-items: center; gap: 8px; border: 1px solid var(--border-color); border-radius: 4px; padding: 6px 12px; }
                .search-field input { border: none; outline: none; background: transparent; color: inherit; width: 200px; }
                .spin { animation: spin 1s linear infinite; }
                @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
            `}</style>

            <div className="board-header">
                <div className="board-title-row">
                    <div className="board-title">
                        <h1>{boardData.name}</h1>
                    </div>
                </div>

                <div className="board-tabs">
                    <button className={`tab-btn ${activeTab === 'table' ? 'active' : ''}`} onClick={() => setActiveTab('table')}>
                        <TableIcon size={16} /> Main Table
                    </button>
                    <button className={`tab-btn ${activeTab === 'dashboard' ? 'active' : ''}`} onClick={() => setActiveTab('dashboard')}>
                        <LayoutDashboard size={16} /> Dashboard
                    </button>
                </div>

                <div className="board-action-bar">
                    <div className="action-left">
                        <button className="new-item-btn" onClick={() => handleAddItem(boardData.Groups[0]?.id)}>
                            <Plus size={16} /> New Item
                        </button>
                        <div className="search-field">
                            <Search size={16} />
                            <input placeholder="Search items..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
                        </div>
                    </div>
                </div>
            </div>

            <div className="board-content" style={{ flex: 1, overflow: 'auto', padding: '24px' }}>
                {activeTab === 'table' ? (
                    filteredGroups.map(group => (
                        <Table
                            key={group.id}
                            group={group}
                            onUpdateItem={handleUpdateItem}
                            onAddItem={handleAddItem}
                            allUsers={allUsers}
                            columns={[
                                { id: 'name', title: 'Item', type: 'text' },
                                { id: 'person', title: 'Person', type: 'person' },
                                { id: 'status', title: 'Status', type: 'status' }
                            ]}
                            columnWidths={{ name: 320, person: 140, status: 140 }}
                            onResize={() => { }}
                        />
                    ))
                ) : (
                    <Dashboard boardData={boardData} />
                )}
            </div>
        </div>
    );
};

export default Board;
