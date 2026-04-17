function CategoryFilter({ options, activeValue, onSelect }) {
  return (
    
      <div className="category-filter-buttons flex gap-6 sm:gap-10 w-full overflow-x-auto  pb-12 [-webkit-overflow-scrolling:touch] [&::-webkit-scrollbar]:hidden px-4">
        {options.map((option) => {
          const isActive = activeValue === option.value;

          return (
            <button
              key={option.value}
              type="button"
              onClick={() => onSelect(option.value)}
              className={[
                "flex flex-shrink-0 items-center justify-center rounded-[30px] border",
                "w-[141px] h-[40px] px-3",
                "border-[#788CA5] text-[18px] font-normal font-teachers",
                !isActive &&
                  "hover:border-[#0060B9] text-[#788CA5] bg-transparent hover:bg-[rgba(0,96,185,0.15)] hover:text-[#0060B9]",
                isActive &&
                  "border-[#C8D69B] bg-[rgba(200,214,155,0.29)] text-[#343B1B]",
              ]
                .filter(Boolean)
                .join(" ")}
            >
              {option.label}
            </button>
          );
        })}
    
    </div>
  );
}

export default CategoryFilter;

