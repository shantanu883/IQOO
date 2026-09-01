import { createBrowserRouter, RouterProvider, Navigate } from "react-router-dom";
import { AuthProvider } from "@/context/AuthContext";
import { ThemeProvider } from "@/context/ThemeContext";
import { NotificationsProvider } from "@/context/NotificationsContext";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AppLayout } from "@/components/layout/AppLayout";

// Pages
import Landing from "@/pages/Landing";
import Login from "@/pages/Login";
import Register from "@/pages/Register";
import ForgotPassword from "@/pages/ForgotPassword";
import Onboarding from "@/pages/Onboarding";
import Home from "@/pages/Home";
import Explore from "@/pages/Explore";
import Projects from "@/pages/Projects";
import ProjectDetail from "@/pages/ProjectDetail";
import Hackathons from "@/pages/Hackathons";
import HackathonDetail from "@/pages/HackathonDetail";
import Developers from "@/pages/Developers";
import Messages from "@/pages/Messages";
import Notifications from "@/pages/Notifications";
import Bookmarks from "@/pages/Bookmarks";
import AiAssistant from "@/pages/AiAssistant";
import Profile from "@/pages/Profile";
import Settings from "@/pages/Settings";
import PostDetail from "@/pages/PostDetail";

// Protected route wrapper
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";

const router = createBrowserRouter([
  // Public routes
  {
    path: "/landing",
    element: <Landing />,
  },
  {
    path: "/login",
    element: <Login />,
  },
  {
    path: "/register",
    element: <Register />,
  },
  {
    path: "/forgot-password",
    element: <ForgotPassword />,
  },
  {
    path: "/onboarding",
    element: (
      <ProtectedRoute>
        <Onboarding />
      </ProtectedRoute>
    ),
  },

  // Protected routes with app layout
  {
    path: "/",
    element: (
      <ProtectedRoute>
        <AppLayout />
      </ProtectedRoute>
    ),
    children: [
      {
        index: true,
        element: <Home />,
      },
      {
        path: "explore",
        element: <Explore />,
      },
      {
        path: "projects",
        element: <Projects />,
      },
      {
        path: "projects/:id",
        element: <ProjectDetail />,
      },
      {
        path: "hackathons",
        element: <Hackathons />,
      },
      {
        path: "hackathons/:id",
        element: <HackathonDetail />,
      },
      {
        path: "developers",
        element: <Developers />,
      },
      {
        path: "messages",
        element: <Messages />,
      },
      {
        path: "notifications",
        element: <Notifications />,
      },
      {
        path: "bookmarks",
        element: <Bookmarks />,
      },
      {
        path: "ai-assistant",
        element: <AiAssistant />,
      },
      {
        path: "profile/:username",
        element: <Profile />,
      },
      {
        path: "posts/:id",
        element: <PostDetail />,
      },
      {
        path: "settings",
        element: <Settings />,
      },
    ],
  },

  // Fallback
  {
    path: "*",
    element: <Navigate to="/" replace />,
  },
]);

export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <NotificationsProvider>
          <TooltipProvider>
            <RouterProvider router={router} />
            <Toaster />
          </TooltipProvider>
        </NotificationsProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}
