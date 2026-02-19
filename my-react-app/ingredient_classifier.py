import json

# Шаг 1: Загружаем ингредиенты из JSON файла
with open('ingredients.json', 'r') as f:
    data = json.load(f)

# Проверим структуру данных
print(data)  # Добавим вывод для проверки данных

# Проверка, если ключ 'ingredients' существует
if 'ingredients' in data:
    ingredients = data['ingredients']
else:
    ingredients = data  # Если данных без ключа, то работаем напрямую с data

# Шаг 2: Определяем категории
categories = [
    "Meat", 
    "Pasta", 
    "Vegetables", 
    "Fruits", 
    "Legumes", 
    "Seafood", 
    "Nuts", 
    "Eggs", 
    "Grain & Cereals", 
    "Dairy Products", 
    "Sauses & Oils", 
    "Baking & Sweets",
    "Others"  # Добавляем категорию "Others"
]

# Шаг 3: Создаём структуру для распределения ингредиентов по категориям
ingredients_by_category = {category: [] for category in categories}

# Шаг 4: Функция для распределения ингредиентов по категориям
def classify_ingredient(ingredient):
    if ingredient in ["Chicken", "Beef", "Pork", "Lamb"]:
        return "Meat"
    elif ingredient in ["Spaghetti", "Penne", "Macaroni"]:
        return "Pasta"
    elif ingredient in ["Tomato", "Carrot", "Cucumber", "Lettuce"]:
        return "Vegetables"
    elif ingredient in ["Apple", "Banana", "Orange", "Lemon"]:
        return "Fruits"
    elif ingredient in ["Beans", "Lentils", "Chickpeas", "Peas"]:
        return "Legumes"
    elif ingredient in ["Salmon", "Tuna", "Shrimp", "Cod"]:
        return "Seafood"
    elif ingredient in ["Almond", "Walnut", "Cashew", "Pistachio"]:
        return "Nuts"
    elif ingredient in ["Eggs", "Eggplant"]:
        return "Eggs"
    elif ingredient in ["Rice", "Wheat", "Oats", "Corn"]:
        return "Grain & Cereals"
    elif ingredient in ["Milk", "Cheese", "Yogurt", "Butter"]:
        return "Dairy Products"
    elif ingredient in ["Olive Oil", "Vegetable Oil", "Coconut Oil"]:
        return "Sauses & Oils"
    elif ingredient in ["Flour", "Sugar", "Chocolate", "Baking Powder"]:
        return "Baking & Sweets"
    else:
        return "Others"  # Если ингредиент не попал в категорию, классифицируем как "Others"

# Шаг 5: Распределяем ингредиенты по категориям
for ingredient in ingredients:  # Итерируем по списку данных (ingredients)
    category = classify_ingredient(ingredient)
    ingredients_by_category[category].append(ingredient)

# Шаг 6: Выводим результат
with open('classified_ingredients.json', 'w') as f:
    json.dump(ingredients_by_category, f, indent=4)

print("Ингредиенты распределены по категориям и сохранены в classified_ingredients.json")