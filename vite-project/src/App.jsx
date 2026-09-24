import { Route, Routes, Navigate } from "react-router-dom";
import { useContext } from "react";
import { AuthContext } from "./context/auth-context";
import RouteGuard from "./components/route-guard";
import MainLayout from "./components/layout/MainLayout";

// Pages
import StudentHomePage from "./pages/student/home";
import EventsPage from "./pages/events";
import EventDetailPage from "./pages/events/EventDetailPage";
import TeamPage from "./pages/team";
import ProjectsPage from "./pages/projects";
import ProjectDetailPage from "./pages/projects/ProjectDetailPage";
import AuthPage from "./pages/auth";
import AdminPage from "./pages/admin";

function App() {
  const { auth } = useContext(AuthContext);

  return (
    <Routes>
      {/* PUBLIC USER-FACING ROUTES (WRAPPED IN MAINLAYOUT) */}
      <Route
        path="/"
        element={
          <MainLayout>
            <StudentHomePage />
          </MainLayout>
        }
      />
      <Route
        path="/events"
        element={
          <MainLayout>
            <EventsPage />
          </MainLayout>
        }
      />
      <Route
        path="/events/:id"
        element={
          <MainLayout>
            <EventDetailPage />
          </MainLayout>
        }
      />
      <Route
        path="/team"
        element={
          <MainLayout>
            <TeamPage />
          </MainLayout>
        }
      />
      <Route
        path="/projects"
        element={
          <MainLayout>
            <ProjectsPage />
          </MainLayout>
        }
      />
      <Route
        path="/projects/:id"
        element={
          <MainLayout>
            <ProjectDetailPage />
          </MainLayout>
        }
      />

      {/* AUTHENTICATION ROUTE */}
      <Route
        path="/auth"
        element={
          <RouteGuard
            element={<AuthPage />}
            authenticated={auth?.authenticated}
            user={auth?.user}
          />
        }
      />

      {/* ADMIN CONTROL ROUTE */}
      <Route
        path="/admin"
        element={
          <RouteGuard
            element={<AdminPage />}
            authenticated={auth?.authenticated}
            user={auth?.user}
          />
        }
      />

      {/* CATCH-ALL ROUTE: PREVENT BROKEN ROUTES OR 404 ORPHANS */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default App;
