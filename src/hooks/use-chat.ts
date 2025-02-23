
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import type { Consultation, ConsultationMessage } from "@/types/consultations";

export function useChat(consultationId: string) {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [consultation, setConsultation] = useState<Consultation | null>(null);
  const [messages, setMessages] = useState<ConsultationMessage[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadConsultation();
    const unsubscribe = subscribeToMessages();
    return () => {
      unsubscribe();
    };
  }, [consultationId]);

  const loadConsultation = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        navigate("/auth");
        return;
      }

      // Load consultation details
      const { data: consultationData, error: consultationError } = await supabase
        .from("consultations")
        .select("*")
        .eq("id", consultationId)
        .single();

      if (consultationError) throw consultationError;

      // Verify user is part of this consultation
      if (consultationData.user_id !== user.id && consultationData.vet_id !== user.id) {
        navigate("/find-vets");
        return;
      }

      setConsultation(consultationData as Consultation);

      // Load existing messages
      const { data: messagesData, error: messagesError } = await supabase
        .from("consultation_messages")
        .select("*")
        .eq("consultation_id", consultationId)
        .order("created_at", { ascending: true });

      if (messagesError) throw messagesError;
      setMessages(messagesData as ConsultationMessage[]);
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
      .channel(`messages_${consultationId}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "consultation_messages",
          filter: `consultation_id=eq.${consultationId}`,
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
          consultation_id: consultationId,
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

  return {
    consultation,
    messages,
    newMessage,
    setNewMessage,
    sendMessage,
    loading
  };
}
