import { Route, Routes, Navigate } from "react-router-dom";
import AuthPage from "./pages/auth";
import RouteGuard from "./components/route-guard";
import AdminPage from "./pages/admin";
import StudentDashboard from "./pages/student/dashboard";
import StudentHomePage from "./pages/student/home";
import ApplyPage from "./pages/student/apply";
import StudentViewCommonLayout from "./components/student-view/common-layout";
import { useContext } from "react";
import { AuthContext } from "./context/auth-context";


function App() {
  const {auth} = useContext(AuthContext);
  return (
    <Routes>
      <Route path="/auth" element={<RouteGuard element={<AuthPage />} authenticated={auth?.authenticated} user={auth?.user} />} />
      <Route path="/admin" element={<RouteGuard element={<AdminPage />} authenticated={auth?.authenticated} user={auth?.user} />} />
      <Route path="/dashboard" element={<RouteGuard element={<StudentDashboard />} authenticated={auth?.authenticated} user={auth?.user} />} />
      <Route path="/apply/:projectId" element={<RouteGuard element={<ApplyPage />} authenticated={auth?.authenticated} user={auth?.user} />} />
      <Route path="/" element={<RouteGuard element={<StudentHomePage />} authenticated={auth?.authenticated} user={auth?.user} />} />
    </Routes>
  );

}

export default App
