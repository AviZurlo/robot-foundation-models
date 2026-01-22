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
        
        // Skip header row (index 0), map remaining rows to objects
        allModels = rows.slice(1).map((row, index) => {
            const cells = row.c || [];
            return {
                id: cells[cols.id]?.v || index + 1,
                name: cells[cols.name]?.v || '',
                org: cells[cols.org]?.v || '',
                date: cells[cols.date]?.v || '',
                category: cells[cols.category]?.v || '',
                backbone: cells[cols.backbone]?.v || '',
                params: cells[cols.params]?.v || '',
                decoder: cells[cols.decoder]?.v || '',
                speed: cells[cols.speed]?.v || '',
                data: cells[cols.data]?.v || '',
                insight: cells[cols.insight]?.v || '',
                paper_link: cells[cols.paper_link]?.v || '',
                website_link: cells[cols.website_link]?.v || '',
                github_link: cells[cols.github_link]?.v || '',
                blog_link: cells[cols.blog_link]?.v || ''
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
