// saveIngredients.js
import fs from 'fs';  // Node v24+ поддерживает ESM
import fetch from 'node-fetch'; // если fetch встроенный, можно убрать

async function saveIngredients() {
  try {
    console.log("Запрашиваем список ингредиентов...");
    const res = await fetch('https://www.themealdb.com/api/json/v1/1/list.php?i=list');
    const data = await res.json();

    if (!data.meals) {
      console.log("Ингредиенты не получены");
      return;
    }

    // получаем только названия ингредиентов
    const ingredients = data.meals.map(item => item.strIngredient);

    // записываем в файл
    fs.writeFileSync('ingredients.json', JSON.stringify(ingredients, null, 2), 'utf-8');
    console.log(`Сохранено ${ingredients.length} ингредиентов в файл ingredients.json`);
  } catch (err) {
    console.error('Ошибка при получении ингредиентов:', err);
  }
}

saveIngredients();
