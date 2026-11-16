import React, { useState, useEffect, Suspense } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import {
  FaArrowLeft, FaHeart, FaFire, FaBolt, FaLeaf, FaRunning,
  FaRobot, FaAppleAlt, FaBullseye, FaChartLine, FaCheckCircle,
} from "react-icons/fa";
import axiosInstance from "./utils/axiosInstance";
import "../css/WorkoutPage.css";
import Logo from "../assets/logo.webp";
import Week1 from "../assets/week1.jpg";
import Week2 from "../assets/week2.jpg";
import Week3 from "../assets/week3.jpg";
import Week4 from "../assets/week4.jpg";
import Week5 from "../assets/week5.jpg";
const FooterNav = React.lazy(() => import("./FooterNav"));
import FooterSkeleton from "./FooterLoading";

// ─── Static category config ──────────────────────────────────────────────────
const CATEGORY_CONFIG = {
  "/weight-loss": {
    display: "Weight Loss",
    key: "WEIGHT_LOSS",
    gradient: "linear-gradient(135deg, #FF6B6B, #FF8E53)",
    accentColor: "#FF6B6B",
    icon: <FaFire size={26} color="#fff" />,
    goalTag: "Fat Burn",
  },
  "/strength-training": {
    display: "Strength Training",
    key: "STRENGTH",
    gradient: "linear-gradient(135deg, #4ECDC4, #2ECC71)",
    accentColor: "#4ECDC4",
    icon: <FaBolt size={26} color="#fff" />,
    goalTag: "Muscle Build",
  },
  "/yoga": {
    display: "Yoga",
    key: "YOGA",
    gradient: "linear-gradient(135deg, #9B59B6, #8E44AD)",
    accentColor: "#9B59B6",
    icon: <FaLeaf size={26} color="#fff" />,
    goalTag: "Flexibility & Mind",
  },
  "/cardio": {
    display: "Cardio",
    key: "CARDIO",
    gradient: "linear-gradient(135deg, #F39C12, #E67E22)",
    accentColor: "#F39C12",
    icon: <FaRunning size={26} color="#fff" />,
    goalTag: "Endurance",
  },
};

// ─── Personalisation engine ───────────────────────────────────────────────────
const calcBMI = (height, weight) => {
  if (!height || !weight) return null;
  return (weight / Math.pow(height / 100, 2)).toFixed(1);
};

const bmiCategory = (bmi) => {
  if (!bmi) return null;
  if (bmi < 18.5) return "Underweight";
  if (bmi < 25) return "Normal weight";
  if (bmi < 30) return "Overweight";
  return "Obese";
};

const MATCH_TABLE = {
  "/weight-loss": { FLABBY: 98, IDEAL: 72, SKINNY: 35 },
  "/strength-training": { SKINNY: 98, IDEAL: 88, FLABBY: 78 },
  "/yoga": { FLABBY: 90, IDEAL: 90, SKINNY: 85 },
  "/cardio": { FLABBY: 95, IDEAL: 85, SKINNY: 70 },
};

const MATCH_REASONS = {
  "/weight-loss": {
    FLABBY: "Your body type goal is to lose fat and tone up — this program is built exactly for you.",
    IDEAL: "Great for maintaining your weight and improving stamina over time.",
    SKINNY: "Your primary goal is muscle gain; combine light cardio with strength for best results.",
  },
  "/strength-training": {
    SKINNY: "Your body type goal is to gain muscle mass — progressive strength training is your fastest path.",
    FLABBY: "Strength training builds muscle which raises your resting metabolism and burns fat 24/7.",
    IDEAL: "Strength training keeps your physique sharp and continues building functional fitness.",
  },
  "/yoga": {
    FLABBY: "Yoga reduces cortisol (a fat-storing hormone) and improves flexibility for all other workouts.",
    IDEAL: "Yoga adds the mindfulness and mobility layer that completes a well-rounded fitness routine.",
    SKINNY: "Yoga builds mind-muscle connection, posture, and flexibility critical for strength gains.",
  },
  "/cardio": {
    FLABBY: "Cardio creates the calorie deficit needed to accelerate fat loss alongside diet.",
    IDEAL: "Cardio keeps your heart healthy and stamina high, essential for long-term fitness.",
    SKINNY: "Moderate cardio improves heart health and endurance without significant muscle loss.",
  },
};

