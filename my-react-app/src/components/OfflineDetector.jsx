import { useState, useEffect } from "react";
import error from "../icons/lep_belgisi.svg"

function OfflineDetector({ children }) {
  const [isOnline, setIsOnline] = useState(navigator.onLine);

  useEffect(() => {
    window.addEventListener("online", () => setIsOnline(true));
    window.addEventListener("offline", () => setIsOnline(false));
    return () => {
      window.removeEventListener("online", () => setIsOnline(true));
      window.removeEventListener("offline", () => setIsOnline(false));
    };
  }, []);

  if (!isOnline) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-[#FFFEEB] px-4 text-center">
        <div className="text-6xl mb-6"><img src={error} alt="" srcset="" /></div>
        <h1 className="text-2xl font-semibold text-[#242D96] mb-3">No internet connection</h1>
        <p className="text-gray-500 mb-8 max-w-sm">
          Check your connection and try again.
        </p>
        <button
          onClick={() => window.location.reload()}
          className="px-8 py-3 bg-[#242D96] text-white rounded-full border-none cursor-pointer text-[16px]"
        >
          Try again
        </button>
      </div>
    );
  }

  return children;
}

export default OfflineDetector;