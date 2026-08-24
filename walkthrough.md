# AegisNet Patient Portal Walkthrough

We have successfully built and compiled the professional, production-style Patient Portal for the **"Privacy-Preserving Predictive AIoT Emergency Detection and Community Care Platform"**.

## Changes Implemented

### 1. Robust Database Fallback & REST API
- Created [mongodb.py](file:///c:/Users/ARJUN/OneDrive/Desktop/CareTaker/app/database/mongodb.py) providing dynamic MongoDB fallback to local JSON storage files when MongoDB is unavailable, ensuring 100% uptime for demo showcases.
- Modified [main.py](file:///c:/Users/ARJUN/OneDrive/Desktop/CareTaker/app/main.py) to implement registration endpoints, login credential checks, real-time vital telemetry streams, prescriptions lists, medication adherence logs, and the **AI Care Assistant** endpoint.
- Integrated `openpyxl` spreadsheet compiling inside [main.py](file:///c:/Users/ARJUN/OneDrive/Desktop/CareTaker/app/main.py#L650-L759) to build and return formatted Excel health records complete with styling columns on request.

### 2. Vite + React + TypeScript + Tailwind v4 Frontend SPA
- Initialized a modular React TS framework under the [frontend/](file:///c:/Users/ARJUN/OneDrive/Desktop/CareTaker/frontend/) folder.
- Configured Vite to output bundles to the backend [app/static/](file:///c:/Users/ARJUN/OneDrive/Desktop/CareTaker/app/static/) directory automatically on compile.
- Configured Tailwind v4 with the `@tailwindcss/postcss` plugin to build premium dark medical themes.
- Established clean, reusable Hooks to manage state:
  - [`usePatient`](file:///c:/Users/ARJUN/OneDrive/Desktop/CareTaker/frontend/src/hooks/usePatient.ts): loads profiles and demographic values.
  - [`useVitals`](file:///c:/Users/ARJUN/OneDrive/Desktop/CareTaker/frontend/src/hooks/useVitals.ts): subscribes to WebSockets to render scrolling charts.
  - [`useRisk`](file:///c:/Users/ARJUN/OneDrive/Desktop/CareTaker/frontend/src/hooks/useRisk.ts): parses AI risk score forecasts and explainability reasons.
  - [`useEmergency`](file:///c:/Users/ARJUN/OneDrive/Desktop/CareTaker/frontend/src/hooks/useEmergency.ts): controls SOS dispatches and tracks volunteer matches.
  - [`usePrescriptions`](file:///c:/Users/ARJUN/OneDrive/Desktop/CareTaker/frontend/src/hooks/usePrescriptions.ts): logs morning/afternoon/night medicine checkboxes.
  - [`usePrivacy`](file:///c:/Users/ARJUN/OneDrive/Desktop/CareTaker/frontend/src/hooks/usePrivacy.ts): saves sharing consents.
  - [`useReports`](file:///c:/Users/ARJUN/OneDrive/Desktop/CareTaker/frontend/src/hooks/useReports.ts): compiles Excel binary streams.

### 3. Professional UI Screens & Safety Guardrails
- **Registration Flow**: A 5-step registration wizard calculating age from DOB, BMI from body statistics, scanning gateways, and selecting consent sharing policies.
- **Accident-Proof SOS Button**: A floating red panic trigger. Requires a **3-second press-and-hold action** with a visual radial loader and audio click confirmation, redirecting directly to the active emergency dispatch center on trigger.
- **AI Care Assistant Chatbot**: Context-aware chatbot. Prompts critical advisories on emergency keywords ("chest pain") and strictly blocks dosage adjustments on change keywords ("stop amlodipine"), prompting users to contact their doctor.
- **Demo Mode Presentation Controller**: A floating controller banner on the dashboard allowing judges to simulate falls, volunteer acceptances, and resolution loops in real-time on the live server.

## Verification & Deployment
- Compiled the frontend SPA successfully (`npm run build`).
- Launched the backend server on `0.0.0.0:8000` via [run.py](file:///c:/Users/ARJUN/OneDrive/Desktop/CareTaker/run.py) so it is network-accessible.
