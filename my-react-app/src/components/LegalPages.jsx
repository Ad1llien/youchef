import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";

const TABS = [
  { id: "terms", label: "Terms of Service", short: "Terms" },
  { id: "privacy", label: "Privacy Policy", short: "Privacy" },
  { id: "refund", label: "Refund Policy", short: "Refund" },
];

const CONTENT = {
  terms: {
    title: "Terms of Service",
    updated: "April 16, 2026",
    sections: [
      {
        num: "01",
        title: "Acceptance of Terms",
        body: "By accessing and using YouChef, you agree to be bound by these Terms of Service. If you do not agree, please do not use the Service.",
      },
      {
        num: "02",
        title: "Description of Service",
        body: "YouChef is a digital platform that provides access to recipes and culinary content from around the world. We offer both free and Premium subscription tiers.",
      },
      {
        num: "03",
        title: "User Accounts",
        list: [
          "You must provide accurate information when creating an account.",
          "You are responsible for maintaining the security of your account credentials.",
          "You must be at least 13 years old to use the Service.",
          "One person may not maintain more than one account.",
        ],
      },
      {
        num: "04",
        title: "Premium Subscription",
        list: [
          "Premium subscriptions grant access to exclusive recipes and content.",
          "Subscriptions are billed on a one-time or recurring basis depending on the plan selected.",
          "Payment is processed through third-party providers (Paddle, Telegram Stars, Kaspi).",
          "Subscription benefits are non-transferable.",
        ],
      },
      {
        num: "05",
        title: "User Content",
        list: [
          "You retain ownership of any content you submit (recipes, comments, etc.).",
          "By submitting content, you grant YouChef a non-exclusive license to display it on the platform.",
          "You agree not to submit content that is illegal, offensive, or infringes on third-party rights.",
          "YouChef reserves the right to remove content that violates these terms.",
        ],
      },
      {
        num: "06",
        title: "Prohibited Activities",
        body: "You agree not to use the Service for any unlawful purpose, attempt to gain unauthorized access to any part of the Service, scrape or redistribute content without permission, or impersonate other users or YouChef staff.",
      },
      {
        num: "07",
        title: "Intellectual Property",
        body: "All content on YouChef, including text, graphics, logos, and software, is the property of YouChef or its content suppliers and is protected by applicable intellectual property laws.",
      },
      {
        num: "08",
        title: "Disclaimers",
        body: 'The Service is provided "as is" without warranties of any kind. YouChef does not guarantee the accuracy of recipes or nutritional information provided on the platform.',
      },
      {
        num: "09",
        title: "Limitation of Liability",
        body: "YouChef shall not be liable for any indirect, incidental, or consequential damages arising from your use of the Service.",
      },
      {
        num: "10",
        title: "Changes to Terms",
        body: "We reserve the right to modify these Terms at any time. Continued use of the Service after changes constitutes acceptance of the new Terms.",
      },
      {
        num: "11",
        title: "Contact",
        body: "For questions about these Terms, contact us at: youchef.app@gmail.com",
      },
    ],
  },
  privacy: {
    title: "Privacy Policy",
    updated: "April 16, 2026",
    sections: [
      {
        num: "01",
        title: "Introduction",
        body: "YouChef is committed to protecting your personal information. This Privacy Policy explains how we collect, use, and safeguard your data when you use our Service.",
      },
      {
        num: "02",
        title: "Information We Collect",
        body: "We collect information you provide directly (name, email, payment info, submitted recipes, contact messages) and information collected automatically (usage data, device info, IP address, cookies).",
      },
      {
        num: "03",
        title: "How We Use Your Information",
        list: [
          "Provide and maintain the Service",
          "Process payments and manage subscriptions",
          "Send transactional emails (receipts, account updates)",
          "Respond to your support requests",
          "Improve and personalize your experience",
          "Prevent fraud and ensure security",
        ],
      },
      {
        num: "04",
        title: "Sharing Your Information",
        body: "We do not sell your personal data. We may share your information with payment processors (Paddle, Telegram) to process transactions, service providers who assist in operating our platform, and law enforcement when required by law.",
      },
      {
        num: "05",
        title: "Cookies",
        body: "We use cookies to keep you logged in, remember your preferences, and analyze platform usage. You can disable cookies in your browser settings, though this may affect functionality.",
      },
      {
        num: "06",
        title: "Data Security",
        body: "We implement industry-standard security measures to protect your data. However, no method of transmission over the internet is 100% secure.",
      },
      {
        num: "07",
        title: "Data Retention",
        body: "We retain your personal data for as long as your account is active or as needed to provide the Service. You may request deletion of your data at any time.",
      },
      {
        num: "08",
        title: "Your Rights",
        list: [
          "Access your personal data",
          "Correct inaccurate data",
          "Request deletion of your data",
          "Opt out of marketing communications",
        ],
      },
      {
        num: "09",
        title: "Third-Party Links",
        body: "Our Service may contain links to third-party websites. We are not responsible for their privacy practices.",
      },
      {
        num: "10",
        title: "Children's Privacy",
        body: "Our Service is not directed to children under 13. We do not knowingly collect personal information from children under 13.",
      },
      {
        num: "11",
        title: "Changes to This Policy",
        body: "We may update this Privacy Policy from time to time. We will notify you of significant changes via email or a notice on our platform.",
      },
      {
        num: "12",
        title: "Contact",
        body: "For privacy-related questions, contact us at: youchef.app@gmail.com",
      },
    ],
  },
  refund: {
    title: "Refund Policy",
    updated: "April 16, 2026",
    sections: [
      {
        num: "01",
        title: "Overview",
        body: "At YouChef, we want you to be satisfied with your purchase. This Refund Policy outlines the conditions under which refunds are granted.",
      },
      {
        num: "02",
        title: "Digital Products and Subscriptions",
        body: "Premium subscriptions are eligible for a full refund within 7 days of purchase, provided the subscription features have not been extensively used. After 7 days, refunds are issued at our discretion on a case-by-case basis.",
      },
      {
        num: "03",
        title: "How to Request a Refund",
        body: "To request a refund, contact us at youchef.app@gmail.com with your account email, date of purchase, reason for the refund request, and transaction ID or receipt. We will respond within 3 business days.",
      },
      {
        num: "04",
        title: "Refund Processing",
        list: [
          "Refunds are processed through the original payment method.",
          "Paddle payments: refunds are processed within 5–10 business days.",
          "Telegram Stars: refunds follow Telegram's refund policy.",
          "Kaspi QR: refunds are processed manually within 3–5 business days.",
        ],
      },
      {
        num: "05",
        title: "Non-Refundable Cases",
        list: [
          "The 7-day refund period has passed and the content has been accessed.",
          "The account has violated our Terms of Service.",
          "The request is for a partial subscription period.",
        ],
      },
      {
        num: "06",
        title: "Exceptional Circumstances",
        body: "We understand that exceptional circumstances may occur. If you experience technical issues that prevent access to Premium content, please contact us and we will work to resolve the issue or provide an appropriate remedy.",
      },
      {
        num: "07",
        title: "Changes to This Policy",
        body: "We reserve the right to modify this Refund Policy at any time. Changes will be effective immediately upon posting.",
      },
      {
        num: "08",
        title: "Contact",
        body: "For refund requests or questions, contact us at: youchef.app@gmail.com",
      },
    ],
  },
};

