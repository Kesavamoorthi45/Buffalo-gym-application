import React, { useState, useEffect, Suspense } from "react";
import { useNavigate } from "react-router-dom";
import {
  FaArrowLeft, FaCalendarAlt, FaFire, FaSnowflake, FaInfoCircle,
  FaExclamationTriangle, FaRobot, FaCheckCircle,
} from "react-icons/fa";
import axiosInstance from "./utils/axiosInstance";
import Logo from "../assets/logo.webp";
import "../css/WorkoutPage.css";
const FooterNav = React.lazy(() => import("./FooterNav"));
import FooterSkeleton from "./FooterLoading";

const WorkoutCalendar = React.lazy(() =>
  import("./calender").catch(() => ({
    default: () => (
      <div style={{ textAlign: "center", padding: "32px 20px", color: "#aaa" }}>
        <FaExclamationTriangle size={28} color="#F39C12" style={{ marginBottom: 12 }} />
        <p style={{ fontSize: 14 }}>Calendar could not be loaded.<br />Complete your profile to view workout history.</p>
      </div>
    ),
  }))
);

// ─── 7-day weekly plans by body type ─────────────────────────────────────────
const WEEKLY_PLANS = {
  FLABBY: [
    { day: "Mon", type: "Weight Loss",      emoji: "🔥", route: "/weight-loss",        duration: "45 min",  intensity: "High",     focus: "HIIT + Fat Burn Circuit" },
    { day: "Tue", type: "Cardio",           emoji: "🏃", route: "/cardio",             duration: "40 min",  intensity: "Moderate", focus: "Steady State + Intervals" },
    { day: "Wed", type: "Yoga",             emoji: "🧘", route: "/yoga",               duration: "30 min",  intensity: "Low",      focus: "Active Recovery & Stretch" },
    { day: "Thu", type: "Weight Loss",      emoji: "🔥", route: "/weight-loss",        duration: "50 min",  intensity: "High",     focus: "Full Body Circuit Training" },
    { day: "Fri", type: "Cardio",           emoji: "🏃", route: "/cardio",             duration: "45 min",  intensity: "High",     focus: "HIIT Sprint Sessions" },
    { day: "Sat", type: "Strength Training",emoji: "💪", route: "/strength-training",  duration: "40 min",  intensity: "Moderate", focus: "Muscle & Metabolism Boost" },
    { day: "Sun", type: "Rest",             emoji: "😴", route: null,                  duration: "—",       intensity: "Rest",     focus: "Recovery & Recharge" },
  ],
  SKINNY: [
    { day: "Mon", type: "Strength Training",emoji: "💪", route: "/strength-training",  duration: "55 min",  intensity: "High",     focus: "Push Day: Chest, Shoulders, Triceps" },
    { day: "Tue", type: "Strength Training",emoji: "💪", route: "/strength-training",  duration: "55 min",  intensity: "High",     focus: "Pull Day: Back & Biceps" },
    { day: "Wed", type: "Yoga",             emoji: "🧘", route: "/yoga",               duration: "30 min",  intensity: "Low",      focus: "Active Recovery & Mobility" },
    { day: "Thu", type: "Strength Training",emoji: "💪", route: "/strength-training",  duration: "55 min",  intensity: "High",     focus: "Leg Day: Quads, Hamstrings, Glutes" },
    { day: "Fri", type: "Cardio",           emoji: "🏃", route: "/cardio",             duration: "20 min",  intensity: "Low",      focus: "Light Cardio for Heart Health" },
    { day: "Sat", type: "Strength Training",emoji: "💪", route: "/strength-training",  duration: "60 min",  intensity: "High",     focus: "Full Body Compound Movements" },
    { day: "Sun", type: "Rest",             emoji: "😴", route: null,                  duration: "—",       intensity: "Rest",     focus: "Complete Rest & Nutrition Focus" },
  ],
  IDEAL: [
    { day: "Mon", type: "Strength Training",emoji: "💪", route: "/strength-training",  duration: "50 min",  intensity: "Moderate", focus: "Upper Body Strength" },
    { day: "Tue", type: "Cardio",           emoji: "🏃", route: "/cardio",             duration: "35 min",  intensity: "Moderate", focus: "Endurance & Cardiovascular Health" },
    { day: "Wed", type: "Yoga",             emoji: "🧘", route: "/yoga",               duration: "40 min",  intensity: "Low",      focus: "Flexibility & Mind-Body Balance" },
    { day: "Thu", type: "Strength Training",emoji: "💪", route: "/strength-training",  duration: "50 min",  intensity: "Moderate", focus: "Lower Body Strength" },
    { day: "Fri", type: "Cardio",           emoji: "🏃", route: "/cardio",             duration: "30 min",  intensity: "Moderate", focus: "Fun Cardio: Cycling / Dance / Swim" },
    { day: "Sat", type: "Weight Loss",      emoji: "🔥", route: "/weight-loss",        duration: "45 min",  intensity: "Moderate", focus: "Full Body Active Workout" },
    { day: "Sun", type: "Rest",             emoji: "😴", route: null,                  duration: "—",       intensity: "Rest",     focus: "Rest, Meal Prep & Recovery" },
  ],
};

