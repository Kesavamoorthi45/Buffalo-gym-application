import React, { useState, useEffect, Suspense } from "react";
import { useNavigate } from "react-router-dom";
import { FaArrowLeft, FaBullhorn, FaTrophy, FaDumbbell, FaAppleAlt, FaCalendarCheck } from "react-icons/fa";
import axiosInstance from "./utils/axiosInstance";
import Logo from "../assets/logo.webp";
import "../css/WorkoutPage.css";
const FooterNav = React.lazy(() => import("./FooterNav"));
import FooterSkeleton from "./FooterLoading";

const UPDATES = [
  {
    id: 1,
    type: "announcement",
    icon: <FaBullhorn size={18} color="#fff" />,
    iconBg: "#E74C3C",
    title: "New Batch Starting Soon",
    description:
      "A new batch of personalized fitness programs begins next Monday. Enroll now to secure your spot and get a customized workout plan based on your body type and goals.",
    date: "April 10, 2026",
    tag: "Announcement",
    tagColor: "#E74C3C",
  },
  {
    id: 2,
    type: "tip",
    icon: <FaDumbbell size={18} color="#fff" />,
    iconBg: "#2ECC71",
    title: "Tip of the Week: Progressive Overload",
    description:
      "The most effective way to build muscle is progressive overload — gradually increasing the weight, reps, or sets over time. Track your lifts every session to ensure consistent improvement.",
    date: "April 9, 2026",
    tag: "Fitness Tip",
    tagColor: "#2ECC71",
  },
  {
    id: 3,
    type: "nutrition",
    icon: <FaAppleAlt size={18} color="#fff" />,
    iconBg: "#F39C12",
    title: "Nutrition Focus: Protein Intake",
    description:
      "Aim for 1.6–2.2g of protein per kg of bodyweight daily to support muscle growth and recovery. Great sources include eggs, chicken, legumes, tofu, and Greek yogurt.",
    date: "April 8, 2026",
    tag: "Nutrition",
    tagColor: "#F39C12",
  },
  {
    id: 4,
    type: "achievement",
    icon: <FaTrophy size={18} color="#fff" />,
    iconBg: "#9B59B6",
    title: "Member Achievement Spotlight",
    description:
      "Congratulations to our members who completed their 30-day fitness challenge this week! Consistent effort, smart training, and proper nutrition are the keys to transformation.",
    date: "April 7, 2026",
    tag: "Achievement",
    tagColor: "#9B59B6",
  },
  {
    id: 5,
    type: "schedule",
    icon: <FaCalendarCheck size={18} color="#fff" />,
    iconBg: "#3498DB",
    title: "Weekend Special: Group Cardio Session",
    description:
      "Join our free group cardio session this Saturday at 7 AM. Open to all fitness levels — a great way to stay motivated and connect with fellow gym members.",
    date: "April 6, 2026",
    tag: "Event",
    tagColor: "#3498DB",
  },
  {
    id: 6,
    type: "tip",
    icon: <FaDumbbell size={18} color="#fff" />,
    iconBg: "#1ABC9C",
    title: "Recovery Matters",
    description:
      "Don't skip rest days. Muscles grow during recovery, not just during training. Prioritize 7–9 hours of sleep, stay hydrated, and use active recovery like light stretching or yoga on off days.",
    date: "April 5, 2026",
    tag: "Fitness Tip",
    tagColor: "#1ABC9C",
  },
];

const STATS = [
  { label: "Active Members", value: "1,200+", color: "#4ECDC4" },
  { label: "Programs Available", value: "8", color: "#F39C12" },
  { label: "Calories Tracked Today", value: "48K+", color: "#FF6B6B" },
  { label: "Workouts Completed", value: "3,400+", color: "#9B59B6" },
];

