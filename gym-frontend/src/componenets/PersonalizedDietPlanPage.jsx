import React, { useState, useEffect, Suspense } from "react";
import { useNavigate } from "react-router-dom";
import {
  FaArrowLeft, FaFire, FaTint, FaRobot, FaUtensils,
  FaCheckCircle, FaAppleAlt, FaChartBar, FaBookOpen,
} from "react-icons/fa";
import axiosInstance from "./utils/axiosInstance";
import Logo from "../assets/logo.webp";
import "../css/WorkoutPage.css";
const FooterNav = React.lazy(() => import("./FooterNav"));
import FooterSkeleton from "./FooterLoading";

// ─── TDEE Engine ──────────────────────────────────────────────────────────────
const calcBMR = (gender, age, height, weight) => {
  if (!age || !height || !weight) return null;
  if (gender === "M") return 10 * weight + 6.25 * height - 5 * age + 5;
  if (gender === "F") return 10 * weight + 6.25 * height - 5 * age - 161;
  return 10 * weight + 6.25 * height - 5 * age - 78; // average
};

const calcTDEE = (bmr, bodyType) => {
  if (!bmr) return null;
  const base = Math.round(bmr * 1.55); // moderately active
  if (bodyType === "FLABBY") return base - 400;
  if (bodyType === "SKINNY") return base + 350;
  return base;
};

const calcMacros = (calories, bodyType) => {
  if (!calories) return null;
  const ratios =
    bodyType === "FLABBY" ? { p: 0.35, c: 0.38, f: 0.27 } :
    bodyType === "SKINNY" ? { p: 0.30, c: 0.50, f: 0.20 } :
                            { p: 0.28, c: 0.47, f: 0.25 };
  return {
    protein: Math.round((calories * ratios.p) / 4),
    carbs:   Math.round((calories * ratios.c) / 4),
    fat:     Math.round((calories * ratios.f) / 9),
  };
};

const calcWater = (weight) => (weight ? Math.round(weight * 35) : 2500);

