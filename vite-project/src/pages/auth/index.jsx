import CommonForm from "@/components/common-form";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { signUpFormControls, signInFormControls } from "@/config";
import { useContext, useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "@/context/auth-context";

function AuthPage() {
  const [activeTab, setActiveTab] = useState("signin");
  const [bootSequence, setBootSequence] = useState([]);
  const [isBooted, setIsBooted] = useState(false);
  const navigate = useNavigate();
  const authContext = useContext(AuthContext);
  const containerRef = useRef(null);

  // --- BOOT SEQUENCE LOGIC ---
  useEffect(() => {
    if (!authContext) return;

    const lines = [
      "> CONNECTING TO NEXSYNC...",
      "> CHECKING CREDENTIALS...",
      "> DECRYPTING GATEWAY_V9...",
      "> HANDSHAKE COMPLETE.",
    ];

    let delay = 0;
    lines.forEach((line, index) => {
      delay += Math.random() * 300 + 400;
      setTimeout(() => {
        setBootSequence((prev) => [...prev, line]);
        if (index === lines.length - 1) {
          setTimeout(() => setIsBooted(true), 800);
        }
      }, delay);
    });
  }, [authContext]);

  // --- MOUSE SPOTLIGHT EFFECT ---
  useEffect(() => {
    const handleMouseMove = (e) => {
      if (!containerRef.current) return;
      const { left, top } = containerRef.current.getBoundingClientRect();
      const x = e.clientX - left;
      const y = e.clientY - top;
      containerRef.current.style.setProperty("--mouse-x", `${x}px`);
      containerRef.current.style.setProperty("--mouse-y", `${y}px`);
    };

    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, []);

  // --- AUTH REDIRECT LOGIC ---
  const {
    signInFormData,
    setSignInFormData,
    signUpFormData,
    setSignUpFormData,
    handleRegisterUser,
    handleLoginUser,
    auth,
    notification,
    setNotification,
  } = authContext || {};

  useEffect(() => {
    console.log("🔍 AuthPage useEffect triggered");
    console.log("   authenticated:", auth?.authenticated);
    console.log("   user:", auth?.user);
    console.log("   role:", auth?.user?.role);

    if (auth?.authenticated) {
      console.log("✓ User is authenticated");
      if (auth?.user?.role === "admin") {
        console.log("🚀 REDIRECTING TO /admin");
        navigate("/admin");
      } else {
        console.log("🚀 REDIRECTING TO /");
        navigate("/");
      }
    }
  }, [auth, navigate]);

  if (!authContext || !isBooted) {
    return (
      <div className="min-h-screen bg-black text-[#ccff00] font-mono p-10 flex flex-col justify-end pb-24 z-50 relative">
        {/* Scanline overlay for boot screen */}
        <div className="absolute inset-0 pointer-events-none bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%),linear-gradient(90deg,rgba(255,0,0,0.06),rgba(0,255,0,0.02),rgba(0,0,255,0.06))] z-[60] bg-[size:100%_2px,3px_100%]"></div>

        {bootSequence.map((line, i) => (
          <div
            key={i}
            className="text-sm md:text-base opacity-80 mb-1 tracking-wider border-r-2 border-[#ccff00] w-fit animate-pulse pr-2"
          >
            {line}
          </div>
        ))}
      </div>
    );
  }

  function handleTabChange(value) {
    setActiveTab(value);
  }

  function checkIfSignInFormIsValid() {
    return (
      signInFormData &&
      signInFormData.userEmail !== "" &&
      signInFormData.password !== ""
    );
  }

  function checkIfSignUpFormIsValid() {
    return (
      signUpFormData &&
      signUpFormData.userName !== "" &&
      signUpFormData.userEmail !== "" &&
      signUpFormData.password !== ""
    );
  }

  return (
    <div
      ref={containerRef}
      className="relative flex min-h-screen w-full items-center justify-center bg-[#020202] text-white font-mono overflow-hidden selection:bg-[#ccff00] selection:text-black group/page"
    >
      {/* --- CSS INJECTION --- */}
      <style>{`
        @keyframes glitch {
          0% { text-shadow: 2px 0 red, -2px 0 blue; }
          25% { text-shadow: -2px 0 red, 2px 0 blue; }
          50% { text-shadow: 2px 0 red, -2px 0 blue; }
          75% { text-shadow: -2px 0 red, 2px 0 blue; }
          100% { text-shadow: 2px 0 red, -2px 0 blue; }
        }

        .glitch-hover:hover {
            animation: glitch 0.3s infinite;
        }

        /* Spotlight Gradient */
        .spotlight-bg {
            background: radial-gradient(
                800px circle at var(--mouse-x) var(--mouse-y),
                rgba(204, 255, 0, 0.06),
                transparent 40%
            );
        }

        /* Inputs - Cleaned up to be less boxy */
        .cyber-form input {
          background-color: transparent !important;
          border: none !important;
          border-bottom: 1px solid #333 !important;
          color: white !important;
          border-radius: 0 !important;
          padding: 1rem 0.5rem !important;
          font-family: monospace !important;
          transition: 0.3s !important;
        }
        .cyber-form input:focus {
          border-bottom: 1px solid #ccff00 !important;
          background-color: rgba(204,255,0,0.02) !important;
          box-shadow: none !important;
          outline: none !important;
        }
        
        /* Labels inside CommonForm */
        .cyber-form label {
            color: #666 !important;
            font-size: 0.7rem !important;
            letter-spacing: 0.1rem !important;
            text-transform: uppercase !important;
        }

        /* Submit Buttons */
        .cyber-form button[type="submit"] {
            background: transparent !important;
            border: 1px solid #ccff00 !important;
            color: #ccff00 !important;
            text-transform: uppercase !important;
            font-weight: 900 !important;
            letter-spacing: 0.1em !important;
            padding: 1rem !important;
            margin-top: 1.5rem !important;
            border-radius: 0 !important;
            position: relative !important;
            overflow: hidden !important;
            z-index: 1 !important;
            transition: all 0.3s !important;
        }
        
        .cyber-form button[type="submit"]::before {
            content: '';
            position: absolute;
            top: 0; left: -100%;
            width: 100%; height: 100%;
            background: #ccff00;
            z-index: -1;
            transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
        }

        .cyber-form button[type="submit"]:hover::before {
            left: 0;
        }

        .cyber-form button[type="submit"]:hover {
            color: black !important;
            box-shadow: 0 0 30px rgba(204, 255, 0, 0.4) !important;
            text-shadow: none !important;
        }
        
        .cyber-form button[type="submit"]:disabled {
            border-color: #333 !important;
            color: #555 !important;
            pointer-events: none !important;
        }

        /* Notification Styles */
        .auth-notification {
            position: relative;
            border-left: 3px solid;
            animation: slideDown 0.4s ease-out;
        }

        .auth-notification::before {
            content: '';
            position: absolute;
            left: 0;
            top: 0;
            width: 3px;
            height: 100%;
            animation: glow-pulse 1.5s ease-in-out infinite;
        }

        .auth-notification-error {
            background: rgba(255, 100, 100, 0.08);
            border-color: rgba(255, 100, 100, 0.3);
            color: #ff6464;
        }

        .auth-notification-error::before {
            background: #ff6464;
        }

        .auth-notification-success {
            background: rgba(100, 255, 100, 0.08);
            border-color: rgba(100, 255, 100, 0.3);
            color: #64ff64;
        }

        .auth-notification-success::before {
            background: #64ff64;
        }

        @keyframes slideDown {
            from { 
                opacity: 0; 
                transform: translateY(-10px); 
            }
            to { 
                opacity: 1; 
                transform: translateY(0); 
            }
        }

        @keyframes glow-pulse {
            0%, 100% { 
                box-shadow: 0 0 10px currentColor; 
            }
            50% { 
                box-shadow: 0 0 20px currentColor; 
            }
        }
      `}</style>

      {/* --- DYNAMIC BACKGROUND --- */}
      <div className="absolute inset-0 z-0 bg-[linear-gradient(rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:64px_64px]"></div>
      <div className="absolute inset-0 z-0 spotlight-bg pointer-events-none"></div>

      {/* --- THE MAIN HUD CARD --- */}
      <div className="relative z-10 w-full max-w-lg p-6 animate-in zoom-in duration-500">
        {/* Floating holographic decorations */}
        <div className="absolute -top-8 -left-8 w-16 h-16 border-l-2 border-t-2 border-[#ccff00]/40 rounded-tl-sm pointer-events-none transition-all duration-700 group-hover/page:translate-x-2 group-hover/page:translate-y-2"></div>
        <div className="absolute -bottom-8 -right-8 w-16 h-16 border-r-2 border-b-2 border-[#ccff00]/40 rounded-br-sm pointer-events-none transition-all duration-700 group-hover/page:-translate-x-2 group-hover/page:-translate-y-2"></div>

        <div className="bg-[#050505]/80 backdrop-blur-xl border border-white/10 p-1 shadow-2xl relative overflow-hidden">
          {/* Inner Border Line */}
          <div className="absolute inset-1 border border-white/5 pointer-events-none"></div>

          {/* Content Container */}
          <div className="p-8 md:p-12 relative">
            {/* Header with Glitch Effect */}
            <div className="mb-10 text-center relative group cursor-default">
              <h1 className="glitch-hover text-4xl md:text-5xl font-black uppercase tracking-tighter text-white mb-2 transition-all select-none">
                ACCOUNT <span className="text-[#ccff00]">ACCESS</span>
              </h1>
              <div className="h-0.5 w-16 bg-[#ccff00] mx-auto mb-3 shadow-[0_0_15px_#ccff00]"></div>
              <p className="text-gray-500 text-[10px] tracking-[0.5em]">
                /// sign in to continue
              </p>
            </div>

            {/* Tabs */}
            <Tabs
              value={activeTab}
              defaultValue="signin"
              onValueChange={handleTabChange}
              className="w-full"
            >
              {/* UPDATED: Removed bg-transparent and border-b border-white/10 to make it cleaner */}
              <TabsList className="grid w-full grid-cols-2 bg-transparent p-0 mb-8 rounded-none gap-4">
                <TabsTrigger
                  value="signin"
                  // REMOVED: data-[state=active]:bg-white/5 (This was causing the odd box)
                  // ADDED: shadow-[0_2px_0_#ccff00] for a clean underline effect
                  className="rounded-none bg-transparent text-gray-500 uppercase tracking-widest text-xs font-bold py-3 border-b border-[#333] hover:text-white data-[state=active]:border-transparent data-[state=active]:shadow-[0_2px_0_#ccff00] data-[state=active]:text-[#ccff00] data-[state=active]:bg-transparent transition-all"
                >
                  Log In
                </TabsTrigger>
                <TabsTrigger
                  value="signup"
                  // REMOVED: data-[state=active]:bg-white/5
                  // ADDED: shadow-[0_2px_0_#ccff00]
                  className="rounded-none bg-transparent text-gray-500 uppercase tracking-widest text-xs font-bold py-3 border-b border-[#333] hover:text-white data-[state=active]:border-transparent data-[state=active]:shadow-[0_2px_0_#ccff00] data-[state=active]:text-[#ccff00] data-[state=active]:bg-transparent transition-all"
                >
                  Sign Up
                </TabsTrigger>
              </TabsList>

              {/* Notification Banner */}
              {notification?.show && (
                <div
                  className={`auth-notification ${notification.type === "error" ? "auth-notification-error" : "auth-notification-success"}`}
                  style={{
                    marginBottom: "20px",
                    padding: "15px 20px",
                    fontFamily: "monospace",
                    fontSize: "0.85rem",
                    borderRadius: "0",
                    position: "relative",
                    overflow: "hidden",
                    cursor: "pointer",
                  }}
                  onClick={() =>
                    setNotification({ message: "", type: "", show: false })
                  }
                >
                  <span style={{ marginRight: "10px" }}>
                    {notification.type === "error" ? "✕" : "✓"}
                  </span>
                  {notification.message}
                </div>
              )}

              {/* Forms with Cyber Styles */}
              <div className="cyber-form relative">
                <TabsContent
                  value="signin"
                  className="mt-0 pl-2 animate-in slide-in-from-right-2 fade-in duration-300"
                >
                  <CommonForm
                    formControls={signInFormControls}
                    formData={signInFormData}
                    setFormData={setSignInFormData}
                    handleSubmit={handleLoginUser}
                    buttonText="Initiate Link"
                    isButtonDisabled={!checkIfSignInFormIsValid()}
                  />
                </TabsContent>
                <TabsContent
                  value="signup"
                  className="mt-0 pl-2 animate-in slide-in-from-left-2 fade-in duration-300"
                >
                  <CommonForm
                    formControls={signUpFormControls}
                    formData={signUpFormData}
                    setFormData={setSignUpFormData}
                    handleSubmit={handleRegisterUser}
                    buttonText="Create Identity"
                    isButtonDisabled={!checkIfSignUpFormIsValid()}
                  />
                </TabsContent>
              </div>
            </Tabs>

            {/* Footer Status Bar */}
            <div className="mt-12 flex justify-between items-center text-[9px] uppercase tracking-widest text-gray-600 border-t border-white/5 pt-4 select-none">
              <div className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 bg-[#ccff00] rounded-full animate-[pulse_2s_infinite] shadow-[0_0_5px_#ccff00]"></span>
                Server: Online
              </div>
              <div />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default AuthPage;
