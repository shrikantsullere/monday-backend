import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { LayoutDashboard, Plus, Search, AlertTriangle, CheckCircle, Clock, Download, Upload, Loader2 } from 'lucide-react';
import { boardService } from '../services/api';
import { useAuth } from '../context/AuthContext';

const PortfolioPipeline = () => {
    const navigate = useNavigate();
    const { user: currentUser } = useAuth();
    const [searchTerm, setSearchTerm] = useState('');
    const [boards, setBoards] = useState([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        fetchBoards();
    }, []);

    const fetchBoards = async () => {
        try {
            const res = await boardService.getAllBoards();
            setBoards(res.data);
        } catch (err) {
            console.error('Failed to fetch boards:', err);
        } finally {
            setIsLoading(false);
        }
    };

    const getBoardStats = (board) => {
        let totalItems = 0;
        let activeItems = 0;
        let completedItems = 0;
        let overdueItems = 0;

        const groups = board.Groups || [];
        groups.forEach(group => {
            const items = group.items || [];
            items.forEach(item => {
                // Strict task isolation
                if (item.assignedToId !== currentUser?.id) return;

                totalItems++;
                const status = (item.status || '').toLowerCase();
                if (status.includes('done') || status.includes('won') || status.includes('closed') || status === 'production') {
                    completedItems++;
                } else {
                    activeItems++;
                }
            });
        });

        const progress = totalItems > 0 ? Math.round((completedItems / totalItems) * 100) : 0;
        return { totalItems, activeItems, completedItems, overdueItems, progress };
    };

    const filteredBoards = boards.filter(board => {
        const matchesSearch = board.name.toLowerCase().includes(searchTerm.toLowerCase());
        const stats = getBoardStats(board);
        // Only show board if it has tasks for the user
        return matchesSearch && stats.totalItems > 0;
    });

    const pipelineStyles = `
        .pipeline-container { padding: 32px; height: 100%; overflow-y: auto; background: var(--bg-page); color: var(--text-main); }
        .pipeline-header { margin-bottom: 32px; }
        .pipeline-header h1 { font-size: 28px; margin: 0 0 8px 0; font-weight: 700; }
        .pipeline-controls { display: flex; gap: 16px; margin-bottom: 32px; }
        .search-box { flex: 1; position: relative; }
        .search-box input { width: 100%; padding: 12px 16px 12px 40px; border: 1px solid var(--border-color); border-radius: 8px; background: var(--bg-card); color: var(--text-main); }
        .search-box svg { position: absolute; left: 14px; top: 50%; transform: translateY(-50%); color: var(--text-secondary); }
        .boards-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(350px, 1fr)); gap: 24px; }
        .board-card { background: var(--bg-card); border-radius: 12px; padding: 24px; border: 1px solid var(--border-color); cursor: pointer; transition: all 0.2s; }
        .board-card:hover { transform: translateY(-4px); box-shadow: 0 8px 24px rgba(0,0,0,0.12); border-color: var(--primary-color); }
        .board-card-header { display: flex; align-items: center; gap: 12px; margin-bottom: 20px; }
        .board-icon { width: 40px; height: 40px; background: var(--primary-color); border-radius: 8px; display: flex; align-items: center; justify-content: center; color: white; }
        .board-stats { display: grid; grid-template-columns: repeat(3, 1fr); gap: 16px; margin-bottom: 20px; text-align: center; }
        .stat-value { font-size: 20px; font-weight: 700; }
        .stat-label { font-size: 11px; color: var(--text-secondary); text-transform: uppercase; margin-top: 4px; }
        .progress-bar { height: 8px; background: var(--bg-hover); border-radius: 4px; overflow: hidden; margin-top: 8px; }
        .progress-fill { height: 100%; background: var(--primary-color); border-radius: 4px; transition: width 0.3s ease; }
    `;

    if (isLoading) {
        return (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh' }}>
                <Loader2 size={40} className="spin" color="var(--primary-color)" />
            </div>
        );
    }

    return (
        <div className="pipeline-container">
            <style>{pipelineStyles}</style>

            <div className="pipeline-header">
                <h1>Portfolio Pipeline</h1>
                <p>Overview of all projects across your workspace</p>
            </div>

            <div className="pipeline-controls">
                <div className="search-box">
                    <Search size={18} />
                    <input
                        type="text"
                        placeholder="Search boards..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
            </div>

            <div className="boards-grid">
                {filteredBoards.map(board => {
                    const stats = getBoardStats(board);
                    return (
                        <div key={board.id} className="board-card" onClick={() => navigate(`/board/${board.id}`)}>
                            <div className="board-card-header">
                                <div className="board-icon"><LayoutDashboard size={20} /></div>
                                <h3 style={{ margin: 0 }}>{board.name === 'Project Pipeline' ? 'SIRA Projects' : board.name}</h3>
                            </div>

                            <div className="board-stats">
                                <div className="stat-item">
                                    <div className="stat-value">{stats.totalItems}</div>
                                    <div className="stat-label">Total</div>
                                </div>
                                <div className="stat-item">
                                    <div className="stat-value" style={{ color: 'var(--primary-color)' }}>{stats.activeItems}</div>
                                    <div className="stat-label">Active</div>
                                </div>
                                <div className="stat-item">
                                    <div className="stat-value" style={{ color: 'var(--success-color)' }}>{stats.completedItems}</div>
                                    <div className="stat-label">Done</div>
                                </div>
                            </div>

                            <div className="progress-section">
                                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', marginBottom: '4px' }}>
                                    <span>Progress</span>
                                    <span>{stats.progress}%</span>
                                </div>
                                <div className="progress-bar">
                                    <div className="progress-fill" style={{ width: `${stats.progress}%` }}></div>
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

export default PortfolioPipeline;
