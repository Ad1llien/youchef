import '../styles/createOwnMeal.css';
import { useState, useRef } from 'react';
import ingredientsData from '../../classified_ingredients.json';
import stroke from '../icons/stroke.svg';

// icons
import meatIcon from '../icons/meat2.svg';
import pastaIcon from '../icons/pasta1.svg';
import vegIcon from '../icons/vegetable1.svg';
import fruitIcon from '../icons/harvest1.svg';
import peasIcon from '../icons/peas1.svg';
import seafoodIcon from '../icons/seafood1.svg';
import nutsIcon from '../icons/nuts1.svg';
import eggIcon from '../icons/egg1.svg';
import grainIcon from '../icons/seeds1.svg';
import dairyIcon from '../icons/dairy1.svg';
import sauceIcon from '../icons/oil1.svg';
import bakingIcon from '../icons/baking1.svg';
import potIcon from '../icons/openPot.svg';

const CATEGORIES = [
  { key: 'Meat', icon: meatIcon },
  { key: 'Pasta', icon: pastaIcon },
  { key: 'Vegetables', icon: vegIcon },
  { key: 'Fruits', icon: fruitIcon },
  { key: 'Legumes', icon: peasIcon },
  { key: 'Seafood', icon: seafoodIcon },
  { key: 'Nuts', icon: nutsIcon },
  { key: 'Eggs', icon: eggIcon },
  { key: 'Grain & Cereals', icon: grainIcon },
  { key: 'Dairy Products', icon: dairyIcon },
  { key: 'Sauses & Oils', icon: sauceIcon },
  { key: 'Baking & Sweets', icon: bakingIcon },
];

function CreateOwnMealContent() {
  const [activeCategory, setActiveCategory] = useState(null);
  const [loading, setLoading] = useState(false);
  const [checkPot, setToPot] = useState([]);
  const flyRef = useRef(null);
  const potRef = useRef(null);

  const ingredients = activeCategory ? ingredientsData[activeCategory] || [] : [];

  // Toggle категории
  const handleCategoryClick = (key) => {
    if (activeCategory === key) {
      setActiveCategory(null);
      setLoading(false);
      return;
    }
    setActiveCategory(key);
    setLoading(true);
    setTimeout(() => setLoading(false), 600);
  };

  // Добавление / удаление ингредиента
  const checkIngregient = (str, e) => {

    if (checkPot.includes(str)) {
      
      setToPot(checkPot.filter((item) => item !== str));
    } else {
      flyToPot(e, str);
      setToPot([...checkPot, str]);
    }
  };

  // Анимация “летящей” картинки
  const flyToPot = (e, src) => {
    const fly = flyRef.current;
    const pot = potRef.current;
    if (!fly || !pot) return;

    const imgSrc = `https://www.themealdb.com/images/ingredients/${src}.png`;

    fly.querySelector('img').src = imgSrc;
    fly.style.display = 'block';
    fly.style.transition = 'none';

    const startX = e.clientX - 36; // центрируем
    const startY = e.clientY - 36;
    fly.style.left = `${startX}px`;
    fly.style.top = `${startY}px`;
    fly.style.width = `72px`;
    fly.style.height = `72px`;
    fly.style.opacity = 1;

    // получаем координаты кастрюли
    const potRect = pot.getBoundingClientRect();
    const targetX = potRect.left + potRect.width / 2 - 36;
    const targetY = potRect.top + potRect.height / 2 - 36;

    setTimeout(() => {
      fly.style.transition = 'all 0.8s ease-in-out';
      fly.style.left = `${targetX}px`;
      fly.style.top = `${targetY}px`;
      fly.style.width = `30px`;
      fly.style.height = `30px`;
    }, 10);

    // скрываем после анимации
    setTimeout(() => {
      fly.style.opacity = 0;
    }, 900);
  };

  return (
    <div className="createOwnMealContent">
      {/* 🔹 Летающая картинка */}
      <div className="fly-cart" ref={flyRef}>
        <img src="" alt="fly" />
      </div>

      {/* 🔹 Категории */}
      <div className="categoriesGrid">
        {CATEGORIES.map((cat) => (
          <div
            key={cat.key}
            className="categoryCard"
            onClick={() => handleCategoryClick(cat.key)}
          >
            <div className="card">
              <div className={`iconCircle ${activeCategory === cat.key ? 'active' : ''}`}>
                <img src={cat.icon} alt={cat.key} />
              </div>
              <div className="cardTitle">{cat.key}</div>
            </div>
          </div>
        ))}
      </div>

      {/* 🔹 Иконка кастрюли */}
      <div className="potIcon" ref={potRef}>
        <img src={potIcon} alt="pot" />
      </div>

      <div className="line">
        <img src={stroke} alt="" />
      </div>

      {/* 🔹 Ингредиенты */}
      {activeCategory && (
        <div className="ingredientsWrapper">
          <h3 className="ingredientsTitle">{activeCategory}</h3>

          {loading ? (
            <div className="loaderWrapper">
              <div className="loader" />
            </div>
          ) : (
            <div className="ingredientsGrid fivePerRow">
              {ingredients.map((item) => (
                <div
                  key={item}
                  className={`ingredientCard ${checkPot.includes(item) ? 'active' : ''}`}
                  onClick={(e) => checkIngregient(item, e)}
                >
                  <img
                    className="ingredientImage Ingrs"
                    src={`https://www.themealdb.com/images/ingredients/${item}.png`}
                    alt={item}
                    onError={(e) => (e.target.src = '/placeholder.png')}
                  />
                  <div className="ingredientTitle">{item}</div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default CreateOwnMealContent;
