import { useEventQueue } from "../contexts/EventContext";

export const useEventProcessor = () => {
  const { addEvents, isProcessing, queueLength } = useEventQueue();

  return {
    addEvents,
    isProcessing,
    queueLength,
  };
};
