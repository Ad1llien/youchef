import { useMemo, useState } from "react";

function AccountProfileSection({
  user,
  setUser,
  avatarPreview,
  apiOrigin,
  onOpenAvatar,
  onOpenAvatarPicker,
}) {
  const [gender, setGender] = useState("female");

  const avatarSrc = useMemo(() => {
    if (avatarPreview) return avatarPreview;
    if (user?.avatar) return `${apiOrigin}${user.avatar}`;
    return null;
  }, [avatarPreview, apiOrigin, user?.avatar]);

  return (
    <div className="w-full min-w-0 md:flex-1">
      <div className="relative mb-6 h-[100px] w-[100px]">
        <div
          className="flex h-[100px] w-[100px] cursor-pointer items-center justify-center overflow-hidden rounded-full bg-[#242D96] text-4xl font-semibold text-white"
          onClick={onOpenAvatar}
        >
          {avatarSrc ? (
            <img
              src={avatarSrc}
              alt="avatar"
              className="h-full w-full object-cover"
            />
          ) : (
            user?.name?.charAt(0).toUpperCase()
          )}
        </div>

        <button
          type="button"
          className="absolute -bottom-1 -right-1 flex h-8 w-8 items-center justify-center rounded-full border-2 border-[#242D96] bg-white"
          onClick={onOpenAvatarPicker}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="16"
            height="16"
            fill="none"
            stroke="#242D96"
            strokeWidth="2"
            viewBox="0 0 24 24"
          >
            <path d="M12 20h9" />
            <path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4 12.5-12.5z" />
          </svg>
        </button>
      </div>

      <form className="w-[270px] md:w-full max-w-[560px] min-w-0 space-y-5">
        <div>
          <label className="mb-2 block font-['Teachers'] font-medium leading-[20px] tracking-[-0.14px] text-[#242D96]">
            Full Name *
          </label>
          <div className="relative">
            <svg
              className="pointer-events-none absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-[#8B93A6]"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.8"
            >
              <circle cx="12" cy="8" r="3.5" />
              <path d="M5 19c1.6-3 4.1-4.5 7-4.5s5.4 1.5 7 4.5" />
            </svg>
            <input
              type="text"
              placeholder="Full Name"
              className="h-14 w-full min-w-0 rounded-[8px] border border-[#BBC8D8] bg-white/70 pl-11 pr-4 font-['Teachers'] text-[16px] font-normal text-[#13151A] outline-none transition focus:border-[#242D96] md:text-[22px]"
              value={user?.name || ""}
              onChange={(e) => setUser({ ...user, name: e.target.value })}
            />
          </div>
        </div>

        <div>
          <label className="mb-2 block font-['Teachers'] font-medium leading-[20px] tracking-[-0.14px] text-[#242D96]">
            Email Address *
          </label>
          <div className="relative">
            <svg
              className="pointer-events-none absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-[#8B93A6]"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.8"
            >
              <path d="M3.5 6.5h17v11h-17z" />
              <path d="m4.5 7.5 7.5 6 7.5-6" />
            </svg>
            <input
              type="email"
              placeholder="Email"
              className="h-14 w-full min-w-0 rounded-[8px] border border-[#BBC8D8] bg-white/70 pl-11 pr-4 font-['Teachers'] text-[16px] font-normal text-[#13151A] outline-none transition focus:border-[#242D96] md:text-[22px]"
              value={user?.email || ""}
              onChange={(e) => setUser({ ...user, email: e.target.value })}
            />
          </div>
        </div>

        <div>
          <div className="mb-2 font-['Teachers'] font-medium leading-[20px] tracking-[-0.14px] text-[#242D96]">
            Gender
          </div>
          <div className="flex flex-wrap items-center gap-4">
            <button
              type="button"
              onClick={() => setGender("female")}
              className="flex items-center gap-3 border-none bg-transparent p-0"
            >
              <span
                className={`h-5 w-5 rounded-full border-2 ${gender === "female" ? "border-[#242D96]" : "border-[#BBC8D8]"}`}
              >
                <span
                  className={`m-[5px] block h-2.5 w-2.5 rounded-full ${gender === "female" ? "bg-[#242D96]" : "bg-transparent"}`}
                />
              </span>
              <span className="rounded-full border border-[#BBC8D8] px-4 py-1 font-['Teachers'] text-[14px] text-[#242D96] md:text-[18px]">
                Female
              </span>
            </button>

            <button
              type="button"
              onClick={() => setGender("male")}
              className="flex items-center gap-3 border-none bg-transparent p-0"
            >
              <span
                className={`h-5 w-5 rounded-full border-2 ${gender === "male" ? "border-[#242D96]" : "border-[#BBC8D8]"}`}
              >
                <span
                  className={`m-[5px] block h-2.5 w-2.5 rounded-full ${gender === "male" ? "bg-[#242D96]" : "bg-transparent"}`}
                />
              </span>
              <span className="rounded-full border border-[#BBC8D8] px-4 py-1 font-['Teachers'] text-[14px] text-[#242D96] md:text-[18px]">
                Male
              </span>
            </button>
          </div>
        </div>

        <button
          type="button"
          className="mt-3 w-full rounded-full bg-[#242D96] px-6 py-3 font-['Teachers'] text-[18px] font-medium leading-none text-white transition hover:bg-[#1d2577] sm:w-fit"
        >
          Update Changes
        </button>
      </form>
    </div>
  );
}

export default AccountProfileSection;
