# Ambedkar Heritage Hub

### AI-Powered Digital Heritage Archive & Interactive Kiosk

Ambedkar Heritage Hub is an interactive digital heritage platform designed to make historical documents, manuscripts, writings, speeches, photographs, and archival resources accessible through a modern touchscreen kiosk experience.

The platform connects **physical heritage exhibits with a digital, searchable and multilingual archive**.

---

## 🎯 Vision

Preserve and make important historical heritage more accessible by connecting physical archival exhibits with a digital knowledge platform.

A visitor can:

```text
Physical Heritage Document
        ↓
     Scan QR
        ↓
Digital Archive
        ↓
      OCR
        ↓
Extracted Text
        ↓
 Select Language
        ↓
Translated Content
        ↓
Explore / Ask the Archive
```

---

## ✨ Features

### 🖥️ Interactive Heritage Kiosk

A large-screen, touch-friendly interface designed for museums, institutions and heritage centers.

Visitors can:

* Explore the digital archive
* Search historical records
* View manuscripts and documents
* Explore the historical timeline
* Access multilingual content
* Access physical exhibits through QR codes

---

### 📚 Digital Heritage Archive

The archive provides a structured interface for exploring:

* Manuscripts
* Books & writings
* Speeches
* Photographs
* Historical documents
* Archival records

Users can search and filter the collection and open individual records for detailed viewing.

---

### 📱 QR-Based Heritage Access

Physical documents and museum exhibits can contain a QR code.

Visitors scan the QR code to directly access the corresponding digital archive record.

```text
Physical Exhibit
      ↓
   QR Code
      ↓
Digital Archive Record
      ↓
Document Viewer
```

This creates a connection between the **physical heritage experience and the digital archive**.

---

### 🔍 OCR Document Digitization

The platform demonstrates how archival documents can be converted into searchable digital text.

```text
Document
   ↓
QR Access
   ↓
Document Image
   ↓
OCR Processing
   ↓
Extracted Text
```

The document viewer provides:

* Original document
* Extracted text
* Metadata
* Document information

> OCR processing is currently simulated in the prototype.

---

### 🌐 Multilingual Heritage Access

The platform supports multilingual exploration.

Supported languages:

* English
* Hindi
* Tamil
* Marathi

Users can switch languages while navigating the platform and exploring archival content.

The interface distinguishes between:

* Original text
* Translated content
* Sample/demo content

---

### 🤖 Ask the Archive

Ask the archive questions using natural language.

Example queries:

> “Show documents related to the Constitution.”

> “What documents are available on education?”

> “Find speeches related to social equality.”

The interface provides:

* AI-style responses
* Relevant archive records
* Supporting sources

The current prototype uses simulated responses and does not require an external AI API.

---

### 🕰️ Interactive Heritage Timeline

Explore important historical milestones through a visual timeline.

Each entry includes:

* Year
* Event
* Description
* Related archival material

---

## 🧩 Platform Flow

```text
                    AMBEDKAR
                 HERITAGE HUB
                       │
                       ▼
              INTERACTIVE KIOSK
                       │
        ┌──────────────┼──────────────┐
        ▼              ▼              ▼
     ARCHIVE         QR ACCESS       TIMELINE
        │              │
        │              ▼
        │          DOCUMENT
        │              │
        │             OCR
        │              │
        └──────────────┤
                       ▼
                MULTILINGUAL
                   ACCESS
                       │
                       ▼
                ASK THE ARCHIVE
```

---

## 🛠️ Technology Stack

### Frontend

* React
* TypeScript
* Vite
* Tailwind CSS
* React Router
* Lucide React
* Framer Motion

### Prototype Data

The current prototype uses:

* Local mock data
* Local assets
* Simulated OCR
* Simulated AI responses
* Client-side search and filtering

No external API keys are required.

---

## 📁 Project Structure

```text
ambedkar-heritage-hub/
│
├── src/
│   ├── components/
│   ├── pages/
│   ├── data/
│   ├── assets/
│   ├── hooks/
│   ├── types/
│   ├── App.tsx
│   └── main.tsx
│
├── public/
│
├── package.json
├── vite.config.ts
├── tailwind.config.js
└── README.md
```

---

## 🚀 Getting Started

### 1. Clone the repository

```bash
git clone <repository-url>
cd ambedkar-heritage-hub
```

### 2. Install dependencies

```bash
npm install
```

### 3. Start the development server

```bash
npm run dev
```

### 4. Open the application

Open the local URL provided by Vite in your browser.

---

## 🎬 Recommended Demo Flow

### 01 — Kiosk

Open the Ambedkar Heritage Hub kiosk.

### 02 — Archive

Explore the Digital Archive and search for a document.

### 03 — Document

Open an archival record and explore its metadata and text.

### 04 — QR Access

Scan or open a QR code associated with a physical heritage document.

### 05 — OCR

Show the original document and its extracted text.

### 06 — Multilingual

Switch the language and demonstrate translated content.

### 07 — Ask the Archive

Ask a question and explore the relevant archival records.

### 08 — Timeline

Finish with the interactive heritage timeline.

---

## 🎯 Current Prototype Scope

| Capability               | Status       |
| ------------------------ | ------------ |
| Interactive Kiosk        | ✅            |
| Digital Archive          | ✅            |
| Search & Filtering       | ✅            |
| Document Viewer          | ✅            |
| QR-Based Access          | ✅            |
| OCR Experience           | 🟡 Simulated |
| Multilingual Interface   | ✅            |
| Translation Experience   | 🟡 Prototype |
| Ask the Archive          | 🟡 Simulated |
| Historical Timeline      | ✅            |
| Real AI Backend          | ❌            |
| Production Database      | ❌            |
| Real Scanner Integration | ❌            |
| Hardware Integration     | ❌            |

---

## 🔮 Future Development

The platform can later evolve with:

* Real OCR pipelines
* Multilingual translation models
* Retrieval-Augmented Generation (RAG)
* Local AI inference
* Real document scanners
* Edge computing
* Institutional databases
* Digital preservation standards
* Multi-kiosk synchronization
* Archivist/admin portal
* Analytics
* Offline-first synchronization

---

## ⚠️ Prototype Disclaimer

This repository represents a demonstration prototype.

Some AI, OCR, translation and hardware interactions are simulated to demonstrate the intended user experience.

Historical content should be verified against authoritative archival sources before production deployment.

---

## 🏛️ Core Concept

> **Connecting physical heritage exhibits with an intelligent, multilingual digital archive through QR-based access and OCR-powered digitization.**
