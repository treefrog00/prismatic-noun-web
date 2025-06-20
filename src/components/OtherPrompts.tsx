import React from "react";

interface Prompt {
  player: {
    id: string;
    name?: string;
  };
  value: string;
}

interface OtherPromptsProps {
  otherPrompts: Prompt[];
  myPlayerId: string;
}

const OtherPrompts: React.FC<OtherPromptsProps> = ({
  otherPrompts,
  myPlayerId,
}) => {
  return (
    <div className="w-1/3 overflow-y-auto max-h-80">
      {otherPrompts
        .filter((prompt) => prompt.player.id !== myPlayerId)
        .map((prompt) => (
          <div key={prompt.player.id} className="text-gray-300 mb-2">
            <div className="font-bold">
              {prompt.player.name || prompt.player.id}:
            </div>
            <div>{prompt.value}</div>
          </div>
        ))}
    </div>
  );
};

export default OtherPrompts;
