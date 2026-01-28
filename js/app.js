// ============================================
// MAIN APPLICATION
// ============================================

import { loadData, getStats, loadGlossary, glossary } from './data.js';
import { getCategoryColor } from './config.js';

// Global state
let allModels = [];
let filteredModels = [];
let openModal = null;

// Era segments for timeline (colored line segments)
const eraSegments = [
    { start: null, end: 'Apr 2022', color: 'var(--gray-200)', label: null },
    { start: 'Apr 2022', end: 'Jul 2023', color: '#8b5cf6', label: 'LLM Era' },
    { start: 'Jul 2023', end: 'Dec 2025', color: '#22c55e', label: 'VLA Era' },
    { start: 'Dec 2025', end: null, color: '#f97316', label: 'VAM Era' }
];

async function init() {
    const loadingEl = document.getElementById('loading');
    const errorEl = document.getElementById('error');
    const mainContent = document.getElementById('main-content');

    try {
        // Load data and glossary in parallel
        const [models] = await Promise.all([
            loadData(),
            loadGlossary()
        ]);
        allModels = models;

        // Update stats
        const stats = getStats();
        document.getElementById('stat-models').textContent = stats.totalModels;
        document.getElementById('stat-orgs').textContent = stats.totalOrgs;
        document.getElementById('stat-years').textContent = stats.dateRange;

        // Hide loading, show content
        if (loadingEl) loadingEl.style.display = 'none';
        if (mainContent) mainContent.style.display = 'block';

        // Set up modal
        setupModal();

        // Set up architecture cards
        setupArchCards();

        // Populate filters
        populateFilters();

        // Set up filter listeners
        setupFilterListeners();

        // Initial render with default sort (newest first)
        applyFiltersAndRender();

        // Set up glossary tooltips
        setupGlossaryTooltips();

        // Process glossary terms in architecture section
        processGlossaryTerms(document.getElementById('arch-evolution'));

    } catch (error) {
        console.error('Initialization error:', error);
        if (loadingEl) loadingEl.style.display = 'none';
        if (errorEl) {
            errorEl.style.display = 'block';
            errorEl.querySelector('.error-message').textContent = error.message;
        }
    }
}

function setupArchCards() {
    const archSection = document.getElementById('arch-evolution');
    const toggleBtn = document.getElementById('arch-toggle-all');
    const toggleText = toggleBtn?.querySelector('.arch-expand-bar-text');

    if (toggleBtn && archSection) {
        toggleBtn.addEventListener('click', () => {
            const isExpanded = archSection.classList.toggle('expanded');
            toggleBtn.setAttribute('aria-expanded', isExpanded);
            if (toggleText) {
                toggleText.textContent = isExpanded ? 'Click to collapse' : 'Click to expand details';
            }
        });
    }
}

