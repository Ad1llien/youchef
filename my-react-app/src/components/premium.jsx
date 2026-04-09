import { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";


function BuyPremium({ tgUser }){

const navigate = useNavigate();

  const handleBuy = () => {
    if (!tgUser) {
      alert("Для покупки авторизуйтесь через Telegram");
      return;
    }

    // Отправляем данные на бота
    window.Telegram.WebApp.sendData(
      JSON.stringify({ action: "buy_premium", userId: tgUser.id })
    );

    alert("Инструкция по оплате отправлена в Telegram");
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
                    <div >Favourites</div>
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
              
  
  
          <div className="searchWrapper leeft">
              <button
                className="searchBtn" onClick={handleBuy}>
                pay
              </button>
            </div>
              </div>
            </div>
          </div>
          
  
        </div>
      );
}



export default BuyPremium;