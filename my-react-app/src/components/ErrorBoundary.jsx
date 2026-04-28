import { Component } from "react";
import error from "../icons/lep_belgisi.svg"
class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-[#FFFEEB] px-4 text-center">
          <div className="text-6xl mb-6"><img src={error} alt="" srcset="" /></div>
          <h1 className="text-2xl font-semibold text-[#242D96] mb-3">Something went wrong</h1>
          <p className="text-gray-500 mb-8 max-w-sm">
            An unexpected error occurred. Please refresh the page.
          </p>
          <button
            onClick={() => window.location.reload()}
            className="px-8 py-3 bg-[#242D96] text-white rounded-full border-none cursor-pointer text-[16px]"
          >
            Refresh page
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}

export default ErrorBoundary;