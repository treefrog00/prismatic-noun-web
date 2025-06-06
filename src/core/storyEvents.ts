type StoryEventListener = (text: string, label?: string) => void;

class StoryEventEmitter {
  private listeners: StoryEventListener[] = [];

  subscribe(listener: StoryEventListener) {
    this.listeners.push(listener);
    return () => {
      this.listeners = this.listeners.filter((l) => l !== listener);
    };
  }

  emit(text: string, label?: string) {
    this.listeners.forEach((listener) => listener(text, label));
  }
}

export const storyEvents = new StoryEventEmitter();

export function appendToStory(text: string, label?: string) {
  storyEvents.emit(text, label);
}
