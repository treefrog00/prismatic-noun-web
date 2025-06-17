const GoogleSignInButton = ({
  theme = "dark",
  onClick,
  disabled = false,
  loadingText,
}: {
  theme?: "light" | "dark";
  onClick?: () => void;
  disabled?: boolean;
  loadingText?: string;
}) => {
  const baseClasses =
    "flex items-center justify-center px-4 py-2 border rounded-md text-sm font-medium focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500";

  const lightThemeClasses =
    "bg-white border-gray-300 text-gray-700 hover:bg-gray-50";
  const darkThemeClasses =
    "bg-gray-800 border-gray-600 text-white hover:bg-gray-700";

  const themeClasses = theme === "dark" ? darkThemeClasses : lightThemeClasses;
  const disabledClasses = disabled ? "opacity-50 cursor-not-allowed" : "";

  return (
    <button
      className={`${baseClasses} ${themeClasses} ${disabledClasses}`}
      onClick={onClick}
      disabled={disabled}
    >
      <svg
        className="w-5 h-5 mr-2"
        viewBox="0 0 48 48"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          fill="#4285F4"
          d="M45.12 24.5c0-1.56-.14-3.06-.4-4.5H24v8.51h11.84c-.51 2.75-2.06 5.12-4.38 6.74v5.52h7.11c4.16-3.83 6.56-9.47 6.56-16.27z"
        />
        <path
          fill="#34A853"
          d="M24 48c6.48 0 11.93-2.13 15.89-5.82l-7.11-5.52c-2.15 1.45-4.92 2.3-8.78 2.3-6.76 0-12.47-4.55-14.53-10.61H2.25v5.68C6.21 42.66 14.48 48 24 48z"
        />
        <path
          fill="#FBBC05"
          d="M9.47 28.38c-.49-1.47-.76-3.03-.76-4.6s.27-3.13.76-4.6V13.5H2.25C.86 16.28 0 19.98 0 24s.86 7.72 2.25 10.5l7.22-5.62z"
        />
        <path
          fill="#EA4335"
          d="M24 9.4c3.54 0 6.6.96 8.78 3.03l6.04-6.01C35.91 2.19 30.47 0 24 0 14.48 0 6.21 5.34 2.25 13.5l7.22 5.68C11.53 13.95 17.24 9.4 24 9.4z"
        />
      </svg>
      {loadingText || "Continue with Google"}
    </button>
  );
};

export default GoogleSignInButton;
