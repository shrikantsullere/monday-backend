import {
    initialData,
    aiFutureProjectsData,
    aiRDData,
    commercialSIRAData,
    dmInquiriesData
} from '../data/demoData';

// Map Board Names to specific routes
const BOARD_ROUTES = {
    'Project Pipeline': '/pipeline',
    'AI Future Projects': '/ai-future-projects',
    'SIRA Projects': '/board',
    'AI R&D Roadmap': '/ai-roadmap',
    'Commercial - SIRA': '/commercial-sira',
    'DM Inquiries - Master Board': '/dm-inquiries'
};

class SearchService {
    constructor() {
        this.index = [];
        this.isInitialized = false;
    }

    // Initialize and build the index
    initialize() {
        if (this.isInitialized) return;

        const allBoards = [
            initialData,
            aiFutureProjectsData,
            aiRDData,
            commercialSIRAData,
            dmInquiriesData
        ];

        this.index = allBoards.reduce((acc, board) => {
            if (!board) return acc;
            return [...acc, ...this.indexBoard(board)];
        }, []);

        // Index Static Pages / System Pages
        const staticPages = [
            {
                id: 'page-pipeline',
                type: 'board',
                title: 'Project Pipeline',
                subtitle: 'Portfolio Overview',
                text: 'project pipeline portfolio overview dashboard',
                path: '/pipeline',
                score: 1.2
            },
            {
                id: 'page-files',
                type: 'page',
                title: 'File Center',
                subtitle: 'All Files',
                text: 'file center documents images media pdfs',
                path: '/files',
                score: 1.1
            },
            {
                id: 'page-my-work',
                type: 'page',
                title: 'My Work',
                subtitle: 'Personal Tasks',
                text: 'my work tasks assigned to me',
                path: '/my-work',
                score: 1.1
            },
            {
                id: 'page-settings',
                type: 'page',
                title: 'Settings',
                subtitle: 'Workspace Settings',
                text: 'settings configuration preferences profile',
                path: '/settings',
                score: 1.0
            }
        ];

        this.index = [...this.index, ...staticPages];

        console.log(`[SearchService] Indexed ${this.index.length} items`);
        this.isInitialized = true;
    }

    getBoardPath(boardName) {
        return BOARD_ROUTES[boardName] || '/board';
    }

    // Recursively index a board and its children
    indexBoard(board) {
        const boardName = board.boardName || 'Untitled Board';
        const boardPath = this.getBoardPath(boardName);
        const results = [];

        // 1. Index the Board itself
        results.push({
            id: `board-${boardName}`,
            type: 'board',
            title: boardName,
            subtitle: 'Board',
            text: boardName.toLowerCase(),
            path: boardPath,
            score: 1.0, // Base score
            metadata: { boardName }
        });

        // 2. Index Groups, Items, Subitems
        board.groups?.forEach(group => {
            // Index Group
            results.push({
                id: group.id,
                type: 'group',
                title: group.title,
                subtitle: `Group in ${boardName}`,
                text: `${group.title} ${boardName}`.toLowerCase(),
                path: boardPath, // Groups just go to board for now
                score: 0.8,
                metadata: { boardName, groupId: group.id }
            });

            group.items?.forEach(item => {
                // Index Item
                results.push({
                    id: item.id,
                    type: 'item',
                    title: item.name,
                    subtitle: `${boardName} › ${group.title}`,
                    text: `${item.name} ${item.person} ${item.status}`.toLowerCase(),
                    path: `${boardPath}?item=${item.id}`,
                    score: 0.9,
                    metadata: { boardName, groupId: group.id, status: item.status, person: item.person }
                });

                // Index Subitems
                item.subItems?.forEach(sub => {
                    results.push({
                        id: sub.id,
                        type: 'subitem',
                        title: sub.name,
                        subtitle: `${boardName} › ${item.name}`,
                        text: `${sub.name} ${sub.person} ${sub.status}`.toLowerCase(),
                        path: `${boardPath}?item=${item.id}`, // Open parent item to see subitem
                        score: 0.7,
                        metadata: { boardName, parentItemId: item.id, status: sub.status, person: sub.person }
                    });
                });
            });
        });

        return results;
    }

    // Perform Search
    search(query, filters = {}) {
        if (!query || !query.trim()) return [];
        if (!this.isInitialized) this.initialize();

        const terms = query.toLowerCase().split(' ').filter(t => t);

        return this.index
            .map(entity => {
                // Scoring Logic
                let score = 0;
                let matches = 0;

                terms.forEach(term => {
                    if (entity.title.toLowerCase().includes(term)) {
                        score += 10;
                        matches++;
                    } else if (entity.subtitle.toLowerCase().includes(term)) {
                        score += 5;
                        matches++;
                    } else if (entity.text.includes(term)) {
                        score += 1;
                        matches++;
                    }
                });

                // Boost by type or exact match
                if (entity.title.toLowerCase() === query.toLowerCase()) score += 20;

                return { ...entity, searchScore: score, matchCount: matches };
            })
            .filter(entity => entity.matchCount > 0) // Must match at least something
            .filter(entity => {
                // Apply Filters
                if (filters.type && filters.type !== 'All') {
                    const typeMap = {
                        'Boards': ['board', 'group'],
                        'Items': ['item', 'subitem'],
                        'Users': ['person'],
                        'Files': ['file']
                    };

                    const allowedTypes = typeMap[filters.type] || [filters.type.toLowerCase()];
                    if (!allowedTypes.includes(entity.type)) {
                        return false;
                    }
                }
                return true;
            })
            .sort((a, b) => b.searchScore - a.searchScore)
            .slice(0, 50); // Limit results
    }

    // Helper to get suggested/recent (mock)
    getRecents() {
        return [];
    }
}

export const searchService = new SearchService();
