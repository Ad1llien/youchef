import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import API_BASE_URL, { API_ORIGIN } from "../config/api";
import AccountNavigation from "./AccountNavigation";
import AccountProfileSection from "./AccountProfileSection";

function MyAccount() {
  const [isAvatarOpen, setIsAvatarOpen] = useState(false);
  const [avatarPreview, setAvatarPreview] = useState(null);
  const [user, setUser] = useState(null);
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const navigate = useNavigate();
  useEffect(() => {
    fetch(`${API_BASE_URL}/api/user/data`, {
      method: "GET",
      credentials: "include",
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          setUser(data.userData);
        }
      })
      .catch((err) => console.error(err));
  }, []);

  const handleAvatarChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // превью
    const previewUrl = URL.createObjectURL(file);
    setAvatarPreview(previewUrl);

    // отправка на сервер
    const formData = new FormData();
    formData.append("avatar", file);

    try {
      const res = await fetch(`${API_BASE_URL}/api/user/avatar`, {
        method: "POST",
        credentials: "include",
        body: formData,
      });

      const data = await res.json();

      if (data.success) {
        console.log("Avatar updated");
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleLogout = async () => {
    try {
      await fetch(`${API_BASE_URL}/api/auth/logout`, {
        method: "POST",
        credentials: "include",
      });

      navigate("/login");
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="mx-auto mt-[102px] w-full max-w-6xl px-4 md:mt-[102px] md:px-6">
      <h1 className="mb-6 text-center font-['Taviraj'] text-[32px] font-normal leading-normal text-[#242D96] md:mb-[80px]">
        My Account
      </h1>

      <div className="flex flex-col gap-11 md:gap-20 md:flex-row md:items-start">
        <AccountNavigation
          activeItem="personal"
          onOpenPersonalInfo={() => navigate("/my-account")}
          onSubscription={() => navigate("/premium")}
          onOpenPasswordManager={() => navigate("/password-manager")}
          onOpenLikes={() => navigate("/my-likes")}
          onLogout={() => setShowLogoutModal(true)}
        />

        <input
          type="file"
          accept="image/*"
          id="avatarInput"
          className="hidden"
          onChange={handleAvatarChange}
        />

        <AccountProfileSection
          user={user}
          setUser={setUser}
          avatarPreview={avatarPreview}
          apiOrigin={API_ORIGIN}
          onOpenAvatar={() => setIsAvatarOpen(true)}
          onOpenAvatarPicker={() =>
            document.getElementById("avatarInput").click()
          }
        />
      </div>

      {showLogoutModal && (
        <div className="fixed inset-0 z-[1000] flex items-center justify-center bg-black/45 px-4">
          <div className="w-full max-w-[340px] rounded-2xl bg-white p-6 text-center shadow-xl">
            <h3 className="mb-2 text-xl font-semibold text-[#13151A]">
              Logout
            </h3>
            <p className="mb-6 text-sm text-[#555]">
              Are you sure you want to log out of your account?
            </p>

            <div className="flex justify-between gap-3">
              <button
                className="flex-1 rounded-lg bg-[#eee] px-4 py-2.5 text-sm font-medium text-[#333]"
                onClick={() => setShowLogoutModal(false)}
              >
                Cancel
              </button>

              <button
                className="flex-1 rounded-lg bg-[#e53935] px-4 py-2.5 text-sm font-medium text-white"
                onClick={handleLogout}
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      )}
      {isAvatarOpen && (
        <div
          className="fixed inset-0 z-[1100] flex items-center justify-center bg-black/60 px-4"
          onClick={() => setIsAvatarOpen(false)}
        >
          <div className="max-h-[90vh] max-w-[90vw]">
            <img
              src={
                avatarPreview || (user?.avatar && `${API_ORIGIN}${user.avatar}`)
              }
              alt="big avatar"
              className="block max-h-[90vh] max-w-[90vw] object-contain"
            />
          </div>
        </div>
      )}
    </div>
  );
}

export default MyAccount;
