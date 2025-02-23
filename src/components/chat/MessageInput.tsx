
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Send, Upload } from "lucide-react";

interface MessageInputProps {
  message: string;
  onChange: (value: string) => void;
  onSubmit: (e: React.FormEvent) => void;
}

export function MessageInput({ message, onChange, onSubmit }: MessageInputProps) {
  return (
    <form onSubmit={onSubmit} className="flex gap-2">
      <Input
        value={message}
        onChange={(e) => onChange(e.target.value)}
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
  );
}
