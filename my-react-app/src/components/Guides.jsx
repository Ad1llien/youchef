import { useState } from "react";
import { useNavigate } from "react-router-dom";
import "../styles/helpCenter.css";

const GUIDES = [
  {
    id: "browse",
    title: "Browsing Recipes",
    steps: [
      {
        title: "Go to Recipes page",
        desc: "Click 'Recipes' in the navigation bar. You'll see three tabs: Main Recipe, Popular Meals, and Create Own Meal.",
      },
      {
        title: "Filter by category or region",
        desc: "In Main Recipe, open the 'Dish Type' or 'Region' dropdown on the left side to filter recipes. You can also quickly filter by Vegan, Halal, or From Chef using the top buttons.",
      },
      {
        title: "Browse Popular Meals",
        desc: "Switch to the 'Popular Meals' tab to see curated collections: Breakfast, Lunch, Dinner, and From Chef.",
      },
      {
        title: "Open a recipe",
        desc: "Click on any dish card to open the full recipe with ingredients, cooking instructions, nutrition info, and a YouTube video link if available.",
      },
    ],
  },
  {
    id: "create",
    title: "Create Own Meal",
    steps: [
      {
        title: "Switch to Create Own Meal tab",
        desc: "On the main page, click the 'Create Own Meal' tab. You'll see ingredient categories like Meat, Vegetables, Fruits, Dairy and more.",
      },
      {
        title: "Add ingredients",
        desc: "Click on a category to expand it, then select ingredients you have at home. Alternatively, use the search bar to find a specific ingredient quickly.",
      },
      {
        title: "View your pot",
        desc: "As you add ingredients, they go into your Pot. Click the pot icon in the bottom right to see all selected ingredients and remove any if needed.",
      },
      {
        title: "Search for matching recipes",
        desc: "Click the 'Search' button. YouChef will find all dishes you can make with your ingredients and show them sorted by match percentage.",
      },
      {
        title: "Open a result",
        desc: "Click any dish in the results list to see the full recipe. The match percentage shows how many of your ingredients are used.",
      },
    ],
  },
  {
    id: "request",
    title: "Request a Recipe",
    steps: [
      {
        title: "Go to Request Recipe",
        desc: "Click 'Request Recipe' button found on the Pot page after searching, or navigate to it from your account menu.",
      },
      {
        title: "Fill in the recipe details",
        desc: "Enter the recipe name, add ingredients one by one using the + button, paste a YouTube video link (optional), and write the cooking instructions in the text area.",
      },
      {
        title: "Set visibility",
        desc: "Toggle the Premium checkbox if you want your recipe to be visible only to Premium subscribers.",
      },
      {
        title: "Upload a photo",
        desc: "Click the photo icon to attach an image of your dish. This helps moderators and users recognize the recipe.",
      },
      {
        title: "Submit for review",
        desc: "Click Submit. Our moderators will review your recipe within 1–3 business days. You'll receive an email with the decision.",
      },
    ],
  },
  {
    id: "premium",
    title: "Getting Premium",
    steps: [
      {
        title: "Go to Premium page",
        desc: "Click 'Premium' in the navigation bar or go to My Account → Subscription.",
      },
      {
        title: "Choose a payment method",
        desc: "We offer two options: Telegram Stars (automatic activation) and Kaspi QR (manual activation). Click on your preferred method.",
      },
      {
        title: "Pay via Telegram Stars",
        desc: "Follow the 4-step guide in the modal: open @youchefBot, link your account with /login, tap 'Buy Premium — 100 Stars', and confirm payment. Premium activates automatically.",
      },
      {
        title: "Pay via Kaspi QR",
        desc: "Scan the QR code in the Kaspi app, confirm payment of 1500 KZT, then send a payment screenshot to youchef.app@gmail.com or via the Contact page. We'll activate Premium within a few hours.",
      },
    ],
  },
  {
    id: "account",
    title: "Managing Your Account",
    steps: [
      {
        title: "Open My Account",
        desc: "Click your name in the top right corner and select 'Account' from the dropdown menu.",
      },
      {
        title: "Update your profile",
        desc: "In Personal Information you can change your full name, email, gender, and upload a profile photo by clicking the avatar.",
      },
      {
        title: "Change your password",
        desc: "Go to Password Manager tab, enter your current password and set a new one. If you forgot your password, use the 'Forgot password' link on the login page.",
      },
      {
        title: "View your favorites",
        desc: "Go to Favourites tab or click the heart icon on any recipe to save it. All liked recipes appear in My Likes page.",
      },
      {
        title: "Link Telegram",
        desc: "Open @youchefBot in Telegram, send /login and enter your YouChef email and password. This is required to buy Premium via Telegram Stars.",
      },
    ],
  },
];

function Guides() {
  const navigate = useNavigate();
  const [activeGuide, setActiveGuide] = useState(null);
  const [openStep, setOpenStep] = useState(-1);

  const selected = GUIDES.find((g) => g.id === activeGuide);

  if (selected) {
    return (
      <section className="help-center-page">
        <div className="help-center-header">
          <button
            onClick={() => { setActiveGuide(null); setOpenStep(-1); }}
            style={{ background: "none", border: "none", cursor: "pointer", color: "#242D96", fontSize: "14px", marginBottom: "12px", display: "flex", alignItems: "center", gap: "6px" }}
          >
            ← Back to Guides
          </button>
          <h1>{selected.title}</h1>
          <p>Follow the steps below to get started.</p>
        </div>

        <div className="help-accordion">
          {selected.steps.map((step, index) => {
            const isOpen = openStep === index;
            return (
              <button
                key={step.title}
                type="button"
                className={`help-accordion-item ${isOpen ? "open" : ""}`}
                onClick={() => setOpenStep(isOpen ? -1 : index)}
              >
                <span className="question-mark">{index + 1}</span>
                <span className="help-accordion-content">
                  <span className="help-question">{step.title}</span>
                  {isOpen && (
                    <span className="help-answer">{step.desc}</span>
                  )}
                </span>
                <span className={`help-chevron ${isOpen ? "up" : "down"}`}>
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none">
                    <path d="M7 10L12 15L17 10" stroke="#242D96" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </span>
              </button>
            );
          })}
        </div>

        <div className="help-divider" />

        <div className="help-cta">
          <h2>Still need help?</h2>
          <p>Our support team is happy to assist you!</p>
          <button type="button" onClick={() => navigate("/contact")}>
            Contact us
          </button>
        </div>
      </section>
    );
  }

  return (
    <section className="help-center-page">
      <div className="help-center-header">
        <h1>Guides</h1>
        <p>Step-by-step guides to help you get the most out of YouChef.</p>
      </div>

      <div className="help-accordion">
        {GUIDES.map((guide, index) => {
          const isOpen = openStep === index;
          return (
            <button
              key={guide.id}
              type="button"
              className={`help-accordion-item ${isOpen ? "open" : ""}`}
              onClick={() => setActiveGuide(guide.id)}
            >
              <span className="question-mark">→</span>
              <span className="help-accordion-content">
                <span className="help-question">{guide.title}</span>
                <span className="help-answer" style={{ display: "block" }}>
                  {guide.steps.length} steps
                </span>
              </span>
              <span className="help-chevron down">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none">
                  <path d="M9 18l6-6-6-6" stroke="#242D96" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
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

export default Guides;