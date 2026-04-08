import "../styles/premium.css";

const plans = [
  {
    name: "Trial",
    price: "$0.90",
    period: "/ for 7 days",
    description: "Ideal for testing & creating your first meals.",
    ctaStyle: "outline",
    features: [
      "Access to limited recipes",
      "Basic ingredient search",
      "Limited meal suggestions",
      "Nutrition tracking dashboard (calories, protein, carbs, fats) AI calorie calculator [3 times]",
      "Access premium chef recipes",
    ],
    disabledFrom: 4,
  },
  {
    name: "Starter",
    price: "$6.90",
    period: "/year",
    description: "Ideal for large businesses.",
    ctaStyle: "filled",
    popular: true,
    features: [
      "Unlimited access to all recipes",
      "No ads",
      "Unlimited AI calorie calculator",
      "Nutrition tracking dashboard (calories, protein, carbs, fats)",
      "Access premium chef recipes",
    ],
    disabledFrom: 4,
  },
  {
    name: "Business & Chef",
    price: "$29.90",
    period: "/year",
    description: "Ideal for chefs & culinary businesses.",
    ctaStyle: "outline",
    features: [
      "All Starter plan features +",
      "5 users - up to 5 people can use the account",
      "Upload and publish own recipes",
      "Personal Chef profile page",
      "Access premium chef recipes",
    ],
    disabledFrom: -1,
  },
];

function Premium() {
  return (
    <section className="premium-page">
      <h1 className="premium-title">Premium</h1>
      <div className="premium-top-line" />

      <div className="premium-toggle" role="tablist" aria-label="Plan period">
        <button type="button" className="toggle-item active">
          Monthly
        </button>
        <button type="button" className="toggle-item">
          Annual <span className="save-badge">Save 15%</span>
        </button>
      </div>

      <div className="premium-cards">
        {plans.map((plan) => (
          <article key={plan.name} className={`premium-card ${plan.popular ? "popular-card" : ""}`}>
            <div className="card-top">
              <div className="plan-icon" />
              <div className="plan-title-row">
                <h2>{plan.name}</h2>
                {plan.popular ? <span className="popular-badge">Popular</span> : null}
              </div>
              <div className="plan-price-row">
                <span className="plan-price">{plan.price}</span>
                <span className="plan-period">{plan.period}</span>
              </div>
              <p className="plan-description">{plan.description}</p>
              <div className="plan-divider" />
              <button type="button" className={`plan-btn ${plan.ctaStyle}`}>
                Get Started <span>→</span>
              </button>
            </div>

            <div className="card-features">
              <p className="features-title">What&apos;s included</p>
              {plan.features.map((feature, index) => (
                <div
                  key={feature}
                  className={`feature-item ${index >= plan.disabledFrom && plan.disabledFrom !== -1 ? "disabled" : ""}`}
                >
                  <span className="feature-check">✓</span>
                  <span>{feature}</span>
                </div>
              ))}
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}

export default Premium;