function setupModal() {
    const modalOverlay = document.getElementById('modal-overlay');
    const modalContent = document.getElementById('modal-content');
    const modalClose = document.getElementById('modal-close');

    openModal = function(modelId) {
        const model = allModels.find(m => m.id == modelId);
        if (!model) return;

        const categoryColor = getCategoryColor(model.category);
        modalContent.innerHTML = `
            <div class="modal-header">
                <div class="modal-title">
                    <h2 class="modal-name">${model.name}</h2>
                    <div class="modal-org">${model.org}</div>
                </div>
                <div class="modal-badges">
                    <div class="modal-badge" style="background: ${categoryColor.bg}; color: ${categoryColor.text}">
                        ${model.category || 'UNKNOWN'}
                    </div>
                    ${model.opensource ? `<div class="modal-badge modal-badge-opensource" style="background: ${model.opensource === 'Yes' ? '#E8F5E9' : model.opensource === 'Partial' ? '#FFF8E1' : '#FFEBEE'}; color: ${model.opensource === 'Yes' ? '#2E7D32' : model.opensource === 'Partial' ? '#F57F17' : '#C62828'}">
                        ${model.opensource === 'Yes' ? 'Open Source' : model.opensource === 'Partial' ? 'Partial OS' : 'Closed'}
                    </div>` : ''}
                </div>
            </div>
            <time class="modal-date">${model.date}</time>

            <nav class="modal-links modal-links-top">
                ${model.paper_link ? `<a href="${model.paper_link}" class="modal-link" target="_blank" rel="noopener">Paper</a>` : ''}
                ${model.github_link ? `<a href="${model.github_link}" class="modal-link" target="_blank" rel="noopener">GitHub</a>` : ''}
                ${model.blog_link ? `<a href="${model.blog_link}" class="modal-link" target="_blank" rel="noopener">Blog</a>` : ''}
            </nav>

            <div class="modal-specs">
                <div class="modal-spec">
                    <span class="spec-label">Backbone</span>
                    <span class="spec-value">${model.backbone || 'N/A'}</span>
                </div>
                <div class="modal-spec">
                    <span class="spec-label">Params</span>
                    <span class="spec-value">${model.params || 'N/A'}</span>
                </div>
                <div class="modal-spec">
                    <span class="spec-label">Decoder</span>
                    <span class="spec-value">${model.decoder || 'N/A'}</span>
                </div>
                <div class="modal-spec">
                    <span class="spec-label">Speed</span>
                    <span class="spec-value">${model.speed || 'N/A'}</span>
                </div>
            </div>

            <div class="modal-section">
                <span class="modal-section-label">About</span>
                <p>${linkModelNames(model.about, model.id)}</p>
            </div>

            ${renderDataProfile(model)}

            ${renderPerformance(model)}
        `;
        modalOverlay.classList.add('active');
        document.body.style.overflow = 'hidden';

        // Scroll modal content to top
        modalContent.scrollTop = 0;

        // Process glossary terms in modal
        processGlossaryTerms(modalContent);

        // Add click handlers for model links within the modal
        modalContent.querySelectorAll('.model-link').forEach(link => {
            link.addEventListener('click', (e) => {
                e.stopPropagation();
                const linkedModelId = link.dataset.linkModelId;
                if (linkedModelId) {
                    openModal(linkedModelId);
                }
            });
        });
    };

    function closeModal() {
        modalOverlay.classList.remove('active');
        document.body.style.overflow = '';
    }

    modalClose.addEventListener('click', closeModal);
    modalOverlay.addEventListener('click', (e) => {
        if (e.target === modalOverlay) closeModal();
    });
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') closeModal();
    });
}

function populateFilters() {
    const orgSelect = document.getElementById('filter-org');
    const typeSelect = document.getElementById('filter-type');

    // Get unique organizations (handling comma-separated values)
    const allOrgs = new Set();
    allModels.forEach(m => {
        if (m.org) {
            // Split by comma and trim whitespace
            m.org.split(',').forEach(org => {
                const trimmed = org.trim();
                if (trimmed) allOrgs.add(trimmed);
            });
        }
    });
    const orgs = [...allOrgs].sort();
    orgs.forEach(org => {
        const option = document.createElement('option');
        option.value = org;
        option.textContent = org;
        orgSelect.appendChild(option);
    });

    // Get unique types/categories
    const types = [...new Set(allModels.map(m => m.category).filter(Boolean))].sort();
    types.forEach(type => {
        const option = document.createElement('option');
        option.value = type;
        option.textContent = type;
        typeSelect.appendChild(option);
    });
}

function setupFilterListeners() {
    const orgSelect = document.getElementById('filter-org');
    const typeSelect = document.getElementById('filter-type');
    const sortSelect = document.getElementById('sort-date');
    const searchInput = document.getElementById('filter-search');
    const resetBtn = document.getElementById('filter-reset');

    orgSelect.addEventListener('change', applyFiltersAndRender);
    typeSelect.addEventListener('change', applyFiltersAndRender);
    sortSelect.addEventListener('change', applyFiltersAndRender);
    searchInput.addEventListener('input', applyFiltersAndRender);

    resetBtn.addEventListener('click', () => {
        orgSelect.value = '';
        typeSelect.value = '';
        sortSelect.value = 'newest';
        searchInput.value = '';
        applyFiltersAndRender();
    });
}

function parseDate(dateStr) {
    const parts = (dateStr || '').split(' ');
    const months = { 'Jan': 0, 'Feb': 1, 'Mar': 2, 'Apr': 3, 'May': 4, 'Jun': 5,
                    'Jul': 6, 'Aug': 7, 'Sep': 8, 'Oct': 9, 'Nov': 10, 'Dec': 11 };
    if (parts.length === 2) {
        const month = months[parts[0]] || 0;
        const year = parseInt(parts[1]) || 2020;
        return new Date(year, month).getTime();
    }
    return 0;
}

// Helper to check if a value is valid (not empty, null, "—", or "N/A")
function hasValue(val) {
    if (!val) return false;
    const str = String(val).trim();
    return str !== '' && str !== '—' && str !== 'N/A' && str !== 'null';
}

