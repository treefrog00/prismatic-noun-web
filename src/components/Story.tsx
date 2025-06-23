import { useRef, useImperativeHandle, forwardRef } from "react";
import { getStyles } from "../styles/shared";
import { useGameConfig } from "@/contexts/AppContext";
import { QuestSummary } from "@/types";

// Constants
const FADE_IN_DURATION = 1000; // Duration in milliseconds

export interface StoryRef {
  updateText: (text: string, animateAll?: boolean) => void;
  appendNoAnimation: (text: string) => void;
  appendFadeIn: (text: string, italic?: boolean) => void;
  clearStory: () => void;
  scrollToBottom: () => void;
}

interface StoryProps {
  questSummary: QuestSummary;
}

const addPerWordHighlights = (text: string) => {
  // Split by spaces but keep the spaces, and also handle punctuation
  // This regex splits by spaces and punctuation, keeping both in the result
  const words = text.split(/(\s+|[.,!?;:])/);
  let isYellow = false;
  const processedWords: string[] = [];

  for (const word of words) {
    // Skip empty words that might result from the split
    if (!word) continue;

    let processedWord = word;

    // Check for opening tag
    if (word.includes("<hl>")) {
      isYellow = true;

      // Check for closing tag in the same word
      if (word.includes("</hl>")) {
        // This word has both opening and closing tags
        isYellow = false;
        processedWord = word;
      } else {
        // Word has opening tag but no closing tag
        processedWord = word + "</hl>";
      }
    }
    // Check for closing tag
    else if (word.includes("</hl>")) {
      // This word ends the highlight section
      processedWord = "<hl>" + word;
      isYellow = false;
    }
    // Not a tag but we're in highlight mode
    else if (isYellow) {
      // Continue the highlight section
      processedWord = "<hl>" + word + "</hl>";
    }

    processedWords.push(processedWord);
  }

  return processedWords;
};

// Helper function to process text formatting
export const processTextFormatting = (
  text: string,
  sharedStyles: any,
  italic: boolean = false,
) => {
  let finalText = text
    .replace(/<hl>/g, `<span class="${sharedStyles.highlight}">`)
    .replace(/<\/hl>/g, "</span>")
    .replace(/<i>/g, `<span style="font-style: italic;">`)
    .replace(/<\/i>/g, "</span>")
    .replace(/^<tab>/gm, "&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;"); // Replace <tab> at line start with 4 spaces

  // If italic is true, wrap the entire text in highlight styling and make it italic
  if (italic) {
    finalText = `<span class="${sharedStyles.highlight}" style="font-style: italic;">${finalText}</span>`;
  }

  return finalText.replace(/\n/g, "<br>");
};

