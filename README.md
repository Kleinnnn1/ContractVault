# ContractVault - AI-Powered Contract Management Platform
A modern, responsive contract management platform that lets you upload, organize, and intelligently analyze legal documents using AI — with a clean, intuitive interface built for teams and individuals.

## Features
- **AI Contract Analysis**: Automatically extract key dates, obligations, risk flags, and summaries from uploaded contracts using Google Gemini
- **Document Upload**: Upload PDF and DOCX contracts (up to 20 MB) with real-time upload progress
- **Smart Dashboard**: Filter and search contracts by type, status, or counterparty with grid and list views
- **Document Detail View**: Deep-dive into any contract with AI-generated metadata, key dates, obligations, and risk flags
- **Firebase Backend**: Real-time Firestore database and Firebase Storage for document management
- **User Authentication**: Secure login, registration, and Google Sign-In via Firebase Auth
- **Dark / Light Theme**: Full theme switching powered by a React context provider
- **Responsive Design**: Fully responsive layout that works on mobile, tablet, and desktop devices

## Tech Stack
- **Frontend Framework**: React 19 with Vite 8
- **Language**: JavaScript (ES Modules)
- **Styling**: Tailwind CSS 3
- **Backend & Database**: Firebase 12 (Auth, Firestore, Storage)
- **AI / ML**: Google Generative AI (`gemini-1.5-flash`) via `@google/generative-ai`
- **Routing**: React Router DOM 7
- **Document Parsing**: `pdfjs-dist` for PDF extraction, `mammoth` for DOCX extraction
- **Linting**: ESLint 10 with `eslint-plugin-react-hooks` and `eslint-plugin-react-refresh`

## Installation

Clone the repository:
```bash
git clone https://github.com/Kleinnnn1/ContractVault.git
cd ContractVault/client
```

Install dependencies:
```bash
npm install
```

### Environment Variables

Create a `.env.local` file inside the `client/` directory and add your Firebase and Gemini credentials:
```env
VITE_FIREBASE_API_KEY=your_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_auth_domain
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_storage_bucket
VITE_FIREBASE_MESSAGING_SENDER_ID=your_messaging_sender_id
VITE_FIREBASE_APP_ID=your_app_id

VITE_GEMINI_API_KEY=your_gemini_api_key
```

## Development

To run the development server:
```bash
npm run dev
```

The app will be available at `http://localhost:5173` with hot module reload enabled.

## Build

To build for production:
```bash
npm run build
```

The optimized build output will be in the `dist/` directory.

## Preview Production Build

To preview the production build locally:
```bash
npm run preview
```

## Linting

To run ESLint:
```bash
npm run lint
```

## Project Structure

```
ContractVault/
└── client/                  # Vite + React frontend
    ├── src/
    │   ├── components/      # Reusable React components (e.g. ProtectedRoute, SidebarFooter)
    │   ├── context/         # React context providers (ThemeContext)
    │   ├── lib/             # Utility libraries and Firebase config
    │   ├── pages/           # Route-level page components
    │   │   ├── Login.jsx
    │   │   ├── Register.jsx
    │   │   ├── Dashboard.jsx
    │   │   ├── Upload.jsx
    │   │   └── DocumentDetail.jsx
    │   ├── App.jsx          # Root component and route definitions
    │   └── main.jsx         # Application entry point
    ├── public/              # Static assets
    ├── index.html           # HTML entry point
    ├── vite.config.js       # Vite configuration
    ├── tailwind.config.js   # Tailwind CSS configuration
    └── package.json
```

## Author

**Kenneth Jhun N. Balino**
Full Stack Developer

Built with React, Firebase, Tailwind CSS, and Google Gemini AI.
