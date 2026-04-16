function MainNav({ activeTab, setActiveTab }) {
  const tabs = [
    { id: "main", label: "Main Recipe" },
    { id: "popular", label: "Popular Meals" },
    { id: "create", label: "Create Own Meal" },
  ];

  return (
    <div className="relative grid grid-cols-2 justify-items-center gap-x-8 gap-y-3 sm:flex sm:justify-center sm:gap-8">
      {tabs.map((tab) => (
        <button
          key={tab.id}
          type="button"
          className={`${tab.id === "create" ? "col-span-2 sm:col-span-1" : ""} relative cursor-pointer border-none bg-transparent pb-1.5 font-teachers text-[18px] font-normal text-[#242D96] after:absolute after:bottom-0 after:left-1/2 after:h-0.5 after:w-[35px] after:-translate-x-1/2 after:rounded after:bg-[#242D96] after:transition-transform after:duration-300 after:ease-in-out ${
            activeTab === tab.id ? "after:scale-x-100" : "after:scale-x-0"
          }`}
          onClick={() => setActiveTab(tab.id)}
        >
          {tab.label}
        </button>
      ))}
    </div>
  );
}

export default MainNav;
