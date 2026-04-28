// src/App.jsx
import { Routes, Route, Link, useLocation } from "react-router-dom";
import { Suspense, lazy, useEffect, useState } from "react";
import { I18nextProvider } from "react-i18next";

import i18n from "./i18n";

/* Context Providers */
import { AuthProvider } from "./context/AuthContext";
import { ToastProvider } from "./context/ToastContext";
import { SocketProvider } from "./context/SocketContext";
import { UIProvider, useUI } from "./context/UIContext";

/* Components */
import ErrorBoundary from "./components/common/ErrorBoundary";
import LoadingSpinner from "./components/common/LoadingSpinner";
import NotFound from "./components/common/NotFound";
import ScrollToTop from "./components/common/ScrollToTop";

/* Routes */
import PrivateRoute from "./routes/PrivateRoute"; // ensure this is correct

/**
 * Component to handle top loading bar on route changes
 */
const NavigationLoader = () => {
  const location = useLocation();
  const { setTopLoading } = useUI();

  useEffect(() => {
    setTopLoading(true);
    const timer = setTimeout(() => setTopLoading(false), 500);
    return () => clearTimeout(timer);
  }, [location.pathname, setTopLoading]);

  return null;
};

/* Layout Utils */
import { enforceLTRLayout } from "./utils/layoutDirection";
import "./styles/force-ltr.css";

/* Layouts */
import AdminLayout from "./layouts/AdminLayout";
import PublicLayout from "./layouts/PublicLayout";

/* Auth Pages */
const Login = lazy(() => import("./pages/auth/Login"));
const ForgotPassword = lazy(() => import("./pages/auth/ForgotPassword"));
const ResetPassword = lazy(() => import("./pages/auth/ResetPassword"));

/* Public Pages */
const Home = lazy(() => import("./pages/public/Home"));
const Projects = lazy(() => import("./pages/public/Projects"));
const Contact = lazy(() => import("./pages/public/Contact"));
const Skills = lazy(() => import("./pages/public/Skills"));
const Poems = lazy(() => import("./pages/public/Poems"));
const Gallery = lazy(() => import("./pages/public/Gallery"));

/* Admin Pages */
const Dashboard = lazy(() => import("./pages/Admin/Dashboard/DashboardContent"));
const HeroAdmin = lazy(() => import("./pages/Admin/Content/HeroAdmin"));
const SkillsAdmin = lazy(() => import("./pages/Admin/Content/SkillAdmin"));
const ContactAdmin = lazy(() => import("./pages/Admin/Content/ContactAdmin"));
const ManageAdmins = lazy(() => import("./pages/Admin/ManageAdmin/ManageAdmin"));
const SettingsPage = lazy(() => import("./pages/Admin/settings/SettingPage"));
const ProfilePage = lazy(() => import("./pages/Admin/Profile/ProfilePage"));

/* Lazy Loaded Pages */
const PoemDashboard = lazy(() => import("./pages/Admin/Content/PoemDashboard"));
const PoemList = lazy(() => import("./pages/Admin/Content/PoemList"));
const EditPoem = lazy(() => import("./pages/Admin/Content/EditPoem"));
const PoemAdd = lazy(() => import("./pages/Admin/Content/PoemAdd"));

const ProjectDashboard = lazy(() => import("./pages/Admin/Content/ProjectDashboard"));
const GalleryDashboard = lazy(() => import("./pages/Admin/Content/GalleryDashboard"));
const GalleryAdd = lazy(() => import("./pages/Admin/Content/GalleryAdd"));
const EditGallery = lazy(() => import("./pages/Admin/Content/EditGallery"));
const EditProject = lazy(() => import("./pages/Admin/Content/EditProject"));
const ProjectAdd = lazy(() => import("./pages/Admin/Content/ProjectAdd"));

const SkillAdd = lazy(() => import("./pages/Admin/Content/SkillAdd"));
const EditSkill = lazy(() => import("./pages/Admin/Content/EditSkill"));
const Analytics = lazy(() => import("./pages/Admin/Dashboard/Analytics"));