const WEEKLY_TARGETS = {
  "/weight-loss": { sessions: "4–5", calPerSession: "400–600", durationMins: "40–60" },
  "/strength-training": { sessions: "3–4", calPerSession: "250–450", durationMins: "45–60" },
  "/yoga": { sessions: "4–6", calPerSession: "150–280", durationMins: "30–50" },
  "/cardio": { sessions: "4–5", calPerSession: "350–550", durationMins: "30–50" },
};

const NUTRITION_TIPS = {
  "/weight-loss": {
    VEG: "Eat high-fibre vegetables (broccoli, spinach, lentils) with every meal. Aim for 1.4 g of protein per kg of bodyweight using tofu, paneer, and legumes.",
    NON_VEG: "Lean proteins like chicken breast, egg whites, and fish keep you full longer. Avoid fried foods; prefer grilled or boiled.",
    VEGAN: "Rely on chickpeas, quinoa, edamame, and tempeh for protein. Keep healthy fats from avocado and nuts moderate to stay in a calorie deficit.",
    DEFAULT: "Eat in a moderate calorie deficit (250–500 kcal below maintenance). Prioritise protein at every meal to preserve muscle while losing fat.",
  },
  "/strength-training": {
    VEG: "Maximise protein with paneer, Greek yogurt, lentils, and soy milk. Aim for 1.6–2 g of protein per kg of bodyweight daily.",
    NON_VEG: "Chicken, eggs, and fish are your best allies. Eat a protein-rich meal within 45 minutes of every training session.",
    VEGAN: "Combine plant proteins — rice + beans, hummus + whole-grain bread — to get all essential amino acids for muscle repair.",
    DEFAULT: "Consume a calorie surplus of 200–300 kcal above maintenance. Prioritise 1.6–2.2 g of protein per kg bodyweight daily.",
  },
  "/yoga": {
    VEG: "Light meals 1–2 hours before practice. Ginger tea, fruits, and light dal help with flexibility and reduce inflammation.",
    NON_VEG: "Avoid heavy meat meals before sessions. Eggs or a light protein shake work well 2 hours prior.",
    VEGAN: "Hydrate well and eat anti-inflammatory foods — berries, turmeric, leafy greens — to support recovery and flexibility.",
    DEFAULT: "Stay hydrated. Eat light 1–2 hours before sessions. Anti-inflammatory foods (turmeric, berries, nuts) support recovery.",
  },
  "/cardio": {
    VEG: "Carbohydrates are your cardio fuel. Oats, bananas, and whole-grain rotis before sessions. Coconut water for electrolyte replacement.",
    NON_VEG: "Bananas or toast 30 minutes before cardio. Post-session, a boiled egg + fruit replenishes glycogen and aids recovery.",
    VEGAN: "Dates, bananas, and energy balls (oats + nut butter) are excellent pre-cardio fuel. Replenish with a smoothie after.",
    DEFAULT: "Carbohydrates power endurance. Eat a moderate-carb meal 1–2 hours before sessions. Hydrate consistently throughout.",
  },
};

// ─── Helpers ──────────────────────────────────────────────────────────────────
const getWeekImage = (week) =>
  ({ "Week 1": Week1, "Week 2": Week2, "Week 3": Week3, "Week 4": Week4, "Week 5": Week5 }[week] || Week1);

const matchColor = (score) => {
  if (score >= 90) return "#2ECC71";
  if (score >= 70) return "#F39C12";
  return "#E74C3C";
};

const matchLabel = (score) => {
  if (score >= 90) return "Perfect Match";
  if (score >= 70) return "Good Match";
  return "Low Match";
};

const GENDER_MAP = { M: "male", F: "female", O: "non-binary", N: "person" };
const DIET_MAP = { VEG: "vegetarian", NON_VEG: "non-vegetarian", VEGAN: "vegan" };
const BODY_MAP = { SKINNY: "skinny (needs muscle mass)", FLABBY: "flabby (needs fat loss)", IDEAL: "ideal physique (maintenance)" };

