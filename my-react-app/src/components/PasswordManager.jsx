
import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom";
function PasswordManager() {

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

    return(
        <div className="myAccountWrapper">
        <div className="recipeEmpty">My Account</div>
        <div className="accountMenu">
          <div className="account-page">
            <div className="left-side">
            <div className="menuwrapper">
              <div className="personalInfo">
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
              <div className="personalInfo">
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

            <div className="right-side">
          

               
        
        
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
      </div>
 
    )
}


export default PasswordManager;