// ─── Meal Plan Data ───────────────────────────────────────────────────────────
const MEAL_PLANS = {
  NON_VEG: {
    FLABBY: {
      breakfast: { name: "Egg White Scramble", items: "3 egg whites + 1 whole egg • Whole wheat toast • Green tea", pct: 0.25 },
      lunch:     { name: "Lean Chicken Bowl",  items: "150g grilled chicken breast • ½ cup brown rice • Steamed broccoli + spinach", pct: 0.35 },
      dinner:    { name: "Baked Fish & Greens", items: "150g baked salmon or tilapia • Sautéed spinach with garlic • Clear vegetable soup", pct: 0.30 },
      snacks:    { name: "Protein Snack",  items: "Greek yogurt (low-fat, plain) OR 10 almonds + 1 boiled egg", pct: 0.10 },
    },
    SKINNY: {
      breakfast: { name: "Power Breakfast",       items: "3 whole eggs (any style) • Oatmeal with banana + honey • 1 glass full-fat milk", pct: 0.25 },
      lunch:     { name: "High-Protein Rice Bowl", items: "200g chicken breast • 1.5 cups white rice • Side salad with olive oil", pct: 0.35 },
      dinner:    { name: "Salmon & Sweet Potato",  items: "200g grilled salmon • 1 medium sweet potato • Sautéed mixed vegetables", pct: 0.30 },
      snacks:    { name: "Muscle Fuel Snack",       items: "Peanut butter toast (2 slices) + banana OR protein shake with full-fat milk", pct: 0.10 },
    },
    IDEAL: {
      breakfast: { name: "Balanced Breakfast",  items: "2 whole eggs + 1 white • Multigrain toast • Seasonal fruit • Black coffee", pct: 0.25 },
      lunch:     { name: "Mixed Protein Bowl",   items: "120g chicken or fish • ¾ cup rice • Cucumber + tomato salad", pct: 0.35 },
      dinner:    { name: "Lean Protein Dinner",  items: "150g grilled chicken or fish • 2 chapattis • Sabzi + dal", pct: 0.30 },
      snacks:    { name: "Healthy Snack",         items: "Handful of mixed nuts OR fruit yogurt", pct: 0.10 },
    },
  },
  VEG: {
    FLABBY: {
      breakfast: { name: "Veggie Omelette",    items: "2-egg veggie omelette (onion, capsicum, tomato) • 1 whole wheat toast • Black coffee", pct: 0.25 },
      lunch:     { name: "Dal & Sabzi Thali",  items: "1 cup moong dal • 2 phulkas • Cucumber + tomato salad • Small curd", pct: 0.35 },
      dinner:    { name: "Light Paneer Bowl",  items: "100g low-fat paneer bhurji • 1 roti • Clear soup • Side salad", pct: 0.30 },
      snacks:    { name: "Fibre Snack",         items: "Sprouts salad with lemon + chaat masala OR roasted chana (handful)", pct: 0.10 },
    },
    SKINNY: {
      breakfast: { name: "Muscle-Building Oats", items: "Oats with full-fat milk + banana + 1 tbsp peanut butter • Boiled egg (optional)", pct: 0.25 },
      lunch:     { name: "Protein Thali",         items: "1 cup rajma/chole • 2 rotis • ½ cup rice • Raita • Salad", pct: 0.35 },
      dinner:    { name: "Paneer & Dal Dinner",   items: "150g paneer curry • 2 rotis • 1 cup dal • Salad", pct: 0.30 },
      snacks:    { name: "Calorie-Dense Snack",   items: "Banana + peanut butter OR 30g mixed nuts trail mix", pct: 0.10 },
    },
    IDEAL: {
      breakfast: { name: "Balanced Veggie Start",   items: "Poha or upma (1 cup) • 1 cup curd • Seasonal fruit", pct: 0.25 },
      lunch:     { name: "Balanced Thali",           items: "Dal • 2 rotis • Sabzi (any) • Salad • Small curd", pct: 0.35 },
      dinner:    { name: "Light Dinner Bowl",        items: "1 cup dal • 1 roti • Palak paneer (small) • Salad", pct: 0.30 },
      snacks:    { name: "Light Snack",              items: "Fruit salad OR roasted makhana (popped lotus seeds)", pct: 0.10 },
    },
  },
  VEGAN: {
    FLABBY: {
      breakfast: { name: "Green Power Smoothie", items: "Spinach + banana + berries + plant protein in oat milk • Chia pudding (side)", pct: 0.25 },
      lunch:     { name: "Quinoa Power Bowl",     items: "¾ cup quinoa • Roasted chickpeas (100g) • Cucumber + tomato + avocado salad • Lemon-tahini dressing", pct: 0.35 },
      dinner:    { name: "Lentil Detox Bowl",     items: "1.5 cups red lentil soup • Steamed broccoli + carrots • Side salad", pct: 0.30 },
      snacks:    { name: "Plant Protein Snack",   items: "Edamame (100g) OR 10 walnuts + 1 Medjool date", pct: 0.10 },
    },
    SKINNY: {
      breakfast: { name: "Overnight Oat Stack",   items: "Rolled oats + almond milk + banana + chia seeds + almond butter — soaked overnight", pct: 0.25 },
      lunch:     { name: "Tofu Stir-Fry Bowl",    items: "200g firm tofu stir-fried • 1 cup brown rice • Mixed vegetables in soy-ginger sauce", pct: 0.35 },
      dinner:    { name: "Tempeh & Sweet Potato", items: "150g tempeh (marinated & baked) • 1 medium sweet potato • Steamed kale + mixed beans", pct: 0.30 },
      snacks:    { name: "High-Cal Vegan Snack",  items: "2 Medjool dates + almond butter OR banana protein smoothie with plant milk", pct: 0.10 },
    },
    IDEAL: {
      breakfast: { name: "Balanced Vegan Start",  items: "Whole grain toast + avocado spread + nut butter • Mixed fresh fruit bowl", pct: 0.25 },
      lunch:     { name: "Buddha Bowl",            items: "Quinoa or brown rice • Mixed roasted vegetables • Chickpeas • Tahini dressing", pct: 0.35 },
      dinner:    { name: "Veggie Curry Bowl",      items: "Mixed vegetable curry • 1 cup rice or 2 rotis • Dal or lentils", pct: 0.30 },
      snacks:    { name: "Balanced Vegan Snack",  items: "Apple with almond butter OR trail mix (nuts + dried fruit)", pct: 0.10 },
    },
  },
};

