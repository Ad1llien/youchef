function MealCard({
  meal,
  onCardClick,
  title,

}) {
  return (
    <div
      className="flex flex-col max-w-[108px] items-center gap-3 rounded-[15px] box-border transition-all duration-200 cursor-pointer sm:max-w-[195px] sm:gap-4"
      onClick={() => onCardClick(meal)}
    >
      <img
        src={meal.strMealThumb}
        alt={meal.strMeal}
        className="h-[108px] w-[108px] max-h-[108px] max-w-[108px] rounded-[15px] border border-[#242D96] object-cover hover:border-2 hover:border-[#0060B9] sm:h-[195px] sm:w-[195px] sm:max-h-[195px] sm:max-w-[195px]"
      />
      <div
        className="mx-auto mt-1 max-w-[140px] text-center font-teachers text-[18px] font-normal text-[#242D96] line-clamp-2 sm:mt-[5px] sm:max-w-[179px]"
      >
        {title}
      </div>
    </div>
  );
}

export default MealCard;
