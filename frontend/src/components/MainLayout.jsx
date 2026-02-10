import React, { useState, useEffect } from 'react';
import Sidebar from './Sidebar';
import Topbar from './Topbar';
import RightPanel from './RightPanel';
import { boardService, notificationService } from '../services/api';
import { useAuth } from '../context/AuthContext';

const MainLayout = ({ children }) => {
    const { user } = useAuth();
    const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
    const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
    const [isRightPanelOpen, setIsRightPanelOpen] = useState(false);
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [rightPanelContent, setRightPanelContent] = useState(null);
    const [rightPanelTitle, setRightPanelTitle] = useState('');
    const [boardFolders, setBoardFolders] = useState([]);
    const [newBoardName, setNewBoardName] = useState('');
    const [unreadCount, setUnreadCount] = useState(0);
    const [newBoardFolder, setNewBoardFolder] = useState('Active Projects');
    const FOLDER_OPTIONS = ['Active Projects', 'AI & Innovation', 'Commercial'];

    useEffect(() => {
        fetchBoards();
        fetchNotifications();
    }, []);

    const fetchNotifications = async () => {
        try {
            const res = await notificationService.getNotifications();
            const unread = res.data.filter(n => !n.isRead).length;
            setUnreadCount(unread);
        } catch (err) {
            console.error('Failed to fetch notifications:', err);
        }
    };

    const fetchBoards = async () => {
        try {
            const res = await boardService.getAllBoards();
            const boards = res.data;

            // Group by folder
            const foldersMap = {};
            const folderOrder = ['Active Projects', 'AI & Innovation', 'Commercial', 'General'];

            // Initialize with empty arrays to ensure order
            folderOrder.forEach(f => {
                foldersMap[f] = { id: f, name: f, boards: [] };
            });

            boards.forEach(board => {
                const fName = board.folder || 'General';
                if (!foldersMap[fName]) {
                    foldersMap[fName] = { id: fName, name: fName, boards: [] };
                }
                foldersMap[fName].boards.push(board);
            });

            // Filter out empty folders if desired, or keep them. keeping them is fine.
            let sortedFolders = Object.values(foldersMap).filter(f => f.boards.length > 0 || folderOrder.includes(f.name));

            // Personalization: If not Admin, only show boards where user has items
            if (user?.role !== 'Admin') {
                sortedFolders = sortedFolders.map(folder => ({
                    ...folder,
                    boards: folder.boards.filter(board => {
                        const groups = board.Groups || board.groups || [];
                        return groups.some(g => (g.items || []).some(i => i.assignedToId === user.id));
                    })
                })).filter(folder => folder.boards.length > 0);
            }

            // Sort folders by predefined order
            sortedFolders.sort((a, b) => {
                const idxA = folderOrder.indexOf(a.name);
                const idxB = folderOrder.indexOf(b.name);
                return (idxA === -1 ? 999 : idxA) - (idxB === -1 ? 999 : idxB);
            });

            setBoardFolders(sortedFolders);
        } catch (err) {
            console.error('Failed to fetch boards:', err);
        }
    };

    const toggleSidebar = () => setIsSidebarCollapsed(!isSidebarCollapsed);
    const toggleMobileSidebar = () => setIsMobileSidebarOpen(!isMobileSidebarOpen);
    const toggleCreateModal = () => {
        setNewBoardName('');
        setNewBoardFolder('Active Projects');
        setIsCreateModalOpen(!isCreateModalOpen);
    };

    const handleCreateBoard = async () => {
        if (!newBoardName.trim()) return;

        try {
            await boardService.createBoard({ name: newBoardName, folder: newBoardFolder });
            await fetchBoards();
            toggleCreateModal();
        } catch (err) {
            alert('Error creating board');
        }
    };

    const openRightPanel = (content, title = 'Details') => {
        setRightPanelContent(content);
        setRightPanelTitle(title);
        setIsRightPanelOpen(true);
    };

    const closeRightPanel = () => setIsRightPanelOpen(false);

    const layoutStyles = `
        .app-layout {
            display: flex;
            height: 100vh;
            width: 100vw;
            overflow: hidden;
            background-color: var(--bg-page);
            font-family: var(--font-main);
            color: var(--text-main);
        }

        .layout-main {
            flex: 1;
            display: flex;
            flex-direction: column;
            overflow: hidden;
            position: relative;
        }

        .layout-content {
            flex: 1;
            overflow-y: auto;
            background-color: var(--bg-page);
            position: relative;
        }

        .modal-overlay {
            position: fixed;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background: rgba(0,0,0,0.7);
            display: flex;
            align-items: center;
            justify-content: center;
            z-index: 2000;
            backdrop-filter: blur(2px);
        }

        .modal-content {
            background: var(--bg-card);
            padding: 24px;
            border-radius: 8px;
            width: 90%;
            max-width: 400px;
            box-shadow: 0 10px 25px rgba(0,0,0,0.5);
            border: 1px solid var(--border-color);
            color: var(--text-main);
        }

        .modal-header {
            margin-bottom: 20px;
            display: flex;
            justify-content: space-between;
            align-items: center;
        }

        .modal-body input {
            width: 100%;
            padding: 10px;
            border: 1px solid var(--border-color);
            border-radius: 4px;
            margin-bottom: 20px;
            background: var(--bg-page);
            color: var(--text-main);
            outline: none;
        }
        .modal-body input:focus {
            border-color: var(--primary-color);
        }

        .modal-footer {
            display: flex;
            justify-content: flex-end;
            gap: 12px;
        }

        .btn-cancel {
            padding: 8px 16px;
            background: var(--bg-hover);
            border: 1px solid var(--border-color);
            border-radius: 4px;
            cursor: pointer;
            color: var(--text-main);
        }

        .btn-create {
            padding: 8px 16px;
            background: var(--primary-color);
            color: #fff;
            border: none;
            border-radius: 4px;
            cursor: pointer;
        }

        .mobile-sidebar-backdrop {
            display: none;
            position: fixed;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background: rgba(0, 0, 0, 0.5);
            z-index: 199;
        }

        @media (max-width: 768px) {
            .mobile-sidebar-backdrop {
                display: ${isMobileSidebarOpen ? 'block' : 'none'};
            }
        }
    `;

    return (
        <div className="app-layout">
            <style>{layoutStyles}</style>

            <div
                className="mobile-sidebar-backdrop"
                onClick={() => setIsMobileSidebarOpen(false)}
            />

            <Sidebar
                isCollapsed={isSidebarCollapsed}
                isMobileOpen={isMobileSidebarOpen}
                onToggle={toggleSidebar}
                onMobileToggle={toggleMobileSidebar}
                onCreateBoard={toggleCreateModal}
                boardFolders={boardFolders}
                unreadCount={unreadCount}
                user={user}
            />

            <div className="layout-main">
                <Topbar
                    onMobileMenuClick={toggleMobileSidebar}
                    unreadCount={unreadCount}
                    onRefreshNotifications={fetchNotifications}
                />
                <main className="layout-content">
                    {children}
                </main>
            </div>

            <RightPanel
                isOpen={isRightPanelOpen}
                onClose={closeRightPanel}
                title={rightPanelTitle}
            >
                {rightPanelContent}
            </RightPanel>

            {isCreateModalOpen && (
                <div className="modal-overlay" onClick={toggleCreateModal}>
                    <div className="modal-content" onClick={e => e.stopPropagation()}>
                        <div className="modal-header">
                            <h3>Create New Board</h3>
                        </div>
                        <div className="modal-body">
                            <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: 600 }}>Board Name</label>
                            <input
                                type="text"
                                placeholder="Enter board name..."
                                value={newBoardName}
                                onChange={(e) => setNewBoardName(e.target.value)}
                                onKeyDown={(e) => e.key === 'Enter' && handleCreateBoard()}
                                autoFocus
                            />

                            <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: 600 }}>Folder</label>
                            <select
                                value={newBoardFolder}
                                onChange={(e) => setNewBoardFolder(e.target.value)}
                                style={{ width: '100%', padding: '10px', borderRadius: '4px', border: '1px solid var(--border-color)', background: 'var(--bg-page)', color: 'var(--text-main)', outline: 'none', marginBottom: '8px' }}
                            >
                                <option value="Active Projects">Active Projects</option>
                                <option value="AI & Innovation">AI & Innovation</option>
                                <option value="Commercial">Commercial</option>
                                <option value="General">General</option>
                            </select>
                        </div>
                        <div className="modal-footer">
                            <button className="btn-cancel" onClick={toggleCreateModal}>Cancel</button>
                            <button className="btn-create" onClick={handleCreateBoard}>Create Board</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default MainLayout;
