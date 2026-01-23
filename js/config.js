// ============================================
// CONFIGURATION
// ============================================

export const CONFIG = {
    GOOGLE_SHEET_ID: '1bXBH0CipQMYT14OC_YD0rQHEbtQm3xx7sTqbcHvMg9A',
    SHEET_NAME: 'robot_foundation_models',
    
    // Column mapping (0-indexed positions in your sheet)
    COLUMNS: {
        id: 0,
        name: 1,
        org: 2,
        date: 3,
        category: 4,
        backbone: 5,
        params: 6,
        decoder: 7,
        speed: 8,
        data: 9,
        insight: 10,
        paper_link: 11,
        website_link: 12,
        github_link: 13,
        blog_link: 14
    }
};

// Category color mapping - minimal, muted palette
export const CATEGORY_COLORS = {
    'VLA': { bg: '#E8F5E9', text: '#2E7D32' },
    'VAM': { bg: '#FFF3E0', text: '#E65100' },
    'Video World Model': { bg: '#E3F2FD', text: '#1565C0' },
    'World Model': { bg: '#E3F2FD', text: '#1565C0' },
    'LLM Planner': { bg: '#F3E5F5', text: '#7B1FA2' },
    'default': { bg: '#F5F5F5', text: '#616161' }
};

export function getCategoryColor(category) {
    if (!category) return CATEGORY_COLORS.default;
    for (const [key, value] of Object.entries(CATEGORY_COLORS)) {
        if (category.includes(key)) return value;
    }
    return CATEGORY_COLORS.default;
}
