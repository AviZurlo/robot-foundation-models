// ============================================
// GRID COMPONENT
// ============================================

import { getCategoryColor } from '../config.js';

let gridContainer = null;
let modalOverlay = null;
let modalContent = null;
let modalClose = null;
let models = [];

export function initGrid(containerId, modelsData) {
    console.log('initGrid called with:', containerId, modelsData?.length, 'models');

    gridContainer = document.getElementById(containerId);
    modalOverlay = document.getElementById('modal-overlay');
    modalContent = document.getElementById('modal-content');
    modalClose = document.getElementById('modal-close');
    models = modelsData || [];

    console.log('gridContainer found:', !!gridContainer);
    console.log('models count:', models.length);

    if (!gridContainer) {
        console.error('Grid container not found!');
        return;
    }

    // Render all cards
    renderGrid();

    // Test: Check what's in the container after render
    console.log('After renderGrid, container innerHTML length:', gridContainer.innerHTML.length);
    console.log('First 500 chars:', gridContainer.innerHTML.substring(0, 500));

    // Set up modal event listeners
    setupModal();
}

function setupModal() {
    // Close modal on close button click
    if (modalClose) {
        modalClose.addEventListener('click', closeModal);
    }

    // Close modal on overlay click
    if (modalOverlay) {
        modalOverlay.addEventListener('click', (e) => {
            if (e.target === modalOverlay) {
                closeModal();
            }
        });
    }

    // Close modal on Escape key
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            closeModal();
        }
    });
}

function openModal(modelId) {
    const model = models.find(m => m.id == modelId);
    if (!model || !modalOverlay || !modalContent) return;

    modalContent.innerHTML = renderModalContent(model);
    modalOverlay.classList.add('active');
    document.body.style.overflow = 'hidden';
}

function closeModal() {
    if (modalOverlay) {
        modalOverlay.classList.remove('active');
        document.body.style.overflow = '';
    }
}

function renderGrid() {
    console.log('renderGrid called, models:', models.length);

    // Always show at least a test card to verify rendering works
    if (!gridContainer) {
        console.log('No grid container!');
        return;
    }

    if (models.length === 0) {
        gridContainer.innerHTML = '<div style="padding: 40px; background: #ffeb3b; color: #333; font-size: 18px; border-radius: 8px;">No models loaded - check console for errors</div>';
        return;
    }

    const html = models.map(model => renderCard(model)).join('');
    console.log('Generated HTML length:', html.length);
    gridContainer.innerHTML = html;
    console.log('Grid innerHTML set, children:', gridContainer.children.length);

    // Add click handlers to cards
    const cards = gridContainer.querySelectorAll('.grid-card');
    cards.forEach(card => {
        card.addEventListener('click', () => {
            const modelId = card.dataset.modelId;
            openModal(modelId);
        });
    });
}

function renderCard(model) {
    const categoryColor = getCategoryColor(model.category);

    return `
        <article class="grid-card" data-model-id="${model.id}">
            <div class="grid-card-header">
                <div class="grid-card-title">
                    <h2 class="grid-card-name">${model.name}</h2>
                    <div class="grid-card-org">${model.org}</div>
                </div>
                <div class="grid-card-badge" style="background: ${categoryColor.bg}; color: ${categoryColor.text}">
                    ${model.category || 'UNKNOWN'}
                </div>
            </div>

            <time class="grid-card-date">${model.date}</time>

            <div class="grid-card-specs">
                <div class="grid-card-spec">
                    <span class="spec-label">Backbone</span>
                    <span class="spec-value">${model.backbone && model.backbone !== '—' ? model.backbone : 'N/A'}</span>
                </div>
                <div class="grid-card-spec">
                    <span class="spec-label">Params</span>
                    <span class="spec-value">${model.params && model.params !== '—' ? model.params : 'N/A'}</span>
                </div>
                <div class="grid-card-spec">
                    <span class="spec-label">Decoder</span>
                    <span class="spec-value">${model.decoder && model.decoder !== '—' ? model.decoder : 'N/A'}</span>
                </div>
                <div class="grid-card-spec">
                    <span class="spec-label">Speed</span>
                    <span class="spec-value">${model.speed && model.speed !== '—' ? model.speed : 'N/A'}</span>
                </div>
            </div>
        </article>
    `;
}

function renderModalContent(model) {
    const categoryColor = getCategoryColor(model.category);

    return `
        <div class="modal-header">
            <div class="modal-title">
                <h2 class="modal-name">${model.name}</h2>
                <div class="modal-org">${model.org}</div>
            </div>
            <div class="modal-badge" style="background: ${categoryColor.bg}; color: ${categoryColor.text}">
                ${model.category || 'UNKNOWN'}
            </div>
        </div>

        <time class="modal-date">${model.date}</time>

        <div class="modal-specs">
            <div class="modal-spec">
                <span class="spec-label">Backbone</span>
                <span class="spec-value">${model.backbone && model.backbone !== '—' ? model.backbone : 'N/A'}</span>
            </div>
            <div class="modal-spec">
                <span class="spec-label">Params</span>
                <span class="spec-value">${model.params && model.params !== '—' ? model.params : 'N/A'}</span>
            </div>
            <div class="modal-spec">
                <span class="spec-label">Decoder</span>
                <span class="spec-value">${model.decoder && model.decoder !== '—' ? model.decoder : 'N/A'}</span>
            </div>
            <div class="modal-spec">
                <span class="spec-label">Speed</span>
                <span class="spec-value">${model.speed && model.speed !== '—' ? model.speed : 'N/A'}</span>
            </div>
        </div>

        <div class="modal-section">
            <span class="modal-section-label">Data</span>
            <p>${model.data && model.data !== '—' && model.data !== 'N/A' ? model.data : 'N/A'}</p>
        </div>

        <div class="modal-section">
            <span class="modal-section-label">Insight</span>
            <p>${model.insight && model.insight !== '—' && model.insight !== 'N/A' ? model.insight : 'N/A'}</p>
        </div>

        <nav class="modal-links">
            ${model.paper_link ? `<a href="${model.paper_link}" class="modal-link" target="_blank" rel="noopener">Paper</a>` : ''}
            ${model.website_link ? `<a href="${model.website_link}" class="modal-link" target="_blank" rel="noopener">Website</a>` : ''}
            ${model.github_link ? `<a href="${model.github_link}" class="modal-link" target="_blank" rel="noopener">GitHub</a>` : ''}
            ${model.blog_link ? `<a href="${model.blog_link}" class="modal-link" target="_blank" rel="noopener">Blog</a>` : ''}
        </nav>
    `;
}
