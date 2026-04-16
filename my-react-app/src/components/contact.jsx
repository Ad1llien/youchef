import { useState } from "react";
import accountIcon from "../icons/account-circle-line.svg";
import mailIcon from "../icons/mail-line.svg";
import instagramIcon from "../icons/instagram.svg";
import telegramIcon from "../icons/telegram.svg";
import tiktokIcon from "../icons/tik-tok.svg";
import youtubeIcon from "../icons/youtube.svg";
import "../styles/contact.css";
import API_BASE_URL from "../config/api";

function Contact() {
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [status, setStatus] = useState(""); // добавь стейт

  const handleSubmit = async (e) => {
    e.preventDefault();
  
    if (!fullName.trim() || !email.trim() || !message.trim()) {
      setStatus("error");
      return;
    }
  
    try {
      const res = await fetch(`${API_BASE_URL}/api/contact`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ fullName, email, message }),
      });
  
      const data = await res.json();
  
      if (data.success) {
        setStatus("success");
        setFullName("");
        setEmail("");
        setMessage("");
        setTimeout(() => setStatus(""), 4000);
      } else {
        setStatus("error");
      }
    } catch (err) {
      console.error(err);
      setStatus("error");
    }
  };

  return (
    <section className="contact-page">
      <h1 className="contact-title">Contact</h1>

      <form className="contact-form" onSubmit={handleSubmit}>
        <div className="contact-row">
          <label className="contact-field">
            <span className="contact-label">
              Full name <span className="required-star">*</span>
            </span>
            <div className="contact-input-wrap">
              <img src={accountIcon} alt="" />
              <input
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="Mason Taylor"
              />
            </div>
          </label>

          <label className="contact-field">
            <span className="contact-label">
              Email Address <span className="required-star">*</span>
            </span>
            <div className="contact-input-wrap">
              <img src={mailIcon} alt="" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="hello@squareui.com"
              />
            </div>
          </label>
        </div>

        <label className="contact-textarea-field">
          <span className="contact-label">Your message</span>
          <textarea
            maxLength={200}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Enter your message here."
          />
          <span className="char-counter">{message.length}/200</span>
        </label>

        <button type="submit" className="contact-send-btn">
          Send
        </button>
        {status === "success" && (
  <p style={{ color: "green", marginTop: "8px" }}>✅ Сообщение отправлено!</p>
)}
{status === "error" && (
  <p style={{ color: "red", marginTop: "8px" }}>❌ Заполните все поля</p>
)}
      </form>

      <div className="contact-info-grid">
        <div className="contact-info-block">
          <p className="contact-info-title">Email</p>
          <p className="contact-info-value">youchef@com</p>
        </div>

        <div className="contact-info-block">
          <p className="contact-info-title">We are on social media</p>
          <div className="contact-socials">
            <a href="#" onClick={(e) => e.preventDefault()} aria-label="Instagram">
              <img src={instagramIcon} alt="" />
            </a>
            <a href="#" onClick={(e) => e.preventDefault()} aria-label="Telegram">
              <img src={telegramIcon} alt="" />
            </a>
            <a href="#" onClick={(e) => e.preventDefault()} aria-label="TikTok">
              <img src={tiktokIcon} alt="" />
            </a>
            <a href="#" onClick={(e) => e.preventDefault()} aria-label="YouTube">
              <img src={youtubeIcon} alt="" />
            </a>
          </div>
        </div>

        <div className="contact-info-block">
          <p className="contact-info-title">Based in</p>
          <p className="contact-info-value">Kazakhstan, Almaty</p>
        </div>
      </div>

      <div className="contact-bottom-line" />
    </section>
  );
}

export default Contact;