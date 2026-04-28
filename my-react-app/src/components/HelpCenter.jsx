import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import "../styles/helpCenter.css";
import error from "../icons/suraq_belgisi.svg"

function HelpCenter() {
  const navigate = useNavigate();
  const faqItems = useMemo(
    () => [
      {
        question: "How do I create an account?",
        answer: "Click the 'Login' button in the top right corner, then select 'Create account'. Enter your name, email and password. You will receive a verification email — confirm it and your account is ready.",
      },
      {
        question: "What is Premium and what does it include?",
        answer: "Premium gives you access to exclusive recipes, the ability to submit your own recipes, and AI-powered food analysis. You can purchase Premium via Telegram Stars or Kaspi QR on the Premium page.",
      },
      {
        question: "How do I pay for Premium?",
        answer: "We support two payment methods: Telegram Stars (automatic activation after payment) and Kaspi QR (manual activation — send us a payment screenshot via Contact page).",
      },
      {
        question: "How does the ingredient search work?",
        answer: "Go to the 'Create' tab on the main page, select the ingredients you have at home, and the app will show you all dishes you can make with them.",
      },
      {
        question: "How do I submit my own recipe?",
        answer: "Go to 'Request Recipe' page, fill in the name, ingredients, description and optionally a video link. After review by our moderators, your recipe will appear on the site.",
      },
      {
        question: "How long does recipe moderation take?",
        answer: "We review submitted recipes within 1–3 business days. You will receive an email notification about the decision.",
      },
      {
        question: "I paid via Kaspi but Premium is not activated.",
        answer: "Kaspi payments are activated manually. Please send us a payment screenshot via the Contact page or email youchef.app@gmail.com. We will activate your Premium within a few hours.",
      },
      {
        question: "How do I cancel or get a refund?",
        answer: "We offer a full refund within 7 days of purchase if you have not extensively used Premium features. Contact us at youchef.app@gmail.com with your transaction details.",
      },
      {
        question: "How do I change my password?",
        answer: "Go to My Account → Password Manager. Enter your current password and set a new one. If you forgot your password, use the 'Forgot password' link on the login page.",
      },
      {
        question: "How do I link my Telegram account?",
        answer: "Open our Telegram bot @youchefBot, send /login, and enter your YouChef email and password. After linking, you can purchase Premium directly in Telegram.",
      },
    ],
    []
  );
  const [openIndex, setOpenIndex] = useState(1);

  return (
    <section className="help-center-page">
      <div className="help-center-header">
        <h1>Help center</h1>
        <p>
          We compiled a list of answers to address your most pressing questions
          regarding our Services.
        </p>
      </div>

      <div style={{ display: "flex", justifyContent: "center" }}>
  <img style={{ width: 200, height: 200 }} src={error} alt="" />
</div>      
      <div className="help-accordion">
        {faqItems.map((item, index) => {
          const isOpen = openIndex === index;
          return (
            <button
              key={item.question}
              type="button"
              className={`help-accordion-item ${isOpen ? "open" : ""}`}
              onClick={() => setOpenIndex(isOpen ? -1 : index)}
            >
              <span className="question-mark">?</span>
              <span className="help-accordion-content">
                <span className="help-question">{item.question}</span>
                {isOpen && item.answer ? (
                  <span className="help-answer">{item.answer}</span>
                ) : null}
              </span>
              <span className={`help-chevron ${isOpen ? "up" : "down"}`}>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                >
                  <path
                    d="M7 10L12 15L17 10"
                    stroke="#242D96"
                    strokeWidth="1.8"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </span>
            </button>
          );
        })}
      </div>

      <div className="help-divider" />

      <div className="help-cta">
        <h2>Still have questions?</h2>
        <p>Please connect with our support team, we&apos;re happy to help!</p>
        <button type="button" onClick={() => navigate("/contact")}>
          Contact us
        </button>
      </div>
    </section>
  );
}

export default HelpCenter;