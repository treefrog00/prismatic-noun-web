import { useRef, useImperativeHandle, forwardRef } from "react";
import { getStyles } from "../styles/shared";
import { useGameConfig } from "@/contexts/AppContext";
import { QuestSummary } from "@/types";

// Constants
const FADE_IN_DURATION = 1000; // Duration in milliseconds

export interface StoryAppendOptions {
  skipScroll?: boolean;
  italic?: boolean;
  animate?: boolean;
  highlight?: boolean;
}

export interface StoryRef {
  updateText: (text: string, options?: StoryAppendOptions) => void;
  appendNoAnimation: (text: string, options?: StoryAppendOptions) => void; // unused
  appendFadeIn: (text: string, options?: StoryAppendOptions) => void;
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
  options?: StoryAppendOptions,
) => {
  let finalText = text
    .replace(/<hl>/g, `<span class="${sharedStyles.highlight}">`)
    .replace(/<\/hl>/g, "</span>")
    .replace(/<i>/g, `<span style="font-style: italic;">`)
    .replace(/<\/i>/g, "</span>")
    .replace(/^<tab>/gm, "&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;"); // Replace <tab> at line start with 4 spaces

  // If italic is true, wrap the entire text in highlight styling and make it italic
  if (options?.italic) {
    finalText = `<span class="${sharedStyles.highlight}" style="font-style: italic;">${finalText}</span>`;
  }

  if (options?.highlight) {
    finalText = `<span class="${sharedStyles.highlight}">${finalText}</span>`;
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
    updateText: async (text: string, options?: StoryAppendOptions) => {
      if (!textDisplayRef.current) return;

      // Ensure fonts are loaded before we start measuring text
      await document.fonts.ready;

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

      // Create a hidden reference paragraph with the final text to measure exact positions
      const finalText = processTextFormatting(text, sharedStyles, options);
      const referenceParagraph = document.createElement("p");
      referenceParagraph.style.lineHeight = `${lineHeight}px`;
      referenceParagraph.style.margin = "0";
      referenceParagraph.style.visibility = "hidden";
      referenceParagraph.style.position = "absolute";
      referenceParagraph.style.width = usableWidth + "px";
      referenceParagraph.style.whiteSpace = "pre-wrap";

      const referenceSpan = document.createElement("span");
      referenceSpan.innerHTML = finalText;
      referenceParagraph.appendChild(referenceSpan);
      textContainer.appendChild(referenceParagraph);

      // Create a temporary span to measure character width (kept for fallback)
      const tempSpan = document.createElement("span");
      tempSpan.style.visibility = "hidden";
      tempSpan.style.position = "absolute";
      tempSpan.style.fontSize = window.getComputedStyle(textDisplay).fontSize;
      textDisplay.appendChild(tempSpan);

      // Function to calculate space width
      function calculateSpaceWidth() {
        tempSpan.textContent = "A A";
        const withSpace = tempSpan.getBoundingClientRect().width;
        tempSpan.textContent = "AA";
        const withoutSpace = tempSpan.getBoundingClientRect().width;
        return withSpace - withoutSpace;
      }

      const spaceWidth = calculateSpaceWidth();

      // Function to get character positions from reference paragraph
      function getCharacterPositions() {
        const range = document.createRange();
        const textNode = referenceSpan.firstChild;
        if (!textNode) return [];

        const positions = [];
        const textContent = textNode.textContent || "";

        for (let i = 0; i < textContent.length; i++) {
          range.setStart(textNode, i);
          range.setEnd(textNode, i + 1);
          const rect = range.getBoundingClientRect();
          const containerRect = textContainer.getBoundingClientRect();

          positions.push({
            x: rect.left - containerRect.left,
            y: rect.top - containerRect.top,
            width: rect.width,
            height: rect.height,
          });
        }

        return positions;
      }

      const characterPositions = getCharacterPositions();

      let currentX = 0;

      // Use measured character positions from reference paragraph
      let charIndex = 0;
      let longestAnimationTime = 0;
      let finishedFirstLine = false;
      let currentLine = 0;
      let lastScrollLine = 0;

      // Animation constants
      const CHAR_DELAY = 4; // Base delay per character
      const SCROLL_DELAY = 300; // Fixed delay for scrolling after new lines

      // Get plain text without HTML tags to map to character positions
      const plainText = text.replace(/<[^>]*>/g, "");

      // Process each character using the measured positions
      for (let i = 0; i < plainText.length; i++) {
        const char = plainText[i];
        const position = characterPositions[i];

        if (!position) continue; // Skip if no position available

        const charElement = document.createElement("span");
        charElement.className = "character";

        // Check if this character should be highlighted
        // We need to map back to the original text to check for highlight tags
        let isHighlighted = false;
        let originalIndex = 0;
        let plainIndex = 0;
        while (plainIndex <= i && originalIndex < text.length) {
          if (text[originalIndex] === "<") {
            // Skip HTML tag
            const tagEnd = text.indexOf(">", originalIndex);
            if (tagEnd !== -1) {
              const tag = text.substring(originalIndex, tagEnd + 1);
              if (tag === "<hl>") {
                isHighlighted = true;
              } else if (tag === "</hl>") {
                isHighlighted = false;
              }
              originalIndex = tagEnd + 1;
            } else {
              originalIndex++;
            }
          } else {
            if (plainIndex === i) {
              break;
            }
            plainIndex++;
            originalIndex++;
          }
        }

        if (isHighlighted) {
          charElement.classList.add(sharedStyles.highlight);
        }

        // Handle spaces properly
        if (char === " ") {
          charElement.textContent = "\u00A0"; // Non-breaking space
          charElement.classList.add("space");
        } else {
          charElement.textContent = char;
        }

        textContainer.appendChild(charElement);

        // Check if we're on a new line for scrolling
        if (
          i > 0 &&
          characterPositions[i - 1] &&
          position.y > characterPositions[i - 1].y + 5
        ) {
          currentLine++;
          if (currentLine >= lastScrollLine + 5) {
            lastScrollLine = currentLine;
            if (!options?.skipScroll) {
              setTimeout(scrollToBottom, SCROLL_DELAY);
            }
          }
          if (currentLine === 1) {
            finishedFirstLine = true;
          }
        }

        // Handle newlines in the original text
        if (char === "\n") {
          finishedFirstLine = true;
        }

        // Use the measured position from the reference paragraph
        const finalX = position.x;
        const finalY = position.y;

        // see message above about "animate" parameter
        if (!finishedFirstLine || options?.animate) {
          // Set initial position (from bottom of screen)
          charElement.style.left = finalX + "px";
          charElement.style.top =
            textContainer.offsetHeight + 50 + Math.random() * 50 + "px";
          charElement.style.opacity = "0";

          // Calculate individual animation time
          const delay = charIndex * CHAR_DELAY; // Staggered delay
          const animationTime = delay + 800; // rough estimate of total animation time
          longestAnimationTime = Math.max(longestAnimationTime, animationTime);

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

      // Remove the temporary measurement span
      textDisplay.removeChild(tempSpan);

      // Clean up DOM after animation completes and replace with paragraph
      setTimeout(() => {
        // Remove the reference paragraph
        if (referenceParagraph && referenceParagraph.parentNode) {
          referenceParagraph.parentNode.removeChild(referenceParagraph);
        }

        const paragraph = document.createElement("p");
        paragraph.style.lineHeight = `${lineHeight}px`;
        paragraph.style.margin = "0";

        const textSpan = document.createElement("span");
        textSpan.innerHTML = finalText; // Use the already-processed finalText

        paragraph.appendChild(textSpan);
        textContainer.innerHTML = "";
        textContainer.appendChild(paragraph);
        scrollToBottom();
      }, longestAnimationTime);
    },
    // unused
    appendNoAnimation: (text: string, options?: StoryAppendOptions) => {
      if (!text || !textDisplayRef.current) return;

      const textContainer = createTextContainer();
      if (!textContainer) return;

      const processedText = processTextFormatting(text, sharedStyles, options);
      createAndAppendParagraph(textContainer, processedText);

      if (!options?.skipScroll) {
        scrollToBottom();
      }
    },
    appendFadeIn: (text: string, options?: StoryAppendOptions) => {
      if (!text || !textDisplayRef.current) return;

      const textContainer = createTextContainer();
      if (!textContainer) return;

      const processedText = processTextFormatting(text, sharedStyles, options);
      createAndAppendParagraph(textContainer, processedText);

      // Set initial opacity to 0 for fade-in effect
      textContainer.style.opacity = "0";
      textContainer.style.transition = `opacity ${FADE_IN_DURATION}ms ease-in`;

      if (!options?.skipScroll) {
        scrollToBottom();
      }

      // Trigger fade-in effect
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          textContainer.style.opacity = "1";
        });
      });
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
