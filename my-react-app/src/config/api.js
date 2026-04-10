const ENV_API_URL = import.meta.env.VITE_API_URL?.replace(/\/$/, "");
const API_ORIGIN = ENV_API_URL || "http://localhost:4000";

// In local Vite dev we use proxy (/api -> API_ORIGIN) to avoid CORS issues.
const API_BASE_URL = import.meta.env.DEV ? "" : API_ORIGIN;

export { API_ORIGIN };
export default API_BASE_URL;
