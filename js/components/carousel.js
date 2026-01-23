// ============================================
// CAROUSEL COMPONENT
// ============================================

import { allModels } from '../data.js';
import { getCategoryColor } from '../config.js';

let currentIndex = 0;
let carouselContainer = null;
let isDragging = false;

export function initCarousel(containerId) {
    carouselContainer = document.getElementById(containerId);
    if (!carouselContainer) return;

    // Keyboard navigation
    document.addEventListener('keydown', handleKeydown);

    // Initialize scrubber
    initScrubber();

    // Initial render
    renderCurrentCard();
    updateScrubber();
}

function handleKeydown(e) {
    if (e.key === 'ArrowLeft') {
        prevCard();
    } else if (e.key === 'ArrowRight') {
        nextCard();
    }
}

// --- SCRUBBER FUNCTIONALITY ---
function initScrubber() {
    const track = document.getElementById('scrubber-track');
    const thumb = document.getElementById('scrubber-thumb');

    if (!track || !thumb) return;

    // Click on track to jump
    track.addEventListener('click', (e) => {
        if (isDragging) return;
        handleScrubberInteraction(e, track);
    });

    // Drag thumb
    thumb.addEventListener('mousedown', startDrag);
    thumb.addEventListener('touchstart', startDrag, { passive: false });

    document.addEventListener('mousemove', handleDrag);
    document.addEventListener('touchmove', handleDrag, { passive: false });

    document.addEventListener('mouseup', endDrag);
    document.addEventListener('touchend', endDrag);
}

function startDrag(e) {
    e.preventDefault();
    isDragging = true;
    const thumb = document.getElementById('scrubber-thumb');
    if (thumb) thumb.classList.add('dragging');
}

function handleDrag(e) {
    if (!isDragging) return;
    e.preventDefault();

    const track = document.getElementById('scrubber-track');
    if (!track) return;

    handleScrubberInteraction(e, track);
}

function endDrag() {
    if (!isDragging) return;
    isDragging = false;
    const thumb = document.getElementById('scrubber-thumb');
    if (thumb) thumb.classList.remove('dragging');
}

function handleScrubberInteraction(e, track) {
    const rect = track.getBoundingClientRect();
    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    let percent = (clientX - rect.left) / rect.width;
    percent = Math.max(0, Math.min(1, percent));

    const newIndex = Math.round(percent * (allModels.length - 1));
    if (newIndex !== currentIndex) {
        currentIndex = newIndex;
        renderCurrentCard();
        updateScrubber();
    }
}

function updateScrubber() {
    const thumb = document.getElementById('scrubber-thumb');
    const progress = document.getElementById('scrubber-progress');
    const label = document.getElementById('scrubber-label');

    if (allModels.length === 0) return;

    const percent = (currentIndex / (allModels.length - 1)) * 100;

    if (thumb) {
        thumb.style.left = `${percent}%`;
    }
    if (progress) {
        progress.style.width = `${percent}%`;
    }
    if (label) {
        label.textContent = `${String(currentIndex + 1).padStart(2, '0')} / ${String(allModels.length).padStart(2, '0')}`;
    }
}

// --- CARD NAVIGATION ---
export function nextCard() {
    if (allModels.length === 0) return;
    currentIndex = (currentIndex + 1) % allModels.length;
    renderCurrentCard();
    updateScrubber();
}

export function prevCard() {
    if (allModels.length === 0) return;
    currentIndex = (currentIndex - 1 + allModels.length) % allModels.length;
    renderCurrentCard();
    updateScrubber();
}

export function goToCard(index) {
    if (index < 0 || index >= allModels.length) return;
    currentIndex = index;
    renderCurrentCard();
    updateScrubber();
}

// --- CARD RENDERING ---
function renderCurrentCard() {
    if (!carouselContainer || allModels.length === 0) return;

    // Calculate indices for prev, current, and next cards
    const prevIndex = (currentIndex - 1 + allModels.length) % allModels.length;
    const nextIndex = (currentIndex + 1) % allModels.length;

    // Render all three cards: left (behind), center (front), right (behind)
    carouselContainer.innerHTML = `
        ${renderCard(allModels[prevIndex], prevIndex, 'left')}
        ${renderCard(allModels[currentIndex], currentIndex, 'center')}
        ${renderCard(allModels[nextIndex], nextIndex, 'right')}
    `;

    // Add click handlers to side cards for navigation
    const leftCard = carouselContainer.querySelector('.card-wrapper--left');
    const rightCard = carouselContainer.querySelector('.card-wrapper--right');

    if (leftCard) {
        leftCard.style.cursor = 'pointer';
        leftCard.addEventListener('click', prevCard);
    }
    if (rightCard) {
        rightCard.style.cursor = 'pointer';
        rightCard.addEventListener('click', nextCard);
    }
}

function renderCard(model, index, position) {
    const categoryColor = getCategoryColor(model.category);

    let wrapperClass = 'card-wrapper';
    if (position === 'center') {
        wrapperClass += ' card-wrapper--center';
    } else if (position === 'left') {
        wrapperClass += ' card-wrapper--left';
    } else if (position === 'right') {
        wrapperClass += ' card-wrapper--right';
    }

    return `
        <div class="${wrapperClass}">
            <article class="model-card">
                <!-- Category badge -->
                <div class="category-badge" style="background: ${categoryColor.bg}; color: ${categoryColor.text}">
                    ${model.category || 'UNKNOWN'}
                </div>

                <!-- Main content area -->
                <div class="card-content">
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
                                <span class="spec-label">Backbone</span>
                                <span class="spec-value">${model.backbone}</span>
                            </div>
                        ` : ''}
                        ${model.params && model.params !== '—' && model.params !== 'N/A' ? `
                            <div class="spec-item">
                                <span class="spec-label">Params</span>
                                <span class="spec-value">${model.params}</span>
                            </div>
                        ` : ''}
                        ${model.decoder && model.decoder !== '—' && model.decoder !== 'N/A' ? `
                            <div class="spec-item">
                                <span class="spec-label">Decoder</span>
                                <span class="spec-value">${model.decoder}</span>
                            </div>
                        ` : ''}
                        ${model.speed && model.speed !== '—' && model.speed !== 'N/A' ? `
                            <div class="spec-item">
                                <span class="spec-label">Speed</span>
                                <span class="spec-value">${model.speed}</span>
                            </div>
                        ` : ''}
                        ${model.data && model.data !== '—' && model.data !== 'N/A' ? `
                            <div class="spec-item">
                                <span class="spec-label">Data</span>
                                <span class="spec-value">${model.data}</span>
                            </div>
                        ` : ''}
                    </div>

                    <!-- Insight text -->
                    ${model.insight && model.insight !== '—' && model.insight !== 'N/A' ? `
                        <div class="model-insight">
                            <span class="insight-label">Insight</span>
                            <p>${model.insight}</p>
                        </div>
                    ` : ''}

                    <!-- Links -->
                    <nav class="card-links">
                        ${model.paper_link ? `<a href="${model.paper_link}" class="card-link" target="_blank" rel="noopener">Paper</a>` : ''}
                        ${model.website_link ? `<a href="${model.website_link}" class="card-link" target="_blank" rel="noopener">Website</a>` : ''}
                        ${model.github_link ? `<a href="${model.github_link}" class="card-link" target="_blank" rel="noopener">GitHub</a>` : ''}
                        ${model.blog_link ? `<a href="${model.blog_link}" class="card-link" target="_blank" rel="noopener">Blog</a>` : ''}
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
