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
    
    const model = allModels[currentIndex];
    const categoryColor = getCategoryColor(model.category);
    
    // Generate random rotation for decorative elements
    const rotation = (Math.random() - 0.5) * 6;
    const accentRotation = (Math.random() - 0.5) * 15;
    
    carouselContainer.innerHTML = `
        <div class="card-wrapper">
            <!-- Decorative background shapes -->
            <div class="deco-shape deco-1" style="transform: rotate(${accentRotation}deg)"></div>
            <div class="deco-shape deco-2" style="transform: rotate(${-accentRotation}deg)"></div>
            
            <article class="model-card" style="--card-rotation: ${rotation}deg">
                <!-- Category badge - floating -->
                <div class="category-badge" style="background: ${categoryColor.bg}; color: ${categoryColor.text}">
                    ${model.category || 'UNKNOWN'}
                </div>
                
                <!-- Main content area -->
                <div class="card-content">
                    <!-- Header with index number -->
                    <div class="card-index">${String(currentIndex + 1).padStart(2, '0')}</div>
                    
                    <header class="card-header">
                        <h2 class="model-name">${model.name}</h2>
                        <div class="model-org">${model.org}</div>
                    </header>
                    
                    <!-- Date stamp -->
                    <time class="model-date">${model.date}</time>
                    
                    <!-- Technical specs grid -->
                    <div class="specs-grid">
                        ${model.params && model.params !== '—' && model.params !== 'N/A' ? `
                            <div class="spec-item">
                                <span class="spec-label">PARAMS</span>
                                <span class="spec-value">${model.params}</span>
                            </div>
                        ` : ''}
                        ${model.backbone && model.backbone !== '—' && model.backbone !== 'N/A' ? `
                            <div class="spec-item">
                                <span class="spec-label">BACKBONE</span>
                                <span class="spec-value">${model.backbone}</span>
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
                    </div>
                    
                    <!-- Insight text -->
                    <div class="model-insight">
                        <span class="insight-label">INSIGHT_</span>
                        <p>${model.insight}</p>
                    </div>
                    
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
