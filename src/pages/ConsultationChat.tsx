
import { useParams } from "react-router-dom";
import { Loader2 } from "lucide-react";
import { MessageBubble } from "@/components/chat/MessageBubble";
import { MessageInput } from "@/components/chat/MessageInput";
import { useChat } from "@/hooks/use-chat";

export default function ConsultationChat() {
  const { id = '' } = useParams();
  const {
    consultation,
    messages,
    newMessage,
    setNewMessage,
    sendMessage,
    loading
  } = useChat(id);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Chat header */}
      <div className="bg-white border-b px-4 py-3">
        <div className="container max-w-4xl mx-auto">
          <h1 className="text-lg font-semibold">
            Consultation {consultation?.status === 'active' ? '(In Progress)' : ''}
          </h1>
        </div>
      </div>

      {/* Messages area */}
      <div className="flex-1 overflow-y-auto p-4">
        <div className="container max-w-4xl mx-auto space-y-4">
          {messages.map((message) => (
            <MessageBubble
              key={message.id}
              message={message}
              isUserMessage={message.sender_id === consultation?.user_id}
            />
          ))}
        </div>
      </div>

      {/* Message input */}
      <div className="bg-white border-t p-4">
        <div className="container max-w-4xl mx-auto">
          <MessageInput
            message={newMessage}
            onChange={setNewMessage}
            onSubmit={sendMessage}
          />
        </div>
      </div>
    </div>
  );
}
