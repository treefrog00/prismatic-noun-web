import { useGameApi } from "@/contexts/GameContext";
import { useToast } from "@/contexts/ToastContext";
import { envConfig } from "@/envConfig";
import { responsiveStyles } from "@/styles/responsiveStyles";
import { starryTheme } from "@/styles/starryTheme";
import { useState } from "react";

const LobbyFeedback = () => {
  const [feedback, setFeedback] = useState("");
  const [email, setEmail] = useState("");
  const [subscribe, setSubscribe] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { showToast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    const response = await fetch(`${envConfig.backendUrl}/submit_feedback`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ feedback, email, subscribe }),
    });
    if (response.ok) {
      setIsSubmitting(false);
      setFeedback("");
      setEmail("");
      setSubscribe(false);
      showToast("Thanks for getting in touch!", "success");
    } else {
      setIsSubmitting(false);
      showToast(`Failed to submit feedback: ${response.statusText}`, "error");
    }
  };

  return (
    <>
      <div className="flex items-start justify-between mb-8">
        <div className="flex-1 flex flex-col justify-start mt-5">
          <h2
            style={{
              ...starryTheme.lobbyHeading,
              fontSize: responsiveStyles.text.heading,
            }}
          >
            Contact
          </h2>

          <form
            onSubmit={handleSubmit}
            className="mt-6 space-y-6 min-w-[600px]"
          >
            <div>
              <label
                htmlFor="feedback"
                className="block text-sm font-medium text-gray-300 mb-2"
              >
                Feedback *
              </label>
              <textarea
                id="feedback"
                value={feedback}
                onChange={(e) => setFeedback(e.target.value)}
                required
                rows={6}
                className="w-full px-4 py-3 bg-gray-800 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                placeholder="Share your thoughts, suggestions, or report any issues..."
              />
            </div>

            <div>
              <label
                htmlFor="email"
                className="block text-sm font-medium text-gray-300 mb-2"
              >
                Email (optional)
              </label>
              <input
                type="email"
                id="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-3 bg-gray-800 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="your.email@example.com"
              />
            </div>

            <div className="flex items-center">
              <input
                type="checkbox"
                id="subscribe"
                checked={subscribe}
                onChange={(e) => setSubscribe(e.target.checked)}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-600 rounded bg-gray-800"
              />
              <label
                htmlFor="subscribe"
                className="ml-2 block text-sm text-gray-300"
              >
                Receive email updates (though there probably won't be any)
              </label>
            </div>

            <button
              type="submit"
              disabled={
                isSubmitting || !feedback.trim() || feedback.trim().length < 5
              }
              className="px-6 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-gray-900 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {isSubmitting ? "Submitting..." : "Submit Feedback"}
            </button>
          </form>
        </div>
      </div>
    </>
  );
};

export default LobbyFeedback;
