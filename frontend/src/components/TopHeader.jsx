import React from 'react';
import { Search, Bell, Settings, ChevronDown, Rocket, Crown, HelpCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { initialData } from '../data/demoData';

const TopHeader = ({ onWorkspaceChange }) => {
    const navigate = useNavigate();
    const [selectedWorkspace, setSelectedWorkspace] = React.useState(initialData.workspaces[0]);
    const [isDropdownOpen, setIsDropdownOpen] = React.useState(false);

    const topHeaderStyles = `
        .top-header {
            height: 48px;
            background-color: #fff;
            border-bottom: 1px solid #e1e1e1;
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding: 0 16px;
            position: sticky;
            top: 0;
            z-index: 100;
        }

        .header-left {
            display: flex;
            align-items: center;
            gap: 12px;
        }

        .workspace-btn {
            display: flex;
            align-items: center;
            gap: 8px;
            padding: 4px 12px;
            border-radius: 4px;
            cursor: pointer;
            font-weight: 500;
            color: #323338;
            font-size: 14px;
            transition: background 0.2s;
            position: relative;
        }

        .workspace-btn:hover {
            background: #f1f1f1;
        }

        .workspace-color-dot {
            width: 12px;
            height: 12px;
            border-radius: 3px;
        }

        .header-right {
            display: flex;
            align-items: center;
            gap: 16px;
        }

        .header-actions {
            display: flex;
            align-items: center;
            gap: 8px;
        }

        .header-icon-btn {
            background: transparent;
            border: none;
            color: #676879;
            cursor: pointer;
            display: flex;
            align-items: center;
            justify-content: center;
            padding: 6px;
            border-radius: 4px;
            transition: all 0.2s;
        }

        .header-icon-btn:hover {
            background: #f1f1f1;
            color: #323338;
        }

        .profile-container {
            display: flex;
            align-items: center;
            gap: 8px;
            margin-left: 8px;
            padding: 2px;
            border-radius: 20px;
            cursor: pointer;
            transition: background 0.2s;
        }

        .profile-container:hover {
            background: #f1f1f1;
        }

        .user-avatar {
            width: 32px;
            height: 32px;
            background: #fdab3d;
            border-radius: 50%;
            color: #fff;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 12px;
            font-weight: 700;
            border: 2px solid #fff;
            box-shadow: 0 0 0 1px #e1e1e1;
        }

        .workspace-dropdown {
            position: absolute;
            top: 100%;
            left: 0;
            margin-top: 4px;
            background: #fff;
            border: 1px solid #e1e1e1;
            border-radius: 8px;
            box-shadow: 0 4px 12px rgba(0,0,0,0.1);
            width: 200px;
            z-index: 1000;
            padding: 8px 0;
        }

        .dropdown-item {
            padding: 8px 16px;
            display: flex;
            align-items: center;
            gap: 10px;
            cursor: pointer;
            font-size: 14px;
            color: #323338;
        }

        .dropdown-item:hover {
            background: #f1f1f1;
        }

        .dropdown-item.active {
            background: rgba(0, 133, 255, 0.05);
            color: #0085ff;
            font-weight: 600;
        }
    `;

    const handleWorkspaceSelect = (ws) => {
        setSelectedWorkspace(ws);
        setIsDropdownOpen(false);
        if (onWorkspaceChange) onWorkspaceChange(ws);
    };

    return (
        <header className="top-header">
            <style>{topHeaderStyles}</style>

            <div className="header-left">
                <div className="workspace-btn" onClick={() => setIsDropdownOpen(!isDropdownOpen)}>
                    <div
                        className="workspace-color-dot"
                        style={{ backgroundColor: selectedWorkspace.color }}
                    />
                    <span>{selectedWorkspace.name}</span>
                    <ChevronDown size={14} />

                    {isDropdownOpen && (
                        <div className="workspace-dropdown">
                            {initialData.workspaces.map(ws => (
                                <div
                                    key={ws.id}
                                    className={`dropdown-item ${selectedWorkspace.id === ws.id ? 'active' : ''}`}
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        handleWorkspaceSelect(ws);
                                    }}
                                >
                                    <div className="workspace-color-dot" style={{ backgroundColor: ws.color }} />
                                    {ws.name}
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            <div className="header-right">
                <div className="header-actions">
                    <button className="header-icon-btn" title="Search" onClick={() => navigate('/search')}>
                        <Search size={18} />
                    </button>
                    <button className="header-icon-btn" title="Notifications" onClick={() => navigate('/notifications')}>
                        <Bell size={18} />
                    </button>
                    <button className="header-icon-btn" title="Work OS Hub">
                        <Rocket size={18} />
                    </button>
                    <button className="header-icon-btn" title="Invite Members">
                        <Crown size={18} />
                    </button>
                    <button className="header-icon-btn" title="Help">
                        <HelpCircle size={18} />
                    </button>
                </div>

                <div className="profile-container">
                    <div className="user-avatar">JD</div>
                </div>
            </div>
        </header>
    );
};

export default TopHeader;
