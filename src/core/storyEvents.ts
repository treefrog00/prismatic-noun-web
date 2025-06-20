type StoryEventListener = (text: string, isFirstParagraph: boolean) => void;
type StoryClearListener = () => void;

class StoryEventEmitter {
  private listeners: StoryEventListener[] = [];
  private clearListeners: StoryClearListener[] = [];

  subscribe(listener: StoryEventListener) {
    this.listeners.push(listener);
    return () => {
      this.listeners = this.listeners.filter((l) => l !== listener);
    };
  }

  subscribeToClear(listener: StoryClearListener) {
    this.clearListeners.push(listener);
    return () => {
      this.clearListeners = this.clearListeners.filter((l) => l !== listener);
    };
  }

  emit(text: string, isFirstParagraph: boolean) {
    this.listeners.forEach((listener) => listener(text, isFirstParagraph));
  }

  emitClear() {
    this.clearListeners.forEach((listener) => listener());
  }
}

export const storyEvents = new StoryEventEmitter();

export function appendToStory(text: string, isFirstParagraph: boolean) {
  storyEvents.emit(text, isFirstParagraph);
}

export function clearStory() {
  storyEvents.emitClear();
}