// ─── Exercise Plans ───────────────────────────────────────────────────────────
const EXERCISE_PLANS = {
  "/weight-loss": [
    { name: "Burpees",               muscle: "Full Body",        sets: 4, reps: "10–12",    rest: "45s",  difficulty: "Hard",   tip: "Jump explosively and land softly to maximise calorie burn." },
    { name: "Jump Squats",           muscle: "Legs & Glutes",    sets: 3, reps: "15–20",    rest: "30s",  difficulty: "Medium", tip: "Drive through heels and land with soft knees to protect joints." },
    { name: "Mountain Climbers",     muscle: "Core & Cardio",    sets: 4, reps: "40s",      rest: "20s",  difficulty: "Medium", tip: "Keep hips level — don't let them rise. Alternate legs rapidly." },
    { name: "High Knees",            muscle: "Legs & Core",      sets: 3, reps: "60s",      rest: "20s",  difficulty: "Easy",   tip: "Drive knees to hip height. Pump arms vigorously to spike heart rate." },
    { name: "Dumbbell Row & Press",  muscle: "Upper Body",       sets: 3, reps: "12 each",  rest: "45s",  difficulty: "Medium", tip: "2 seconds down, 1 second up. No swinging — control the weight." },
    { name: "Plank Hold",            muscle: "Core & Stability", sets: 3, reps: "45–60s",   rest: "30s",  difficulty: "Medium", tip: "Squeeze glutes and abs. Keep straight line from head to heels." },
  ],
  "/strength-training": [
    { name: "Barbell Squat",         muscle: "Legs & Glutes",       sets: 4, reps: "8–10",  rest: "90s",  difficulty: "Hard",   tip: "Chest up, knees track over toes. Go to parallel or below." },
    { name: "Bench Press",           muscle: "Chest & Triceps",     sets: 4, reps: "8–10",  rest: "90s",  difficulty: "Hard",   tip: "Arch your back naturally. Lower bar to mid-chest, press explosively." },
    { name: "Deadlift",              muscle: "Back, Legs & Core",   sets: 3, reps: "6–8",   rest: "120s", difficulty: "Hard",   tip: "Keep the bar close to your body. Hinge at the hips — not a squat." },
    { name: "Pull-ups / Lat Pulldown",muscle: "Back & Biceps",      sets: 3, reps: "8–12",  rest: "75s",  difficulty: "Medium", tip: "Pull elbows to your sides. Squeeze lats at the bottom of each rep." },
    { name: "Overhead Press",        muscle: "Shoulders & Triceps", sets: 3, reps: "10–12", rest: "75s",  difficulty: "Medium", tip: "Brace core and press in a straight line. Lock out and lower slowly." },
    { name: "Barbell Row",           muscle: "Upper Back",          sets: 3, reps: "10–12", rest: "75s",  difficulty: "Medium", tip: "Keep back flat at 45°. Row to lower chest, not chin." },
  ],
  "/yoga": [
    { name: "Sun Salutation",        muscle: "Full Body Flow",      sets: 3, reps: "5 rounds",         rest: "60s",  difficulty: "Easy",   tip: "Sync breath with movement — inhale to extend, exhale to fold." },
    { name: "Warrior I & II",        muscle: "Legs, Hips & Core",   sets: 1, reps: "30–45s each side", rest: "15s",  difficulty: "Easy",   tip: "Front knee stays directly over ankle. Open chest and breathe." },
    { name: "Downward Dog",          muscle: "Hamstrings & Back",   sets: 3, reps: "45–60s",           rest: "15s",  difficulty: "Easy",   tip: "Press through palms, heels toward the floor. Pedal feet to deepen." },
    { name: "Boat Pose",             muscle: "Core & Hip Flexors",  sets: 3, reps: "Hold 30s",          rest: "30s",  difficulty: "Medium", tip: "Sit on sit bones, not tailbone. Keep chest open, spine long." },
    { name: "Pigeon Pose",           muscle: "Hip Flexors & Glutes",sets: 1, reps: "60s each side",     rest: "15s",  difficulty: "Medium", tip: "Breathe slowly through any discomfort. Never force deep hip flexors." },
    { name: "Tree Pose",             muscle: "Balance & Focus",     sets: 1, reps: "45s each side",     rest: "15s",  difficulty: "Easy",   tip: "Fix gaze on a point. Foot to inner thigh — never on the knee." },
  ],
  "/cardio": [
    { name: "Jump Rope",             muscle: "Full Body Cardio",    sets: 4, reps: "3 min",             rest: "60s",  difficulty: "Medium", tip: "Stay on balls of your feet. Jump just high enough for rope clearance." },
    { name: "HIIT Intervals",        muscle: "Cardiovascular",      sets: 5, reps: "40s on / 20s off",  rest: "90s",  difficulty: "Hard",   tip: "Give 90% effort during work intervals. HIIT only works if you push hard." },
    { name: "Stair Climbing",        muscle: "Legs & Glutes",       sets: 1, reps: "20 min steady",     rest: "N/A",  difficulty: "Medium", tip: "Lean slightly forward. Use glutes to push up each step, not just quads." },
    { name: "Cycling (Stationary)",  muscle: "Legs & Cardio",       sets: 1, reps: "30–45 min",         rest: "N/A",  difficulty: "Easy",   tip: "Vary intensity — 2 min easy, 1 min hard — to prevent boredom and boost burn." },
    { name: "Sprint Intervals",      muscle: "Legs & Cardiovascular",sets: 6,reps: "30s sprint + 90s jog",rest:"each", difficulty: "Hard",  tip: "Pump arms hard during sprints. Hit 85–90% max effort every sprint." },
    { name: "Box Step-Ups",          muscle: "Legs & Core",         sets: 3, reps: "15 each leg",       rest: "45s",  difficulty: "Easy",   tip: "Drive through heel, not toes. Fully extend hip at the top of each rep." },
  ],
};

