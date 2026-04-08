import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import "../styles/helpCenter.css";

function HelpCenter() {
  const navigate = useNavigate();
  const faqItems = useMemo(
    () => [
      {
        question: "How can I contact customer support?",
        answer: "",
      },
      {
        question: "What services do you offer?",
        answer:
          "We provide a range of services, including digital banking solutions, payment processing, risk management, and compliance tools.",
      },
      {
        question: "How secure are your digital banking solutions?",
        answer: "",
      },
      {
        question: "What types of payment methods do you support?",
        answer: "",
      },
      {
        question: "Can your software integrate with existing systems?",
        answer: "",
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