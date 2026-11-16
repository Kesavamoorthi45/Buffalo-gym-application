import React, { useState, Suspense } from "react";
import { useNavigate } from "react-router-dom";
import {
  FaArrowLeft,
  FaUser,
  FaDumbbell,
  FaAppleAlt,
  FaCalculator,
  FaRobot,
  FaCalendarAlt,
  FaChevronRight,
  FaSignOutAlt,
  FaInfoCircle,
  FaShieldAlt,
  FaStar,
} from "react-icons/fa";
import axiosInstance from "./utils/axiosInstance";
import Logo from "../assets/logo.webp";
import "../css/WorkoutPage.css";
const FooterNav = React.lazy(() => import("./FooterNav"));
import FooterSkeleton from "./FooterLoading";

const MENU_SECTIONS = [
  {
    title: "My Account",
    items: [
      { icon: <FaUser size={18} />, label: "Edit Profile", route: "/user-profile", color: "#4ECDC4" },
      { icon: <FaCalculator size={18} />, label: "BMI Calculator", route: "/bmi-calculator", color: "#F39C12" },
    ],
  },
  {
    title: "Fitness",
    items: [
      { icon: <FaDumbbell size={18} />, label: "My Workouts", route: "/workout-week", color: "#FF6B6B" },
      { icon: <FaCalendarAlt size={18} />, label: "Workout Schedule", route: "/gym-schedules", color: "#9B59B6" },
      { icon: <FaStar size={18} />, label: "Progress & Stats", route: "/stat", color: "#F39C12" },
    ],
  },
  {
    title: "Nutrition",
    items: [
      { icon: <FaAppleAlt size={18} />, label: "Diet Plan", route: "/diet-plan", color: "#F39C12" },
      { icon: <FaAppleAlt size={18} />, label: "Food Log", route: "/today", color: "#1ABC9C" },
      { icon: <FaAppleAlt size={18} />, label: "Food Categories", route: "/foodpage", color: "#2ECC71" },
    ],
  },
  {
    title: "Tools",
    items: [
      { icon: <FaRobot size={18} />, label: "AI Fitness Assistant", route: "/ai-chat", color: "#3498DB" },
    ],
  },
  {
    title: "About",
    items: [
      { icon: <FaInfoCircle size={18} />, label: "About Buffalo Gym", action: "about", color: "#95A5A6" },
      { icon: <FaShieldAlt size={18} />, label: "Privacy & Terms", action: "privacy", color: "#7F8C8D" },
    ],
  },
];

const AboutModal = ({ onClose }) => (
  <div
    style={{
      position: "fixed",
      inset: 0,
      background: "rgba(0,0,0,0.7)",
      zIndex: 200,
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      padding: "20px",
    }}
    onClick={onClose}
  >
    <div
      style={{
        background: "#252b2d",
        borderRadius: "20px",
        padding: "28px",
        maxWidth: "360px",
        width: "100%",
        color: "#f0f0f0",
      }}
      onClick={(e) => e.stopPropagation()}
    >
      <h3 style={{ margin: "0 0 12px", fontSize: "20px", fontWeight: 700, color: "#4ECDC4" }}>
        Buffalo Gym App
      </h3>
      <p style={{ fontSize: "14px", color: "#bbb", lineHeight: 1.7, marginBottom: "16px" }}>
        A comprehensive fitness management platform built as a final year project. Designed to help
        members track workouts, plan nutrition, monitor progress, and stay consistent on their
        fitness journey.
      </p>
      <div style={{ borderTop: "1px solid #333", paddingTop: "14px" }}>
        <p style={{ fontSize: "12px", color: "#888", marginBottom: "4px" }}>Version 1.0.0</p>
        <p style={{ fontSize: "12px", color: "#888" }}>Built with React + Django REST Framework</p>
      </div>
      <button
        onClick={onClose}
        style={{
          marginTop: "20px",
          width: "100%",
          padding: "12px",
          background: "#4ECDC4",
          color: "#fff",
          border: "none",
          borderRadius: "10px",
          fontWeight: 700,
          cursor: "pointer",
        }}
      >
        Close
      </button>
    </div>
  </div>
);

const PrivacyModal = ({ onClose }) => (
  <div
    style={{
      position: "fixed",
      inset: 0,
      background: "rgba(0,0,0,0.7)",
      zIndex: 200,
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      padding: "20px",
    }}
    onClick={onClose}
  >
    <div
      style={{
        background: "#252b2d",
        borderRadius: "20px",
        padding: "28px",
        maxWidth: "360px",
        width: "100%",
        color: "#f0f0f0",
        maxHeight: "80vh",
        overflowY: "auto",
      }}
      onClick={(e) => e.stopPropagation()}
    >
      <h3 style={{ margin: "0 0 14px", fontSize: "20px", fontWeight: 700 }}>Privacy & Terms</h3>
      {[
        { title: "Data Storage", body: "All your fitness data, food logs, and personal information are stored securely on our servers and are never shared with third parties." },
        { title: "Account Security", body: "Your password is securely hashed and stored. We use JWT tokens for authentication to keep your sessions secure." },
        { title: "Usage", body: "This application is intended for personal fitness tracking purposes. All workout and nutrition data belongs to you and can be deleted at any time." },
        { title: "Contact", body: "For any concerns regarding your data or account, please reach out through the gym management." },
      ].map((section, i) => (
        <div key={i} style={{ marginBottom: "16px" }}>
          <p style={{ fontWeight: 600, fontSize: "14px", marginBottom: "4px", color: "#4ECDC4" }}>{section.title}</p>
          <p style={{ fontSize: "13px", color: "#bbb", lineHeight: 1.6 }}>{section.body}</p>
        </div>
      ))}
      <button
        onClick={onClose}
        style={{
          marginTop: "8px",
          width: "100%",
          padding: "12px",
          background: "#4ECDC4",
          color: "#fff",
          border: "none",
          borderRadius: "10px",
          fontWeight: 700,
          cursor: "pointer",
        }}
      >
        Close
      </button>
    </div>
  </div>
);