// Format numbers with commas for values >= 10000
function formatNumber(val) {
    if (!val) return val;
    const str = String(val);
    // Check if it's a number (possibly with + suffix like "920000+")
    const match = str.match(/^(\d+)(\+?)$/);
    if (match && parseInt(match[1]) >= 10000) {
        return parseInt(match[1]).toLocaleString() + match[2];
    }
    return val;
}

// Get access pill class based on availability text
function getAccessClass(availability) {
    const lower = (availability || '').toLowerCase();
    if (lower.includes('open') && !lower.includes('partial')) return 'access-open';
    if (lower.includes('partial')) return 'access-partial';
    return 'access-closed';
}

// Get abbreviated access label and full tooltip
function getAccessLabel(availability) {
    if (!hasValue(availability)) return null;

    const str = String(availability);
    const parenMatch = str.match(/^([^(]+)\s*\(([^)]+)\)/);

    if (parenMatch) {
        return { short: parenMatch[1].trim(), full: str };
    }
    return { short: str, full: null };
}

// Known datasets to extract from data_sources text
const KNOWN_DATASETS = [
    'Open X-Embodiment', 'OXE', 'Open-X',
    'DROID',
    'BridgeData', 'BridgeData V2', 'Bridge V2', 'Bridge',
    'RoboSet',
    'RoboMimic',
    'MimicGen',
    'DexMimicGen',
    'RH20T',
    'LIBERO',
    'RoboCasa',
    'Ego4D',
    'Something-Something', 'Something Something',
    'Kinetics',
    'Epic-Kitchens', 'EPIC-KITCHENS',
    'RoboTurk',
    'RoboNet',
    'BC-Z',
    'Language Table',
    'CALVIN',
    'MetaWorld',
    'RLBench',
    'Franka Kitchen',
    'ALOHA',
    'Mobile ALOHA',
    'RT-1',
    'RT-2',
    'Google Robot',
    'UR5',
    'Franka',
    'xArm',
    'Sawyer',
    'Kuka',
    'HumanoidBench',
    'DexArt',
    'Maniskill', 'ManiSkill',
    'Isaac', 'Isaac Gym', 'IsaacGym',
    'Habitat',
    'AI2-THOR',
    'Ravens',
    'CLIPort'
];

// Extract known datasets from data_sources text
function extractDatasets(text) {
    if (!hasValue(text)) return [];

    const found = [];
    const lowerText = text.toLowerCase();

    // Sort by length (longest first) to match longer names first
    const sortedDatasets = [...KNOWN_DATASETS].sort((a, b) => b.length - a.length);

    for (const dataset of sortedDatasets) {
        const lowerDataset = dataset.toLowerCase();
        // Check if dataset name exists in text (case-insensitive)
        if (lowerText.includes(lowerDataset)) {
            // Avoid duplicates (e.g., "Bridge" if "BridgeData V2" already matched)
            const isDuplicate = found.some(d =>
                d.toLowerCase().includes(lowerDataset) ||
                lowerDataset.includes(d.toLowerCase())
            );
            if (!isDuplicate) {
                found.push(dataset);
            }
        }
    }

    return found;
}

