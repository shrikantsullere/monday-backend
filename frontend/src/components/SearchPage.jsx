import React, { useState, useEffect } from 'react';
import { Search, Layout, LayoutDashboard, Loader2, ArrowRight } from 'lucide-react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { searchService } from '../services/api';

const SearchPage = () => {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const [query, setQuery] = useState(searchParams.get('q') || '');
    const [results, setResults] = useState({ boards: [], items: [], users: [] });
    const [isSearching, setIsSearching] = useState(false);
    const performSearch = async (val) => {
        setIsSearching(true);
        try {
            const res = await searchService.search(val);
            setResults(res.data);
        } catch (err) {
            console.error('Search failed:', err);
        } finally {
            setIsSearching(false);
        }
    };

    useEffect(() => {
        const urlQuery = searchParams.get('q');
        if (urlQuery) {
            setQuery(urlQuery);
            performSearch(urlQuery);
        }
    }, [searchParams]);

    const handleSearch = async (e) => {
        const val = e.target.value;
        setQuery(val);

        if (val.length < 2) {
            setResults({ boards: [], items: [], users: [] });
            return;
        }

        performSearch(val);
    };

    const styles = `
        .search-container { padding: 48px; background: var(--bg-page); min-height: 100%; color: var(--text-main); }
        .search-box-large { position: relative; margin-bottom: 48px; max-width: 600px; }
        .search-box-large input { width: 100%; padding: 16px 20px 16px 50px; font-size: 18px; border: 2px solid var(--border-color); border-radius: 12px; background: var(--bg-card); color: var(--text-main); outline: none; transition: border-color 0.2s; }
        .search-box-large input:focus { border-color: var(--primary-color); }
        .search-box-large svg { position: absolute; left: 16px; top: 50%; transform: translateY(-50%); color: var(--text-secondary); }
        .results-section { margin-bottom: 40px; }
        .section-title { font-size: 14px; font-weight: 700; color: var(--text-secondary); text-transform: uppercase; margin-bottom: 20px; letter-spacing: 1px; }
        .result-card { background: var(--bg-card); padding: 20px; border-radius: 8px; border: 1px solid var(--border-color); display: flex; align-items: center; gap: 16px; margin-bottom: 12px; cursor: pointer; transition: all 0.2s; }
        .result-card:hover { border-color: var(--primary-color); transform: translateX(8px); }
        .icon-box { width: 40px; height: 40px; border-radius: 8px; background: var(--bg-hover); display: flex; align-items: center; justify-content: center; color: var(--primary-color); }
        .avatar-box { width: 40px; height: 40px; border-radius: 50%; background: var(--warning-color); display: flex; align-items: center; justify-content: center; color: #fff; font-weight: 700; overflow: hidden; }
        .result-info h4 { margin: 0; font-size: 16px; }
        .result-info p { margin: 4px 0 0 0; color: var(--text-secondary); font-size: 13px; }
    `;

    return (
        <div className="search-container">
            <style>{styles}</style>
            <h1>Search Everything</h1>
            <p style={{ color: 'var(--text-secondary)', marginBottom: '32px' }}>Search across all boards, items, and team members.</p>

            <div className="search-box-large">
                <Search size={24} />
                <input
                    type="text"
                    placeholder="Search by name, board, or person..."
                    value={query}
                    onChange={handleSearch}
                    autoFocus
                />
                {isSearching && <Loader2 size={20} className="spin" style={{ position: 'absolute', right: 16, top: '50%', marginTop: -10 }} color="var(--primary-color)" />}
            </div>

            {results.users && results.users.length > 0 && (
                <div className="results-section">
                    <div className="section-title">People</div>
                    {results.users.map(user => (
                        <div key={user.id} className="result-card" onClick={() => navigate('/users')}>
                            <div className="avatar-box">
                                {user.avatar ? (
                                    <img src={user.avatar} alt={user.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                ) : (
                                    user.name[0]
                                )}
                            </div>
                            <div className="result-info">
                                <h4>{user.name}</h4>
                                <p>{user.email} • {user.role}</p>
                            </div>
                            <ArrowRight size={18} style={{ marginLeft: 'auto', opacity: 0.3 }} />
                        </div>
                    ))}
                </div>
            )}

            {results.boards.length > 0 && (
                <div className="results-section">
                    <div className="section-title">Boards (Projects)</div>
                    {results.boards.map(board => (
                        <div key={board.id} className="result-card" onClick={() => navigate(`/board/${board.id}`)}>
                            <div className="icon-box"><LayoutDashboard size={20} /></div>
                            <div className="result-info">
                                <h4>{board.name}</h4>
                                <p>{board.workspace || 'Main Workspace'}</p>
                            </div>
                            <ArrowRight size={18} style={{ marginLeft: 'auto', opacity: 0.3 }} />
                        </div>
                    ))}
                </div>
            )}

            {results.items.length > 0 && (
                <div className="results-section">
                    <div className="section-title">Items</div>
                    {results.items.map(item => (
                        <div key={item.id} className="result-card" onClick={() => navigate(`/board/${item.Group?.BoardId}`)}>
                            <div className="icon-box" style={{ color: 'var(--success-color)' }}><Layout size={20} /></div>
                            <div className="result-info">
                                <h4>{item.name}</h4>
                                <p>{item.Group?.Board?.name} • {item.Group?.title}</p>
                            </div>
                            <ArrowRight size={18} style={{ marginLeft: 'auto', opacity: 0.3 }} />
                        </div>
                    ))}
                </div>
            )}

            {!isSearching && query.length >= 2 && results.boards.length === 0 && results.items.length === 0 && (results.users?.length || 0) === 0 && (
                <div style={{ textAlign: 'center', padding: '40px', color: 'var(--text-secondary)' }}>
                    No results found for "{query}"
                </div>
            )}
        </div>
    );
};

export default SearchPage;
