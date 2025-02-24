
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface NotifyDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  email: string;
  onEmailChange: (email: string) => void;
  onSubmit: (e: React.FormEvent) => void;
}

export function NotifyDialog({
  open,
  onOpenChange,
  email,
  onEmailChange,
  onSubmit,
}: NotifyDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Get Notified</DialogTitle>
          <DialogDescription>
            Enter your email to be notified when Essentials launches.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={onSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => onEmailChange(e.target.value)}
              required
            />
          </div>
          <Button type="submit" className="w-full">
            Notify Me
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
