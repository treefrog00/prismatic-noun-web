export const pageStyles = {
  container: "min-h-screen flex flex-col items-center justify-center p-4 ",
  content: "max-w-2xl w-full text-center space-y-8",
  contentLeft: "max-w-2xl w-full space-y-8",
  heading: "text-4xl font-bold text-gray-900 text-center",
  heading2: "text-2xl font-semibold text-gray-900 mb-4",
  paragraph: "text-xl text-gray-600",
  link: "text-amber-800 hover:text-amber-900",
  policyContainer: "min-h-screen flex flex-col items-center justify-center p-4",
  policyContent: "max-w-2xl w-full space-y-8 z-10",
  policyTitle: "text-4xl font-bold text-gray-900",
  policySubtitle: "text-2xl font-semibold text-gray-800 mb-4",
  policyText: "text-lg  ",
  policySection: "bg-white p-6 rounded-lg",
  policyList: "list-disc ml-6 space-y-2",
  table: "min-w-full bg-white border border-gray-200 rounded-lg",
  tableHeader: "bg-gray-50",
  tableHeaderCell:
    "px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider",
  tableRow: "divide-y divide-gray-200",
  tableCell: "px-6 py-4 whitespace-nowrap",
  overlayImage: "w-48 h-48 bg-gray-700 rounded-lg border border-gray-600 m-4",
};

export const themeColors = {
  desert: {
    container: "bg-[#F5F5DC]",
    text: "text-gray-800",
    highlight: "text-red-800",
    gradient: ["#2d1b0e", "#d4b483", "#1a1208"],
  },
  darkSlateGray: {
    container: "bg-gray-800",
    text: "text-gray-200",
    highlight: "text-amber-400",
    gradient: ["#0f1729", "#1f2937", "#111827"],
  },
  midnightBlue: {
    container: "bg-blue-900",
    text: "text-blue-100",
    highlight: "text-blue-300",
    gradient: ["#0f1729", "#1f2937", "#111827"],
  },
  darkOliveGreen: {
    container: "bg-green-900",
    text: "text-green-100",
    highlight: "text-green-300",
    gradient: ["#0f1729", "#1f2937", "#111827"],
  },
  maroon: {
    container: "bg-red-900",
    text: "text-red-100",
    highlight: "text-red-300",
    gradient: ["#0f1729", "#1f2937", "#111827"],
  },
  indigo: {
    container: "bg-indigo-900",
    text: "text-indigo-100",
    highlight: "text-indigo-300",
    gradient: ["#0f1729", "#1f2937", "#111827"],
  },
  darkBlue: {
    container: "bg-gray-800",
    text: "text-gray-300",
    highlight: "text-yellow-400",
    gradient: ["#0f1729", "#1f2937", "#111827"],
  },
} as const;

export type ThemeColorKey = keyof typeof themeColors;

export const getStyles = (themeKey: ThemeColorKey) => {
  const theme = themeColors[themeKey];

  return {
    container: `relative p-5 rounded-lg shadow-xl shadow-black/30 border border-gray-500 backdrop-blur-sm ${theme.container}`,
    text: `${theme.text} text-xl leading-relaxed`,
    highlight: `${theme.highlight}`,
  };
};
