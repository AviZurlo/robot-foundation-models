// ============================================
// CAROUSEL COMPONENT
// ============================================

import { allModels } from '../data.js';
import { getCategoryColor } from '../config.js';

let currentIndex = 0;
let carouselContainer = null;

export function initCarousel(containerId) {
    carouselContainer = document.getElementById(containerId);
    if (!carouselContainer) return;
    
    // Keyboard navigation
    document.addEventListener('keydown', handleKeydown);
    
    // Initial render
    renderCurrentCard();
    updateCounter();
}

function handleKeydown(e) {
    if (e.key === 'ArrowLeft') {
        prevCard();
    } else if (e.key === 'ArrowRight') {
        nextCard();
    }
}

export function nextCard() {
    if (allModels.length === 0) return;
    currentIndex = (currentIndex + 1) % allModels.length;
    renderCurrentCard();
    updateCounter();
}

export function prevCard() {
    if (allModels.length === 0) return;
    currentIndex = (currentIndex - 1 + allModels.length) % allModels.length;
    renderCurrentCard();
    updateCounter();
}

export function goToCard(index) {
    if (index < 0 || index >= allModels.length) return;
    currentIndex = index;
    renderCurrentCard();
    updateCounter();
}

function updateCounter() {
    const counter = document.getElementById('carousel-counter');
    if (counter) {
        counter.textContent = `${String(currentIndex + 1).padStart(2, '0')} / ${String(allModels.length).padStart(2, '0')}`;
    }
}

function renderCurrentCard() {
    if (!carouselContainer || allModels.length === 0) return;

    // Calculate indices for prev, current, and next cards
    const prevIndex = (currentIndex - 1 + allModels.length) % allModels.length;
    const nextIndex = (currentIndex + 1) % allModels.length;

    // Render all three cards
    carouselContainer.innerHTML = `
        ${renderCard(allModels[prevIndex], prevIndex, 'side')}
        ${renderCard(allModels[currentIndex], currentIndex, 'center')}
        ${renderCard(allModels[nextIndex], nextIndex, 'side')}
    `;
}

function renderCard(model, index, position) {
    const categoryColor = getCategoryColor(model.category);
    const wrapperClass = position === 'center' ? 'card-wrapper card-wrapper--center' : 'card-wrapper card-wrapper--side';

    return `
        <div class="${wrapperClass}">
            <article class="model-card">
                <!-- Category badge - floating -->
                <div class="category-badge" style="background: ${categoryColor.bg}; color: ${categoryColor.text}">
                    ${model.category || 'UNKNOWN'}
                </div>

                <!-- Main content area -->
                <div class="card-content">
                    <!-- Header with index number -->
                    <div class="card-index">${String(index + 1).padStart(2, '0')}</div>

                    <header class="card-header">
                        <h2 class="model-name">${model.name}</h2>
                        <div class="model-org">${model.org}</div>
                    </header>

                    <!-- Date stamp -->
                    <time class="model-date">${model.date}</time>

                    <!-- Technical specs grid -->
                    <div class="specs-grid">
                        ${model.backbone && model.backbone !== '—' && model.backbone !== 'N/A' ? `
                            <div class="spec-item">
                                <span class="spec-label">BACKBONE</span>
                                <span class="spec-value">${model.backbone}</span>
                            </div>
                        ` : ''}
                        ${model.params && model.params !== '—' && model.params !== 'N/A' ? `
                            <div class="spec-item">
                                <span class="spec-label">PARAMS</span>
                                <span class="spec-value">${model.params}</span>
                            </div>
                        ` : ''}
                        ${model.decoder && model.decoder !== '—' && model.decoder !== 'N/A' ? `
                            <div class="spec-item">
                                <span class="spec-label">DECODER</span>
                                <span class="spec-value">${model.decoder}</span>
                            </div>
                        ` : ''}
                        ${model.speed && model.speed !== '—' && model.speed !== 'N/A' ? `
                            <div class="spec-item">
                                <span class="spec-label">SPEED</span>
                                <span class="spec-value">${model.speed}</span>
                            </div>
                        ` : ''}
                        ${model.data && model.data !== '—' && model.data !== 'N/A' ? `
                            <div class="spec-item">
                                <span class="spec-label">DATA</span>
                                <span class="spec-value">${model.data}</span>
                            </div>
                        ` : ''}
                    </div>

                    <!-- Insight text -->
                    ${model.insight && model.insight !== '—' && model.insight !== 'N/A' ? `
                        <div class="model-insight">
                            <span class="insight-label">INSIGHT_</span>
                            <p>${model.insight}</p>
                        </div>
                    ` : ''}

                    <!-- Links -->
                    <nav class="card-links">
                        ${model.paper_link ? `<a href="${model.paper_link}" class="card-link" target="_blank" rel="noopener">Paper↗</a>` : ''}
                        ${model.website_link ? `<a href="${model.website_link}" class="card-link" target="_blank" rel="noopener">Site↗</a>` : ''}
                        ${model.github_link ? `<a href="${model.github_link}" class="card-link" target="_blank" rel="noopener">GitHub↗</a>` : ''}
                        ${model.blog_link ? `<a href="${model.blog_link}" class="card-link" target="_blank" rel="noopener">Blog↗</a>` : ''}
                    </nav>
                </div>
            </article>
        </div>
    `;
}

export function getCurrentIndex() {
    return currentIndex;
}

export function getTotalCards() {
    return allModels.length;
}
