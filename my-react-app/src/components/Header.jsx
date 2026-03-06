import youChefLogo from "../logos/logo.svg";

function Header({ onBurgerClick }) {
  return (
    <header className="flex justify-between items-end pt-12 px-[146px] max-w-[1148px] mx-auto bg-[#FFFEEB]">
      <img
        src={youChefLogo}
        alt="YouChef Logo"
        className="w-[245px] h-[74px] block"
      />

      {/* DESKTOP NAV */}
      <nav className="flex gap-8 text-[#242D96] font-teachers text-xl font-normal items-center max-[393px]:hidden">
        <div className="cursor-pointer">Recipe</div>
        <div className="cursor-pointer">Premium</div>
        <div className="cursor-pointer">Contact</div>
        <button className="flex w-32 h-10 py-2.5 px-3 justify-center items-center gap-1 border-none cursor-pointer rounded-full bg-[#242D96] ml-16 text-white font-teachers text-lg font-medium">
          Log In
        </button>
      </nav>

      {/* MOBILE HEADER */}
      <div className="hidden max-[393px]:flex max-[393px]:gap-3 max-[393px]:items-center">
        <button className="flex w-32 h-10 py-2.5 px-3 justify-center items-center rounded-full bg-[#242D96] text-white font-teachers text-lg font-medium">
          Log In
        </button>
        <button
          className="text-[28px] bg-transparent border-none cursor-pointer text-[#242D96]"
          onClick={onBurgerClick}
        >
          ☰
        </button>
      </div>
    </header>
  );
}

export default Header;
