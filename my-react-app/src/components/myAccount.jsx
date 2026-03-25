import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom";

function MyAccount() {
  const [isAvatarOpen, setIsAvatarOpen] = useState(false);
const [avatarPreview, setAvatarPreview] = useState(null);
  const [user, setUser] = useState(null);
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const navigate = useNavigate();
  useEffect(() => {
    fetch("http://localhost:4000/api/user/data", {
      method: "GET",
      credentials: "include",
    })
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          setUser(data.userData);
        }
      })
      .catch(err => console.error(err));
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
      const res = await fetch("http://localhost:4000/api/user/avatar", {
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
      await fetch("http://localhost:4000/api/auth/logout", {
        method: "POST",
        credentials: "include"
      });
  
      navigate("/login");
    } catch (err) {
      console.error(err);
    }
  };

    return (
        
      <div className="myAccountWrapper">
        <div className="recipeEmpty">My Account</div>
        <div className="accountMenu">
          <div className="account-page">
            <div className="left-side">
            <div className="menuwrapper">
              <div className="personalInfo active_MenuPage">
                <div className="rp">
                  <div>Personal Info</div>
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="w-4 h-4 text-[#242D96]"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={2}
                  >
                  <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M9 5l7 7-7 7" // стрелка направо
                   />
                   </svg>
                </div>
                
                <hr />
              </div>
              <div className="personalInfo">
                <div className="rp">
                  <div>Subscription</div>
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="w-4 h-4 text-[#242D96]"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={2}
                  >
                  <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M9 5l7 7-7 7" // стрелка направо
                   />
                   </svg>
                </div>
                
                <hr />
              </div>
              <div className="personalInfo" onClick={()=> navigate("/password-manager")}>
                <div className="rp">
                  <div>Password Manager</div>
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="w-4 h-4 text-[#242D96]"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={2}
                  >
                  <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M9 5l7 7-7 7" // стрелка направо
                   />
                   </svg>
                </div>
                
                <hr />
              </div>
              <div className="personalInfo" onClick={() => navigate("/my-likes")}>
                <div className="rp">
                  <div >Likes</div>
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="w-4 h-4 text-[#242D96]"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={2}
                  >
                  <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M9 5l7 7-7 7" // стрелка направо
                   />
                   </svg>
                </div>
                
                <hr />
              </div>
              <div className="personalInfo" onClick={() => setShowLogoutModal(true)}>
  <div className="rp">
    <div>Logout</div>
  </div>
  <hr />
</div>

            </div>
            </div>

            <input
            type="file"
            accept="image/*"
            id="avatarInput"
            style={{ display: "none" }}
            onChange={handleAvatarChange}
            />

            <div className="right-side">
            <div className="avatar">
  <div className="avatar-wrapper">

    {/* 👇 КЛИК = УВЕЛИЧЕНИЕ */}
    <div
      className="avatar"
      onClick={() => setIsAvatarOpen(true)}
      style={{ cursor: "pointer" }}
    >
      {avatarPreview ? (
        <img src={avatarPreview} alt="avatar" />
      ) : user?.avatar ? (
        <img src={avatarPreview || `http://localhost:4000${user?.avatar}`} alt="avatar" />
      ) : (
        user?.name?.charAt(0).toUpperCase()
      )}
    </div>

    {/* 👇 КЛИК = ВЫБОР ФАЙЛА */}
    <div
      className="edit-avatar"
      onClick={() => document.getElementById("avatarInput").click()}
      style={{ cursor: "pointer" }}
    >
      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="none" stroke="#242D96" strokeWidth="2" viewBox="0 0 24 24">
        <path d="M12 20h9"/>
        <path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4 12.5-12.5z"/>
      </svg>
    </div>

  </div>
</div>

            <form className="profileForm">
          <div className="input-group shorter">
            <label>Full Name *</label>
            <div className="input-wrapper">
              <input
                type="email"
                placeholder=""
                                
                
              />
            </div>
          </div>

          <div className="input-group shorter">
            <label>Email Address *</label>
            <div className="input-wrapper">
              <input
                type="password"
                placeholder=""
                
              />
            </div>
          </div>         
        </form>
        <div className="searchWrapper leeft">
            <button
              className="searchBtn">
              Update
            </button>
          </div>
            </div>
          </div>
        </div>
        {showLogoutModal && (
  <div className="logoutModalOverlay">
    <div className="logoutModal">
      <h3>Logout</h3>
      <p>Are you sure you want to log out of your account?</p>

      <div className="logoutButtons">
        <button
          className="cancelBtn"
          onClick={() => setShowLogoutModal(false)}
        >
          Cancel
        </button>

        <button
          className="logoutBtn"
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
    className="avatarModal"
    onClick={() => setIsAvatarOpen(false)}
  >
    <div className="avatarModalContent">
    <img
  src={avatarPreview || (user?.avatar && `http://localhost:4000${user.avatar}`)}
  alt="big avatar"
/>
    </div>
  </div>
)}
      </div>
    );
  }
  
  export default MyAccount;