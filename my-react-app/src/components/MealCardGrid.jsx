import MealCard from "./MealCard.jsx";

const GRID_VARIANTS = {
  popular:
    "grid grid-cols-2 justify-center gap-4 sm:grid-cols-3 sm:justify-start sm:gap-x-12 sm:gap-y-[48px]",
  mainRecipe:
    "grid grid-cols-2 justify-start gap-4 sm:grid-cols-3 sm:gap-x-12 sm:gap-y-[48px] sm:max-w-[684px]",
};

function MealCardGrid({
  meals,
  onCardClick,
  titleMaxLength = 15,
  variant = "popular",
  useLongTitle = false,
}) {
  const formatTitle = (title) => {
    if (!title) return "";
    return title.length > titleMaxLength
      ? `${title.slice(0, titleMaxLength)}...`
      : title;
  };

  return (
    <div className={GRID_VARIANTS[variant] ?? GRID_VARIANTS.popular}>
      {meals.map((meal) => (
        <MealCard
          key={meal.idMeal}
          meal={meal}
          onCardClick={onCardClick}
          title={formatTitle(meal.strMeal)}
          useLongTitle={useLongTitle}
        />
      ))}
    </div>
  );
}

export default MealCardGrid;

