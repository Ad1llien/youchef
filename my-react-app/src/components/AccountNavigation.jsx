function ArrowIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      className="h-5 w-5 text-[#242D96]"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth={2}
    >
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
    </svg>
  );
}

function AccountNavigationItem({
  label,
  active = false,
  showArrow = true,
  onClick,
}) {
  const textColor = active ? "text-[#242D96]" : "text-[#343B1B]";
  const borderColor = active
    ? "border-[#242D96]"
    : "border-transparent md:border-[#BBC8D8]";
  const baseClass =
    "shrink-0 border-b-2 pb-3 text-left font-['Teachers'] text-[18px] font-semibold leading-normal md:w-full md:pb-6";

  return (
    <button
      type="button"
      onClick={onClick}
      className={`inline-block appearance-none border-0 ${borderColor} bg-transparent p-0 focus:outline-none md:block ${baseClass} ${textColor}`}
    >
      <div className="flex items-center justify-between">
        <span className="font-semibold">{label}</span>
        {showArrow && (
          <span className="hidden md:inline-flex">
            <ArrowIcon />
          </span>
        )}
      </div>
    </button>
  );
}

function AccountNavigation({
  activeItem = "personal",
  onOpenPersonalInfo,
  onSubscription,
  onOpenPasswordManager,
  onOpenLikes,
  onLogout,
}) {
  return (
    <div className="w-full md:w-[278px] md:shrink-0 font-teachers">
      <div className="flex gap-8 overflow-x-auto whitespace-nowrap pb-2 pr-4 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden md:block md:space-y-5 md:pr-0">
        <AccountNavigationItem
          label="Personal Information"
          active={activeItem === "personal"}
          onClick={onOpenPersonalInfo}
        />
        <AccountNavigationItem
          label="Subscription"
          active={activeItem === "subscription"}
          onClick={onSubscription}
        />
        <AccountNavigationItem
          label="Password Manager"
          active={activeItem === "password"}
          onClick={onOpenPasswordManager}
        />
        <AccountNavigationItem
          label="Likes"
          active={activeItem === "likes"}
          onClick={onOpenLikes}
        />
        <AccountNavigationItem
          label="Logout"
          showArrow={false}
          onClick={onLogout}
        />
      </div>
    </div>
  );
}

export default AccountNavigation;