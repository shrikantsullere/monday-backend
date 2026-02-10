import React, { useState, useEffect, useMemo, useRef } from 'react';
import {
    PieChart as PieChartIcon,
    Calendar as CalendarIcon,
    Users as UsersIcon,
    Download,
    Upload,
    TrendingUp,
    CheckCircle2,
    Clock,
    AlertCircle,
    ChevronRight,
    Search,
    Layout,
    Loader2
} from 'lucide-react';
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip as RechartsTooltip,
    ResponsiveContainer,
    PieChart,
    Pie,
    Cell,
    Legend as RechartsLegend
} from 'recharts';
import { boardService } from '../services/api';

import { useAuth } from '../context/AuthContext';
const Dashboard = ({ boardData: singleBoardData }) => {
    const { user: currentUser } = useAuth();
    const isAdmin = currentUser?.role === 'Admin';
    const [isLoading, setIsLoading] = useState(!singleBoardData);
    const [allBoards, setAllBoards] = useState(singleBoardData ? [singleBoardData] : []);
    const [filter, setFilter] = useState('all');
    const [importedSnapshot, setImportedSnapshot] = useState(null);
    const fileInputRef = useRef(null);

    useEffect(() => {
        if (!singleBoardData) {
            fetchAllBoards();
        } else {
            setAllBoards([singleBoardData]);
            setIsLoading(false);
        }
    }, [singleBoardData]);

    const fetchAllBoards = async () => {
        setIsLoading(true);
        try {
            const res = await boardService.getAllBoards();
            setAllBoards(res.data);
        } catch (err) {
            console.error('Failed to fetch boards:', err);
        } finally {
            setIsLoading(false);
        }
    };

    const stats = useMemo(() => {
        let totalTasks = 0;
        let completedTasks = 0;
        let activeTasks = 0;
        const userWorkload = {};
        const statusCounts = {};

        allBoards.forEach(board => {
            const groups = board.Groups || board.groups || [];
            groups.forEach(group => {
                const items = group.items || group.Items || [];
                items.forEach(item => {
                    // Strict task isolation: Filter for Users, allow Admins to see all
                    if (currentUser?.role !== 'Admin' && item.assignedToId !== currentUser?.id) {
                        return;
                    }

                    totalTasks++;
                    const status = (item.status || '').toLowerCase();
                    if (status.includes('done') || status.includes('won') || status.includes('closed') || status === 'production') {
                        completedTasks++;
                        statusCounts['Done'] = (statusCounts['Done'] || 0) + 1;
                    } else if (status.includes('stuck') || status.includes('lost')) {
                        activeTasks++;
                        statusCounts['Stuck'] = (statusCounts['Stuck'] || 0) + 1;
                    } else {
                        activeTasks++;
                        statusCounts['Working'] = (statusCounts['Working'] || 0) + 1;
                    }

                    const person = item.assignedUser?.name || item.person || 'Unassigned';
                    userWorkload[person] = (userWorkload[person] || 0) + 1;
                });
            });
        });

        // For everyone, totalBoards is just boards where they have tasks (Admins see all)
        const relevantBoardsCount = (currentUser?.role === 'Admin') ? allBoards.length : allBoards.filter(b => {
            const gs = b.Groups || b.groups || [];
            return gs.some(g => (g.items || g.Items || []).some(i => i.assignedToId === currentUser?.id));
        }).length;

        return {
            totalBoards: relevantBoardsCount,
            totalTasks,
            completedTasks,
            activeTasks,
            userWorkload: Object.entries(userWorkload).map(([name, count]) => ({ name, count })),
            statusData: Object.entries(statusCounts).map(([name, value]) => ({ name, value }))
        };
    }, [allBoards, currentUser]);

    const progressData = useMemo(() => {
        return allBoards.map(board => {
            let done = 0;
            let total = 0;
            const groups = board.Groups || board.groups || [];
            groups.forEach(group => {
                const items = group.items || group.Items || [];
                items.forEach(item => {
                    // Strict isolation: Filter for users, allow Admins to see all
                    if (currentUser?.role !== 'Admin' && item.assignedToId !== currentUser?.id) {
                        return;
                    }

                    total++;
                    const status = (item.status || '').toLowerCase();
                    if (status.includes('done') || status.includes('won') || status.includes('closed') || status === 'production') {
                        done++;
                    }
                });
            });
            if (currentUser?.role !== 'Admin' && total === 0) return null; // Hide boards with no tasks for regular user
            return {
                name: (board.name || board.boardName || '').split(' ')[0],
                progress: total > 0 ? Math.round((done / total) * 100) : 0
            };
        }).filter(Boolean);
    }, [allBoards, currentUser]);

    const displayStats = importedSnapshot || stats;
    const displayProgressData = importedSnapshot?.progressData ?? progressData;
    const COLORS = ['#00c875', '#fdab3d', '#e2445c', '#579bfc'];

    const dashboardStyles = `
        .dashboard-container { padding: 24px; background: var(--bg-page); min-height: 100%; color: var(--text-main); }
        .dashboard-header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 24px; flex-direction: column; gap: 8px; }
        .dashboard-header h1 { font-size: 24px; margin: 0; color: var(--text-main); font-weight: 700; width: 100%; }
        .stats-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 16px; margin-bottom: 24px; }
        .stat-card { background: var(--bg-card); padding: 16px; border-radius: 8px; border: 1px solid var(--border-color); display: flex; align-items: center; gap: 16px; }
        .stat-info h4 { margin: 0; font-size: 13px; color: var(--text-secondary); }
        .stat-info .stat-value { font-size: 20px; font-weight: 700; color: var(--text-main); }
        .charts-row { display: grid; grid-template-columns: 2fr 1fr; gap: 20px; margin-bottom: 40px; }
        .chart-card { background: var(--bg-card); padding: 20px; border-radius: 8px; border: 1px solid var(--border-color); height: 350px; min-width: 0; }
        
        @media (max-width: 1024px) {
            .charts-row { grid-template-columns: 1fr; }
            .chart-card { height: 300px; }
        }
        @media (max-width: 600px) {
            .dashboard-container { padding: 16px; }
            .stats-grid { grid-template-columns: 1fr; }
            .dashboard-header h1 { font-size: 20px; }
        }
    `;

    if (isLoading) {
        return (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%' }}>
                <Loader2 size={40} className="spin" color="var(--primary-color)" />
            </div>
        );
    }

    return (
        <div className="dashboard-container">
            <style>{dashboardStyles}</style>

            <header className="dashboard-header">
                <h1>{singleBoardData ? `${singleBoardData.name} Insights` : (isAdmin ? 'Master Insights Dashboard' : `Welcome, ${currentUser?.name?.split(' ')[0] || 'User'}`)}</h1>
                {!singleBoardData && (
                    <p style={{ color: 'var(--text-secondary)', marginTop: '4px' }}>
                        {isAdmin ? 'Overview of all work across the workspace' : 'Here is a breakdown of your personal performance and assigned tasks.'}
                    </p>
                )}
            </header>

            <div className="stats-grid">
                <div className="stat-card">
                    <div className="stat-info"><h4>{singleBoardData ? 'Items' : (isAdmin ? 'Total Boards' : 'Assigned Boards')}</h4><div className="stat-value">{singleBoardData ? stats.totalTasks : stats.totalBoards}</div></div>
                </div>
                <div className="stat-card">
                    <div className="stat-info"><h4>{isAdmin ? 'Active Tasks' : 'My Active Tasks'}</h4><div className="stat-value">{displayStats.activeTasks}</div></div>
                </div>
                <div className="stat-card">
                    <div className="stat-info"><h4>{isAdmin ? 'Completed' : 'My Completed'}</h4><div className="stat-value">{displayStats.completedTasks}</div></div>
                </div>
            </div>

            <div className="charts-row">
                <div className="chart-card">
                    <h3>{singleBoardData ? 'Group Progress' : 'Project Progress (%)'}</h3>
                    <ResponsiveContainer width="100%" height="90%">
                        <BarChart data={displayProgressData}>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} />
                            <XAxis dataKey="name" />
                            <YAxis />
                            <RechartsTooltip />
                            <Bar dataKey="progress" fill="var(--primary-color)" radius={[4, 4, 0, 0]} barSize={40} />
                        </BarChart>
                    </ResponsiveContainer>
                </div>

                <div className="chart-card">
                    <h3>Status Distribution</h3>
                    <ResponsiveContainer width="100%" height="90%">
                        <PieChart>
                            <Pie data={displayStats.statusData} cx="50%" cy="50%" innerRadius={60} outerRadius={80} paddingAngle={5} dataKey="value">
                                {displayStats.statusData.map((entry, index) => <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />)}
                            </Pie>
                            <RechartsTooltip />
                        </PieChart>
                    </ResponsiveContainer>
                </div>
            </div>
        </div>
    );
};

export default Dashboard;