// Render the Data Profile section
function renderDataProfile(model) {
    // Check if any data fields have values
    const hasScale = hasValue(model.robot_hours) || hasValue(model.robot_episodes) ||
                     hasValue(model.video_hours) || hasValue(model.num_embodiments) ||
                     hasValue(model.num_tasks);
    const hasAccess = hasValue(model.data_availability);
    const hasCollection = hasValue(model.collection_methods);
    const hasComposition = hasValue(model.real_sim_ratio) || hasValue(model.action_labeled_pct);

    // Extract datasets from data_sources
    const datasets = extractDatasets(model.data_sources);
    const hasDatasets = datasets.length > 0;

    // If no data at all, don't render the section
    if (!hasScale && !hasAccess && !hasCollection && !hasComposition && !hasDatasets) {
        return '';
    }

    // Build scale items with formatted numbers
    const scaleItems = [];
    if (hasValue(model.robot_hours)) scaleItems.push(`<span class="data-scale-value">${formatNumber(model.robot_hours)}</span> robot hrs`);
    if (hasValue(model.robot_episodes)) scaleItems.push(`<span class="data-scale-value">${formatNumber(model.robot_episodes)}</span> episodes`);
    if (hasValue(model.video_hours)) scaleItems.push(`<span class="data-scale-value">${formatNumber(model.video_hours)}</span> video hrs`);
    if (hasValue(model.num_embodiments)) scaleItems.push(`<span class="data-scale-value">${formatNumber(model.num_embodiments)}</span> embodiments`);
    if (hasValue(model.num_tasks)) scaleItems.push(`<span class="data-scale-value">${formatNumber(model.num_tasks)}</span> tasks`);

    // Build access pill
    const accessInfo = getAccessLabel(model.data_availability);
    const accessClass = getAccessClass(model.data_availability);

    return `
        <div class="modal-section">
            <span class="modal-section-label">Data Profile</span>
            <div class="data-profile">
                ${(hasScale || hasAccess || hasCollection || hasComposition) ? `
                <div class="data-profile-top">
                    ${(hasScale || hasComposition) ? `
                    <div class="data-profile-column">
                        ${hasScale ? `
                        <div>
                            <div class="data-profile-header">Scale</div>
                            <div class="data-scale-list">
                                ${scaleItems.map(item => `<div class="data-scale-item">${item}</div>`).join('')}
                            </div>
                        </div>
                        ` : ''}

                        ${hasComposition ? `
                        <div>
                            <div class="data-profile-header">Composition</div>
                            <div class="data-scale-list">
                                ${hasValue(model.real_sim_ratio) ? `<div class="data-scale-item"><span class="data-scale-label">Real/Sim:</span> ${model.real_sim_ratio}</div>` : ''}
                                ${hasValue(model.action_labeled_pct) ? `<div class="data-scale-item"><span class="data-scale-label">Action-labeled:</span> ${model.action_labeled_pct}</div>` : ''}
                            </div>
                        </div>
                        ` : ''}
                    </div>
                    ` : ''}

                    ${(hasAccess || hasCollection) ? `
                    <div class="data-profile-column">
                        ${hasAccess && accessInfo ? `
                        <div>
                            <div class="data-profile-header">Access</div>
                            <span class="data-access-pill ${accessClass}"${accessInfo.full ? ` title="${accessInfo.full}"` : ''}>${accessInfo.short}</span>
                        </div>
                        ` : ''}

                        ${hasCollection ? `
                        <div>
                            <div class="data-profile-header">Collection</div>
                            <div class="data-collection-text">${model.collection_methods}</div>
                        </div>
                        ` : ''}
                    </div>
                    ` : ''}
                </div>
                ` : ''}

                ${hasDatasets ? `
                <div class="data-datasets">
                    <div class="data-profile-header">Datasets</div>
                    <div class="dataset-tags">
                        ${datasets.map(d => `<span class="dataset-tag">${d}</span>`).join('')}
                    </div>
                </div>
                ` : ''}
            </div>
        </div>
    `;
}

// Render the Performance section
function renderPerformance(model) {
    const hasHeadline = hasValue(model.perf_headline);
    const hasBenchmarks = hasValue(model.perf_benchmarks);
    const hasComparisons = hasValue(model.perf_comparisons);
    const hasSource = hasValue(model.perf_source);

    // If no performance data, don't render
    if (!hasHeadline && !hasBenchmarks && !hasComparisons) {
        return '';
    }

    // Parse benchmarks (pipe-delimited "Name: Score" pairs)
    const benchmarkList = hasBenchmarks
        ? model.perf_benchmarks.split(' | ').map(b => {
            const parts = b.split(': ');
            return { name: parts[0]?.trim(), score: parts[1]?.trim() };
        }).filter(b => b.name && b.score)
        : [];

    // Parse comparisons (pipe-delimited strings)
    const comparisonList = hasComparisons
        ? model.perf_comparisons.split(' | ').filter(c => c.trim())
        : [];

    return `
        <div class="modal-section">
            <span class="modal-section-label">Performance</span>
            <div class="perf-content">
                ${hasHeadline ? `
                <div class="perf-headline">${model.perf_headline}</div>
                ` : ''}

                ${(benchmarkList.length > 0 || comparisonList.length > 0) ? `
                <div class="perf-columns">
                    ${benchmarkList.length > 0 ? `
                    <div class="perf-column">
                        <div class="data-profile-header">Benchmarks</div>
                        <div class="perf-list">
                            ${benchmarkList.slice(0, 6).map(b => `
                                <div class="perf-item">
                                    <span class="perf-item-name">${b.name}:</span>
                                    <span class="perf-item-score">${b.score}</span>
                                </div>
                            `).join('')}
                            ${benchmarkList.length > 6 ? `<div class="perf-more">+${benchmarkList.length - 6} more</div>` : ''}
                        </div>
                    </div>
                    ` : ''}

                    ${comparisonList.length > 0 ? `
                    <div class="perf-column">
                        <div class="data-profile-header">Key Comparisons</div>
                        <div class="perf-list">
                            ${comparisonList.slice(0, 4).map(c => `
                                <div class="perf-comparison">
                                    <span class="perf-arrow">›</span>
                                    <span>${c}</span>
                                </div>
                            `).join('')}
                        </div>
                    </div>
                    ` : ''}
                </div>
                ` : ''}

                ${hasSource ? `
                <div class="perf-source">Source: ${model.perf_source}</div>
                ` : ''}
            </div>
        </div>
    `;
}

