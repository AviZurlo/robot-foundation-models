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
        opensource: 5,
        backbone: 6,
        params: 7,
        decoder: 8,
        speed: 9,
        about: 10,
        robot_hours: 11,
        robot_episodes: 12,
        video_hours: 13,
        num_embodiments: 14,
        num_tasks: 15,
        data_sources: 16,
        action_labeled_pct: 17,
        real_sim_ratio: 18,
        data_availability: 19,
        collection_methods: 20,
        data_notes: 21,
        perf_headline: 22,
        perf_benchmarks: 23,
        perf_comparisons: 24,
        perf_source: 25,
        insight: 26,
        paper_link: 27,
        blog_link: 28,
        github_link: 29
    }
};

// Category color mapping - minimal, muted palette
export const CATEGORY_COLORS = {
    'VLA': { bg: '#E8F5E9', text: '#2E7D32' },
    'VAM': { bg: '#FFF3E0', text: '#E65100' },
    'Video World Model': { bg: '#E3F2FD', text: '#1565C0' },
    'Predictive World Model': { bg: '#E3F2FD', text: '#1565C0' },
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