function LegalPages() {
  const location = useLocation();
  const navigate = useNavigate();
  const [copied, setCopied] = useState(false);

  const handleCopyEmail = () => {
    navigator.clipboard.writeText("youchef.app@gmail.com");
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };
  const pathToTab = {
    "/terms": "terms",
    "/privacy": "privacy",
    "/refund": "refund",
  };

  const [activeTab, setActiveTab] = useState(
    pathToTab[location.pathname] || "terms"
  );

  const current = CONTENT[activeTab];

  const handleTabChange = (id) => {
    setActiveTab(id);
    navigate(`/${id}`);
  };

  return (
    <div className="mx-auto mt-[80px] w-full max-w-4xl px-4 pb-20 md:px-6">
      {/* Page title */}
      <div className="mb-10 text-center">
        <h1 className="font-['Taviraj'] text-[32px] font-normal text-[#242D96] md:text-[40px]">
          Legal
        </h1>
        <p className="mt-2 text-[15px] text-gray-400">
          Last updated: {current.updated}
        </p>
      </div>

      {/* Tabs */}
      <div className="mb-10 flex gap-2 overflow-x-auto rounded-2xl border border-[#BBC8D8] bg-white p-1.5">
        {TABS.map((tab) => (
          <button
            key={tab.id}
            onClick={() => handleTabChange(tab.id)}
            className={`flex-1 whitespace-nowrap rounded-xl py-2.5 px-4 text-[14px] font-medium transition border-none cursor-pointer ${
              activeTab === tab.id
                ? "bg-[#242D96] text-white"
                : "bg-transparent text-gray-500 hover:text-[#242D96]"
            }`}
          >
            <span className="hidden sm:inline">{tab.label}</span>
            <span className="sm:hidden">{tab.short}</span>
          </button>
        ))}
      </div>

      {/* Content */}
      <div className="flex flex-col gap-6">
        {current.sections.map((section) => (
          <div
            key={section.num}
            className="rounded-2xl border border-[#BBC8D8] bg-white p-6 md:p-8"
          >
            <div className="mb-4 flex items-start gap-4">
              <span className="flex-shrink-0 rounded-xl bg-[#EEF0FB] px-3 py-1 font-mono text-[13px] font-medium text-[#242D96]">
                {section.num}
              </span>
              <h2 className="font-['Taviraj'] text-[18px] font-normal text-[#242D96] md:text-[20px]">
                {section.title}
              </h2>
            </div>

            {section.body && (
              <p className="ml-[52px] text-[15px] leading-relaxed text-gray-600">
                {section.body}
              </p>
            )}

            {section.list && (
              <ul className="ml-[52px] flex flex-col gap-2">
                {section.list.map((item, i) => (
                  <li key={i} className="flex items-start gap-2.5">
                    <span className="mt-2 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-[#242D96]" />
                    <span className="text-[15px] leading-relaxed text-gray-600">
                      {item}
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </div>
        ))}
      </div>

      {/* Contact footer */}
      <div className="mt-10 rounded-2xl bg-[#242D96] p-6 text-center text-white md:p-8">
        <p className="mb-1 font-['Taviraj'] text-[20px]">Have questions?</p>
        <p className="mb-4 text-[14px] text-white/70">
          We're happy to help with any legal inquiries.
        </p>
        <button
          onClick={handleCopyEmail}
          className="inline-block rounded-full border border-white/30 bg-white/10 px-6 py-2.5 text-[14px] font-medium text-white cursor-pointer transition hover:bg-white/20"
          style={{ border: "1px solid rgba(255,255,255,0.3)" }}
        >
          {copied ? "Copied!" : "youchef.app@gmail.com"}
        </button>
      </div>
    </div>
  );
}

export default LegalPages;