// Link model names in text to their respective cards
function linkModelNames(text, currentModelId) {
    if (!text || text === '—' || text === 'N/A') return 'N/A';

    let result = text;

    // Sort models by name length (longest first) to avoid partial matches
    const sortedModels = [...allModels].sort((a, b) => b.name.length - a.name.length);

    sortedModels.forEach(model => {
        // Skip the current model
        if (model.id == currentModelId) return;

        // Create a regex that matches the model name as a whole word
        // Escape special regex characters in model name
        const escapedName = model.name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
        // Use negative lookahead to avoid matching when followed by . and digits (e.g., N1 in N1.5)
        const regex = new RegExp(`\\b(${escapedName})\\b(?![.\\d])`, 'g');

        result = result.replace(regex, `<span class="model-link" data-link-model-id="${model.id}">$1</span>`);
    });

    return result;
}

function applyFiltersAndRender() {
    const orgFilter = document.getElementById('filter-org').value;
    const typeFilter = document.getElementById('filter-type').value;
    const sortOrder = document.getElementById('sort-date').value;
    const searchTerm = document.getElementById('filter-search').value.toLowerCase().trim();

    // Filter
    filteredModels = allModels.filter(model => {
        // Check organization filter (handle comma-separated orgs)
        if (orgFilter) {
            const modelOrgs = (model.org || '').split(',').map(o => o.trim());
            if (!modelOrgs.includes(orgFilter)) return false;
        }
        if (typeFilter && model.category !== typeFilter) return false;

        // Check search term across all fields
        if (searchTerm) {
            const searchableFields = [
                model.name,
                model.org,
                model.category,
                model.date,
                model.opensource,
                model.backbone,
                model.params,
                model.decoder,
                model.speed,
                model.about,
                model.data_sources,
                model.data_notes,
                model.insight
            ].map(f => (f || '').toLowerCase());

            const matchesSearch = searchableFields.some(field => field.includes(searchTerm));
            if (!matchesSearch) return false;
        }

        return true;
    });

    // Sort by date, then by ID for consistent ordering when dates are equal
    filteredModels.sort((a, b) => {
        const dateA = parseDate(a.date);
        const dateB = parseDate(b.date);
        const dateCompare = sortOrder === 'newest' ? dateB - dateA : dateA - dateB;

        // If dates are equal, sort by ID (higher ID = more recent entry)
        if (dateCompare === 0) {
            return sortOrder === 'newest' ? b.id - a.id : a.id - b.id;
        }
        return dateCompare;
    });

    // Update count display
    document.getElementById('stat-models').textContent = filteredModels.length;

    // Re-render
    renderGrid();
    renderTimeline();
}

