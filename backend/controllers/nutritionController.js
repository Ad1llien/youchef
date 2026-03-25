import fetch from "node-fetch";

export const getNutrition = async (req, res) => {
  try {
    const { ingredients } = req.body;

    const response = await fetch(
      `https://api.edamam.com/api/nutrition-details?app_id=${process.env.EDAMAM_ID}&app_key=${process.env.EDAMAM_KEY}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          ingr: ingredients
        })
      }
    );

    const data = await response.json();

    res.json({
      calories: Math.round(data.calories),
      protein: Math.round(data.totalNutrients.PROCNT.quantity),
      carbs: Math.round(data.totalNutrients.CHOCDF.quantity),
      fat: Math.round(data.totalNutrients.FAT.quantity)
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Nutrition calculation failed" });
  }
};