// ============================================
// MAIN APPLICATION
// ============================================

import { loadData, getStats } from './data.js';
import { initCarousel, nextCard, prevCard } from './components/carousel.js';

// Make navigation functions globally available for onclick handlers
window.nextCard = nextCard;
window.prevCard = prevCard;

async function init() {
    const loadingEl = document.getElementById('loading');
    const errorEl = document.getElementById('error');
    const mainContent = document.getElementById('main-content');
    
    try {
        // Load data
        await loadData();
        
        // Update stats
        const stats = getStats();
        document.getElementById('stat-models').textContent = stats.totalModels;
        document.getElementById('stat-orgs').textContent = stats.totalOrgs;
        document.getElementById('stat-years').textContent = stats.dateRange;
        
        // Initialize carousel
        initCarousel('carousel');
        
        // Hide loading, show content
        if (loadingEl) loadingEl.style.display = 'none';
        if (mainContent) mainContent.style.display = 'block';
        
    } catch (error) {
        console.error('Initialization error:', error);
        if (loadingEl) loadingEl.style.display = 'none';
        if (errorEl) {
            errorEl.style.display = 'block';
            errorEl.querySelector('.error-message').textContent = error.message;
        }
    }
}

// Initialize when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
} else {
    init();
}
