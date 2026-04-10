import { useState, useRef, useEffect } from "react";
import CreateOwnMealContent from "./CreateOwnMealContent";
import Line from "../icons/Line36.svg";
import link from "../icons/link-2.svg";
import addphotos from "../icons/sidekickicons_photo-plus.svg";
import pto from "../icons/deleteIcon.svg";
import attach from "../icons/attachIcon.svg";
import { useNavigate } from "react-router-dom";
import more from "../icons/moreIcon.svg";
import success from "../icons/clarity_success-standard-solid.svg"
import API_BASE_URL from "../config/api";
function RequestRecipe() {
  const [active, setActive] = useState(false);
  
  const [addedIngredients, setAddedIngredients] = useState([]);
  const [photo, setPhoto] = useState(null);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  // form fields
  const [name, setName] = useState("");
  const [video, setVideo] = useState("");
  const [description, setDescription] = useState("");
  const [isPremium, setIsPremium] = useState(false);
  const navigate = useNavigate();
  // user info
  const [user, setUser] = useState(null);

  const fileInputRef = useRef(null);

  // получить данные пользователя
  useEffect(() => {
    fetch(`${API_BASE_URL}/api/user/data`, {
      credentials: "include",
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.success) setUser(data.userData);
      })
      .catch((err) => console.error(err));
  }, []);

  // выбор файла
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        setPhoto(URL.createObjectURL(file));
      };
      reader.readAsDataURL(file);
    }
  };

  const removePhoto = () => setPhoto(null);

  // отправка заявки
  const handleSubmit = async () => {
    if (!user) {
      alert("Сначала войдите в аккаунт");
      return;
    }
  
    try {
      const formData = new FormData();
      formData.append("name", name);
      formData.append("ingredients", JSON.stringify(addedIngredients));
      formData.append("video", video);
      formData.append("description", description);
      formData.append("isPremium", isPremium);
      formData.append("userName", user.name);
      formData.append("userEmail", user.email);
  
      if (fileInputRef.current.files[0]) {
        formData.append("photo", fileInputRef.current.files[0]); // файл вместо base64
      }
  
      const res = await fetch(`${API_BASE_URL}/api/recipe-request`, {
        method: "POST",
        credentials: "include",
        body: formData, // тут FormData
      });
  
      const data = await res.json();
  
      if (data.success) {
        setShowSuccessModal(true);
        setTimeout(() => {
            setShowSuccessModal(false);
          }, 5000);
        setName("");
        setVideo("");
        setDescription("");
        setAddedIngredients([]);
        setPhoto(null);
        setIsPremium(false);
      } else {
        alert("Ошибка: " + data.message);
      }
    } catch (err) {
      console.error(err);
      alert("Ошибка отправки");
    }
  };

  return (
    <div className="ingredientsWrapper">
      <h2 className="inYourPot">Add Your Recipe</h2>

      <div className="Line36">
        <img src={Line} alt="" />
      </div>

      <div className="formBlock">
        {/* Фото */}
        <div className="photoBlock">
          <div className="photoFrame">
            {photo ? (
              <img src={photo} alt="uploaded" />
            ) : (
              <img src={addphotos} alt="placeholder" />
            )}
          </div>

          <div className="photoBtns">
            <img src={pto} alt="delete" onClick={removePhoto} />
            <img
              src={attach}
              alt="attach"
              onClick={() => fileInputRef.current.click()}
            />
            <img src={more} alt="more" />
          </div>

          <input
            type="file"
            accept="image/*"
            style={{ display: "none" }}
            ref={fileInputRef}
            onChange={handleFileChange}
          />
        </div>

        {/* Основной блок */}
        <div className="addBlock">
          {/* Name */}
          <div className="addBlockLine">
            <div className="addBlockLineTitle">Name</div>
            <div className="AddBlockInput">
              <div className="AddBlockInputWrapper">
                <input
                  type="text"
                  placeholder="Add Subject"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
              </div>
            </div>
          </div>

          {/* Ingredients */}
          <div className="addBlockLine">
            <div className="addBlockLineTitle">Ingredients</div>
            <div className="AddBlockInput">
              <div className="AddBlockInputWrapper">
                <div className="ingredientsScroll">
                  {addedIngredients.length === 0 ? (
                    <span className="placeholder">Add Ingredients</span>
                  ) : (
                    addedIngredients.map((item) => (
                      <div key={item} className="ingredientTag">
                        <span className="tagText">{item}</span>
                        <span
                          className="removeTag"
                          onClick={() =>
                            setAddedIngredients(
                              addedIngredients.filter((i) => i !== item)
                            )
                          }
                        >
                          ✕
                        </span>
                      </div>
                    ))
                  )}
                </div>

                <button
                  className="addBtn"
                  onClick={() => setActive(!active)}
                  type="button"
                >
                  <span className={`plusIcon ${active ? "active" : ""}`}>+</span>
                </button>
              </div>
            </div>
          </div>

          {/* Video */}
          <div className="addBlockLine">
            <div className="addBlockLineTitle long">Add Video Tutorial</div>
            <div className="AddBlockInput">
              <div className="AddBlockInputWrapper">
                <img src={link} alt="" />
                <input
                  type="text"
                  placeholder="Paste file url"
                  value={video}
                  onChange={(e) => setVideo(e.target.value)}
                />
              </div>
            </div>
          </div>

          {/* Premium */}
          <div className="addBlockLine">
            <div className="addBlockLineTitle">Set Visibility Recipe</div>
            <div className="premiumRadioWrapper">
              <label className="premiumRadio">
                <input
                  type="checkbox"
                  checked={isPremium}
                  onChange={(e) => setIsPremium(e.target.checked)}
                />
                <span className="customRadio"></span>
              </label>

              <div className="radioTitleWrapper">
                <div className="radioTitle">Premium</div>
              </div>
            </div>
          </div>

          {/* Textarea */}
          <div className="addBlockLine">
            <textarea
              placeholder="Type your Recipe here"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>
        </div>
      </div>

      {/* КНОПКИ */}
      <div className="submitBtnsWrapper">
        <div className="submitBtns">
          <div className="cancelBtns">Cancel</div>
          <div className="submitBtn" onClick={handleSubmit}>
            Submit
          </div>
        </div>
      </div>

      {/* Ингредиенты popup */}
      {active && (
        <CreateOwnMealContent
          checkPot={addedIngredients}
          setCheckPot={setAddedIngredients}
          showPot={false}
        />
      )}
      {showSuccessModal  && (
        <div className="logoutModalOverlay">
          <div className="logoutModal">
            <img src={success} alt="" />
            <p>Successful!</p>
            <div className="logoutButtons">
              <button className="cancelBtn" onClick={() => setShowSuccessModal(false)}>Back</button>
              <button className="logoutBtn" onClick={()=> navigate("/")}>Go to home</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default RequestRecipe;
