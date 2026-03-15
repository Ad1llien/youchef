import { useState, useEffect } from "react"
function MyAccount() {
  const [user, setUser] = useState(null);

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

    return (
        
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
              <div className="personalInfo">
                <div className="rp">
                  <div>Likes</div>
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
                  <div>Logout</div>
                </div>
                
                <hr />
              </div>

            </div>
            </div>

            <div className="right-side">
              <div className="avatar">
                <div className="avatar-wrapper">
                  <div className="avatar">
                    {user?.name?.charAt(0).toUpperCase()}
                  </div>

                  <div className="edit-avatar">
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
            </div>
          </div>
        </div>
      </div>
    );
  }
  
  export default MyAccount;