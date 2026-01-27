// ============================================
// DATA LOADING
// ============================================

import { CONFIG } from './config.js';

export let allModels = [];

export async function loadData() {
    try {
        const url = `https://docs.google.com/spreadsheets/d/${CONFIG.GOOGLE_SHEET_ID}/gviz/tq?tqx=out:json&sheet=${encodeURIComponent(CONFIG.SHEET_NAME)}`;
        const response = await fetch(url);
        const text = await response.text();
        
        // Parse the JSONP response - Google wraps it in a callback
        const jsonString = text.match(/google\.visualization\.Query\.setResponse\(([\s\S]*)\);?/);
        if (!jsonString) {
            throw new Error('Could not parse Google Sheets response');
        }
        
        const json = JSON.parse(jsonString[1]);
        const rows = json.table.rows;
        const cols = CONFIG.COLUMNS;
        
        // Map rows to objects (Google Sheets API doesn't include header in rows array)
        allModels = rows.map((row, index) => {
            const cells = row.c || [];
            return {
                id: cells[cols.id]?.v || index + 1,
                name: cells[cols.name]?.v || '',
                org: cells[cols.org]?.v || '',
                date: cells[cols.date]?.v || '',
                category: cells[cols.category]?.v || '',
                opensource: cells[cols.opensource]?.v || '',
                backbone: cells[cols.backbone]?.v || '',
                params: cells[cols.params]?.v || '',
                decoder: cells[cols.decoder]?.v || '',
                speed: cells[cols.speed]?.v || '',
                about: cells[cols.about]?.v || '',
                robot_hours: cells[cols.robot_hours]?.v || '',
                robot_episodes: cells[cols.robot_episodes]?.v || '',
                video_hours: cells[cols.video_hours]?.v || '',
                num_embodiments: cells[cols.num_embodiments]?.v || '',
                num_tasks: cells[cols.num_tasks]?.v || '',
                data_sources: cells[cols.data_sources]?.v || '',
                action_labeled_pct: cells[cols.action_labeled_pct]?.v || '',
                real_sim_ratio: cells[cols.real_sim_ratio]?.v || '',
                data_availability: cells[cols.data_availability]?.v || '',
                collection_methods: cells[cols.collection_methods]?.v || '',
                data_notes: cells[cols.data_notes]?.v || '',
                perf_headline: cells[cols.perf_headline]?.v || '',
                perf_benchmarks: cells[cols.perf_benchmarks]?.v || '',
                perf_comparisons: cells[cols.perf_comparisons]?.v || '',
                perf_source: cells[cols.perf_source]?.v || '',
                insight: cells[cols.insight]?.v || '',
                paper_link: cells[cols.paper_link]?.v || '',
                blog_link: cells[cols.blog_link]?.v || '',
                github_link: cells[cols.github_link]?.v || ''
            };
        }).filter(m => m.name); // Filter out empty rows
        
        console.log(`Loaded ${allModels.length} models from Google Sheets`);
        return allModels;
        
    } catch (error) {
        console.error('Error loading from Google Sheets:', error);
        throw error;
    }
}

export function getModelById(id) {
    return allModels.find(m => m.id == id);
}

// Glossary data
export let glossary = {};

export async function loadGlossary() {
    try {
        const url = 'https://docs.google.com/spreadsheets/d/1bXBH0CipQMYT14OC_YD0rQHEbtQm3xx7sTqbcHvMg9A/export?format=csv&gid=1096744885';
        const response = await fetch(url);
        const text = await response.text();

        // Parse CSV (simple parser for two-column CSV)
        const lines = text.split('\n');

        // Skip header row
        for (let i = 1; i < lines.length; i++) {
            const line = lines[i].trim();
            if (!line) continue;

            // Handle CSV with potential quoted fields
            let term, definition;
            if (line.startsWith('"')) {
                // First field is quoted
                const match = line.match(/^"([^"]*(?:""[^"]*)*)"\s*,\s*"?([^"]*(?:""[^"]*)*)"?$/);
                if (match) {
                    term = match[1].replace(/""/g, '"');
                    definition = match[2].replace(/""/g, '"');
                }
            } else {
                // Simple split
                const commaIndex = line.indexOf(',');
                if (commaIndex > 0) {
                    term = line.substring(0, commaIndex).trim();
                    definition = line.substring(commaIndex + 1).trim();
                    // Remove surrounding quotes if present
                    if (definition.startsWith('"') && definition.endsWith('"')) {
                        definition = definition.slice(1, -1).replace(/""/g, '"');
                    }
                }
            }

            if (term && definition) {
                glossary[term.toLowerCase()] = { term, definition };
            }
        }

        console.log(`Loaded ${Object.keys(glossary).length} glossary terms`);
        return glossary;
    } catch (error) {
        console.error('Error loading glossary:', error);
        return {};
    }
}

export function getStats() {
    const orgs = new Set(allModels.map(m => m.org));
    const dates = allModels.map(m => m.date).filter(d => d);
    
    let dateRange = '—';
    if (dates.length > 0) {
        const years = dates.map(d => {
            const parts = d.split(' ');
            return parts[1] || d.slice(-4);
        }).filter(y => y && !isNaN(parseInt(y)));
        
        if (years.length > 0) {
            const minYear = Math.min(...years.map(y => parseInt(y)));
            const maxYear = Math.max(...years.map(y => parseInt(y)));
            dateRange = minYear === maxYear ? `${minYear}` : `${minYear}–${maxYear}`;
        }
    }
    
    return {
        totalModels: allModels.length,
        totalOrgs: orgs.size,
        dateRange
    };
}