// 0 = Monday … 6 = Sunday (our plan indexing)
const TODAY_IDX = (new Date().getDay() + 6) % 7;
const DAY_NAMES = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];

const INTENSITY_COLOR = { High: "#FF6B6B", Moderate: "#F39C12", Low: "#2ECC71", Rest: "#888" };
const TYPE_ROUTE_COLOR = {
  "Weight Loss":       "#FF6B6B",
  "Cardio":            "#F39C12",
  "Yoga":              "#9B59B6",
  "Strength Training": "#4ECDC4",
  "Rest":              "#555",
};

const BODY_MAP   = { SKINNY: "skinny (needs muscle mass)", FLABBY: "flabby (needs fat loss)", IDEAL: "ideal physique" };
const GENDER_MAP = { M: "male", F: "female", O: "non-binary", N: "person" };

const LEGEND_ITEMS = [
  { icon: <FaFire size={15} color="#F59E0B" />, label: "Workout day", desc: "You completed a workout and burned calories" },
  { icon: <FaSnowflake size={15} color="#60A5FA" />, label: "Rest day", desc: "No workout recorded — recovery day" },
];

// ─── Skeleton ─────────────────────────────────────────────────────────────────
const AiSkeleton = () => (
  <div style={{ padding: "14px", background: "#2d3335", borderRadius: 10 }}>
    {[80, 95, 60].map((w, i) => (
      <div key={i} style={{ height: 11, background: "#3a4042", borderRadius: 6, marginBottom: 7, width: `${w}%`, animation: "pulse 1.5s ease-in-out infinite" }} />
    ))}
  </div>
);

// ─── DayCard ──────────────────────────────────────────────────────────────────
const DayCard = ({ plan, index, isToday, navigate }) => {
  const isRest   = plan.type === "Rest";
  const color    = TYPE_ROUTE_COLOR[plan.type] || "#4ECDC4";
  const intColor = INTENSITY_COLOR[plan.intensity] || "#888";

  return (
    <div
      onClick={() => plan.route && navigate(plan.route)}
      style={{
        background: isToday ? `${color}18` : "#252b2d",
        border: isToday ? `2px solid ${color}` : "2px solid transparent",
        borderRadius: 14,
        padding: "14px 16px",
        marginBottom: 10,
        cursor: isRest ? "default" : "pointer",
        position: "relative",
        transition: "transform 0.15s",
      }}
    >
      {isToday && (
        <div style={{ position: "absolute", top: 10, right: 12, background: color, color: "#fff", borderRadius: 20, padding: "2px 10px", fontSize: 10, fontWeight: 700, letterSpacing: 0.5 }}>
          TODAY
        </div>
      )}
      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
        <div style={{ width: 42, height: 42, background: isRest ? "#333" : `${color}22`, borderRadius: 12, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20, flexShrink: 0 }}>
          {plan.emoji}
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 3 }}>
            <p style={{ margin: 0, fontSize: 12, color: "#888", fontWeight: 600, textTransform: "uppercase", letterSpacing: 0.4 }}>{DAY_NAMES[index]}</p>
            {!isRest && (
              <span style={{ background: `${intColor}22`, color: intColor, borderRadius: 20, padding: "1px 7px", fontSize: 10, fontWeight: 700 }}>
                {plan.intensity}
              </span>
            )}
          </div>
          <p style={{ margin: "0 0 2px", fontSize: 14, fontWeight: 700, color: isRest ? "#666" : "#f0f0f0" }}>{plan.type}</p>
          <p style={{ margin: 0, fontSize: 12, color: "#888", lineHeight: 1.4 }}>{plan.focus}</p>
        </div>
        {!isRest && (
          <div style={{ textAlign: "right", flexShrink: 0 }}>
            <p style={{ margin: 0, fontSize: 13, fontWeight: 700, color }}>
              {plan.duration}
            </p>
            <p style={{ margin: 0, fontSize: 11, color: "#666" }}>duration</p>
          </div>
        )}
      </div>
    </div>
  );
};

