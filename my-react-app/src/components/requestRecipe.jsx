import { useState, useRef } from "react";
import CreateOwnMealContent from "./CreateOwnMealContent";
import Line from "../icons/Line36.svg";
import link from "../icons/link-2.svg";
import addphotos from "../icons/sidekickicons_photo-plus.svg";
import pto from "../icons/deleteIcon.svg";
import attach from "../icons/attachIcon.svg";
import more from "../icons/moreIcon.svg";

function RequestRecipe() {
  const [active, setActive] = useState(false);
  const [addedIngredients, setAddedIngredients] = useState([]);
  const [photo, setPhoto] = useState(null); // state для загруженного фото
  const fileInputRef = useRef(null); // реф для скрытого input

  // выбор файла
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        setPhoto(event.target.result); // сохраняем base64
      };
      reader.readAsDataURL(file);
    }
  };

  // удаление фото
  const removePhoto = () => {
    setPhoto(null);
  };

  return (
    <div className="ingredientsWrapper">
      <h2 className="inYourPot">Add Your Recipe</h2>

      <div className="Line36">
        <img src={Line} alt="" />
      </div>

      <div className="formBlock">
        {/* Фото блок */}
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
                <input type="text" placeholder="Add Subject" required />
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
                <input type="text" placeholder="Paste file url" required />
              </div>
            </div>
          </div>

          {/* Premium */}
          <div className="addBlockLine">
            <div className="addBlockLineTitle">Set Visibility Recipe</div>
            <div className="premiumRadioWrapper">
              <label className="premiumRadio">
                <input type="checkbox" name="option" />
                <span className="customRadio"></span>
              </label>

              <div className="radioTitleWrapper">
                <div className="radioTitle">Premium</div>
              </div>
            </div>
          </div>

          {/* Textarea */}
          <div className="addBlockLine">
            <textarea placeholder="Type your Recipe here"></textarea>
          </div>
        </div>
        
      </div>
      <div className="submitBtns">
            <div className="cancelBtns">
                Cancel
            </div>
            <div className="submitBtn">
                Submit
            </div>
        </div>

      {/* Категории */}
      {active && (
        <CreateOwnMealContent
          checkPot={addedIngredients}
          setCheckPot={setAddedIngredients}
          showPot={false}
        />
      )}
    </div>
  );
}

export default RequestRecipe;