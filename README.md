# Hydra

### AI-Powered Irrigation Telemetry & Municipal Command Platform

> Report instantly. Triage with AI. Protect the harvest.

---










## Problem Statement

> *Imagine a farmer stepping into their fields at dawn, only to find the main irrigation trench completely dry. A municipal pipe has ruptured upstream, spewing thousands of gallons of water across an access road. The water was released yesterday, but it never reached the crops. The farmer has no immediate way to alert the municipality, and the authorities remain entirely blind to an infrastructure failure that is actively destroying a season's harvest.*

This isolated incident is part of a massive, systemic failure with devastating cascading effects:

* **Massive Transit Loss:** Agriculture consumes roughly 80% of India's freshwater, yet **up to 50% is lost in transit** due to unmonitored canal breaches, seepage, and broken infrastructure ([FAO Aquastat](https://www.fao.org/aquastat/en/)).
* **Economic Threat:** Agriculture supports nearly half of India's workforce. According to government data, unchecked water mismanagement and scarcity threaten a **6% contraction in the national GDP by 2050** ([NITI Aayog](https://niti.gov.in/sites/default/files/2019-08/CWMI-2.0-latest.pdf)).
* **The Human Cost:** Delayed infrastructure repairs lead directly to localized crop failure and inescapable debt. The ultimate cost is measured in lives: according to the latest NCRB data, **10,546 people in the farm sector died by suicide in a single year—averaging one death every hour** ([Down To Earth](https://www.downtoearth.org.in/)). Behind every number is a family destroyed: a father who took loans for fertilizers, a mother who watched her crops die when the canal water never arrived, and a son who couldn't bear the debt after the monsoon failed.

<br>

###  The Core Problem

The crisis is not just a lack of water—it is a catastrophic lack of **ground-truth visibility**. 

There is a severe communication and telemetry gap between rural agricultural communities and municipal authorities. Because there is no accessible, real-time reporting pipeline, critical infrastructure repairs only happen long after the crops are already damaged and millions of gallons of water are lost.

---

## The Solution: Hydra

Hydra is a complete municipal telemetry platform designed to bridge the gap between rural farming communities and local water authorities. It turns every farmer with a phone into an active reporting node, transforming chaotic voice notes and text messages into actionable intelligence for municipal command teams.

<br>

### Why Hydra is Urgently Needed

When a pipe ruptures or a canal blocks, time is everything. Right now, farmers have to navigate slow bureaucracy or rely on word of mouth to get help. By the time an official hears about a failure, days have passed, millions of gallons of water are lost, and crops are already ruined. 

Hydra is needed because it removes all friction from reporting. It gives farmers an instant voice channel while giving municipal authorities the exact geospatial location and automated context they need to dispatch repair crews immediately.
---

### How Hydra Solves the Crisis

Hydra replaces blind spots with live visibility through a simple four step workflow:

1. **Eliminating Literacy and Language Barriers**
   Farmers do not need to fill out complex forms. They can simply tap a button and speak about the problem in their local language or Hinglish. Our voice to text engine transcribes their observation instantly.

2. **Automated AI Triage and Categorization**
   Raw reports pass through a local edge AI model that instantly categorizes the issue into standard categories like pipe bursts, canal blockages, water shortages, or contamination. This ensures urgent infrastructure failures are flagged without manual triage delays.

3. **Smart Geospatial Clustering**
   When fifty farmers report the same broken pipe, authorities do not need fifty separate notifications. Hydra groups all reports submitted within a 200 meter grid into a single incident cluster on an interactive map. This prevents dashboard spam and highlights the exact center of the problem.

4. **Executive Summaries for Fast Dispatch**
   Municipal leaders receive a brief executive summary for every incident cluster alongside thermal heatmaps. They can view site photos uploaded by farmers, verify the crisis, and authorize bulk resolution in a few clicks.

---

### What Hydra Delivers

* **For Farmers:** A fast, voice based hotline that ensures their broken irrigation channels are seen and fixed before crops die.
* **For Municipalities:** A single dashboard featuring thermal heatmaps, verified geotags, and structured incident cards for rapid field team dispatch.
* **For the Community:** Drastic reduction in transit water loss, protecting local food supplies and securing the economic livelihood of farming families.




## Tech Stack

| Layer | Technology | Role |
| :--- | :--- | :--- |
| **Frontend** | React + Vite | Core Web Application |
| **Styling** | Tailwind CSS | UI System & Dashboard Layout |
| **Geospatial Maps** | Leaflet & React Leaflet | Interactive Incident Map Layers |
| **Thermal Radar** | Leaflet.heat | Spatial Heatmap Overlays |
| **Voice Processing** | Web Speech API | Multilingual Audio Transcription |
| **Backend API** | FastAPI (Python) | Asynchronous Telemetry Pipelines |
| **Edge AI Engine** | Hugging Face Flan T5 | Local Report Triage & Categorization |
| **Database** | Supabase (PostgreSQL) | Telemetry & Incident Cluster Storage |
| **Security** | Supabase RLS | Database Row Level Security |
| **Media Storage** | Supabase Storage | Evidence Photo Asset Hosting |





## Completed Features

| Category | Feature | Status |
| :--- | :--- | :---: |
| **Community Reporting** | Multilingual Voice-to-Text (Web Speech API) | ✅ |
| **Community Reporting** | Manual Text Problem Reporting | ✅ |
| **Community Reporting** | Automatic GPS Geotagging | ✅ |
| **Community Reporting** | Photo Evidence File Uploads | ✅ |
| **GIS & Mapping** | Interactive Leaflet GIS Map | ✅ |
| **GIS & Mapping** | Dynamic Thermal Heatmap Layer (`Leaflet.heat`) | ✅ |
| **GIS & Mapping** | Dynamic Active vs Resolved Incident Filters | ✅ |
| **AI Engine** | Automated Issue Categorization (`google/flan-t5-small`) | ✅ |
| **AI Engine** | Zero-Latency Keyword Triage Engine | ✅ |
| **AI Engine** | Deterministic ~200m Grid Spatial Clustering | ✅ |
| **AI Engine** | Executive Command Summary Generation | ✅ |
| **Authority Console** | Passcode-Protected Admin Clearance Gate | ✅ |
| **Authority Console** | Expandable "Show More / Show Less" Text Toggles | ✅ |
| **Authority Console** | Evidence Photo Inspection Modals | ✅ |
| **Authority Console** | Bulk Incident Resolution Verification | ✅ |
| **Infrastructure** | Supabase PostgreSQL Integration & RLS Security | ✅ |
| **Infrastructure** | Asynchronous FastAPI Backend Services | ✅ |


## Platform User Journeys

```text
Hydra Platform User Journeys
│
├── Journey A: Farmer & Community User (Reporting Pipeline)
│   ├── Step 1: Access Dashboard & View Live Telemetry Metrics
│   ├── Step 2: Input Observation (Choose Mode)
│   │   ├── Voice Reporting: Browser Web Speech API (English / Hinglish)
│   │   ├── Text Manual Entry: Direct description typing
│   │   └── Optional Evidence Photo: File upload & secure storage
│   ├── Step 3: Capture Location (GPS Geotagging Latitude & Longitude)
│   └── Step 4: Broadcast Ground-Truth Report -> Supabase Database & Real-Time Feed
│
└── Journey B: Municipal Authority / Administrator (Command Console)
    ├── Step 1: Navigation to Authority Command Tab
    ├── Step 2: Secure Clearance Authentication (Passcode Gate)
    ├── Step 3: Spatial-Temporal Cluster View (~200m grid aggregation)
    ├── Step 4: AI Executive Brief Review (Flan-T5 / Template Synthesis)
    └── Step 5: Incident Resolution Workflow
        ├── Filter by Active vs. Resolved status
        ├── Authorize bulk resolution via password barrier
        └── Dynamic database update -> Instant removal from GIS maps & heatmaps


```
## 1. End-to-End Technical Flow

```text
[ Community User / Farmer ]
        │
        ├─► [1. Speech-to-Text] ────────► Browser Web Speech API (English / Hinglish Audio)
        │         │
        │         ▼
        ├─► [2. Text Classification] ───► FastAPI Backend ──► Hugging Face Flan-T5-Small
        │         │                                                   │
        │         ▼                                                   ▼
        │     [ Supabase DB ] ◄────────────────────────────── Assigned Category Tag
        │         │
        │         ▼
        ├─► [3. Spatial Clustering] ───► Geotag Analysis (~200m Radius + Issue Type Grouping)
        │         │
        │         ▼
        └─► [4. Incident Summarization] ─► Municipal Template Synthesizer (Executive Command Brief)
                                                                      │
                                                                      ▼
                                                        [ Authority Command Center ]



```
## AI Core Engine Architecture

```text
Hydra AI Core Engine
│
├── 1. Voice Ingestion & Transcription Layer
│   └── Component: Browser Web Speech API
│       ├── Input: Multi-lingual voice observations (English, Hinglish, Local Phrasing)
│       └── Output: Raw timestamped transcript text
│
├── 2. Edge Text Classification Pipeline
│   └── Component: Hugging Face Transformers (`google/flan-t5-small`)
│       ├── Hybrid Execution: Zero-latency heuristic keyword matching + Flan-T5 prompt inference
│       └── Output Categories: PIPE_BURST | CANAL_BLOCK | WATER_SHORTAGE | CONTAMINATION
│
├── 3. Deterministic Spatial-Temporal Clustering
│   └── Component: Geocoding & Grid Aggregator Engine
│       ├── Inputs: Latitude, Longitude, Issue Category, Timestamp
│       ├── Processing: Coordinate rounding (~200-meter grid resolution)
│       └── Output: Unified municipal incident cluster cards
│
└── 4. Automated Incident Summarization
    └── Component: Template-Based Municipal Synthesizer
        ├── Inputs: Clustered description arrays & category types
        ├── Processing: Extraction of critical infrastructure impact vectors
        └── Output: Concise executive briefs for municipal intervention





```
##  Project Structure

```text
Hydra/
├── backend/
│   ├── .env
│   ├── main.py             # FastAPI server with triage & synthesis routes
│   └── requirements.txt    # Python package dependencies
├── frontend/
│   ├── src/
│   │   ├── components/     # HeatmapLayer, MapView, ReportForm
│   │   ├── pages/          # AdminDashboard, AiTriageFeed, IncidentsMap
│   │   ├── services/       # Supabase client config
│   │   ├── App.jsx         # Main navigation & dashboard layout
│   │   └── main.jsx
│   ├── public/
│   └── package.json
└── README.md





```
##  Platform Impact

###  For Farming Communities (Livelihood & Accessibility)
* **Zero-Barrier Reporting:** Voice-to-text integration allows farmers to report critical infrastructure failures instantly in their local language or Hinglish, bypassing literacy and bureaucratic hurdles.
* **Crop & Income Preservation:** Closing the communication gap accelerates repair times, directly preventing seasonal harvest loss and mitigating the severe cycle of debt in the agricultural sector.
* **Empowered Ground-Truth:** Transforms isolated farmers into active, real-time telemetry nodes who have a direct line to municipal command.

###  For Municipal Authorities (Governance & Operations)
* **Precision Dispatch:** Spatial grid clustering (~200m) completely eliminates duplicate reports and dashboard spam, allowing authorities to dispatch repair crews to the exact epicenter of a structural failure.
* **AI-Triaged Prioritization:** The Edge-AI engine automatically classifies raw audio and text into actionable categories (e.g., `PIPE_BURST`, `CANAL_BLOCK`), ensuring catastrophic water losses are flagged immediately.
* **Resource Optimization:** Replaces chaotic, word-of-mouth incident management with a structured, verified, and map-driven executive command dashboard.

###  For Society & the Environment (Transparency & Conservation)
* **Combating Transit Loss:** Directly targets and reduces the massive 50% agricultural water transit loss by shrinking the timeline between a pipeline rupture and municipal awareness.
* **Systemic Transparency:** Immutable database logging creates a verifiable paper trail of active versus resolved issues, holding local governance accountable to repair timelines.
* **Food & Economic Security:** Securing irrigation water stabilizes local food supplies, protecting the agricultural foundation of the regional and national economy.




## Team Glitch

| Developer | Core Responsibilities | Connect |
| :--- | :--- | :--- |
| **Chongtham Allen** | Backend API, Edge-AI Engine & Database Architecture | [GitHub](https://github.com/Allenchongtham) \| [LinkedIn](https://www.linkedin.com/in/chongtham-allen-7057303b5) |
| **James Khuraijam** | Frontend Development, UI/UX & Client Integration | [GitHub](https://github.com/jameskhuraijam63-dotcom) \| [LinkedIn](https://www.linkedin.com/in/james-khuraijam-8953813ab) |
