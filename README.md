# Robot Foundation Models

A visual tracker for the evolution of embodied AI and robot foundation models, from LLM planners to VLAs to the emerging VAM paradigm.

## Features

- **Architecture Evolution** — Visual diagrams explaining the three major paradigms: LLM Planners, Vision-Language-Action models (VLAs), and Video-Action Models (VAMs)
- **Interactive Timeline** — Color-coded timeline showing the progression of models across eras
- **Filterable Grid** — Browse models by organization, type, or search
- **Detailed Modal Views** — Specs, data profiles, performance benchmarks, and links for each model
- **Glossary Tooltips** — Hover over technical terms to see definitions

## Tech Stack

- Vanilla HTML/CSS/JavaScript (no framework)
- Google Sheets as the data backend (read-only)
- ES6 modules

## Data Source

Model data is pulled live from a public Google Sheet using the Visualization API. The sheet contains:
- Model metadata (name, org, date, category)
- Technical specs (backbone, params, decoder, speed)
- Data profile (training hours, episodes, datasets)
- Performance benchmarks
- Links to papers, code, and blogs

A separate sheet tab provides glossary definitions for technical terms.

## Local Development

No build step required. Just serve the files:

```bash
# Using Python
python -m http.server 8000

# Using Node
npx serve .
```

Then open `http://localhost:8000`

## Project Structure

```
├── index.html          # Main HTML structure
├── css/
│   └── styles.css      # All styles
└── js/
    ├── app.js          # Main application logic
    ├── config.js       # Google Sheets config & column mapping
    └── data.js         # Data loading & parsing
```

## Contributing

To add or update model data, edit the [Google Sheet](https://docs.google.com/spreadsheets/d/1bXBH0CipQMYT14OC_YD0rQHEbtQm3xx7sTqbcHvMg9A) directly. Changes appear on the site immediately.

For code changes, submit a PR.

## License

MIT
