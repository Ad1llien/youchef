import { Helmet } from "react-helmet-async";

const DEFAULT = {
  title: "YouChef — Recipes, Meal Plans & AI Nutrition",
  description: "Discover thousands of recipes, generate personalized meal plans with AI, analyze food photos for calories. Your smart cooking assistant.",
  image: "https://youchef.kz/icons/logo-192.png",
  url: "https://youchef.kz",
};

function SEO({ title, description, image, url, type = "website" }) {
  const fullTitle = title ? `${title} — YouChef` : DEFAULT.title;
  const desc = description || DEFAULT.description;
  const img  = image || DEFAULT.image;
  const canonical = url || DEFAULT.url;

  return (
    <Helmet>
      {/* ── Basic ── */}
      <title>{fullTitle}</title>
      <meta name="description" content={desc} />
      <link rel="canonical" href={canonical} />

      {/* ── Open Graph (Facebook, Telegram, WhatsApp) ── */}
      <meta property="og:type"        content={type} />
      <meta property="og:title"       content={fullTitle} />
      <meta property="og:description" content={desc} />
      <meta property="og:image"       content={img} />
      <meta property="og:url"         content={canonical} />
      <meta property="og:site_name"   content="YouChef" />
      <meta property="og:locale"      content="ru_KZ" />

      {/* ── Twitter Card ── */}
      <meta name="twitter:card"        content="summary_large_image" />
      <meta name="twitter:title"       content={fullTitle} />
      <meta name="twitter:description" content={desc} />
      <meta name="twitter:image"       content={img} />

      {/* ── Extra ── */}
      <meta name="robots"    content="index, follow" />
      <meta name="author"    content="YouChef" />
      <meta name="keywords"  content="рецепты, блюда, meal plan, калории, питание, кулинария, казахстан, recipes, cooking, nutrition, AI meal planner" />
    </Helmet>
  );
}

export default SEO;