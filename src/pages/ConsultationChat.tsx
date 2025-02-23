
import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Loader2, Send, Upload } from "lucide-react";
import type { Consultation, ConsultationMessage } from "@/types/consultations";

export default function ConsultationChat() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [consultation, setConsultation] = useState<Consultation | null>(null);
  const [messages, setMessages] = useState<ConsultationMessage[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadConsultation();
    subscribeToMessages();
  }, [id]);

  const loadConsultation = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        navigate("/auth");
        return;
      }

      // Load consultation details
      const { data: consultation, error: consultationError } = await supabase
        .from("consultations")
        .select("*")
        .eq("id", id)
        .single();

      if (consultationError) throw consultationError;

      // Verify user is part of this consultation
      if (consultation.user_id !== user.id && consultation.vet_id !== user.id) {
        navigate("/find-vets");
        return;
      }

      setConsultation(consultation);

      // Load existing messages
      const { data: messages, error: messagesError } = await supabase
        .from("consultation_messages")
        .select("*")
        .eq("consultation_id", id)
        .order("created_at", { ascending: true });

      if (messagesError) throw messagesError;
      setMessages(messages || []);
    } catch (error) {
      console.error("Error loading consultation:", error);
      toast({
        title: "Error",
        description: "Failed to load consultation",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const subscribeToMessages = () => {
    const channel = supabase
      .channel(`messages_${id}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "consultation_messages",
          filter: `consultation_id=eq.${id}`,
        },
        (payload) => {
          setMessages((current) => [...current, payload.new as ConsultationMessage]);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  };

  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim()) return;

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { error } = await supabase
        .from("consultation_messages")
        .insert({
          consultation_id: id,
          sender_id: user.id,
          content: newMessage,
        });

      if (error) throw error;
      setNewMessage("");
    } catch (error) {
      console.error("Error sending message:", error);
      toast({
        title: "Error",
        description: "Failed to send message",
        variant: "destructive",
      });
    }
  };

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
            <div
              key={message.id}
              className={`flex ${
                message.sender_id === consultation?.user_id
                  ? "justify-end"
                  : "justify-start"
              }`}
            >
              <div
                className={`max-w-[80%] rounded-lg px-4 py-2 ${
                  message.sender_id === consultation?.user_id
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
          ))}
        </div>
      </div>

      {/* Message input */}
      <div className="bg-white border-t p-4">
        <div className="container max-w-4xl mx-auto">
          <form onSubmit={sendMessage} className="flex gap-2">
            <Input
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              placeholder="Type your message..."
              className="flex-1"
            />
            <Button type="button" variant="outline" size="icon">
              <Upload className="h-4 w-4" />
            </Button>
            <Button type="submit">
              <Send className="h-4 w-4" />
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
}
