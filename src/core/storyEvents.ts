import { StoryAppendOptions } from "@/components/Story";

type StoryEventListener = (text: string, options: StoryAppendOptions) => void;
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

  emit(text: string, options: StoryAppendOptions) {
    this.listeners.forEach((listener) => listener(text, options));
  }

  emitClear() {
    this.clearListeners.forEach((listener) => listener());
  }
}

export const storyEvents = new StoryEventEmitter();

export function appendToStory(text: string, options: StoryAppendOptions) {
  storyEvents.emit(text, options);
}

export function clearStory() {
  storyEvents.emitClear();
}
