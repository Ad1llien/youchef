import { useNavigate } from "react-router-dom";
import error from "../icons/lep_belgisi.svg"

function NotFound() {
  const navigate = useNavigate();
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-[#FFFEEB] px-4 text-center">
      <div className="text-8xl font-['Taviraj'] text-[#242D96] mb-4">404</div>
      <div><img src={error} alt="" /></div>
      <h1 className="text-2xl font-semibold text-[#242D96] mb-3">Page not found</h1>
      <p className="text-gray-500 mb-8 max-w-sm">
        The page you're looking for doesn't exist or has been moved.
      </p>
      <button
        onClick={() => navigate("/")}
        className="px-8 py-3 bg-[#242D96] text-white rounded-full border-none cursor-pointer text-[16px]"
      >
        Go home
      </button>
    </div>
  );
}

export default NotFound;