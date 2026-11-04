## Overview

Hala AI handles a business's inbound conversations. Its agents answer phone calls and messages on WhatsApp, Instagram, Facebook and web chat, qualify leads, answer repetitive questions, route intent, and book appointments or capture orders. Staff work from one inbox across every channel. The platform is built in Lebanon for businesses across the Middle East, so it speaks Lebanese Arabic, Modern Standard Arabic and English, among more than 20 languages and Arabic dialects.

I co-founded Meta Empires, which builds Hala, and I lead its engineering.

## Problem

Customer operations at many businesses are slow and fragmented. Inquiries arrive on several channels at all hours, replies come late, and leads go cold before anyone books them. Hala's goal is to reduce response latency and raise conversion by answering every inquiry immediately, in the customer's language, and acting on it directly in the business's own systems.

## Architecture

{{diagram:hala}}

Each conversation enters through a channel adapter. Voice calls go through a real-time speech path; text messages go straight to the agent. The agent runs on an LLM with function calling, so it can read and write the business's CRM and calendar while the conversation is still going. Every tenant is an isolated workspace with its own encrypted credentials, and usage is metered for billing.

## Engineering approach {#engineering}

**Voice pipeline.** A low-latency pipeline in Python and FastAPI handles real-time LLM interaction, with a dialect-aware speech-to-text and text-to-speech path that supports 20+ languages and native Arabic dialects.

**Agents that act.** The agent uses LLM function calling to book appointments and to read and write CRM records mid-conversation, across calendar and CRM integrations. The product connects to CRMs such as Zoho and Odoo, to Excel and Airtable as data sources, and to Google Calendar, Outlook and Calendly.

**Multi-tenancy.** The TypeScript and Python codebase isolates each business at the workspace level, encrypts tenant credentials, and meters usage for billing per conversation and per calling minute.

**Human oversight.** Staff can review AI replies, approve or edit them, take over a conversation, escalate it, and hand it back. Every interaction is logged with a transcript and a summary.

**Security.** Role-based access control, encrypted data and audit-ready logs. Customer data is not used to train models.

## Design constraints

| Constraint | How the design addresses it |
|---|---|
| Voice has to feel like a conversation | A low-latency pipeline with real-time LLM interaction |
| Customers speak many languages and Arabic dialects | A dialect-aware speech-to-text and text-to-speech path covering 20+ languages |
| Many businesses share one platform | Workspace-level isolation and encrypted per-tenant credentials |
| AI actions need human oversight | Review, approval, takeover and hand-back in a shared inbox, with audit logs |
| Pricing follows usage | Metering per conversation and per calling minute |

## Links

- Live product: [tryhala.ai](https://tryhala.ai)
- This website embeds the Hala web widget.