const SettingsPage = () => {
  const navigate = useNavigate();
  const [modal, setModal] = useState(null); // 'about' | 'privacy' | 'logout'
  const [loggingOut, setLoggingOut] = useState(false);

  const handleLogout = () => {
    setLoggingOut(true);
    setTimeout(() => {
      localStorage.removeItem("accessToken");
      localStorage.removeItem("refreshToken");
      navigate("/login", { replace: true });
    }, 600);
  };

  const handleItemClick = (item) => {
    if (item.route) {
      navigate(item.route);
    } else if (item.action === "about") {
      setModal("about");
    } else if (item.action === "privacy") {
      setModal("privacy");
    }
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#1a1f21",
        color: "#f0f0f0",
        paddingBottom: "90px",
      }}
    >
      {/* Header */}
      <header className="workout-header" style={{ position: "sticky", top: 0, zIndex: 100, borderBottom: "1px solid #333" }}>
        <button className="back-button" onClick={() => navigate("/")}>
          <FaArrowLeft />
        </button>
        <div className="logo-container">
          <img src={Logo} alt="Logo" className="logo" />
        </div>
        <h1 className="header-title" style={{ fontSize: 20 }}>SETTINGS</h1>
      </header>

      {/* Menu sections */}
      <div style={{ padding: "16px", display: "flex", flexDirection: "column", gap: "20px" }}>
        {MENU_SECTIONS.map((section, si) => (
          <div key={si}>
            <p
              style={{
                margin: "0 0 8px 4px",
                fontSize: "11px",
                fontWeight: 700,
                color: "#888",
                textTransform: "uppercase",
                letterSpacing: "1px",
              }}
            >
              {section.title}
            </p>
            <div
              style={{
                background: "#252b2d",
                borderRadius: "14px",
                overflow: "hidden",
              }}
            >
              {section.items.map((item, ii) => (
                <button
                  key={ii}
                  onClick={() => handleItemClick(item)}
                  style={{
                    width: "100%",
                    display: "flex",
                    alignItems: "center",
                    gap: "14px",
                    padding: "14px 16px",
                    background: "none",
                    border: "none",
                    borderBottom:
                      ii < section.items.length - 1 ? "1px solid #333" : "none",
                    cursor: "pointer",
                    textAlign: "left",
                    color: "#f0f0f0",
                  }}
                >
                  <div
                    style={{
                      width: 36,
                      height: 36,
                      background: `${item.color}22`,
                      borderRadius: "10px",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      color: item.color,
                      flexShrink: 0,
                    }}
                  >
                    {item.icon}
                  </div>
                  <span style={{ flex: 1, fontSize: "15px", fontWeight: 500 }}>{item.label}</span>
                  <FaChevronRight size={12} color="#555" />
                </button>
              ))}
            </div>
          </div>
        ))}

        {/* Logout button */}
        <button
          onClick={() => setModal("logout")}
          style={{
            width: "100%",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: "10px",
            padding: "16px",
            background: "#3d1515",
            border: "1px solid #FF6B6B44",
            borderRadius: "14px",
            color: "#FF6B6B",
            fontWeight: 700,
            fontSize: "15px",
            cursor: "pointer",
          }}
        >
          <FaSignOutAlt size={18} />
          Log Out
        </button>
      </div>

      {/* Logout confirm modal */}
      {modal === "logout" && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0,0,0,0.7)",
            zIndex: 200,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: "20px",
          }}
        >
          <div
            style={{
              background: "#252b2d",
              borderRadius: "20px",
              padding: "28px",
              maxWidth: "320px",
              width: "100%",
              textAlign: "center",
            }}
          >
            <FaSignOutAlt size={36} color="#FF6B6B" style={{ marginBottom: "16px" }} />
            <h3 style={{ margin: "0 0 10px", fontSize: "20px", fontWeight: 700 }}>
              Log Out?
            </h3>
            <p style={{ color: "#aaa", fontSize: "14px", marginBottom: "24px" }}>
              You will need to log in again to access your account.
            </p>
            <div style={{ display: "flex", gap: "12px" }}>
              <button
                onClick={() => setModal(null)}
                style={{
                  flex: 1,
                  padding: "13px",
                  background: "#333",
                  border: "none",
                  borderRadius: "10px",
                  color: "#f0f0f0",
                  fontWeight: 600,
                  cursor: "pointer",
                }}
              >
                Cancel
              </button>
              <button
                onClick={handleLogout}
                disabled={loggingOut}
                style={{
                  flex: 1,
                  padding: "13px",
                  background: "#FF6B6B",
                  border: "none",
                  borderRadius: "10px",
                  color: "#fff",
                  fontWeight: 700,
                  cursor: "pointer",
                }}
              >
                {loggingOut ? "..." : "Log Out"}
              </button>
            </div>
          </div>
        </div>
      )}

      {modal === "about" && <AboutModal onClose={() => setModal(null)} />}
      {modal === "privacy" && <PrivacyModal onClose={() => setModal(null)} />}

      <div style={{ position: "fixed", bottom: 0, left: 0, right: 0 }}>
        <Suspense fallback={<FooterSkeleton />}>
          <FooterNav />
        </Suspense>
      </div>
    </div>
  );
};

export default SettingsPage;