const GymUpdatesPage = () => {
  const navigate = useNavigate();
  const [banners, setBanners] = useState([]);

  useEffect(() => {
    // Attempt to fetch any home data for context — if unavailable, static content is shown
    axiosInstance
      .get("/home/")
      .then((res) => {
        if (res.data?.banners) setBanners(res.data.banners.slice(0, 3));
      })
      .catch(() => {
        // Static content will be shown — no action needed
      });
  }, []);

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
        <h1 className="header-title" style={{ fontSize: 20 }}>GYM UPDATES</h1>
      </header>

      {/* Hero Banner */}
      <div
        style={{
          background: "linear-gradient(135deg, #E74C3C, #C0392B)",
          padding: "28px 20px",
          textAlign: "center",
        }}
      >
        <FaBullhorn size={36} color="#fff" style={{ marginBottom: "12px" }} />
        <h2 style={{ margin: "0 0 8px", fontSize: "22px", fontWeight: 700, color: "#fff" }}>
          Latest News & Updates
        </h2>
        <p style={{ margin: 0, color: "rgba(255,255,255,0.85)", fontSize: "14px", lineHeight: 1.5 }}>
          Stay updated with the latest announcements, fitness tips, nutrition advice, and gym events.
        </p>
      </div>

      {/* Gym Stats */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: "12px",
          padding: "16px 16px 4px",
        }}
      >
        {STATS.map((stat, i) => (
          <div
            key={i}
            style={{
              background: "#252b2d",
              borderRadius: "12px",
              padding: "16px",
              textAlign: "center",
              borderLeft: `4px solid ${stat.color}`,
            }}
          >
            <p style={{ margin: "0 0 4px", fontSize: "22px", fontWeight: 700, color: stat.color }}>
              {stat.value}
            </p>
            <p style={{ margin: 0, fontSize: "12px", color: "#aaa" }}>{stat.label}</p>
          </div>
        ))}
      </div>

      {/* Updates Feed */}
      <div style={{ padding: "16px" }}>
        <h3 style={{ margin: "0 0 14px", fontSize: "16px", fontWeight: 600, color: "#f0f0f0" }}>
          Recent Updates
        </h3>
        <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
          {UPDATES.map((update) => (
            <div
              key={update.id}
              style={{
                background: "#252b2d",
                borderRadius: "14px",
                padding: "16px",
                borderLeft: `4px solid ${update.tagColor}`,
              }}
            >
              {/* Tag + Date */}
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  marginBottom: "10px",
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                  <div
                    style={{
                      background: update.iconBg,
                      borderRadius: "50%",
                      width: 32,
                      height: 32,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    {update.icon}
                  </div>
                  <span
                    style={{
                      background: `${update.tagColor}22`,
                      color: update.tagColor,
                      borderRadius: "20px",
                      padding: "3px 10px",
                      fontSize: "11px",
                      fontWeight: 600,
                    }}
                  >
                    {update.tag}
                  </span>
                </div>
                <span style={{ fontSize: "11px", color: "#888" }}>{update.date}</span>
              </div>

              {/* Content */}
              <h4 style={{ margin: "0 0 8px", fontSize: "15px", fontWeight: 600, color: "#f0f0f0" }}>
                {update.title}
              </h4>
              <p style={{ margin: 0, fontSize: "13px", color: "#bbb", lineHeight: 1.6 }}>
                {update.description}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Quick Actions */}
      <div style={{ padding: "8px 16px 16px" }}>
        <h3 style={{ margin: "0 0 12px", fontSize: "16px", fontWeight: 600 }}>Quick Actions</h3>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px" }}>
          {[
            { label: "View Workouts", route: "/workout-week", color: "#4ECDC4" },
            { label: "Food Planner", route: "/foodpage", color: "#F39C12" },
            { label: "My Schedule", route: "/gym-schedules", color: "#9B59B6" },
            { label: "Diet Plan", route: "/diet-plan", color: "#2ECC71" },
          ].map((action, i) => (
            <button
              key={i}
              onClick={() => navigate(action.route)}
              style={{
                padding: "14px",
                background: `${action.color}18`,
                border: `1px solid ${action.color}44`,
                borderRadius: "12px",
                color: action.color,
                fontWeight: 600,
                fontSize: "13px",
                cursor: "pointer",
              }}
            >
              {action.label}
            </button>
          ))}
        </div>
      </div>

      <div
        style={{
          position: "fixed",
          bottom: 0,
          left: 0,
          right: 0,
        }}
      >
        <Suspense fallback={<FooterSkeleton />}>
          <FooterNav />
        </Suspense>
      </div>
    </div>
  );
};

export default GymUpdatesPage;
