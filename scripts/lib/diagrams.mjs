import { html } from "./html.mjs";

const box = (x, y, w, h, title, lines = [], cls = "") => html`
  <g class="dg-box ${cls}">
    <rect x="${x}" y="${y}" width="${w}" height="${h}" rx="2"/>
    <text x="${x + 12}" y="${y + 21}" class="dg-title">${title}</text>
    ${lines.map((line, i) => html`<text x="${x + 12}" y="${y + 39 + i * 16}" class="dg-text">${line}</text>`)}
  </g>`;

const chip = (x, y, w, label) => html`
  <g class="dg-chip">
    <rect x="${x}" y="${y}" width="${w}" height="30" rx="2"/>
    <text x="${x + w / 2}" y="${y + 19.5}" text-anchor="middle" class="dg-text">${label}</text>
  </g>`;

const path = (d, cls = "") => html`<path d="${d}" class="dg-line ${cls}" marker-end="url(#dg-arrow)"/>`;
const line = (d) => html`<path d="${d}" class="dg-line"/>`;

const halaDiagram = () => {
  const channels = ["Phone", "Web voice", "WhatsApp", "Instagram", "Facebook", "Web chat"];
  const w = 94;
  const gap = (640 - channels.length * w) / (channels.length - 1);
  const cx = (i) => i * (w + gap) + w / 2;
  return html`
<figure class="diagram" id="architecture-diagram">
  <div class="diagram-scroll">
  <svg viewBox="0 0 640 434" role="img" aria-labelledby="hala-dg-title hala-dg-desc" class="dg">
    <title id="hala-dg-title">Hala AI system overview</title>
    <desc id="hala-dg-desc">Phone and web voice enter a voice path of speech-to-text, LLM and text-to-speech. WhatsApp, Instagram, Facebook and web chat enter a text path. Both reach an agent that uses LLM function calling to read and write business systems: CRMs, Airtable, Excel and calendars. The agent feeds a shared inbox for human review and takeover, and records of transcripts, summaries, audit logs and usage metering. Everything except the channels and business systems sits inside an isolated tenant workspace with encrypted credentials.</desc>
    <defs>
      <marker id="dg-arrow" viewBox="0 0 8 8" refX="7" refY="4" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
        <path d="M0 0 L8 4 L0 8 z" class="dg-arrowhead"/>
      </marker>
    </defs>
    ${channels.map((c, i) => chip(i * (w + gap), 0, w, c))}
    ${line(`M${cx(0)} 30 V54 M${cx(1)} 30 V54 M${cx(0)} 54 H${cx(1)}`)}
    ${line(`M${cx(2)} 30 V54 M${cx(3)} 30 V54 M${cx(4)} 30 V54 M${cx(5)} 30 V54 M${cx(2)} 54 H${cx(5)}`)}
    <rect x="0.5" y="74" width="469" height="356" rx="2" class="dg-boundary"/>
    <text x="16" y="416" class="dg-label">Tenant workspace: isolated, with encrypted credentials</text>
    ${path(`M121 54 V114`)}
    ${path(`M${(cx(2) + cx(5)) / 2} 54 V80 H349 V114`)}
    ${box(16, 114, 210, 62, "Voice path", ["Speech-to-text, LLM, text-to-speech"])}
    ${box(244, 114, 210, 62, "Text path", ["Messages go to the agent"])}
    ${path(`M121 176 V193 H200 V212`)}
    ${path(`M349 176 V193 H270 V212`)}
    ${box(95, 212, 280, 62, "Agent", ["LLM with function calling"], "dg-strong")}
    <path d="M375 243 H488" class="dg-line" marker-start="url(#dg-arrow)" marker-end="url(#dg-arrow)"/>
    <text x="431" y="235" text-anchor="middle" class="dg-small">reads, writes</text>
    ${box(490, 188, 150, 110, "Business systems", ["CRMs: Zoho, Odoo", "Airtable, Excel", "Google Calendar,", "Outlook, Calendly"])}
    ${line(`M235 274 V292 M121 292 H349`)}
    ${path(`M121 292 V312`)}
    ${path(`M349 292 V312`)}
    ${box(16, 312, 210, 78, "Shared inbox", ["Review, approve, take over,", "hand back to the agent"])}
    ${box(244, 312, 210, 78, "Records", ["Transcripts and summaries,", "audit logs, usage metering"])}
  </svg>
  </div>
  <figcaption>System overview, drawn from the platform's documented components. Channels and business systems sit outside the tenant workspace.</figcaption>
</figure>`;
};

export const blocks = () => ({ "diagram:hala": halaDiagram() });