const DIFF_COLOR = { Easy: "#2ECC71", Medium: "#F39C12", Hard: "#FF6B6B" };

// ─── Sub-components ───────────────────────────────────────────────────────────
const WorkoutCard = ({ workout, navigate }) => {
  const [isFavorite, setIsFavorite] = useState(workout.is_favorite || false);

  const toggleFavorite = async (e) => {
    e.stopPropagation();
    try {
      const res = await axiosInstance.post("toggle-favorite/", { workout_id: workout.id });
      setIsFavorite(res.data.is_favorite);
    } catch {}
  };

  const truncate = (text, limit) => {
    const words = text.split(" ");
    return words.length > limit ? words.slice(0, limit).join(" ") + "..." : text;
  };

  return (
    <div className="workout-card">
      <img src={workout.image || getWeekImage(workout.week)} alt={workout.name} className="workout-image" loading="lazy" />
      <div className="workout-details">
        <h3>{workout.name}</h3>
        <p className="workout-description">{truncate(workout.description, 6)}</p>
        <div className="workout-actions">
          <button className="start-button" onClick={() => navigate(`/workout-day/${workout.id}`)}>
            Start
          </button>
        </div>
        <span className="workout-week">{workout.week}</span>
      </div>
      <button className={`favorite-button ${isFavorite ? "favorite-active" : ""}`} onClick={toggleFavorite}>
        <FaHeart />
      </button>
    </div>
  );
};

const AiTipSkeleton = () => (
  <div style={{ padding: "16px", background: "#2d3335", borderRadius: "12px", marginBottom: "4px" }}>
    {[80, 95, 60].map((w, i) => (
      <div key={i} style={{ height: 12, background: "#3a4042", borderRadius: 6, marginBottom: 8, width: `${w}%`, animation: "pulse 1.5s ease-in-out infinite" }} />
    ))}
  </div>
);

const ExerciseRow = ({ exercise, accentColor }) => (
  <div style={{ background: "#1a1f21", borderRadius: 12, padding: "14px", marginBottom: 8, borderLeft: `3px solid ${DIFF_COLOR[exercise.difficulty] || accentColor}` }}>
    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 6 }}>
      <div>
        <p style={{ margin: "0 0 2px", fontSize: 14, fontWeight: 700, color: "#f0f0f0" }}>{exercise.name}</p>
        <p style={{ margin: 0, fontSize: 12, color: "#888" }}>{exercise.muscle}</p>
      </div>
      <span style={{ background: `${DIFF_COLOR[exercise.difficulty]}22`, color: DIFF_COLOR[exercise.difficulty], borderRadius: 20, padding: "2px 9px", fontSize: 11, fontWeight: 700, whiteSpace: "nowrap", marginLeft: 8 }}>
        {exercise.difficulty}
      </span>
    </div>
    <div style={{ display: "flex", gap: 8, marginBottom: 7, flexWrap: "wrap" }}>
      <span style={{ background: "#252b2d", borderRadius: 8, padding: "4px 10px", fontSize: 11, color: "#ccc", fontWeight: 600 }}>
        {exercise.sets} sets × {exercise.reps}
      </span>
      <span style={{ background: "#252b2d", borderRadius: 8, padding: "4px 10px", fontSize: 11, color: "#aaa" }}>
        Rest {exercise.rest}
      </span>
    </div>
    <div style={{ display: "flex", gap: 6, alignItems: "flex-start" }}>
      <span style={{ color: accentColor, fontSize: 10, marginTop: 3, flexShrink: 0 }}>💡</span>
      <p style={{ margin: 0, fontSize: 12, color: "#999", lineHeight: 1.55, fontStyle: "italic" }}>{exercise.tip}</p>
    </div>
  </div>
);