function App() {
  useEffect(() => {
    enforceLTRLayout();
  }, []);

  return (
    <I18nextProvider i18n={i18n}>
      <ErrorBoundary>
        <AuthProvider>
          <UIProvider>
            <ScrollToTop />
            <NavigationLoader />
            <ToastProvider>
              <SocketProvider>
                <Suspense fallback={<LoadingSpinner text="Loading..." />}>
                  <Routes>
                    {/* Public Routes */}
                    <Route element={<PublicLayout />}>
                      <Route index element={<Home />} />
                      <Route path="projects" element={<Projects />} />
                      <Route path="projects/:id" element={<Projects />} />
                      <Route path="skills" element={<Skills />} />
                      <Route path="skills/:slug" element={<Skills />} />
                      <Route path="poems" element={<Poems />} />
                      <Route path="poems/:id" element={<Poems />} />
                      <Route path="gallery" element={<Gallery />} />
                      <Route path="gallery/:id" element={<Gallery />} />
                      <Route path="contact" element={<Contact />} />

                      {/* Auth Routes inside PublicLayout for Header/Footer */}
                      <Route path="login" element={<Login />} />
                      <Route path="forgot-password" element={<ForgotPassword />} />
                      <Route path="reset-password/:token" element={<ResetPassword />} />
                    </Route>

                    {/* Admin Routes */}
                    <Route
                      path="admin"
                      element={
                        <PrivateRoute requiredRole="admin">
                          <AdminLayout />
                        </PrivateRoute>
                      }
                    >
                      <Route index element={<Dashboard />} />

                      {/* Content Management */}
                      <Route path="hero" element={<HeroAdmin />} />
                      <Route path="gallery">
                        <Route index element={<GalleryDashboard />} />
                        <Route path="new" element={<GalleryAdd />} />
                        <Route path="edit/:id" element={<EditGallery />} />
                      </Route>
                      <Route path="skills">
                        <Route index element={<SkillsAdmin />} />
                        <Route path="add" element={<SkillAdd />} />
                        <Route path="edit/:id" element={<EditSkill />} />
                      </Route>
                      <Route path="contact" element={<ContactAdmin />} />
                      <Route path="analytics" element={<Analytics />} />

                      {/* Poems Management */}
                      <Route path="poems">
                        <Route index element={<PoemDashboard />} />
                        <Route path="list" element={<PoemList />} />
                        <Route path="new" element={<PoemAdd />} />
                        <Route path="edit/:id" element={<EditPoem />} />
                      </Route>

                      {/* Projects Management */}
                      <Route path="projects">
                        <Route index element={<ProjectDashboard />} />
                        <Route path="new" element={<ProjectAdd />} />
                        <Route path="edit/:id" element={<EditProject />} />
                      </Route>

                      {/* Settings & Profile */}
                      <Route path="settings" element={<SettingsPage />} />
                      <Route path="profile" element={<ProfilePage />} />

                      {/* Super Admin Only */}
                      <Route
                        path="manage-admins"
                        element={
                          <PrivateRoute requiredRole="superadmin">
                            <ManageAdmins />
                          </PrivateRoute>
                        }
                      />

                      {/* Admin 404 */}
                      <Route path="*" element={<AdminNotFound />} />
                    </Route>

                    {/* Public 404 */}
                    <Route path="*" element={<NotFound />} />
                  </Routes>
                </Suspense>
              </SocketProvider>
            </ToastProvider>
          </UIProvider>
        </AuthProvider>
      </ErrorBoundary>
    </I18nextProvider>
  );
}

// Admin 404 Component
const AdminNotFound = () => {
  const { t } = i18n;
  return (
    <div className="admin-not-found p-6">
      <h1 className="text-2xl font-bold text-red-600">{t('admin.not-found', '404 - Page Not Found')}</h1>
      <p className="mt-2">{t('admin.not-found-message', "The requested admin page doesn't exist.")}</p>
      <Link to="/admin" className="btn-primary mt-4 inline-block">
        {t('navigation.go-to-dashboard')}
      </Link>
    </div>
  );
};

export default App;
