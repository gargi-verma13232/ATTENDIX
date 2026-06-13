# Attendix

A modern, comprehensive attendance management and academic tracking application built specifically for students. It empowers students to monitor their attendance, plan recovery strategies, and rectify discrepancies through a seamless, intuitive interface.

## Live Demo
[View Live Project](https://agent-6a2c5c90d242d793fb5315b7--attendixz.netlify.app)

## Core Modules & Features

- **📊 Student Dashboard (`/student`)**
  Get a high-level overview of overall attendance, upcoming classes, and recent alerts. Visualizes data using interactive charts to quickly identify areas needing attention.
- **📅 Recovery Planner (`/student/recovery`)**
  A smart tool to help students calculate exactly how many classes they need to attend to reach their target attendance percentage for specific subjects.

- **📝 Rectification Workflow (`/student/rectification`)**
  A streamlined process for students to submit and track attendance dispute tickets directly to faculty or administration.

- **📈 Subject Trends (`/student/trends`)**
  Deep-dive analytics into attendance patterns over time, broken down by individual subjects or semesters.

## Tech Stack
- **Frontend Framework:** React 19, powered by Vite for lightning-fast HMR and building.
- **Routing:** React Router DOM for seamless Single Page Application (SPA) navigation.
- **Styling:** Tailwind CSS for highly customizable, utility-first styling.
- **Data Visualization:** Recharts for composing responsive and interactive charts.
- **Icons:** Lucide React for consistent, beautiful iconography.
- **Data Layer:** Context API with a custom `MockDataProvider` to simulate backend API responses.


## Project Structure
```text
src/
├── assets/         # Static assets and images
├── components/     # Reusable UI components
├── data/           # Static mock data constants
├── layouts/        # Page wrappers (e.g., StudentLayout)
├── pages/          # Main route components
├── views/          # Complex page views or sections
├── App.jsx         # Application routing
├── MockDataContext # Simulated global state provider
└── index.css       # Global Tailwind imports
```

## Deployment
This project is continuously deployed to Netlify via continuous deployment. Any changes pushed to the `main` branch are automatically built (`npm run build`) and the `dist` directory is published live.