// ─── Labels ───────────────────────────────────────────────────────────────────
const GOAL_LABEL = { FLABBY: "Fat Loss", SKINNY: "Muscle Gain", IDEAL: "Maintenance" };
const GOAL_COLOR = { FLABBY: "#FF6B6B", SKINNY: "#4ECDC4", IDEAL: "#2ECC71" };
const BODY_MAP   = { SKINNY: "skinny (needs muscle mass)", FLABBY: "flabby (needs fat loss)", IDEAL: "ideal physique (maintenance)" };
const GENDER_MAP = { M: "male", F: "female", O: "non-binary", N: "person" };
const DIET_MAP   = { VEG: "vegetarian", NON_VEG: "non-vegetarian", VEGAN: "vegan" };

const MEAL_ICONS = { breakfast: "🌅", lunch: "☀️", dinner: "🌙", snacks: "🍎" };

// ─── Skeleton ─────────────────────────────────────────────────────────────────
const AiSkeleton = () => (
  <div style={{ padding: "16px", background: "#2d3335", borderRadius: "12px" }}>
    {[80, 95, 60].map((w, i) => (
      <div key={i} style={{ height: 12, background: "#3a4042", borderRadius: 6, marginBottom: 8, width: `${w}%`, animation: "pulse 1.5s ease-in-out infinite" }} />
    ))}
  </div>
);

// ─── MacroBar ─────────────────────────────────────────────────────────────────
const MacroBar = ({ label, grams, pct, color, totalCal }) => (
  <div style={{ marginBottom: "14px" }}>
    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 5 }}>
      <span style={{ fontSize: 13, fontWeight: 600, color: "#f0f0f0" }}>{label}</span>
      <span style={{ fontSize: 13, color: "#aaa" }}>{grams}g · {Math.round(pct * 100)}%</span>
    </div>
    <div style={{ height: 8, background: "#333", borderRadius: 6 }}>
      <div style={{ height: "100%", width: `${Math.round(pct * 100)}%`, background: color, borderRadius: 6, transition: "width 1.2s ease" }} />
    </div>
  </div>
);

// ─── MealCard ─────────────────────────────────────────────────────────────────
const MealCard = ({ type, meal, calories, accentColor }) => (
  <div style={{ background: "#252b2d", borderRadius: 14, padding: "16px", marginBottom: 10 }}>
    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 8 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
        <span style={{ fontSize: 22 }}>{MEAL_ICONS[type]}</span>
        <div>
          <p style={{ margin: 0, fontSize: 13, color: "#888", textTransform: "uppercase", letterSpacing: "0.5px", fontWeight: 600 }}>{type}</p>
          <p style={{ margin: 0, fontSize: 15, fontWeight: 700, color: "#f0f0f0" }}>{meal.name}</p>
        </div>
      </div>
      <span style={{ background: `${accentColor}20`, color: accentColor, borderRadius: 20, padding: "4px 10px", fontSize: 12, fontWeight: 700, whiteSpace: "nowrap" }}>
        ~{calories} kcal
      </span>
    </div>
    <div style={{ borderTop: "1px solid #333", paddingTop: 10 }}>
      {meal.items.split(" • ").map((item, i) => (
        <div key={i} style={{ display: "flex", gap: 8, alignItems: "flex-start", marginBottom: 5 }}>
          <span style={{ color: accentColor, fontSize: 10, marginTop: 5, flexShrink: 0 }}>●</span>
          <p style={{ margin: 0, fontSize: 13, color: "#bbb", lineHeight: 1.5 }}>{item}</p>
        </div>
      ))}
    </div>
  </div>
);

