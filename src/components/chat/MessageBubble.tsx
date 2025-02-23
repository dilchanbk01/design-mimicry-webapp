
import { ConsultationMessage } from "@/types/consultations";

interface MessageBubbleProps {
  message: ConsultationMessage;
  isUserMessage: boolean;
}

export function MessageBubble({ message, isUserMessage }: MessageBubbleProps) {
  return (
    <div className={`flex ${isUserMessage ? "justify-end" : "justify-start"}`}>
      <div
        className={`max-w-[80%] rounded-lg px-4 py-2 ${
          isUserMessage
            ? "bg-primary text-white"
            : "bg-white border"
        }`}
      >
        <p className="text-sm">{message.content}</p>
        {message.file_url && (
          <a
            href={message.file_url}
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs underline mt-1 block"
          >
            View Attachment
          </a>
        )}
      </div>
    </div>
  );
}