function renderGrid() {
    const gridContainer = document.getElementById('cards-grid');
    if (!gridContainer) return;

    if (filteredModels.length === 0) {
        gridContainer.innerHTML = '<div class="no-results">No models match your filters</div>';
        return;
    }

    gridContainer.innerHTML = filteredModels.map(model => {
        const categoryColor = getCategoryColor(model.category);
        const opensourceClass = model.opensource === 'Yes' ? 'opensource-yes' : model.opensource === 'Partial' ? 'opensource-partial' : 'opensource-no';
        return `
            <article class="grid-card" data-model-id="${model.id}" data-date="${model.date}">
                <div class="grid-card-header">
                    <div class="grid-card-title">
                        <h2 class="grid-card-name">${model.name}</h2>
                        <div class="grid-card-org">${model.org}</div>
                    </div>
                    <div class="grid-card-badges">
                        <div class="grid-card-badge" style="background: ${categoryColor.bg}; color: ${categoryColor.text}">
                            ${model.category || 'UNKNOWN'}
                        </div>
                        ${model.opensource ? `<div class="grid-card-badge-os ${opensourceClass}">${model.opensource === 'Yes' ? 'OS' : model.opensource === 'Partial' ? 'P' : 'C'}</div>` : ''}
                    </div>
                </div>
                <time class="grid-card-date">${model.date}</time>
                <div class="grid-card-specs">
                    <div class="grid-card-spec">
                        <span class="spec-label">Backbone</span>
                        <span class="spec-value">${model.backbone || 'N/A'}</span>
                    </div>
                    <div class="grid-card-spec">
                        <span class="spec-label">Params</span>
                        <span class="spec-value">${model.params || 'N/A'}</span>
                    </div>
                    <div class="grid-card-spec">
                        <span class="spec-label">Decoder</span>
                        <span class="spec-value">${model.decoder || 'N/A'}</span>
                    </div>
                    <div class="grid-card-spec">
                        <span class="spec-label">Speed</span>
                        <span class="spec-value">${model.speed || 'N/A'}</span>
                    </div>
                </div>
                <div class="grid-card-expand">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                        <polyline points="15 3 21 3 21 9"></polyline>
                        <polyline points="9 21 3 21 3 15"></polyline>
                        <polyline points="21 15 21 21 15 21"></polyline>
                        <polyline points="3 9 3 3 9 3"></polyline>
                        <line x1="3" y1="3" x2="9" y2="9"></line>
                        <line x1="21" y1="3" x2="15" y2="9"></line>
                        <line x1="3" y1="21" x2="9" y2="15"></line>
                        <line x1="21" y1="21" x2="15" y2="15"></line>
                    </svg>
                </div>
            </article>
        `;
    }).join('');

    // Add click handlers to cards
    gridContainer.querySelectorAll('.grid-card').forEach(card => {
        card.addEventListener('click', () => {
            openModal(card.dataset.modelId);
        });
    });
}