// ─── Main Component ───────────────────────────────────────────────────────────
const PersonalizedDietPlanPage = () => {
  const navigate = useNavigate();
  const [profile, setProfile] = useState(null);
  const [aiTips, setAiTips] = useState("");
  const [aiLoading, setAiLoading] = useState(true);
  const [pageLoading, setPageLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const [userRes, bodyRes, physRes, dietRes] = await Promise.allSettled([
          axiosInstance.get("user/"),
          axiosInstance.get("update-body-type/"),
          axiosInstance.get("update-physical-profile/"),
          axiosInstance.get("update-dietary-preferences/"),
        ]);
        const user = userRes.status === "fulfilled" ? userRes.value.data : {};
        const body = bodyRes.status === "fulfilled" ? bodyRes.value.data : {};
        const phys = physRes.status === "fulfilled" ? physRes.value.data : {};
        const diet = dietRes.status === "fulfilled" ? dietRes.value.data : {};

        setProfile({
          gender:   user.gender   || "",
          age:      user.age      || null,
          height:   phys.height   || null,
          weight:   phys.weight   || null,
          bodyType: body.body_type || "IDEAL",
          dietType: diet.diet_type || "NON_VEG",
        });
      } catch {
        setProfile({ gender: "", age: null, height: null, weight: null, bodyType: "IDEAL", dietType: "NON_VEG" });
      } finally {
        setPageLoading(false);
      }
    };
    load();
  }, []);

  useEffect(() => {
    if (!profile) return;
    const fetchAiTip = async () => {
      setAiLoading(true);
      try {
        const genderLabel = GENDER_MAP[profile.gender] || "person";
        const dietLabel   = DIET_MAP[profile.dietType]  || "mixed-diet";
        const bodyLabel   = BODY_MAP[profile.bodyType]  || "average build";
        const goalLabel   = GOAL_LABEL[profile.bodyType] || "maintenance";
        const prompt = `You are a certified nutritionist. Give exactly 3 short, actionable nutrition tips for ${goalLabel} tailored to a ${genderLabel} with a ${bodyLabel} body type following a ${dietLabel} diet. Each tip must be 1 sentence. Format: "• tip". No intro, no conclusion.`;
        const res = await axiosInstance.post("ai-chat/", { message: prompt });
        setAiTips(res.data.message || "");
      } catch {
        setAiTips("• Eat protein at every meal to support your body composition goal.\n• Drink at least 8 glasses of water daily — hydration directly affects metabolism.\n• Avoid skipping meals — consistent eating prevents muscle loss and energy crashes.");
      } finally {
        setAiLoading(false);
      }
    };
    fetchAiTip();
  }, [profile]);

  if (pageLoading) {
    return (
      <div style={{ minHeight: "100vh", background: "#1a1f21", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
        <div style={{ width: 40, height: 40, border: "4px solid #333", borderTop: "4px solid #F39C12", borderRadius: "50%", animation: "spin 1s linear infinite" }} />
        <p style={{ marginTop: 16, color: "#aaa", fontSize: 14 }}>Building your personalized diet plan…</p>
        <style>{`@keyframes spin{0%{transform:rotate(0deg)}100%{transform:rotate(360deg)}}`}</style>
      </div>
    );
  }

  const bmr      = calcBMR(profile.gender, profile.age, profile.height, profile.weight);
  const calories = calcTDEE(bmr, profile.bodyType);
  const macros   = calcMacros(calories, profile.bodyType);
  const water    = calcWater(profile.weight);
  const accentColor = GOAL_COLOR[profile.bodyType] || "#F39C12";
  const goalLabel   = GOAL_LABEL[profile.bodyType] || "Balanced";

  // Get the right meal plan
  const mealKey  = MEAL_PLANS[profile.dietType] ? profile.dietType : "NON_VEG";
  const bodyKey  = profile.bodyType && MEAL_PLANS[mealKey][profile.bodyType] ? profile.bodyType : "IDEAL";
  const todayMeals = MEAL_PLANS[mealKey][bodyKey];

  const macroRatios = profile.bodyType === "FLABBY"
    ? { p: 0.35, c: 0.38, f: 0.27 }
    : profile.bodyType === "SKINNY"
    ? { p: 0.30, c: 0.50, f: 0.20 }
    : { p: 0.28, c: 0.47, f: 0.25 };

  const aiBullets = aiTips
    .split("\n")
    .map((l) => l.replace(/^[•\-\*]\s*/, "").trim())
    .filter((l) => l.length > 10)
    .slice(0, 3);

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
        <h1 className="header-title" style={{ fontSize: 20 }}>DIET PLAN</h1>
      </header>

      {/* Hero — Daily Calorie Target */}
      <div style={{ background: `linear-gradient(135deg, ${accentColor}, ${accentColor}bb)`, padding: "28px 20px", textAlign: "center" }}>
        <FaFire size={32} color="#fff" style={{ marginBottom: 10 }} />
        <p style={{ margin: "0 0 4px", fontSize: 13, color: "rgba(255,255,255,0.8)", fontWeight: 600, textTransform: "uppercase", letterSpacing: 1 }}>Daily Calorie Target</p>
        {calories ? (
          <>
            <h2 style={{ margin: "0 0 6px", fontSize: 48, fontWeight: 900, color: "#fff", letterSpacing: -1 }}>
              {calories.toLocaleString()}
            </h2>
            <p style={{ margin: "0 0 14px", fontSize: 14, color: "rgba(255,255,255,0.85)" }}>kcal/day · Goal: <strong>{goalLabel}</strong></p>
          </>
        ) : (
          <>
            <h2 style={{ margin: "0 0 6px", fontSize: 30, fontWeight: 700, color: "#fff" }}>Complete Your Profile</h2>
            <p style={{ margin: "0 0 14px", fontSize: 13, color: "rgba(255,255,255,0.85)" }}>Add height, weight & age in Profile → Edit to get your exact calorie target</p>
          </>
        )}
        <div style={{ display: "flex", justifyContent: "center", gap: 10, flexWrap: "wrap" }}>
          {profile.gender && (
            <span style={{ background: "rgba(0,0,0,0.25)", borderRadius: 20, padding: "4px 12px", fontSize: 12, color: "#fff", fontWeight: 600 }}>
              {profile.gender === "M" ? "Male" : profile.gender === "F" ? "Female" : "Other"}
            </span>
          )}
          {profile.age && (
            <span style={{ background: "rgba(0,0,0,0.25)", borderRadius: 20, padding: "4px 12px", fontSize: 12, color: "#fff", fontWeight: 600 }}>
              Age {profile.age}
            </span>
          )}
          {profile.weight && (
            <span style={{ background: "rgba(0,0,0,0.25)", borderRadius: 20, padding: "4px 12px", fontSize: 12, color: "#fff", fontWeight: 600 }}>
              {profile.weight} kg
            </span>
          )}
          <span style={{ background: "rgba(0,0,0,0.25)", borderRadius: 20, padding: "4px 12px", fontSize: 12, color: "#fff", fontWeight: 600 }}>
            {profile.dietType === "VEG" ? "Vegetarian" : profile.dietType === "VEGAN" ? "Vegan" : "Non-Veg"}
          </span>
        </div>
      </div>

      <div style={{ padding: "0 16px" }}>

        {/* Macros Breakdown */}
        {macros && (
          <div style={{ background: "#252b2d", borderRadius: 14, padding: 16, marginTop: 16, marginBottom: 14 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 16 }}>
              <FaChartBar size={14} color={accentColor} />
              <span style={{ fontWeight: 700, fontSize: 14, color: "#f0f0f0" }}>Daily Macro Targets</span>
            </div>
            <MacroBar label="Protein" grams={macros.protein} pct={macroRatios.p} color="#4ECDC4" />
            <MacroBar label="Carbohydrates" grams={macros.carbs} pct={macroRatios.c} color="#F39C12" />
            <MacroBar label="Fats" grams={macros.fat} pct={macroRatios.f} color="#9B59B6" />
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 8, marginTop: 14 }}>
              {[
                { label: "Protein", value: `${macros.protein}g`, color: "#4ECDC4" },
                { label: "Carbs",   value: `${macros.carbs}g`,   color: "#F39C12" },
                { label: "Fat",     value: `${macros.fat}g`,     color: "#9B59B6" },
              ].map((m, i) => (
                <div key={i} style={{ background: "#1a1f21", borderRadius: 10, padding: "10px 8px", textAlign: "center" }}>
                  <p style={{ margin: "0 0 2px", fontSize: 17, fontWeight: 800, color: m.color }}>{m.value}</p>
                  <p style={{ margin: 0, fontSize: 11, color: "#888" }}>{m.label}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Water Intake */}
        <div style={{ background: "rgba(52, 152, 219, 0.12)", border: "1px solid rgba(52, 152, 219, 0.3)", borderRadius: 14, padding: "14px 16px", marginBottom: 14, display: "flex", alignItems: "center", gap: 14 }}>
          <div style={{ width: 44, height: 44, background: "rgba(52, 152, 219, 0.2)", borderRadius: 12, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
            <FaTint size={20} color="#3498DB" />
          </div>
          <div>
            <p style={{ margin: "0 0 2px", fontSize: 14, fontWeight: 700, color: "#f0f0f0" }}>
              Daily Water Goal: <span style={{ color: "#3498DB" }}>{(water / 1000).toFixed(1)} L</span>
            </p>
            <p style={{ margin: 0, fontSize: 12, color: "#aaa" }}>
              {Math.round(water / 250)} glasses of 250 ml • Increase by 500 ml on workout days
            </p>
          </div>
        </div>

        {/* AI Nutritionist Tips */}
        <div style={{ background: "#252b2d", borderRadius: 14, padding: 16, marginBottom: 14 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12 }}>
            <div style={{ width: 30, height: 30, background: `${accentColor}22`, borderRadius: 8, display: "flex", alignItems: "center", justifyContent: "center" }}>
              <FaRobot size={14} color={accentColor} />
            </div>
            <div>
              <p style={{ margin: 0, fontWeight: 700, fontSize: 14, color: "#f0f0f0" }}>AI Nutritionist Tips</p>
              <p style={{ margin: 0, fontSize: 11, color: "#888" }}>Based on your body type, diet & goal</p>
            </div>
          </div>
          {aiLoading ? <AiSkeleton /> : (
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {aiBullets.length > 0 ? aiBullets.map((tip, i) => (
                <div key={i} style={{ display: "flex", gap: 10, alignItems: "flex-start" }}>
                  <FaCheckCircle size={13} color={accentColor} style={{ marginTop: 2, flexShrink: 0 }} />
                  <p style={{ margin: 0, fontSize: 13, color: "#ccc", lineHeight: 1.6 }}>{tip}</p>
                </div>
              )) : (
                <p style={{ margin: 0, fontSize: 13, color: "#aaa" }}>Eat mindfully and stay consistent with your plan!</p>
              )}
            </div>
          )}
        </div>

        {/* Today's Meal Plan */}
        <div style={{ marginBottom: 14 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12 }}>
            <FaUtensils size={14} color={accentColor} />
            <span style={{ fontWeight: 700, fontSize: 14, color: "#f0f0f0" }}>Today's Meal Plan</span>
            <span style={{ marginLeft: "auto", fontSize: 12, color: "#888" }}>
              {profile.dietType === "VEG" ? "Vegetarian" : profile.dietType === "VEGAN" ? "Vegan" : "Non-Veg"} · {goalLabel}
            </span>
          </div>

          {(["breakfast", "lunch", "dinner", "snacks"]).map((mealType) => {
            const meal = todayMeals[mealType];
            const mealCal = calories ? Math.round(calories * meal.pct) : null;
            return (
              <MealCard
                key={mealType}
                type={mealType}
                meal={meal}
                calories={mealCal || "—"}
                accentColor={accentColor}
              />
            );
          })}
        </div>

        {/* Nutrition Notes */}
        <div style={{ background: `${accentColor}12`, border: `1px solid ${accentColor}30`, borderRadius: 14, padding: "14px 16px", marginBottom: 14 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
            <FaAppleAlt size={13} color={accentColor} />
            <span style={{ fontSize: 13, fontWeight: 700, color: "#f0f0f0" }}>Nutrition Notes</span>
          </div>
          <p style={{ margin: 0, fontSize: 13, color: "#bbb", lineHeight: 1.65 }}>
            {profile.bodyType === "FLABBY"
              ? "You're in a moderate calorie deficit to support fat loss while preserving muscle. Prioritise protein at every meal. Avoid skipping meals — it slows metabolism. Weigh yourself weekly, not daily."
              : profile.bodyType === "SKINNY"
              ? "You're in a calorie surplus to support muscle growth. Eat every 3–4 hours to keep your body in an anabolic state. Post-workout nutrition is critical — eat within 45 minutes of training."
              : "You're eating at maintenance to sustain your current physique. Focus on food quality — whole grains, lean proteins, healthy fats, and plenty of vegetables. Adjust portions if weight fluctuates."}
          </p>
        </div>

        {/* Log Food CTA */}
        <div style={{ marginBottom: 14 }}>
          <button
            onClick={() => navigate("/today")}
            style={{ width: "100%", padding: 16, background: `linear-gradient(135deg, ${accentColor}, ${accentColor}cc)`, color: "#fff", border: "none", borderRadius: 14, fontWeight: 700, fontSize: 15, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 10 }}
          >
            <FaBookOpen size={16} />
            Log Today's Food & Track Calories
          </button>
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

export default PersonalizedDietPlanPage;
