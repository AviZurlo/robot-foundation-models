// ============================================
// CAROUSEL COMPONENT
// ============================================

import { allModels } from '../data.js';
import { getCategoryColor } from '../config.js';

let currentIndex = 0;
let carouselContainer = null;
let isDragging = false;
let dateHideTimeout = null;

// Persistent card elements
let leftCardEl = null;
let centerCardEl = null;
let rightCardEl = null;

export function initCarousel(containerId) {
    carouselContainer = document.getElementById(containerId);
    if (!carouselContainer) return;

    // Create persistent card elements
    createCardElements();

    // Keyboard navigation
    document.addEventListener('keydown', handleKeydown);

    // Initialize scrubber
    initScrubber();

    // Initial render
    updateCards();
    updateScrubber();
}

function createCardElements() {
    // Create three persistent card wrappers
    leftCardEl = document.createElement('div');
    leftCardEl.className = 'card-wrapper card-wrapper--left';

    centerCardEl = document.createElement('div');
    centerCardEl.className = 'card-wrapper card-wrapper--center';

    rightCardEl = document.createElement('div');
    rightCardEl.className = 'card-wrapper card-wrapper--right';

    carouselContainer.appendChild(leftCardEl);
    carouselContainer.appendChild(centerCardEl);
    carouselContainer.appendChild(rightCardEl);

    // Add click handlers for side cards (but not for links)
    leftCardEl.style.cursor = 'pointer';
    leftCardEl.addEventListener('click', (e) => {
        if (e.target.closest('.card-link')) return; // Don't navigate if clicking a link
        prevCard();
    });

    rightCardEl.style.cursor = 'pointer';
    rightCardEl.addEventListener('click', (e) => {
        if (e.target.closest('.card-link')) return; // Don't navigate if clicking a link
        nextCard();
    });
}

function handleKeydown(e) {
    if (e.key === 'ArrowLeft') {
        prevCard();
    } else if (e.key === 'ArrowRight') {
        nextCard();
    }
}

// --- FLOATING DATE ---
function showFloatingDate() {
    const floatingDate = document.getElementById('floating-date');
    if (!floatingDate || allModels.length === 0) return;

    const currentModel = allModels[currentIndex];
    floatingDate.textContent = currentModel.date || '';
    floatingDate.classList.add('visible');

    if (dateHideTimeout) {
        clearTimeout(dateHideTimeout);
    }
}

function hideFloatingDate() {
    const floatingDate = document.getElementById('floating-date');
    if (!floatingDate) return;

    dateHideTimeout = setTimeout(() => {
        floatingDate.classList.remove('visible');
    }, 1000);
}

// --- SCRUBBER FUNCTIONALITY ---
function initScrubber() {
    const track = document.getElementById('scrubber-track');
    const thumb = document.getElementById('scrubber-thumb');

    if (!track || !thumb) return;

    track.addEventListener('click', (e) => {
        if (isDragging) return;
        handleScrubberInteraction(e, track);
        showFloatingDate();
        hideFloatingDate();
    });

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
    const progress = document.getElementById('scrubber-progress');
    if (thumb) thumb.classList.add('dragging');
    if (progress) progress.style.transition = 'none';
    showFloatingDate();
}

function handleDrag(e) {
    if (!isDragging) return;
    e.preventDefault();

    const track = document.getElementById('scrubber-track');
    if (!track) return;

    handleScrubberInteraction(e, track);
    showFloatingDate();
}

function endDrag() {
    if (!isDragging) return;
    isDragging = false;
    const thumb = document.getElementById('scrubber-thumb');
    const progress = document.getElementById('scrubber-progress');
    if (thumb) thumb.classList.remove('dragging');
    if (progress) progress.style.transition = '';
    hideFloatingDate();
}

function handleScrubberInteraction(e, track) {
    const rect = track.getBoundingClientRect();
    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    let percent = (clientX - rect.left) / rect.width;
    percent = Math.max(0, Math.min(1, percent));

    const newIndex = Math.round(percent * (allModels.length - 1));
    if (newIndex !== currentIndex) {
        currentIndex = newIndex;
        updateCards();
        updateScrubber();
    }
}

function updateScrubber() {
    const thumb = document.getElementById('scrubber-thumb');
    const progress = document.getElementById('scrubber-progress');

    if (allModels.length === 0) return;

    const percent = (currentIndex / (allModels.length - 1)) * 100;

    if (thumb) thumb.style.left = `${percent}%`;
    if (progress) progress.style.width = `${percent}%`;
}