function renderTimeline() {
    const track = document.getElementById('timeline-track');
    if (!track) return;

    // Clear existing content
    track.innerHTML = '';

    if (filteredModels.length === 0) {
        track.style.minHeight = '60px';
        return;
    }

    // Parse dates and sort chronologically for timeline (always chronological)
    const modelsWithDates = filteredModels.map(m => ({
        ...m,
        timestamp: parseDate(m.date),
        dateStr: m.date
    })).sort((a, b) => a.timestamp - b.timestamp);

    // Get date range - start from beginning of 2022
    const minTime = new Date(2022, 0, 1).getTime();
    const maxTime = Math.max(...modelsWithDates.map(m => m.timestamp), new Date(2026, 0, 1).getTime());
    const timeRange = maxTime - minTime || 1;

    // Use percentage-based positioning
    const paddingPercent = 3;

    // Add colored era segments
    eraSegments.forEach(era => {
        const startTime = era.start ? parseDate(era.start) : minTime;
        const endTime = era.end ? parseDate(era.end) : maxTime;

        const startPercent = paddingPercent + ((startTime - minTime) / timeRange) * (100 - paddingPercent * 2);
        const endPercent = paddingPercent + ((endTime - minTime) / timeRange) * (100 - paddingPercent * 2);

        const segment = document.createElement('div');
        segment.className = 'timeline-segment';
        segment.style.left = `${startPercent}%`;
        segment.style.width = `${endPercent - startPercent}%`;
        segment.style.background = era.color;
        track.appendChild(segment);

        // Add era label at the start of colored segments
        if (era.label) {
            const label = document.createElement('div');
            label.className = 'timeline-era-label';
            label.style.left = `${startPercent}%`;
            label.style.color = era.color;
            label.textContent = era.label;
            track.appendChild(label);
        }
    });

    // Generate year labels
    const startYear = 2022;
    const endYear = new Date(maxTime).getFullYear();

    for (let year = startYear; year <= endYear; year++) {
        const yearTime = new Date(year, 0).getTime();
        const percent = paddingPercent + ((yearTime - minTime) / timeRange) * (100 - paddingPercent * 2);

        if (percent >= paddingPercent && percent <= 100 - paddingPercent) {
            const yearLabel = document.createElement('div');
            yearLabel.className = 'timeline-year';
            yearLabel.style.left = `${percent}%`;
            yearLabel.textContent = year;
            track.appendChild(yearLabel);
        }
    }

    // Calculate label positions with collision avoidance
    const labelData = modelsWithDates.map(model => {
        const percent = paddingPercent + ((model.timestamp - minTime) / timeRange) * (100 - paddingPercent * 2);
        return {
            model,
            percent: Math.max(paddingPercent, Math.min(100 - paddingPercent, percent)),
            width: model.name.length * 7,
            level: 0
        };
    });

    // Assign levels to avoid collisions
    const levels = [];
    labelData.forEach(item => {
        const estPos = (item.percent / 100) * 1200;
        const labelLeft = estPos - item.width / 2;
        const labelRight = estPos + item.width / 2;

        let assignedLevel = 0;
        for (let level = 0; level < 10; level++) {
            const levelItems = levels[level] || [];
            const hasCollision = levelItems.some(range =>
                !(labelRight < range.left - 8 || labelLeft > range.right + 8)
            );
            if (!hasCollision) {
                assignedLevel = level;
                break;
            }
            assignedLevel = level + 1;
        }

        item.level = assignedLevel;

        if (!levels[assignedLevel]) levels[assignedLevel] = [];
        levels[assignedLevel].push({ left: labelLeft, right: labelRight });
    });

    // Calculate track height
    const maxLevel = labelData.length > 0 ? Math.max(...labelData.map(d => d.level)) : 0;
    const baseHeight = 60;
    const levelHeight = 22;
    const trackHeight = baseHeight + (maxLevel + 1) * levelHeight + 40;
    track.style.minHeight = `${trackHeight}px`;

    // Render dots and labels
    labelData.forEach(item => {
        const { model, percent, level } = item;
        const stemHeight = 15 + level * levelHeight;
        const labelBottom = 48 + stemHeight;

        // Dot
        const dot = document.createElement('div');
        dot.className = 'timeline-dot';
        dot.style.left = `${percent}%`;
        dot.dataset.modelId = model.id;
        dot.addEventListener('click', () => openModal(model.id));
        dot.addEventListener('mouseenter', () => {
            document.querySelectorAll(`[data-model-id="${model.id}"]`).forEach(el => el.classList.add('active'));
        });
        dot.addEventListener('mouseleave', () => {
            document.querySelectorAll(`[data-model-id="${model.id}"]`).forEach(el => el.classList.remove('active'));
        });
        track.appendChild(dot);

        // Date popup
        const datePopup = document.createElement('div');
        datePopup.className = 'timeline-date-popup';
        datePopup.style.left = `${percent}%`;
        datePopup.textContent = model.dateStr;
        track.appendChild(datePopup);

        // Label
        const label = document.createElement('div');
        label.className = 'timeline-label';
        label.style.left = `${percent}%`;
        label.style.bottom = `${labelBottom}px`;
        label.textContent = model.name;
        label.dataset.modelId = model.id;
        label.addEventListener('click', () => openModal(model.id));
        label.addEventListener('mouseenter', () => {
            document.querySelectorAll(`[data-model-id="${model.id}"]`).forEach(el => el.classList.add('active'));
        });
        label.addEventListener('mouseleave', () => {
            document.querySelectorAll(`[data-model-id="${model.id}"]`).forEach(el => el.classList.remove('active'));
        });
        track.appendChild(label);
    });
}

// ============================================
// GLOSSARY TOOLTIPS
// ============================================

let tooltipElement = null;
let tooltipTimeout = null;
let hideTimeout = null;

function setupGlossaryTooltips() {
    // Create tooltip element
    tooltipElement = document.createElement('div');
    tooltipElement.className = 'glossary-tooltip';
    tooltipElement.innerHTML = '<div class="glossary-tooltip-term"></div><div class="glossary-tooltip-def"></div>';
    document.body.appendChild(tooltipElement);

    // Event delegation for glossary terms
    document.addEventListener('mouseenter', handleTermHover, true);
    document.addEventListener('mouseleave', handleTermLeave, true);

    // Keep tooltip visible when hovering over it
    tooltipElement.addEventListener('mouseenter', () => {
        clearTimeout(hideTimeout);
    });
    tooltipElement.addEventListener('mouseleave', () => {
        hideTooltip();
    });

    // Mobile: tap to show, tap elsewhere to hide
    document.addEventListener('click', (e) => {
        if (e.target.classList.contains('glossary-term')) {
            e.preventDefault();
            showTooltipForElement(e.target);
        } else if (!tooltipElement.contains(e.target)) {
            hideTooltip();
        }
    });
}

