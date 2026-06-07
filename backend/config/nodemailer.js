const sendEmail = async ({ to, subject, html, text }) => {
  const response = await fetch("https://api.brevo.com/v3/smtp/email", {
    method: "POST",
    headers: {
      "api-key": process.env.BREVO_API_KEY,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      sender: { name: "YouChef", email: process.env.SENDER_EMAIL },
      to: [{ email: to }],
      subject,
      ...(html ? { htmlContent: html } : { textContent: text }),
    }),
  });

  if (!response.ok) {
    const err = await response.json();
    throw new Error(err.message || "Brevo API error");
  }
};

export default sendEmail;
