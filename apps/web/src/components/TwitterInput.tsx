import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";

interface TwitterInputProps {
  onSubmit: (username: string) => void;
  isLoading?: boolean;
}

export const TwitterInput = ({ onSubmit, isLoading }: TwitterInputProps) => {
  const [username, setUsername] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!username.trim()) return;

    const cleanUsername = username.trim().replace('@', '');
    onSubmit(cleanUsername);
    setUsername(""); // Clear input after submission
  };

  return (
    <div className="w-full max-w-xl mx-auto px-6">
      <div className="text-center mb-12">
        <h1 className="text-5xl font-light tracking-tight mb-4">
          Framework
        </h1>
        <p className="text-lg text-muted-foreground font-light">
          Discover content frameworks from any Twitter account
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="relative">
          <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
          <Input
            type="text"
            placeholder="Twitter username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            className="pl-12 h-12 text-base border-border bg-background focus:ring-1 focus:ring-ring"
            disabled={isLoading}
          />
        </div>
        
        <Button
          type="submit"
          disabled={!username.trim() || isLoading}
          variant="default"
          className="w-full h-12"
        >
          {isLoading ? "Analyzing..." : "Analyze"}
        </Button>
      </form>
    </div>
  );
};