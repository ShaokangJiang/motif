# Motif project website

A one-page static research site closely following the visual layout of [Agentic CLEAR](https://ibm.github.io/CLEAR/): centered project title and resource links, blue accents, a short abstract, alternating white and pale gray sections, full-width figures, and simple result tables.

## Preview

Open `index.html` directly, or run from this folder:

```sh
python3 -m http.server 4173 --bind 127.0.0.1
```

Visit <http://127.0.0.1:4173/>. There is no build step or package installation. The YouTube player and Google Fonts require internet access; all report figures are local, and system fonts provide a fallback. Content remains readable without JavaScript.

## Publishing

The Paper button links to [arXiv:2607.10531](https://arxiv.org/abs/2607.10531), the earlier paper titled “Motif: Discovering and Automating Personal Web Workflows.” The current page retains the latest manuscript's title, authors, and study content. Add the public repository URL in `site-config.js` when available; Code remains marked “soon.” Verify manuscript details against the final publication.

Upload the contents of this folder to a static host. All local URLs are relative, so it also works under a repository subpath. For GitHub Pages, copy the folder contents to the root of a dedicated repository and configure Pages to serve that branch's root. `.nojekyll` bypasses Jekyll. No website has been deployed by this task.

## Files

- `index.html`: title, video, pipeline, interface, both studies, and reference.
- `styles.css`: small stylesheet matching the CLEAR layout.
- `script.js`: optional reference copying and configured resource URLs.
- `charts.js`: interactive SVG charts with hover, touch, keyboard inspection, and legend toggles. Details float beside the cursor, on whichever side keeps them over the chart, and below or above it on narrow screens.
- `study-data.js`: locally bundled numeric chart data; no network requests or private study records.
- `site-config.js`: public paper and repository links.
- `assets/`: report figures, PDF downloads, and favicon.

## CLEAR reference and template

The public CLEAR homepage uses **Bulma 0.9.4** plus custom CSS, Google Sans/Noto Sans, and icon fonts. Its HTML does not credit a named standalone academic template. Its own source is the closest reference:

- [Homepage source, project_page branch](https://github.com/IBM/CLEAR/blob/project_page/docs/index.html)
- [Bulma](https://bulma.io/)

This Motif page uses a small standalone stylesheet to reproduce the layout without a CSS framework dependency. It uses the same Google Fonts families. It does not copy CLEAR's research content or assign a new project license.

## Report figures

The procedure/pipeline is taken from `../report/figures/pipeline.pdf`, the older report. That file is byte-identical to the pipeline PDF in the latest manuscript. It is rendered with blank margins removed as `assets/pipeline.webp`, and its original PDF is provided alongside it.

The Behavior-Grounded Specification section sits between the Abstract and Video. It uses the original conceptual teaser from `../newReport/CHI27-MOTIF/figures/teaser.pdf`, with blank margins removed in `assets/teaser.webp`; the original PDF is linked as `assets/behavior-grounded-specification.pdf`. The teaser and pipeline use transparent CSS backgrounds and multiply compositing so the white paper in the original artwork blends into the section background without changing labels or diagram geometry. No generative image editing is used.

The interface figure is `../newReport/CHI27-MOTIF/figures/interface.pdf`, rendered as `assets/interface.webp` with the original PDF available for full-size viewing. Other existing asset files are retained but are not needed by the simplified layout.

## Results and reporting

Text and result values come from the latest manuscript, `../newReport/CHI27-MOTIF/`, especially its `study1.tex`, `study2-v2.tex`, and `motif-system-v2.tex` sections. Study 1 reproduces the paper's original two-condition table, including its grouped Functionality and Pattern Fidelity columns. Study 2 recreates the paper's `survey.pdf` and `post-study-survey.pdf` as compact, interactive SVG charts on the section's existing background. The original PDFs remain linked, and WebP images provide a no-JavaScript fallback.

Participant-chart values match the plotted manuscript figure; bars were verified against the original PDF vector geometry. This includes two working grounded programs for P3 as plotted, rather than substituting a different count from the global summary CSV. Survey box plots use the eight ratings per condition in `../supplemental/supplemental/Study2-survey_comparison.csv`, with linear quartiles, 1.5-IQR whiskers, and hidden outliers, matching `../Study/analysis/draw.ipynb`. Tooltips expose the exact summary statistics and anonymized ratings. Only the needed numeric values and question text are bundled with the website.

- Study 1 reports working 42/21, not working 58/79, goal-only 85/66, invented 6/16, and missing 9/18 (behavior-grounded/description-only). Each condition has 100 programs.
- Study 2 includes eight completing participants and five program reviews each. The 17-versus-9 comparison covers only the 29 testable programs; grounded outcomes came from participant ratings.
- The manuscript's “4.75/5” figure caption is ambiguous relative to the prose about numbers of reviewed matching patterns. The site uses the explicit finding that all eight participants agreed at least four of five reviewed patterns matched their routines.
- Browsing is described as “multi-day” because the procedure and participant table give slightly different duration ranges.
- No publication venue, acceptance status, statistical significance, or long-term adoption claim is invented. The reference is marked as a research manuscript.
