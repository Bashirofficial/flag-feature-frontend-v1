import React from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "./contexts/AuthContext";
import { ProtectedRoute } from "./components/ProtectedRoute";
import { LoginPage } from "./pages/LoginPage";
import { RegisterPage } from "./pages/RegisterPage";
import { DashboardLayout } from "./components/DashboardLayout";
import { HomePage } from "./pages/HomePage";
import { FlagsPage } from "./pages/FlagsPage";
import { FlagDetailPage } from "./pages/FlagDetailPage";
import { CreateFlagPage } from "./pages/CreateFlagPage";
import { ApiKeysPage } from "./pages/ApiKeysPage";
import { AuditLogsPage } from "./pages/AuditLogsPage";

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route
            path="/"
            element={
              <ProtectedRoute>
                <DashboardLayout />
              </ProtectedRoute>
            }
          >
            <Route index element={<HomePage />} />
            <Route path="flags" element={<FlagsPage />} />
            <Route path="flags/new" element={<CreateFlagPage />} />
            <Route path="flags/:flagId" element={<FlagDetailPage />} />
            <Route path="api-keys" element={<ApiKeysPage />} />
            <Route path="audit-logs" element={<AuditLogsPage />} />
          </Route>
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