const Story = forwardRef<StoryRef, StoryProps>(({ questSummary }, ref) => {
  const textDisplayRef = useRef<HTMLDivElement>(null);
  let paragraphCount = 0;
  const lineHeight = 20;
  const { gameConfig } = useGameConfig();
  const sharedStyles = getStyles(questSummary.theme);

  const scrollToBottom = () => {
    const textDisplay = textDisplayRef?.current;

    // this can happen if navigating to lobby from settings
    if (!textDisplay) {
      return;
    }

    textDisplay.scrollTo({
      top: textDisplay.scrollHeight,
      behavior: "smooth",
    });
  };

  // Helper function to create text container and paragraph
  const createTextContainer = () => {
    const textDisplay = textDisplayRef.current;
    if (!textDisplay) return null;

    paragraphCount++;
    const paragraphId = `paragraph-${paragraphCount}`;

    // Create a new container for this paragraph
    const textContainer = document.createElement("div");
    textContainer.className = "text-container relative mb-2";
    textContainer.id = paragraphId;
    textDisplay.appendChild(textContainer);

    // Add blank space at the bottom
    const blankSpace = document.createElement("div");
    blankSpace.style.height = "50px";
    blankSpace.className = "blank-space";
    textDisplay.appendChild(blankSpace);

    // Remove any previous blank spaces
    const blankSpaces = textDisplay.querySelectorAll(".blank-space");
    if (blankSpaces.length > 1) {
      for (let i = 0; i < blankSpaces.length - 1; i++) {
        blankSpaces[i].remove();
      }
    }

    return textContainer;
  };

  // Helper function to create and append paragraph
  const createAndAppendParagraph = (
    textContainer: HTMLElement,
    processedText: string,
  ) => {
    const paragraph = document.createElement("p");
    paragraph.style.lineHeight = `${lineHeight}px`;
    paragraph.style.margin = "0";

    const textSpan = document.createElement("span");
    textSpan.innerHTML = processedText;

    paragraph.appendChild(textSpan);
    textContainer.appendChild(paragraph);
  };

  // Expose the updateText and updateChat methods to parent components
  useImperativeHandle(ref, () => ({
    updateText: (text: string, animateAll: boolean = false) => {
      if (!textDisplayRef.current) return;

      const textDisplay = textDisplayRef.current;
      paragraphCount++;
      const paragraphId = `paragraph-${paragraphCount}`;

      // Create a new container for this paragraph
      const textContainer = document.createElement("div");
      textContainer.className = "text-container relative mb-2";
      textContainer.id = paragraphId;
      textDisplay.appendChild(textContainer);

      // Add blank space at the bottom
      const blankSpace = document.createElement("div");
      blankSpace.style.height = lineHeight * 2 + "px";
      blankSpace.className = "blank-space";
      textDisplay.appendChild(blankSpace);

      // Remove any previous blank spaces
      const blankSpaces = textDisplay.querySelectorAll(".blank-space");
      if (blankSpaces.length > 1) {
        for (let i = 0; i < blankSpaces.length - 1; i++) {
          blankSpaces[i].remove();
        }
      }

      if (!gameConfig.shouldAnimateText) {
        const paragraph = document.createElement("p");
        paragraph.style.lineHeight = `${lineHeight}px`;
        paragraph.style.margin = "0";

        const textSpan = document.createElement("span");
        textSpan.innerHTML = text.replace(/\n/g, "<br>");
        paragraph.appendChild(textSpan);
        textContainer.appendChild(paragraph);
        scrollToBottom();
        return;
      }

      let lineCount = 0;
      let lastScrollLine = 0;

      // Get computed styles for the text display
      const textDisplayStyle = window.getComputedStyle(textDisplay);
      const paddingLeft = parseFloat(textDisplayStyle.paddingLeft);
      const paddingRight = parseFloat(textDisplayStyle.paddingRight);
      const totalHorizontalPadding = paddingLeft + paddingRight;

      // Create a hidden measurement div with the same styling
      const measureDiv = document.createElement("div");
      measureDiv.style.visibility = "hidden";
      measureDiv.style.position = "absolute";
      measureDiv.className = "w-full";
      textDisplay.appendChild(measureDiv);

      // Calculate usable width from the measurement div
      const usableWidth =
        measureDiv.getBoundingClientRect().width - totalHorizontalPadding;
      textDisplay.removeChild(measureDiv);

      // Scroll to the bottom of the display
      textDisplay.scrollTop = textDisplay.scrollHeight;

      // Create a temporary span to measure character width
      const tempSpan = document.createElement("span");
      tempSpan.style.visibility = "hidden";
      tempSpan.style.position = "absolute";
      tempSpan.style.fontSize = window.getComputedStyle(textDisplay).fontSize;
      document.body.appendChild(tempSpan);

      // Function to calculate space width
      function calculateSpaceWidth() {
        tempSpan.textContent = "A A";
        const withSpace = tempSpan.getBoundingClientRect().width;
        tempSpan.textContent = "AA";
        const withoutSpace = tempSpan.getBoundingClientRect().width;
        return withSpace - withoutSpace;
      }

      const spaceWidth = calculateSpaceWidth();

      let currentX = 0;

      // Split the text into words
      const words = addPerWordHighlights(text); // Split by spaces but keep the spaces
      let currentY = 0;
      let charIndex = 0;
      let longestAnimationTime = 0;
      let finishedFirstLine = false;
      let isYellow = false;

      // Animation constants
      const CHAR_DELAY = 4; // Base delay per character
      const SCROLL_DELAY = 300; // Fixed delay for scrolling after new lines

      // Process each word
      words.forEach((word) => {
        // Check if this word has highlight tags (either opening, closing, or both)
        if (word.includes("<hl>")) {
          // Remove the highlight tags for processing
          word = word.replace("<hl>", "").replace("</hl>", "");
          isYellow = true;
        } else if (word.includes("</hl>")) {
          // This word ends the highlight section
          word = word.replace("</hl>", "");
          isYellow = false;
        }
        // If isYellow is true from previous words, continue highlighting
        // (no need to check here as isYellow state is maintained)

        if (finishedFirstLine && !animateAll) {
          return;
        }
        // Measure the word width
        tempSpan.textContent = word.replace(/ /g, "\u00A0");
        const wordWidth = tempSpan.getBoundingClientRect().width;

        // Check if we need to wrap to a new line
        if (word.trim() !== "" && currentX + wordWidth > usableWidth) {
          currentX = 0;
          currentY += lineHeight;
          lineCount++;

          if (lineCount >= lastScrollLine + 5) {
            lastScrollLine = lineCount;
            setTimeout(scrollToBottom, SCROLL_DELAY);
          }
          finishedFirstLine = true;
        }

        if (word.includes("\n")) {
          finishedFirstLine = true;
        }

        // Process each character in the word
        for (let i = 0; i < word.length; i++) {
          const char = word[i];

          const charElement = document.createElement("span");
          charElement.className = "character";
          if (isYellow) {
            charElement.classList.add(sharedStyles.highlight);
          }

          // Handle spaces properly
          if (char === " ") {
            charElement.textContent = "\u00A0"; // Non-breaking space
            charElement.style.width = spaceWidth + "px";
            charElement.classList.add("space");
          } else {
            charElement.textContent = char;
          }

          textContainer.appendChild(charElement);

          // Measure individual character
          tempSpan.textContent = char === " " ? "\u00A0" : char;
          let charWidth =
            char === " " ? spaceWidth : tempSpan.getBoundingClientRect().width;

          // Handle special kerning cases by measuring pairs
          if (i > 0) {
            // Measure the previous character and current character together
            const prevChar = word[i - 1];
            tempSpan.textContent = prevChar + char;
            const pairWidth = tempSpan.getBoundingClientRect().width;

            // Measure the previous character alone
            tempSpan.textContent = prevChar;
            const prevWidth = tempSpan.getBoundingClientRect().width;

            // Measure current character alone
            tempSpan.textContent = char;
            const currentWidth = tempSpan.getBoundingClientRect().width;

            // Calculate kerning adjustment
            const kerningAdjustment = pairWidth - (prevWidth + currentWidth);

            // Apply the kerning adjustment to the previous character's position
            if (kerningAdjustment !== 0) {
              currentX += kerningAdjustment;
            }
          }

          // Set the final position
          const finalX = currentX;
          const finalY = currentY;

          // Update position for next character
          currentX += charWidth;

          if (!finishedFirstLine || animateAll) {
            // Set initial position (from bottom of screen)
            charElement.style.left = finalX + "px";
            charElement.style.top =
              textContainer.offsetHeight + 50 + Math.random() * 50 + "px";
            charElement.style.opacity = "0";

            // Calculate individual animation time
            const delay = charIndex * CHAR_DELAY; // Staggered delay
            const animationTime = delay + 800; // rough estimate of total animation time
            longestAnimationTime = Math.max(
              longestAnimationTime,
              animationTime,
            );

            // Start animation with a staggered delay
            setTimeout(() => {
              charElement.style.opacity = "1";

              // Animate with CSS transition
              charElement.style.transition = `top 0.6s cubic-bezier(0.2, 0.8, 0.2, 1), opacity 0.3s ease-in`;

              // Add some randomness to the bobbing
              const bobAmount = 30 + Math.random() * 10;
              const bobTime = 400 + Math.random() * 100;

              // First bob - go higher than final position
              setTimeout(() => {
                charElement.style.top = finalY - bobAmount + "px";

                // Second bob - settle at final position
                setTimeout(() => {
                  charElement.style.top = finalY + "px";
                }, bobTime);
              }, 50);
            }, delay);
          } else {
            // For text after newline when not animating all, just set the final position immediately
            charElement.style.left = finalX + "px";
            charElement.style.top = finalY + "px";
          }

          charIndex++;
        }

        // Handle explicit newlines
        if (word.includes("\n")) {
          currentX = 0;
          currentY += lineHeight;
          lineCount++;

          if (lineCount >= lastScrollLine + 5) {
            lastScrollLine = lineCount;
            setTimeout(scrollToBottom, SCROLL_DELAY);
          }
        }
      });

      // Remove the temporary measurement span
      document.body.removeChild(tempSpan);

      // Clean up DOM after animation completes and replace with paragraph
      setTimeout(() => {
        const finalText = processTextFormatting(text, sharedStyles);

        const paragraph = document.createElement("p");
        paragraph.style.lineHeight = `${lineHeight}px`;
        paragraph.style.margin = "0";

        const textSpan = document.createElement("span");
        textSpan.innerHTML = finalText;

        paragraph.appendChild(textSpan);
        textContainer.innerHTML = "";
        textContainer.appendChild(paragraph);
        scrollToBottom();
      }, longestAnimationTime);
    },
    appendNoAnimation: (text: string) => {
      if (!text || !textDisplayRef.current) return;

      const textContainer = createTextContainer();
      if (!textContainer) return;

      const processedText = processTextFormatting(text, sharedStyles);
      createAndAppendParagraph(textContainer, processedText);

      scrollToBottom();
    },
    appendFadeIn: (text: string, italic: boolean = false) => {
      if (!text || !textDisplayRef.current) return;

      const textContainer = createTextContainer();
      if (!textContainer) return;

      const processedText = processTextFormatting(text, sharedStyles, italic);
      createAndAppendParagraph(textContainer, processedText);

      // Set initial opacity to 0 for fade-in effect
      textContainer.style.opacity = "0";
      textContainer.style.transition = `opacity ${FADE_IN_DURATION}ms ease-in`;

      // Scroll to bottom
      scrollToBottom();

      // Trigger fade-in effect
      setTimeout(() => {
        textContainer.style.opacity = "1";
      }, 10); // Small delay to ensure the transition is applied
    },
    clearStory: () => {
      if (!textDisplayRef.current) return;

      const textDisplay = textDisplayRef.current;
      textDisplay.innerHTML = "";
    },
    scrollToBottom: () => {
      scrollToBottom();
    },
  }));

  return (
    <>
      <div
        className={`${sharedStyles.container} ${sharedStyles.text} opacity-90 h-full overflow-auto flex-1`}
        id="textDisplay"
        ref={textDisplayRef}
      />

      <style>{`
        /* Character animation styles */
        .character {
          position: absolute;
          display: inline-block;
          opacity: 0;
          line-height: ${lineHeight}px;
        }

        .space {
          width: 0.4em;
        }

        /* Bouncing animation class */
        .bouncing {
            transition: transform 1.5s ease-out, left 1.5s ease-out, top 1.5s ease-out;
        }

        /* Ensure consistent spacing in the final paragraph */
        .text-container p {
          line-height: ${lineHeight}px;
          margin: 0;
        }

        /* Ensure consistent spacing for yellow labels */
        .${sharedStyles.highlight} {
          line-height: ${lineHeight}px;
          display: inline-block;
          vertical-align: top;
        }
      `}</style>
    </>
  );
});

Story.displayName = "Story";

export default Story;
