import React from "react";
import { AlertTriangle, RotateCcw, Home, HelpCircle } from "lucide-react";






class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {

    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {

    console.error("── React Render Crash Captured by ErrorBoundary ──");
    console.error("Error Object:", error);
    console.error("Error Info:", errorInfo);
    this.setState({ errorInfo });
  }

  handleReload = () => {
    window.location.reload();
  };

  handleGoHome = () => {
    window.location.href = "/";
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex items-center justify-center w-full min-h-screen bg-black text-[#e1dcc9] relative p-6 overflow-hidden select-none font-sans">

          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-[#412d15]/20 rounded-full blur-[140px] pointer-events-none" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-[#e1dcc9]/2 rounded-full blur-[90px] pointer-events-none" />


          <div className="absolute inset-4 border border-[#e1dcc9]/5 rounded-[2rem] pointer-events-none hidden sm:block" />

          <div className="max-w-xl w-full flex flex-col items-center text-center gap-8 relative z-10">

            <div className="relative flex items-center justify-center w-36 h-36">
              <div className="absolute inset-0 border border-dashed border-[#e1dcc9]/15 rounded-full animate-[spin_40s_linear_infinite]" />
              <div className="absolute w-28 h-28 border border-dashed border-[#412d15]/50 rounded-full animate-[spin_20s_linear_infinite_reverse]" />
              <div className="absolute w-20 h-20 bg-[#1f150c] border border-[#e1dcc9]/10 rounded-full flex items-center justify-center shadow-lg" />
              <AlertTriangle className="w-8 h-8 text-[#e1dcc9] relative z-10 animate-bounce" />
            </div>


            <div className="space-y-3">
              <h1 className="text-[10px] sm:text-xs uppercase tracking-[0.4em] font-extrabold text-[#e1dcc9]/60">
                SYSTEM CORE GUARD
              </h1>
              <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-[#e1dcc9]">
                A Gentle Interrupt in the Boutique Flow
              </h2>
              <div className="h-[1px] w-32 bg-gradient-to-r from-transparent via-[#e1dcc9]/40 to-transparent mx-auto mt-4" />
            </div>


            <div className="w-full bg-[#1f150c]/40 border border-[#412d15]/50 rounded-2xl p-4 sm:p-5 backdrop-blur-md text-left space-y-3 max-h-[180px] overflow-y-auto">
              <div className="flex items-center gap-2 text-xs font-bold text-[#e1dcc9]/80 border-b border-[#412d15]/40 pb-2">
                <HelpCircle className="w-3.5 h-3.5" />
                <span>Captured Exception Diagnostics</span>
              </div>
              <p className="text-[11px] font-mono leading-relaxed text-[#e1dcc9]/60 break-words">
                {this.state.error ? this.state.error.toString() : "Unknown execution failure occurred during interface rendering."}
              </p>
            </div>


            <div className="flex flex-col sm:flex-row items-center gap-3 w-full justify-center">
              <button
                onClick={this.handleReload}
                className="w-full sm:w-auto px-6 py-3 rounded-xl bg-[#e1dcc9] text-black hover:bg-[#c9c4b2] active:scale-[0.98] transition-all font-bold text-xs flex items-center justify-center gap-2 shadow-glow-sm cursor-pointer border-0"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                Reload Interface
              </button>
              <button
                onClick={this.handleGoHome}
                className="w-full sm:w-auto px-6 py-3 rounded-xl border border-[#412d15] text-[#e1dcc9] hover:bg-[#412d15]/30 active:scale-[0.98] transition-all font-semibold text-xs flex items-center justify-center gap-2 cursor-pointer bg-transparent"
              >
                <Home className="w-3.5 h-3.5" />
                Return to Showcase
              </button>
            </div>

            <p className="text-[9px] text-[#e1dcc9]/30 tracking-widest uppercase">
              Secure Sandbox Isolation Mode
            </p>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
