# danielmadii.github.io

Personal site of Daniel Madi. Plain static HTML, generated from JSON and Markdown by a small Node script and served by GitHub Pages straight from `main`.

## Edit content

| To add or change | Edit |
|---|---|
| Intro, links, "Currently", focus areas | `content/site.json` |
| Jobs, education, volunteering, languages | `content/experience.json` |
| A project | `content/projects.json`, plus an optional case study in `content/projects/<slug>.md` |
| A security finding | `content/security.json`, plus the write-up in `content/security/<slug>.md` |
| An article or tutorial | `content/publications.json` (an internal article needs a `body` Markdown file) |
| A certification or training | `content/certifications.json` |
| Expertise | `content/skills.json` |
| A dated update (also goes to the RSS feed) | `content/updates.json` |

Dates are `YYYY`, `YYYY-MM` or `YYYY-MM-DD`. Leave a field `null` to hide it: severity, credential IDs, verification links and badges only appear once they're filled in.

## Build

```sh
npm install        # once
npm run build      # validates content/ and regenerates the HTML, feed.xml and sitemap.xml
npm run serve      # preview at http://127.0.0.1:4000/
npm run cv:pdf     # rebuilds assets/cv/Daniel-Madi-CV.pdf from /cv/ with headless Chrome
```

Commit the generated files together with your content change. The build reports missing fields, unknown categories and bad dates before it writes anything, and `.generated.json` lets it remove pages you delete.
