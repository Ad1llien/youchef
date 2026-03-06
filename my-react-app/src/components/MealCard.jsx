function MealCard({
  meal,
  onCardClick,
  title,

}) {
  return (
    <div
      className="flex flex-col max-w-[195px] items-center rounded-[15px] cursor-pointer transition-all duration-200 box-border  gap-4"
      onClick={() => onCardClick(meal)}
    >
      <img
        src={meal.strMealThumb}
        alt={meal.strMeal}
        className={`w-[195px] h-[195px] max-w-[195px] max-h-[195px] rounded-[15px] object-cover border border-[#242D96] hover:border-2 hover:border-[#0060B9]`}
      />
      <div
        className={`mt-[5px] text-[#242D96] max-w-[179px] mx-auto font-teachers text-[18px] text-center font-normal line-clamp-2`}
      >
        {title}
      </div>
    </div>
  );
}

export default MealCard;