// --- CARD NAVIGATION ---
export function nextCard() {
    if (allModels.length === 0) return;
    if (currentIndex < allModels.length - 1) {
        currentIndex++;
        updateCards();
        updateScrubber();
        showFloatingDate();
        hideFloatingDate();
    }
}

export function prevCard() {
    if (allModels.length === 0) return;
    if (currentIndex > 0) {
        currentIndex--;
        updateCards();
        updateScrubber();
        showFloatingDate();
        hideFloatingDate();
    }
}

export function goToCard(index) {
    if (index < 0 || index >= allModels.length) return;
    currentIndex = index;
    updateCards();
    updateScrubber();
}

// --- CARD RENDERING ---
function updateCards() {
    if (!carouselContainer || allModels.length === 0) return;

    const isAtStart = currentIndex === 0;
    const isAtEnd = currentIndex === allModels.length - 1;

    // Update left card
    if (isAtStart) {
        leftCardEl.style.visibility = 'hidden';
        leftCardEl.style.opacity = '0';
    } else {
        leftCardEl.style.visibility = 'visible';
        leftCardEl.style.opacity = '';
        leftCardEl.innerHTML = renderCardContent(allModels[currentIndex - 1]);
    }

    // Update center card (always visible)
    centerCardEl.innerHTML = renderCardContent(allModels[currentIndex]);

    // Update right card
    if (isAtEnd) {
        rightCardEl.style.visibility = 'hidden';
        rightCardEl.style.opacity = '0';
    } else {
        rightCardEl.style.visibility = 'visible';
        rightCardEl.style.opacity = '';
        rightCardEl.innerHTML = renderCardContent(allModels[currentIndex + 1]);
    }
}

function renderCardContent(model) {
    const categoryColor = getCategoryColor(model.category);

    return `
        <article class="model-card">
            <div class="category-badge" style="background: ${categoryColor.bg}; color: ${categoryColor.text}">
                ${model.category || 'UNKNOWN'}
            </div>

            <div class="card-content">
                <header class="card-header">
                    <h2 class="model-name">${model.name}</h2>
                    <div class="model-org">${model.org}</div>
                </header>

                <time class="model-date">${model.date}</time>

                <div class="specs-grid">
                    <div class="spec-item">
                        <span class="spec-label">Backbone</span>
                        <span class="spec-value">${model.backbone && model.backbone !== '—' ? model.backbone : 'N/A'}</span>
                    </div>
                    <div class="spec-item">
                        <span class="spec-label">Params</span>
                        <span class="spec-value">${model.params && model.params !== '—' ? model.params : 'N/A'}</span>
                    </div>
                    <div class="spec-item">
                        <span class="spec-label">Decoder</span>
                        <span class="spec-value">${model.decoder && model.decoder !== '—' ? model.decoder : 'N/A'}</span>
                    </div>
                    <div class="spec-item">
                        <span class="spec-label">Speed</span>
                        <span class="spec-value">${model.speed && model.speed !== '—' ? model.speed : 'N/A'}</span>
                    </div>
                </div>

                <div class="model-data">
                    <span class="data-label">Data</span>
                    <p>${model.data && model.data !== '—' && model.data !== 'N/A' ? model.data : 'N/A'}</p>
                </div>

                <div class="model-insight">
                    <span class="insight-label">Insight</span>
                    <p>${model.insight && model.insight !== '—' && model.insight !== 'N/A' ? model.insight : 'N/A'}</p>
                </div>

                <nav class="card-links">
                    ${model.paper_link ? `<a href="${model.paper_link}" class="card-link" target="_blank" rel="noopener">Paper</a>` : ''}
                    ${model.website_link ? `<a href="${model.website_link}" class="card-link" target="_blank" rel="noopener">Website</a>` : ''}
                    ${model.github_link ? `<a href="${model.github_link}" class="card-link" target="_blank" rel="noopener">GitHub</a>` : ''}
                    ${model.blog_link ? `<a href="${model.blog_link}" class="card-link" target="_blank" rel="noopener">Blog</a>` : ''}
                </nav>
            </div>
        </article>
    `;
}

export function getCurrentIndex() {
    return currentIndex;
}

export function getTotalCards() {
    return allModels.length;
}