function handleTermHover(e) {
    if (!e.target.classList.contains('glossary-term')) return;

    clearTimeout(hideTimeout);
    clearTimeout(tooltipTimeout);

    tooltipTimeout = setTimeout(() => {
        showTooltipForElement(e.target);
    }, 200);
}

function handleTermLeave(e) {
    if (!e.target.classList.contains('glossary-term')) return;

    clearTimeout(tooltipTimeout);
    hideTimeout = setTimeout(() => {
        hideTooltip();
    }, 150);
}

function showTooltipForElement(element) {
    const term = element.dataset.glossaryTerm;
    const entry = glossary[term.toLowerCase()];
    if (!entry) return;

    tooltipElement.querySelector('.glossary-tooltip-term').textContent = entry.term;
    tooltipElement.querySelector('.glossary-tooltip-def').textContent = entry.definition;
    tooltipElement.classList.add('visible');

    // Position tooltip
    positionTooltip(element);
}

function positionTooltip(element) {
    const rect = element.getBoundingClientRect();
    const tooltipRect = tooltipElement.getBoundingClientRect();
    const padding = 8;

    let top, left;

    // Try to position above
    if (rect.top > tooltipRect.height + padding) {
        top = rect.top - tooltipRect.height - padding + window.scrollY;
    } else {
        // Position below
        top = rect.bottom + padding + window.scrollY;
    }

    // Center horizontally
    left = rect.left + (rect.width / 2) - (tooltipRect.width / 2);

    // Keep within viewport
    if (left < padding) {
        left = padding;
    } else if (left + tooltipRect.width > window.innerWidth - padding) {
        left = window.innerWidth - tooltipRect.width - padding;
    }

    tooltipElement.style.top = `${top}px`;
    tooltipElement.style.left = `${left}px`;
}

function hideTooltip() {
    tooltipElement.classList.remove('visible');
}

function processGlossaryTerms(container) {
    if (!container || Object.keys(glossary).length === 0) return;

    // Get all text-containing elements
    const walker = document.createTreeWalker(
        container,
        NodeFilter.SHOW_TEXT,
        {
            acceptNode: (node) => {
                // Skip if parent is already a glossary term or is a script/style
                const parent = node.parentElement;
                if (!parent) return NodeFilter.FILTER_REJECT;
                if (parent.classList.contains('glossary-term')) return NodeFilter.FILTER_REJECT;
                if (['SCRIPT', 'STYLE', 'TEXTAREA', 'INPUT'].includes(parent.tagName)) return NodeFilter.FILTER_REJECT;
                if (node.textContent.trim().length === 0) return NodeFilter.FILTER_REJECT;
                return NodeFilter.FILTER_ACCEPT;
            }
        }
    );

    const textNodes = [];
    let node;
    while (node = walker.nextNode()) {
        textNodes.push(node);
    }

    // Sort glossary terms by length (longest first) to avoid partial matches
    const sortedTerms = Object.keys(glossary).sort((a, b) => b.length - a.length);

    // Build regex pattern
    const pattern = sortedTerms.map(term => {
        const escaped = glossary[term].term.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
        return `\\b${escaped}\\b`;
    }).join('|');

    if (!pattern) return;

    const regex = new RegExp(`(${pattern})`, 'gi');

    // Process each text node
    textNodes.forEach(textNode => {
        const text = textNode.textContent;
        if (!regex.test(text)) return;

        // Reset regex
        regex.lastIndex = 0;

        const fragment = document.createDocumentFragment();
        let lastIndex = 0;
        let match;

        while ((match = regex.exec(text)) !== null) {
            // Add text before match
            if (match.index > lastIndex) {
                fragment.appendChild(document.createTextNode(text.slice(lastIndex, match.index)));
            }

            // Create glossary term span
            const span = document.createElement('span');
            span.className = 'glossary-term';
            span.dataset.glossaryTerm = match[0];
            span.textContent = match[0];
            fragment.appendChild(span);

            lastIndex = regex.lastIndex;
        }

        // Add remaining text
        if (lastIndex < text.length) {
            fragment.appendChild(document.createTextNode(text.slice(lastIndex)));
        }

        // Replace text node with fragment
        textNode.parentNode.replaceChild(fragment, textNode);
    });
}

// Process glossary in modal when opened
function processModalGlossary() {
    const modalContent = document.getElementById('modal-content');
    if (modalContent) {
        processGlossaryTerms(modalContent);
    }
}

// Initialize when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
} else {
    init();
}
