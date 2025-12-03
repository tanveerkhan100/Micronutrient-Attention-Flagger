import React, { useState } from "react";
import "./App.css";

export default function MicronutrientAttentionFlagger() {
  const [age, setAge] = useState("");
  const [sex, setSex] = useState("female");
  const [dietPattern, setDietPattern] = useState("omnivore");
  const [fruitVegServings, setFruitVegServings] = useState("");
  const [dairyIntake, setDairyIntake] = useState("daily");
  const [redMeatFrequency, setRedMeatFrequency] = useState("weekly");
  const [oilyFishFrequency, setOilyFishFrequency] = useState("weeklyPlus");
  const [sunExposure, setSunExposure] = useState("moderate");
  const [fatigue, setFatigue] = useState("sometimes");
  const [hairSkin, setHairSkin] = useState("someIssues");
  const [digestion, setDigestion] = useState("sometimesOff");
  const [supplements, setSupplements] = useState("none");

  const [result, setResult] = useState(null);
  const [error, setError] = useState("");

  const inputBase =
    "w-full border border-gray-300 rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm";

  const handleSubmit = (e) => {
    e.preventDefault();
    setError("");
    setResult(null);

    const ageNum = Number(age);
    const fruitVegNum = Number(fruitVegServings);

    if (!ageNum || ageNum < 16) {
      setError("Please enter a valid age (16+).");
      return;
    }

    if (
      Number.isNaN(fruitVegNum) ||
      fruitVegNum < 0 ||
      fruitVegNum > 15
    ) {
      setError(
        "Please enter a realistic daily number of fruit + veg servings (0–15)."
      );
      return;
    }

    const score = calculateAttentionScore({
      dietPattern,
      fruitVegServings: fruitVegNum,
      dairyIntake,
      redMeatFrequency,
      oilyFishFrequency,
      sunExposure,
      fatigue,
      hairSkin,
      digestion,
      supplements,
      sex,
      age: ageNum,
    });

    const zone = classifyRisk(score);
    const interpretation = interpretRisk(zone);
    const flags = buildFlagSummary({
      dietPattern,
      fruitVegServings: fruitVegNum,
      dairyIntake,
      redMeatFrequency,
      oilyFishFrequency,
      sunExposure,
      fatigue,
      hairSkin,
      digestion,
      supplements,
      sex,
      age: ageNum,
    });
    const tips = buildTips(zone, {
      dietPattern,
      fruitVegServings: fruitVegNum,
      dairyIntake,
      redMeatFrequency,
      oilyFishFrequency,
      sunExposure,
      supplements,
    });

    setResult({
      score,
      zone,
      interpretation,
      flags,
      tips,
      inputs: {
        age: ageNum,
        sex,
        dietPattern,
        fruitVegServings: fruitVegNum,
        dairyIntake,
        redMeatFrequency,
        oilyFishFrequency,
        sunExposure,
        fatigue,
        hairSkin,
        digestion,
        supplements,
      },
    });
  };

  const calculateAttentionScore = ({
    dietPattern,
    fruitVegServings,
    dairyIntake,
    redMeatFrequency,
    oilyFishFrequency,
    sunExposure,
    fatigue,
    hairSkin,
    digestion,
    supplements,
    sex,
    age,
  }) => {
    let score = 0;

    // Diet pattern (B12, iron, zinc, omega-3)
    if (dietPattern === "omnivore") score += 0;
    else if (dietPattern === "vegetarian") score += 4;
    else score += 7; // vegan

    // Fruit & veg (vit C, folate, potassium, carotenoids)
    if (fruitVegServings <= 1) score += 6;
    else if (fruitVegServings <= 3) score += 3;
    else score += 0; // 4+

    // Dairy / fortified alternatives (calcium, iodine, D)
    if (dairyIntake === "rare") score += 5;
    else if (dairyIntake === "some") score += 2;
    else score += 0; // daily

    // Red meat / iron-rich foods (iron + B12 context)
    if (redMeatFrequency === "rare") score += 4;
    else if (redMeatFrequency === "weekly") score += 2;
    else score += 0; // often

    // Oily fish (omega-3 + some D)
    if (oilyFishFrequency === "rare") score += 5;
    else if (oilyFishFrequency === "sometimes") score += 2;
    else score += 0; // weekly+

    // Sun exposure (vitamin D)
    if (sunExposure === "low") score += 4;
    else if (sunExposure === "moderate") score += 1;
    else score += 0; // high

    // Non-specific symptom cluster (fatigue, hair/skin, digestion)
    if (fatigue === "often") score += 4;
    else if (fatigue === "sometimes") score += 2;

    if (hairSkin === "frequentIssues") score += 3;
    else if (hairSkin === "someIssues") score += 1;

    if (digestion === "oftenOff") score += 3;
    else if (digestion === "sometimesOff") score += 1;

    // Supplements
    if (supplements === "none") score += 4;
    else if (supplements === "multivitamin") score += 1;
    else score += 0; // targeted support

    // Extra context: menstruating age-range → iron / B12 attention
    if (sex === "female" && age >= 16 && age <= 50) {
      score += 2;
    }

    // Clamp roughly 0–40
    return Math.max(0, Math.min(score, 40));
  };

  const classifyRisk = (score) => {
    if (score <= 9) {
      return {
        level: "low",
        label: "Lower Attention Needed",
        description:
          "From a diet-pattern perspective, your routine doesn’t raise strong red flags for micronutrient gaps.",
      };
    }
    if (score <= 17) {
      return {
        level: "moderate",
        label: "Some Attention Helpful",
        description:
          "There are a few areas where your intake or lifestyle could make certain vitamins or minerals worth keeping an eye on.",
      };
    }
    if (score <= 27) {
      return {
        level: "high",
        label: "Higher Attention Suggested",
        description:
          "Several factors (diet pattern, low intake of certain foods, limited sun, or symptoms) suggest that micronutrient coverage might be patchy.",
      };
    }
    return {
      level: "veryHigh",
      label: "Strong Attention Suggested",
      description:
        "Multiple elements point toward a higher chance of micronutrient gaps. This doesn’t mean something is wrong, but it does make a check-in with food variety and possibly labs more relevant.",
    };
  };

  const interpretRisk = (zone) => {
    switch (zone.level) {
      case "low":
        return (
          "Your inputs look generally supportive of micronutrient coverage. That doesn’t guarantee ‘perfect’ levels, " +
          "but your overall pattern seems reasonably nutrient-friendly."
        );
      case "moderate":
        return (
          "You’re in a middle zone: some habits protect your micronutrient status, while others may create gaps over time. " +
          "A few targeted tweaks can usually shift things in a better-supported direction."
        );
      case "high":
        return (
          "Your mix of diet pattern, food choices, lifestyle, and/or symptoms suggests several micronutrient ‘watch points’. " +
          "It may be worth being more intentional with nutrient-dense foods and discussing testing with a health professional."
        );
      case "veryHigh":
        return (
          "You’ve flagged quite a few potential risk factors for micronutrient gaps. This tool can’t diagnose anything, " +
          "but it is nudging you to consider more formal assessment (like blood work) and support from a qualified clinician."
        );
      default:
        return "";
    }
  };

  const buildFlagSummary = ({
    dietPattern,
    fruitVegServings,
    dairyIntake,
    redMeatFrequency,
    oilyFishFrequency,
    sunExposure,
    fatigue,
    hairSkin,
    digestion,
    supplements,
    sex,
    age,
  }) => {
    const lines = [];
    const nutrientFlags = [];

    // Diet pattern flags
    if (dietPattern === "vegetarian" || dietPattern === "vegan") {
      nutrientFlags.push(
        "Vitamin B12 (especially if you don’t use fortified foods or supplements)",
        "Iron and zinc (depending on legumes, nuts, seeds, and fortified foods)"
      );
    }
    if (dietPattern === "vegan") {
      nutrientFlags.push(
        "Calcium and iodine (if dairy is excluded and alternatives aren’t fortified)"
      );
    }

    // Fruit & veg
    if (fruitVegServings <= 1) {
      nutrientFlags.push(
        "Vitamin C, folate, potassium, and a variety of plant antioxidants"
      );
    } else if (fruitVegServings <= 3) {
      nutrientFlags.push(
        "Plant diversity (extra servings of colorful veg/fruit could broaden micronutrient coverage)"
      );
    }

    // Dairy / fortified intake
    if (dairyIntake === "rare") {
      nutrientFlags.push(
        "Calcium and iodine (if you don’t regularly use fortified milks or other sources)"
      );
    }

    // Iron / B12 context
    if (redMeatFrequency === "rare") {
      nutrientFlags.push(
        "Iron (and possibly B12), especially if you also don’t eat many legumes or fortified foods"
      );
    }

    // Omega-3 + D
    if (oilyFishFrequency === "rare") {
      nutrientFlags.push(
        "Long-chain omega-3 fats (EPA/DHA), which mainly come from oily fish or supplements"
      );
    }

    if (sunExposure === "low") {
      nutrientFlags.push(
        "Vitamin D, because low sun time plus modern indoor life can make it harder to maintain levels"
      );
    }

    // Symptom cluster (non-specific, just a nudge)
    const symptomFlags = [];
    if (fatigue !== "rare") symptomFlags.push("fatigue");
    if (hairSkin !== "fine") symptomFlags.push("hair/skin/nail changes");
    if (digestion !== "fine") symptomFlags.push("digestive shifts");

    if (symptomFlags.length > 0) {
      lines.push(
        `You reported ${symptomFlags.join(
          ", "
        )}. These can *sometimes* overlap with micronutrient issues, but they are very non-specific and can come from many causes.`
      );
    }

    // Age/sex context
    if (sex === "female" && age >= 16 && age <= 50) {
      nutrientFlags.push(
        "Iron, due to ongoing menstrual losses (particularly if intake is on the lower side)"
      );
    }

    if (supplements === "none") {
      lines.push(
        "You’re not currently using micronutrient supplements, so most of your intake needs to come from food variety."
      );
    } else if (supplements === "multivitamin") {
      lines.push(
        "You use a general multivitamin, which may help cover some gaps, but food pattern still matters a lot."
      );
    } else {
      lines.push(
        "You use targeted supplements, which may support specific nutrients depending on the product and dosing."
      );
    }

    if (nutrientFlags.length > 0) {
      lines.unshift(
        "Based on your answers, nutrients that might deserve a little extra attention include:"
      );
      lines.push(
        "This doesn’t mean you’re deficient in any of these; it just highlights where food variety or professional review could be useful."
      );
    } else {
      lines.unshift(
        "Your answers don’t strongly spotlight a specific nutrient gap, but that doesn’t guarantee that everything is perfect."
      );
    }

    return {
      summaryLines: lines,
      nutrientFlags,
    };
  };

  const buildTips = (
    zone,
    {
      dietPattern,
      fruitVegServings,
      dairyIntake,
      redMeatFrequency,
      oilyFishFrequency,
      sunExposure,
      supplements,
    }
  ) => {
    const tips = [];

    // Core food-based ideas
    if (fruitVegServings <= 3) {
      tips.push(
        "Gently work toward at least 4–5 servings of fruit and veg per day by adding one extra serving to a meal or snack."
      );
    } else {
      tips.push(
        "Keep aiming for a range of colorful fruits and vegetables through the week to spread out different micronutrients."
      );
    }

    if (dietPattern === "vegetarian" || dietPattern === "vegan") {
      tips.push(
        "Include regular B12 sources (fortified plant milks, nutritional yeast, or a supplement) and mix in legumes, nuts, seeds, and tofu/tempeh for iron, zinc, and protein."
      );
    }

    if (dietPattern === "vegan") {
      tips.push(
        "Check that your plant milks and yogurts are fortified with calcium and vitamin D, and consider iodine sources (like iodised salt, seaweed in moderate amounts, or professional guidance)."
      );
    }

    if (dairyIntake === "rare") {
      tips.push(
        "If dairy isn’t a fit for you, look for fortified non-dairy milks/yogurts and calcium-rich foods like tofu set with calcium, leafy greens, or canned fish with bones (if eaten)."
      );
    }

    if (oilyFishFrequency === "rare") {
      tips.push(
        "If you eat animal products, consider adding oily fish (e.g. salmon, sardines, mackerel) 1–2 times per week, or discuss omega-3 supplementation with a professional if you don’t."
      );
    }

    if (sunExposure === "low") {
      tips.push(
        "With limited sun exposure, it’s common for vitamin D to be low. Talk with your healthcare provider about whether vitamin D testing or supplementation makes sense for you."
      );
    }

    if (redMeatFrequency === "rare") {
      tips.push(
        "For iron, think in terms of beans, lentils, chickpeas, tofu, seeds, and dark leafy greens, ideally paired with vitamin C–rich foods (like citrus or peppers) to help absorption."
      );
    }

    // Supplements
    if (supplements === "none" && (zone.level === "high" || zone.level === "veryHigh")) {
      tips.push(
        "If getting a wide variety of nutrient-dense foods is hard right now, you can ask a clinician whether a basic multivitamin/mineral might be appropriate for you."
      );
    }

    // General guidance
    const general = [
      "Food and symptoms alone can’t confirm deficiencies. Lab tests and a conversation with a qualified professional are the gold standard.",
      "If you have a medical condition, take medications, or are pregnant/breastfeeding, always get personalised advice before changing supplements.",
      "This tool is educational and not a diagnostic test. Use it as a starting point to ask better questions, not as a final answer.",
    ];

    if (zone.level === "low" && tips.length === 0) {
      tips.push(
        "Since your attention score is on the lower side, focus on maintaining a varied, mostly whole-food eating pattern and checking in with a health professional periodically as part of routine care."
      );
    }

    return [...tips, ...general];
  };

  const badgeClass = (level) => {
    switch (level) {
      case "low":
        return "bg-emerald-100 text-emerald-700";
      case "moderate":
        return "bg-yellow-100 text-yellow-700";
      case "high":
        return "bg-orange-100 text-orange-700";
      case "veryHigh":
        return "bg-red-100 text-red-700";
      default:
        return "bg-gray-100 text-gray-700";
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 flex justify-center py-10 px-4">
      <div className="w-full max-w-md bg-white shadow-md rounded-xl p-6">
        <h2 className="text-2xl font-semibold text-center mb-2">
          Micronutrient Attention Flagger
        </h2>
        <p className="text-gray-500 text-sm text-center mb-5">
          A quick look at patterns that might deserve extra attention for
          vitamins and minerals. Informational only and{" "}
          <span className="font-semibold">not</span> a diagnosis or blood test.
        </p>

        {/* FORM */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Age + Sex */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-sm font-medium block">Age (years)</label>
              <input
                className={inputBase}
                type="number"
                placeholder="e.g. 29"
                value={age}
                onChange={(e) => setAge(e.target.value)}
                required
              />
            </div>
            <div className="space-y-1">
              <label className="text-sm font-medium block">Sex</label>
              <select
                className={inputBase}
                value={sex}
                onChange={(e) => setSex(e.target.value)}
              >
                <option value="female">Female</option>
                <option value="male">Male</option>
                <option value="other">Other / Prefer not to say</option>
              </select>
            </div>
          </div>

          {/* Diet pattern */}
          <div className="space-y-1">
            <label className="text-sm font-medium block">
              Which best describes your usual eating pattern?
            </label>
            <select
              className={inputBase}
              value={dietPattern}
              onChange={(e) => setDietPattern(e.target.value)}
            >
              <option value="omnivore">
                Omnivore (includes meat/fish and plant foods)
              </option>
              <option value="vegetarian">
                Vegetarian (no meat/fish, but includes eggs/dairy)
              </option>
              <option value="vegan">
                Vegan (no animal products)
              </option>
            </select>
          </div>

          {/* Fruit & veg */}
          <div className="space-y-1">
            <label className="text-sm font-medium block">
              On a typical day, how many servings of fruit + vegetables do you
              eat?
            </label>
            <input
              className={inputBase}
              type="number"
              placeholder="e.g. 3"
              value={fruitVegServings}
              onChange={(e) => setFruitVegServings(e.target.value)}
              required
            />
            <p className="text-[11px] text-gray-400">
              One serving is about a small piece of fruit, ½ cup cooked veg, or
              1 cup leafy greens.
            </p>
          </div>

          {/* Dairy / fortified intake */}
          <div className="space-y-1">
            <label className="text-sm font-medium block">
              How often do you have dairy or fortified milk/yogurt alternatives?
            </label>
            <select
              className={inputBase}
              value={dairyIntake}
              onChange={(e) => setDairyIntake(e.target.value)}
            >
              <option value="daily">Most days (1–2+ servings)</option>
              <option value="some">Sometimes (a few times per week)</option>
              <option value="rare">Rarely / almost never</option>
            </select>
          </div>

          {/* Red meat frequency */}
          <div className="space-y-1">
            <label className="text-sm font-medium block">
              How often do you eat red meat or other iron-rich animal foods?
            </label>
            <select
              className={inputBase}
              value={redMeatFrequency}
              onChange={(e) => setRedMeatFrequency(e.target.value)}
            >
              <option value="often">Most days</option>
              <option value="weekly">About 1–3 times per week</option>
              <option value="rare">Rarely / never</option>
            </select>
          </div>

          {/* Oily fish */}
          <div className="space-y-1">
            <label className="text-sm font-medium block">
              How often do you eat oily fish (like salmon, mackerel, sardines)?
            </label>
            <select
              className={inputBase}
              value={oilyFishFrequency}
              onChange={(e) => setOilyFishFrequency(e.target.value)}
            >
              <option value="weeklyPlus">
                About once a week or more
              </option>
              <option value="sometimes">
                Occasionally (1–3 times per month)
              </option>
              <option value="rare">Rarely / never</option>
            </select>
          </div>

          {/* Sun exposure */}
          <div className="space-y-1">
            <label className="text-sm font-medium block">
              Typical sun exposure most weeks
            </label>
            <select
              className={inputBase}
              value={sunExposure}
              onChange={(e) => setSunExposure(e.target.value)}
            >
              <option value="low">
                Mostly indoors / minimal direct sun
              </option>
              <option value="moderate">
                Some regular outdoor time in daylight
              </option>
              <option value="high">
                Frequent outdoor time with decent skin exposure
              </option>
            </select>
          </div>

          {/* Symptom cluster */}
          <div className="space-y-1">
            <label className="text-sm font-medium block">
              How often do you notice low energy or fatigue?
            </label>
            <select
              className={inputBase}
              value={fatigue}
              onChange={(e) => setFatigue(e.target.value)}
            >
              <option value="rare">Rarely</option>
              <option value="sometimes">Sometimes</option>
              <option value="often">Often / most days</option>
            </select>
          </div>

          <div className="space-y-1">
            <label className="text-sm font-medium block">
              Hair, skin, and nails over the last few months
            </label>
            <select
              className={inputBase}
              value={hairSkin}
              onChange={(e) => setHairSkin(e.target.value)}
            >
              <option value="fine">Mostly as usual</option>
              <option value="someIssues">
                Some changes (e.g. more dryness, breakage, or brittleness)
              </option>
              <option value="frequentIssues">
                Frequent or noticeable changes that concern you
              </option>
            </select>
          </div>

          <div className="space-y-1">
            <label className="text-sm font-medium block">
              Digestion pattern
            </label>
            <select
              className={inputBase}
              value={digestion}
              onChange={(e) => setDigestion(e.target.value)}
            >
              <option value="fine">Mostly steady / as usual</option>
              <option value="sometimesOff">
                Sometimes off (bloating, constipation, loose stools, etc.)
              </option>
              <option value="oftenOff">
                Often off or noticeably changed
              </option>
            </select>
          </div>

          {/* Supplements */}
          <div className="space-y-1">
            <label className="text-sm font-medium block">
              Do you regularly take any vitamin or mineral supplements?
            </label>
            <select
              className={inputBase}
              value={supplements}
              onChange={(e) => setSupplements(e.target.value)}
            >
              <option value="none">No regular supplements</option>
              <option value="multivitamin">
                A general multivitamin/mineral most days
              </option>
              <option value="targeted">
                Targeted supplements (e.g. iron, D, B12, etc.)
              </option>
            </select>
          </div>

          <button
            type="submit"
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 rounded-lg text-sm transition"
          >
            Run Micronutrient Attention Check
          </button>
        </form>

        {/* ERROR */}
        {error && (
          <p className="mt-4 bg-red-100 text-red-600 p-3 rounded-lg text-sm">
            {error}
          </p>
        )}

        {/* RESULT */}
        {result && (
          <div className="bg-gray-50 p-4 rounded-lg shadow-inner mt-6">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-lg font-medium">
                Your Micronutrient Attention Snapshot
              </h3>
              <span
                className={`px-2 py-1 rounded-full text-xs font-semibold ${badgeClass(
                  result.zone.level
                )}`}
              >
                {result.zone.label}
              </span>
            </div>

            <p className="text-xs text-gray-500 mb-3">
              Attention score (higher = more factors to watch):{" "}
              <span className="font-semibold">{result.score}</span> / 40
            </p>

            <p className="text-sm text-gray-700 mb-2">
              {result.zone.description}
            </p>
            <p className="text-sm text-gray-700 mb-3">
              {result.interpretation}
            </p>

            {/* Nutrient flags */}
            <div className="mb-3">
              <p className="text-xs uppercase tracking-wide text-gray-400 mb-1">
                Possible nutrient watch areas
              </p>
              {result.flags.nutrientFlags.length > 0 ? (
                <ul className="list-disc list-inside text-sm text-gray-700 space-y-1 mb-2">
                  {result.flags.nutrientFlags.map((nf, idx) => (
                    <li key={idx}>{nf}</li>
                  ))}
                </ul>
              ) : (
                <p className="text-sm text-gray-700 mb-2">
                  No specific nutrient categories stood out strongly from your
                  answers, but this still isn’t a guarantee that everything is
                  optimal.
                </p>
              )}

              {result.flags.summaryLines.map((line, idx) => (
                <p key={idx} className="text-sm text-gray-700">
                  {line}
                </p>
              ))}
            </div>

            {/* Tips */}
            {result.tips?.length > 0 && (
              <>
                <h4 className="text-sm font-semibold mb-1">
                  Practical ideas you could explore:
                </h4>
                <ul className="list-disc list-inside text-sm text-gray-700 space-y-1">
                  {result.tips.map((tip, idx) => (
                    <li key={idx}>{tip}</li>
                  ))}
                </ul>
              </>
            )}

            <hr className="my-3" />

            <p className="text-[11px] text-gray-400">
              This helper looks at typical diet patterns and broad symptoms. It
              does not use lab results and cannot diagnose deficiencies, medical
              conditions, or mental health issues. If you’re worried about your
              energy, hair/skin changes, digestion, or nutrient status, please
              talk with a doctor, registered dietitian, or other qualified
              health professional. They can interpret your history and, if
              needed, arrange appropriate testing.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
