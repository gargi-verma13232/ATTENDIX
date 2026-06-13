
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { MockDataProvider } from './MockDataContext';

// Layouts
import StudentLayout from './layouts/StudentLayout';

// Pages
import StudentDashboard from './pages/StudentDashboard';
import RecoveryPlanner from './pages/RecoveryPlanner';
import RectificationWorkflow from './pages/RectificationWorkflow';
import SubjectTrends from './pages/SubjectTrends';

import './index.css';

function App() {
  return (
    <MockDataProvider>
      <BrowserRouter>
        <Routes>
          {/* Default redirect to student dashboard for now */}
          <Route path="/" element={<Navigate to="/student" replace />} />
          
          <Route path="/student" element={<StudentLayout />}>
            <Route index element={<StudentDashboard />} />
            <Route path="recovery" element={<RecoveryPlanner />} />
            <Route path="rectification" element={<RectificationWorkflow />} />
            <Route path="trends" element={<SubjectTrends />} />
          </Route>
          
          {/* Placeholder for Faculty/Admin for future implementation */}
          <Route path="*" element={<Navigate to="/student" replace />} />
        </Routes>
      </BrowserRouter>
    </MockDataProvider>
  );
}

export default App;