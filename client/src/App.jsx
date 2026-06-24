import DashboardTickets from "./pages/dashboard/DashboardTickets";
import { Route, Routes } from "react-router-dom";

import Navbar from "./components/layout/Navbar";
import ProtectedRoute from "./components/protected/ProtectedRoute";
import FloatingAIAssistant from "./components/ai/FloatingAIAssistant";

import Home from "./pages/Home";
import Events from "./pages/Events";
import EventDetails from "./pages/EventDetails";
import Problems from "./pages/Problems";
import ProblemDetails from "./pages/ProblemDetails";

import Login from "./pages/auth/Login";
import Register from "./pages/auth/Register";

import Dashboard from "./pages/dashboard/Dashboard";
import DashboardEvents from "./pages/dashboard/DashboardEvents";
import CreateEvent from "./pages/dashboard/CreateEvent";
import DashboardProblems from "./pages/dashboard/DashboardProblems";
import CreateProblem from "./pages/dashboard/CreateProblem";
import AdminPanel from "./pages/dashboard/AdminPanel";
import AIAssistant from "./pages/dashboard/AIAssistant";
import Notifications from "./pages/dashboard/Notifications";

const App = () => {
  return (
    <>
      <Navbar />

      <Routes>
        {/* Public pages */}
        <Route path="/" element={<Home />} />
        <Route path="/events" element={<Events />} />
        <Route path="/events/:id" element={<EventDetails />} />
        <Route path="/problems" element={<Problems />} />
        <Route path="/problems/:id" element={<ProblemDetails />} />

        {/* Auth pages */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        {/* Dashboard home */}
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          }
        />
        <Route
  path="/dashboard/tickets"
  element={
    <ProtectedRoute>
      <DashboardTickets />
    </ProtectedRoute>
  }
/>

        {/* Event dashboard */}
        <Route
          path="/dashboard/events"
          element={
            <ProtectedRoute>
              <DashboardEvents />
            </ProtectedRoute>
          }
        />

        <Route
          path="/dashboard/events/create"
          element={
            <ProtectedRoute>
              <CreateEvent />
            </ProtectedRoute>
          }
        />

        {/* Problem dashboard */}
        <Route
          path="/dashboard/problems"
          element={
            <ProtectedRoute>
              <DashboardProblems />
            </ProtectedRoute>
          }
        />

        <Route
          path="/dashboard/problems/create"
          element={
            <ProtectedRoute>
              <CreateProblem />
            </ProtectedRoute>
          }
        />

        {/* Admin */}
<Route
  path="/dashboard/admin"
  element={
    <ProtectedRoute>
      <AdminPanel />
    </ProtectedRoute>
  }
/>

<Route
  path="/dashboard/admin/events"
  element={
    <ProtectedRoute>
      <AdminPanel />
    </ProtectedRoute>
  }
/>

<Route
  path="/dashboard/events/approve"
  element={
    <ProtectedRoute>
      <AdminPanel />
    </ProtectedRoute>
  }
/>


        {/* AI */}
        <Route
          path="/dashboard/ai"
          element={
            <ProtectedRoute>
              <AIAssistant />
            </ProtectedRoute>
          }
        />

        {/* Notifications */}
        <Route
          path="/notifications"
          element={
            <ProtectedRoute>
              <Notifications />
            </ProtectedRoute>
          }
        />
      </Routes>

      <FloatingAIAssistant />
    </>
  );
};

export default App;