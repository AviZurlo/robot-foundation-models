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

// Category color mapping for visual distinction
export const CATEGORY_COLORS = {
    'VLA': { bg: '#00FF00', text: '#000000' },
    'VAM': { bg: '#FF6B00', text: '#000000' },
    'Video World Model': { bg: '#00FFFF', text: '#000000' },
    'World Model': { bg: '#00FFFF', text: '#000000' },
    'LLM Planner': { bg: '#FF00FF', text: '#000000' },
    'default': { bg: '#FFFF00', text: '#000000' }
};

export function getCategoryColor(category) {
    if (!category) return CATEGORY_COLORS.default;
    for (const [key, value] of Object.entries(CATEGORY_COLORS)) {
        if (category.includes(key)) return value;
    }
    return CATEGORY_COLORS.default;
}