// ─── Main Component ───────────────────────────────────────────────────────────
const GymSchedulesPage = () => {
  const navigate = useNavigate();
  const [profile, setProfile] = useState(null);
  const [aiTip, setAiTip]   = useState("");
  const [aiLoading, setAiLoading] = useState(true);
  const [pageLoading, setPageLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const [userRes, bodyRes] = await Promise.allSettled([
          axiosInstance.get("user/"),
          axiosInstance.get("update-body-type/"),
        ]);
        const user = userRes.status === "fulfilled" ? userRes.value.data : {};
        const body = bodyRes.status === "fulfilled" ? bodyRes.value.data : {};
        setProfile({ gender: user.gender || "", age: user.age || null, bodyType: body.body_type || "IDEAL" });
      } catch {
        setProfile({ gender: "", age: null, bodyType: "IDEAL" });
      } finally {
        setPageLoading(false);
      }
    };
    load();
  }, []);

  useEffect(() => {
    if (!profile) return;
    const fetchTip = async () => {
      setAiLoading(true);
      try {
        const genderLabel = GENDER_MAP[profile.gender] || "person";
        const bodyLabel   = BODY_MAP[profile.bodyType] || "average build";
        const agePart     = profile.age ? `, ${profile.age} years old` : "";
        const prompt = `You are a certified personal trainer. Give exactly 3 short, actionable weekly training tips for a ${genderLabel}${agePart} with a ${bodyLabel} body type. Each tip must be 1 sentence. Format: "• tip". No intro.`;
        const res = await axiosInstance.post("ai-chat/", { message: prompt });
        setAiTip(res.data.message || "");
      } catch {
        setAiTip("• Always warm up for 5–10 minutes before every session to prevent injury.\n• Prioritise sleep — muscles grow during rest, not during workouts.\n• Track your workouts to see progress and stay motivated every week.");
      } finally {
        setAiLoading(false);
      }
    };
    fetchTip();
  }, [profile]);

  const bodyType    = profile?.bodyType && WEEKLY_PLANS[profile.bodyType] ? profile.bodyType : "IDEAL";
  const weekPlan    = WEEKLY_PLANS[bodyType];
  const todayPlan   = weekPlan[TODAY_IDX];
  const accentColor = todayPlan.type === "Rest" ? "#888" : (TYPE_ROUTE_COLOR[todayPlan.type] || "#4ECDC4");

  const aiBullets = aiTip
    .split("\n")
    .map((l) => l.replace(/^[•\-\*]\s*/, "").trim())
    .filter((l) => l.length > 10)
    .slice(0, 3);

  if (pageLoading) {
    return (
      <div style={{ minHeight: "100vh", background: "#1a1f21", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
        <div style={{ width: 40, height: 40, border: "4px solid #333", borderTop: "4px solid #6C63FF", borderRadius: "50%", animation: "spin 1s linear infinite" }} />
        <p style={{ marginTop: 16, color: "#aaa", fontSize: 14 }}>Loading your weekly schedule…</p>
        <style>{`@keyframes spin{0%{transform:rotate(0deg)}100%{transform:rotate(360deg)}}`}</style>
      </div>
    );
  }

  return (
    <div style={{ minHeight: "100vh", background: "#1a1f21", color: "#f0f0f0", paddingBottom: 100 }}>
      {/* Header */}
      <header className="workout-header" style={{ position: "sticky", top: 0, zIndex: 100, borderBottom: "1px solid #333" }}>
        <button className="back-button" onClick={() => navigate("/")}>
          <FaArrowLeft />
        </button>
        <div className="logo-container">
          <img src={Logo} alt="Logo" className="logo" />
        </div>
        <h1 className="header-title" style={{ fontSize: 20 }}>MY SCHEDULE</h1>
      </header>

      {/* Hero — Today's Focus */}
      <div style={{ background: `linear-gradient(135deg, #6C63FF, #4834D4)`, padding: "24px 20px" }}>
        <p style={{ margin: "0 0 4px", fontSize: 12, color: "rgba(255,255,255,0.7)", fontWeight: 600, textTransform: "uppercase", letterSpacing: 1 }}>
          Today · {DAY_NAMES[TODAY_IDX]}
        </p>
        <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 8 }}>
          <span style={{ fontSize: 36 }}>{todayPlan.emoji}</span>
          <div>
            <h2 style={{ margin: 0, fontSize: 22, fontWeight: 800, color: "#fff" }}>{todayPlan.type}</h2>
            <p style={{ margin: 0, fontSize: 13, color: "rgba(255,255,255,0.8)" }}>{todayPlan.focus}</p>
          </div>
        </div>
        {todayPlan.route ? (
          <button
            onClick={() => navigate(todayPlan.route)}
            style={{ background: "rgba(255,255,255,0.2)", border: "1px solid rgba(255,255,255,0.4)", color: "#fff", borderRadius: 10, padding: "10px 20px", fontWeight: 700, fontSize: 13, cursor: "pointer" }}
          >
            Start Today's Workout →
          </button>
        ) : (
          <div style={{ background: "rgba(255,255,255,0.12)", borderRadius: 10, padding: "10px 16px", display: "inline-flex", alignItems: "center", gap: 8 }}>
            <span style={{ fontSize: 16 }}>😴</span>
            <span style={{ fontSize: 13, color: "rgba(255,255,255,0.8)", fontWeight: 600 }}>Rest Day — let your muscles recover</span>
          </div>
        )}
      </div>

      <div style={{ padding: "16px 16px 0" }}>

        {/* Goal badge */}
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 14 }}>
          <span style={{ fontSize: 12, color: "#888" }}>
            Plan optimized for
          </span>
          <span style={{
            background: bodyType === "FLABBY" ? "#FF6B6B22" : bodyType === "SKINNY" ? "#4ECDC422" : "#2ECC7122",
            color:      bodyType === "FLABBY" ? "#FF6B6B"   : bodyType === "SKINNY" ? "#4ECDC4"   : "#2ECC71",
            borderRadius: 20, padding: "3px 12px", fontSize: 12, fontWeight: 700,
          }}>
            {bodyType === "FLABBY" ? "Fat Loss" : bodyType === "SKINNY" ? "Muscle Gain" : "Maintenance"}
          </span>
        </div>

        {/* AI Weekly Coach */}
        <div style={{ background: "#252b2d", borderRadius: 14, padding: 16, marginBottom: 14 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10 }}>
            <div style={{ width: 30, height: 30, background: "rgba(108,99,255,0.2)", borderRadius: 8, display: "flex", alignItems: "center", justifyContent: "center" }}>
              <FaRobot size={13} color="#6C63FF" />
            </div>
            <div>
              <p style={{ margin: 0, fontWeight: 700, fontSize: 14, color: "#f0f0f0" }}>AI Coach · Weekly Tips</p>
              <p style={{ margin: 0, fontSize: 11, color: "#888" }}>Personalised for your fitness goal</p>
            </div>
          </div>
          {aiLoading ? <AiSkeleton /> : (
            <div style={{ display: "flex", flexDirection: "column", gap: 9 }}>
              {aiBullets.length > 0 ? aiBullets.map((tip, i) => (
                <div key={i} style={{ display: "flex", gap: 10, alignItems: "flex-start" }}>
                  <FaCheckCircle size={13} color="#6C63FF" style={{ marginTop: 2, flexShrink: 0 }} />
                  <p style={{ margin: 0, fontSize: 13, color: "#ccc", lineHeight: 1.6 }}>{tip}</p>
                </div>
              )) : (
                <p style={{ margin: 0, fontSize: 13, color: "#aaa" }}>Stay consistent — every session builds toward your goal!</p>
              )}
            </div>
          )}
        </div>

        {/* 7-Day Plan */}
        <div style={{ marginBottom: 20 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12 }}>
            <FaCalendarAlt size={14} color="#6C63FF" />
            <span style={{ fontWeight: 700, fontSize: 14, color: "#f0f0f0" }}>This Week's Schedule</span>
          </div>
          {weekPlan.map((plan, idx) => (
            <DayCard
              key={plan.day}
              plan={plan}
              index={idx}
              isToday={idx === TODAY_IDX}
              navigate={navigate}
            />
          ))}
        </div>

        {/* Quick Stats Row */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 8, marginBottom: 20 }}>
          {[
            { label: "Active Days",  value: weekPlan.filter(d => d.type !== "Rest").length, unit: "/week" },
            { label: "Rest Days",    value: weekPlan.filter(d => d.type === "Rest").length,  unit: "/week" },
            { label: "Avg Duration", value: Math.round(weekPlan.filter(d => d.duration !== "—").reduce((sum, d) => sum + parseInt(d.duration), 0) / weekPlan.filter(d => d.duration !== "—").length), unit: "min" },
          ].map((stat, i) => (
            <div key={i} style={{ background: "#252b2d", borderRadius: 12, padding: "12px 10px", textAlign: "center", borderTop: "3px solid #6C63FF" }}>
              <p style={{ margin: "0 0 4px", fontSize: 20, fontWeight: 800, color: "#6C63FF" }}>{stat.value}</p>
              <p style={{ margin: 0, fontSize: 11, color: "#aaa" }}>{stat.label}</p>
              <p style={{ margin: 0, fontSize: 10, color: "#666" }}>{stat.unit}</p>
            </div>
          ))}
        </div>

        {/* Workout Calendar section */}
        <div style={{ marginBottom: 16 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12 }}>
            <FaCalendarAlt size={14} color="#aaa" />
            <span style={{ fontWeight: 700, fontSize: 14, color: "#f0f0f0" }}>Workout History</span>
          </div>
          <Suspense fallback={
            <div style={{ textAlign: "center", padding: 40, color: "#aaa" }}>
              <div style={{ width: 36, height: 36, border: "4px solid #444", borderTop: "4px solid #6C63FF", borderRadius: "50%", margin: "0 auto 12px", animation: "spin 1s linear infinite" }} />
              <p>Loading calendar…</p>
            </div>
          }>
            <WorkoutCalendar />
          </Suspense>
        </div>

        {/* Calendar Legend */}
        <div style={{ background: "#252b2d", borderRadius: 14, padding: 16, marginBottom: 14 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10 }}>
            <FaInfoCircle size={13} color="#aaa" />
            <span style={{ fontSize: 13, color: "#aaa", fontWeight: 600 }}>How to read the calendar</span>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {LEGEND_ITEMS.map((item, i) => (
              <div key={i} style={{ display: "flex", alignItems: "center", gap: 12 }}>
                <div style={{ width: 32, height: 32, background: "#333", borderRadius: 8, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                  {item.icon}
                </div>
                <div>
                  <p style={{ margin: 0, fontSize: 13, fontWeight: 600, color: "#f0f0f0" }}>{item.label}</p>
                  <p style={{ margin: 0, fontSize: 12, color: "#aaa" }}>{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Pro Tip */}
        <div style={{ background: "rgba(108,99,255,0.1)", border: "1px solid rgba(108,99,255,0.3)", borderRadius: 14, padding: "14px 16px", marginBottom: 14 }}>
          <p style={{ margin: 0, fontSize: 13, color: "#a5b4fc", lineHeight: 1.6 }}>
            <strong>Pro Tip:</strong> Tap any workout day above to go directly to that exercise category.
            Aim to complete 4+ active days per week for measurable results within 4 weeks.
          </p>
        </div>

      </div>

      <div style={{ position: "fixed", bottom: 0, left: 0, right: 0 }}>
        <Suspense fallback={<FooterSkeleton />}>
          <FooterNav />
        </Suspense>
      </div>

      <style>{`
        @keyframes spin  { 0%{transform:rotate(0deg)} 100%{transform:rotate(360deg)} }
        @keyframes pulse { 0%,100%{opacity:1} 50%{opacity:.35} }
      `}</style>
    </div>
  );
};

export default GymSchedulesPage;