// ─── Main page ────────────────────────────────────────────────────────────────
const CategoryWorkoutsPage = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const [workouts, setWorkouts] = useState([]);
  const [profile, setProfile] = useState(null);   // consolidated user profile
  const [aiTip, setAiTip] = useState("");
  const [aiLoading, setAiLoading] = useState(true);
  const [pageLoading, setPageLoading] = useState(true);
  const [error, setError] = useState(null);

  const cat = CATEGORY_CONFIG[location.pathname] || {
    display: "Workouts", key: null,
    gradient: "linear-gradient(135deg,#4ECDC4,#2ECC71)",
    accentColor: "#4ECDC4",
    icon: <FaBolt size={26} color="#fff" />,
    goalTag: "Fitness",
  };

  // ── Load profile + workouts in parallel ────────────────────────────────────
  useEffect(() => {
    const load = async () => {
      setPageLoading(true);
      try {
        const [userRes, bodyRes, physRes, dietRes, workoutRes] = await Promise.allSettled([
          axiosInstance.get("user/"),
          axiosInstance.get("update-body-type/"),
          axiosInstance.get("update-physical-profile/"),
          axiosInstance.get("update-dietary-preferences/"),
          axiosInstance.get("workouts/", { params: cat.key ? { category: cat.key } : {} }),
        ]);

        const user = userRes.status === "fulfilled" ? userRes.value.data : {};
        const body = bodyRes.status === "fulfilled" ? bodyRes.value.data : {};
        const phys = physRes.status === "fulfilled" ? physRes.value.data : {};
        const diet = dietRes.status === "fulfilled" ? dietRes.value.data : {};

        const bmi = calcBMI(phys.height, phys.weight);
        const bmiCat = bmiCategory(parseFloat(bmi));

        setProfile({
          userId: user.user_id || "",
          gender: user.gender || "",
          age: user.age || null,
          bodyType: body.body_type || "",
          height: phys.height || null,
          weight: phys.weight || null,
          bmi,
          bmiCategory: bmiCat,
          dietType: diet.diet_type || "DEFAULT",
        });

        if (workoutRes.status === "fulfilled") {
          setWorkouts(workoutRes.value.data);
        }
      } catch (err) {
        setError("Failed to load. Please try again.");
      } finally {
        setPageLoading(false);
      }
    };
    load();
  }, [location.pathname]);

  // ── Fetch personalised AI tip once profile is ready ─────────────────────────
  useEffect(() => {
    if (!profile) return;
    const fetchAiTip = async () => {
      setAiLoading(true);
      try {
        const genderLabel = GENDER_MAP[profile.gender] || "person";
        const dietLabel = DIET_MAP[profile.dietType] || "mixed-diet";
        const bodyLabel = BODY_MAP[profile.bodyType] || "average build";
        const bmiPart = profile.bmi
          ? `, BMI ${profile.bmi} (${profile.bmiCategory})`
          : "";
        const agePart = profile.age ? `, ${profile.age} years old` : "";

        const prompt = `You are a certified fitness coach. Give exactly 3 short, specific, actionable bullet-point tips for ${cat.display} training tailored to a ${genderLabel}${agePart} with a ${bodyLabel} body type${bmiPart} following a ${dietLabel} diet. Each tip must be 1 sentence. Format: "• tip". No intro, no conclusion, just 3 bullets.`;

        const res = await axiosInstance.post("ai-chat/", { message: prompt });
        setAiTip(res.data.message || "");
      } catch {
        setAiTip("• Stay consistent — 3 to 4 sessions per week delivers measurable results within 4 weeks.\n• Warm up for 5–10 minutes before every session to prevent injury.\n• Track your progress weekly so you stay motivated and adjust intensity as needed.");
      } finally {
        setAiLoading(false);
      }
    };
    fetchAiTip();
  }, [profile, location.pathname]);

  // ── Derived personalisation values ─────────────────────────────────────────
  const matchScore = profile?.bodyType ? (MATCH_TABLE[location.pathname]?.[profile.bodyType] ?? 80) : 80;
  const matchReason = profile?.bodyType ? (MATCH_REASONS[location.pathname]?.[profile.bodyType] ?? "") : "";
  const weeklyTarget = WEEKLY_TARGETS[location.pathname] || { sessions: "3–4", calPerSession: "300–500", durationMins: "30–60" };
  const nutritionTip = NUTRITION_TIPS[location.pathname]?.[profile?.dietType] || NUTRITION_TIPS[location.pathname]?.DEFAULT || "";

  // ── Format AI tip bullets as array ─────────────────────────────────────────
  const aiBullets = aiTip
    .split("\n")
    .map((l) => l.replace(/^[•\-\*]\s*/, "").trim())
    .filter((l) => l.length > 10)
    .slice(0, 4);

  // ── Personalised header line ────────────────────────────────────────────────
  const heroSubtitle = () => {
    if (!profile?.bodyType) return `Your personalized ${cat.display.toLowerCase()} program awaits.`;
    const bodyDescMap = {
      SKINNY: "muscle-building foundation",
      FLABBY: "fat-loss transformation",
      IDEAL: "performance & maintenance",
    };
    return `Tailored for your ${bodyDescMap[profile.bodyType] || "fitness journey"}.`;
  };

  if (pageLoading) {
    return (
      <div className="workout-page">
        <header className="workout-header">
          <button className="back-button" onClick={() => navigate("/")}>
            <FaArrowLeft />
          </button>
          <div className="logo-container">
            <img src={Logo} alt="Logo" className="logo" loading="eager" />
          </div>
          <h1 className="header-title">BUFFALO GYM</h1>
        </header>
        <div style={{ padding: "32px 20px", textAlign: "center", color: "#aaa" }}>
          <div style={{ width: 40, height: 40, border: `4px solid #444`, borderTop: `4px solid ${cat.accentColor}`, borderRadius: "50%", margin: "0 auto 16px", animation: "spin 1s linear infinite" }} />
          <p>Loading your personalised program…</p>
        </div>
        <style>{`@keyframes spin{0%{transform:rotate(0deg)}100%{transform:rotate(360deg)}} @keyframes pulse{0%,100%{opacity:1}50%{opacity:.4}}`}</style>
      </div>
    );
  }

  return (
    <div className="workout-page">
      {/* ── Header ─────────────────────────────────────────────────── */}
      <header className="workout-header">
        <button className="back-button" onClick={() => navigate("/")}>
          <FaArrowLeft />
        </button>
        <div className="logo-container">
          <img src={Logo} alt="Logo" className="logo" loading="eager" />
        </div>
        <h1 className="header-title">BUFFALO GYM</h1>
      </header>

      <div style={{ paddingBottom: 100 }}>

        {/* ── Hero Banner ────────────────────────────────────────────── */}
        <div style={{ background: cat.gradient, padding: "24px 20px 20px", margin: "12px 16px", borderRadius: 18, color: "#fff" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 6 }}>
            {cat.icon}
            <h2 style={{ margin: 0, fontSize: 22, fontWeight: 800 }}>{cat.display}</h2>
            <span style={{ marginLeft: "auto", background: "rgba(255,255,255,0.25)", borderRadius: 20, padding: "3px 10px", fontSize: 11, fontWeight: 700 }}>
              {cat.goalTag}
            </span>
          </div>
          <p style={{ margin: "0 0 14px", fontSize: 14, opacity: 0.93, lineHeight: 1.55 }}>
            {heroSubtitle()}
          </p>
          {/* User profile chips */}
          <div style={{ display: "flex", gap: 7, flexWrap: "wrap" }}>
            {profile?.bodyType && (
              <span style={{ background: "rgba(0,0,0,0.22)", borderRadius: 20, padding: "4px 12px", fontSize: 12, fontWeight: 600 }}>
                {profile.bodyType === "SKINNY" ? "Skinny Build" : profile.bodyType === "FLABBY" ? "Flabby Build" : "Ideal Build"}
              </span>
            )}
            {profile?.bmi && (
              <span style={{ background: "rgba(0,0,0,0.22)", borderRadius: 20, padding: "4px 12px", fontSize: 12, fontWeight: 600 }}>
                BMI {profile.bmi} · {profile.bmiCategory}
              </span>
            )}
            {profile?.dietType && profile.dietType !== "DEFAULT" && (
              <span style={{ background: "rgba(0,0,0,0.22)", borderRadius: 20, padding: "4px 12px", fontSize: 12, fontWeight: 600 }}>
                {profile.dietType === "VEG" ? "Vegetarian" : profile.dietType === "NON_VEG" ? "Non-Veg" : "Vegan"}
              </span>
            )}
            {profile?.age && (
              <span style={{ background: "rgba(0,0,0,0.22)", borderRadius: 20, padding: "4px 12px", fontSize: 12, fontWeight: 600 }}>
                Age {profile.age}
              </span>
            )}
          </div>
        </div>

        {/* ── Profile Match Card ─────────────────────────────────────── */}
        {profile?.bodyType && (
          <div style={{ margin: "0 16px 14px", background: "#252b2d", borderRadius: 14, padding: "16px" }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 10 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <FaBullseye size={16} color={cat.accentColor} />
                <span style={{ fontWeight: 700, fontSize: 14, color: "#f0f0f0" }}>Program Match for You</span>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                <span style={{ fontSize: 20, fontWeight: 800, color: matchColor(matchScore) }}>{matchScore}%</span>
                <span style={{ fontSize: 11, color: matchColor(matchScore), fontWeight: 600, background: `${matchColor(matchScore)}18`, padding: "2px 8px", borderRadius: 10 }}>
                  {matchLabel(matchScore)}
                </span>
              </div>
            </div>
            {/* Progress bar */}
            <div style={{ height: 6, background: "#333", borderRadius: 6, marginBottom: 10 }}>
              <div style={{ height: "100%", width: `${matchScore}%`, background: matchColor(matchScore), borderRadius: 6, transition: "width 1s ease" }} />
            </div>
            <p style={{ margin: 0, fontSize: 13, color: "#bbb", lineHeight: 1.6 }}>{matchReason}</p>
          </div>
        )}

        {/* ── Weekly Target ──────────────────────────────────────────── */}
        <div style={{ margin: "0 16px 14px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10 }}>
            <FaChartLine size={14} color={cat.accentColor} />
            <span style={{ fontWeight: 700, fontSize: 14, color: "#f0f0f0" }}>Your Weekly Target</span>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 8 }}>
            {[
              { label: "Sessions", value: weeklyTarget.sessions, unit: "/week" },
              { label: "Calories", value: weeklyTarget.calPerSession, unit: "/session" },
              { label: "Duration", value: weeklyTarget.durationMins, unit: "mins" },
            ].map((item, i) => (
              <div key={i} style={{ background: "#252b2d", borderRadius: 12, padding: "12px 10px", textAlign: "center", borderTop: `3px solid ${cat.accentColor}` }}>
                <p style={{ margin: "0 0 4px", fontSize: 16, fontWeight: 800, color: cat.accentColor }}>{item.value}</p>
                <p style={{ margin: 0, fontSize: 11, color: "#aaa" }}>{item.label}</p>
                <p style={{ margin: 0, fontSize: 10, color: "#666" }}>{item.unit}</p>
              </div>
            ))}
          </div>
        </div>

        {/* ── AI Personalised Tips ───────────────────────────────────── */}
        <div style={{ margin: "0 16px 14px", background: "#252b2d", borderRadius: 14, padding: "16px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12 }}>
            <div style={{ width: 30, height: 30, background: `${cat.accentColor}22`, borderRadius: 8, display: "flex", alignItems: "center", justifyContent: "center" }}>
              <FaRobot size={14} color={cat.accentColor} />
            </div>
            <div>
              <p style={{ margin: 0, fontWeight: 700, fontSize: 14, color: "#f0f0f0" }}>AI Coach · Personalised Tips</p>
              <p style={{ margin: 0, fontSize: 11, color: "#888" }}>Based on your body type, BMI & diet</p>
            </div>
          </div>
          {aiLoading ? (
            <AiTipSkeleton />
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {aiBullets.length > 0 ? aiBullets.map((tip, i) => (
                <div key={i} style={{ display: "flex", gap: 10, alignItems: "flex-start" }}>
                  <FaCheckCircle size={14} color={cat.accentColor} style={{ marginTop: 2, flexShrink: 0 }} />
                  <p style={{ margin: 0, fontSize: 13, color: "#ccc", lineHeight: 1.6 }}>{tip}</p>
                </div>
              )) : (
                <p style={{ margin: 0, fontSize: 13, color: "#aaa" }}>Stay consistent and trust the process!</p>
              )}
            </div>
          )}
        </div>

        {/* ── Nutrition Guidance ─────────────────────────────────────── */}
        {nutritionTip && (
          <div style={{ margin: "0 16px 14px", background: "#252b2d", borderRadius: 14, padding: "16px", borderLeft: `4px solid #2ECC71` }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10 }}>
              <FaAppleAlt size={14} color="#2ECC71" />
              <span style={{ fontWeight: 700, fontSize: 14, color: "#f0f0f0" }}>
                Nutrition for {cat.display}
                {profile?.dietType && profile.dietType !== "DEFAULT" && (
                  <span style={{ marginLeft: 6, fontSize: 11, color: "#888", fontWeight: 500 }}>
                    ({profile.dietType === "VEG" ? "Vegetarian" : profile.dietType === "NON_VEG" ? "Non-Veg" : "Vegan"})
                  </span>
                )}
              </span>
            </div>
            <p style={{ margin: 0, fontSize: 13, color: "#bbb", lineHeight: 1.65 }}>{nutritionTip}</p>
          </div>
        )}

        {/* ── Exercise Guide ─────────────────────────────────────────── */}
        {(() => {
          const exercises = EXERCISE_PLANS[location.pathname] || [];
          if (exercises.length === 0) return null;
          // Order by difficulty matching body type
          const ordered = profile?.bodyType === "SKINNY"
            ? [...exercises].sort((a, b) => ({ Easy: 0, Medium: 1, Hard: 2 }[a.difficulty] - { Easy: 0, Medium: 1, Hard: 2 }[b.difficulty]))
            : profile?.bodyType === "FLABBY"
            ? [...exercises].sort((a, b) => ({ Hard: 0, Medium: 1, Easy: 2 }[a.difficulty] - { Hard: 0, Medium: 1, Easy: 2 }[b.difficulty]))
            : exercises;
          return (
            <div style={{ margin: "0 16px 14px" }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 10 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  {cat.icon && React.cloneElement(cat.icon, { size: 13, color: cat.accentColor })}
                  <span style={{ fontWeight: 700, fontSize: 14, color: "#f0f0f0" }}>Exercise Guide</span>
                </div>
                {profile?.bodyType && (
                  <span style={{ fontSize: 11, color: "#888" }}>
                    ordered for {profile.bodyType === "SKINNY" ? "muscle gain" : profile.bodyType === "FLABBY" ? "fat burn" : "balance"}
                  </span>
                )}
              </div>
              <div style={{ background: "#252b2d", borderRadius: 14, padding: 14 }}>
                {ordered.map((ex) => (
                  <ExerciseRow key={ex.name} exercise={ex} accentColor={cat.accentColor} />
                ))}
              </div>
            </div>
          );
        })()}

        {/* ── Workout Programs ───────────────────────────────────────── */}
        <div style={{ padding: "0 0 0" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "0 16px 12px" }}>
            {cat.icon && React.cloneElement(cat.icon, { size: 14, color: cat.accentColor })}
            <span style={{ fontWeight: 700, fontSize: 14, color: "#f0f0f0" }}>
              {cat.display} Programs
            </span>
            {workouts.length > 0 && (
              <span style={{ marginLeft: "auto", fontSize: 12, color: "#888" }}>{workouts.length} program{workouts.length !== 1 ? "s" : ""}</span>
            )}
          </div>

          {error ? (
            <div style={{ textAlign: "center", padding: "32px 20px", color: "#FF6B6B" }}>
              <p>{error}</p>
              <button onClick={() => window.location.reload()} style={{ marginTop: 12, padding: "10px 24px", background: "#FF6B6B", color: "#fff", border: "none", borderRadius: 8, cursor: "pointer" }}>
                Retry
              </button>
            </div>
          ) : workouts.length === 0 ? (
            <div style={{ textAlign: "center", padding: "40px 20px", color: "#aaa" }}>
              <p style={{ fontSize: 15, marginBottom: 6 }}>No programs added yet for this category.</p>
              <p style={{ fontSize: 13, marginBottom: 20 }}>The gym admin can add programs through the admin panel.</p>
              <button onClick={() => navigate("/workout-week")} style={{ padding: "12px 28px", background: cat.gradient, color: "#fff", border: "none", borderRadius: 10, cursor: "pointer", fontWeight: 700 }}>
                Browse All Workouts
              </button>
            </div>
          ) : (
            <div className="workout-list">
              {workouts.map((workout) => (
                <WorkoutCard key={workout.id} workout={workout} navigate={navigate} />
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="foot">
        <Suspense fallback={<FooterSkeleton />}>
          <FooterNav />
        </Suspense>
      </div>

      <style>{`
        @keyframes spin { 0%{transform:rotate(0deg)} 100%{transform:rotate(360deg)} }
        @keyframes pulse { 0%,100%{opacity:1} 50%{opacity:.35} }
      `}</style>
    </div>
  );
};

export default CategoryWorkoutsPage;
