import { lazy, Suspense, useEffect } from 'react';
import { Routes, Route, useLocation } from 'react-router-dom';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { AuthProvider } from '@/context/AuthContext';
import { AdminProtectedRoute } from '@/components/AdminProtectedRoute';
import { Toaster } from 'sonner';

// Public pages
const Home = lazy(() => import('@/pages/Home'));
const Services = lazy(() => import('@/pages/Services'));
const Industries = lazy(() => import('@/pages/Industries'));
const About = lazy(() => import('@/pages/About'));
const Blog = lazy(() => import('@/pages/Blog'));
const BlogPost = lazy(() => import('@/pages/BlogPost'));
const Contact = lazy(() => import('@/pages/Contact'));
const Privacy = lazy(() => import('@/pages/Privacy'));
const Terms = lazy(() => import('@/pages/Terms'));
const NotFound = lazy(() => import('@/pages/NotFound'));

// Admin pages
const AdminLayout = lazy(() => import('@/components/admin/AdminLayout').then(m => ({ default: m.AdminLayout })));
const AdminLogin = lazy(() => import('@/pages/admin/AdminLogin'));
const AdminDashboard = lazy(() => import('@/pages/admin/AdminDashboard'));
const AdminContacts = lazy(() => import('@/pages/admin/AdminContacts'));
const AdminUsers = lazy(() => import('@/pages/admin/AdminUsers'));
const AdminAudit = lazy(() => import('@/pages/admin/AdminAudit'));
const AdminProfile = lazy(() => import('@/pages/admin/AdminProfile'));
const AdminSettings = lazy(() => import('@/pages/admin/AdminSettings'));
const AdminNotFound = lazy(() => import('@/pages/admin/AdminNotFound'));

function ScrollToTop() {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);
  return null;
}

export default function App() {
  const { pathname } = useLocation();
  const isAdminRoute = pathname.startsWith('/admin');

  return (
    <AuthProvider>
      <div className="min-h-screen bg-xifoz-base flex flex-col">
        <Toaster position="top-right" richColors closeButton />
        <ScrollToTop />
        {!isAdminRoute && <Navbar />}
        <main id="main-content" className="flex-grow">
          <Suspense fallback={null}>
            <Routes>
              {/* Public Routes */}
              <Route path="/" element={<Home />} />
              <Route path="/services" element={<Services />} />
              <Route path="/industries" element={<Industries />} />
              <Route path="/about" element={<About />} />
              <Route path="/blog" element={<Blog />} />
              <Route path="/blog/:slug" element={<BlogPost />} />
              <Route path="/contact" element={<Contact />} />
              <Route path="/privacy" element={<Privacy />} />
              <Route path="/terms" element={<Terms />} />

              {/* Admin Routes */}
              <Route path="/admin/login" element={<AdminLogin />} />
              <Route
                path="/admin"
                element={
                  <AdminProtectedRoute>
                    <AdminLayout />
                  </AdminProtectedRoute>
                }
              >
                <Route index element={<AdminDashboard />} />
                <Route path="contacts" element={<AdminContacts />} />
                <Route
                  path="users"
                  element={
                    <AdminProtectedRoute allowedRoles={['SUPER_ADMIN']}>
                      <AdminUsers />
                    </AdminProtectedRoute>
                  }
                />
                <Route path="audit" element={<AdminAudit />} />
                <Route path="profile" element={<AdminProfile />} />
                <Route
                  path="settings"
                  element={
                    <AdminProtectedRoute allowedRoles={['SUPER_ADMIN']}>
                      <AdminSettings />
                    </AdminProtectedRoute>
                  }
                />
                <Route path="*" element={<AdminNotFound />} />
              </Route>

              {/* Public Fallback */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </Suspense>
        </main>
        {!isAdminRoute && <Footer />}
      </div>
    </AuthProvider>
  );
}

