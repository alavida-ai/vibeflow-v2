import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Copy, Check } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Framework } from "@/types/twitter-analyzer";


interface FrameworkCardProps {
  framework: Framework;
}

export const FrameworkCard = ({ framework }: FrameworkCardProps) => {
  const [copied, setCopied] = useState(false);
  const { toast } = useToast();

  const handleCopy = async () => {
    try {

      const prompt = `Please create a tweet draft using the framework below as your guide. Apply the framework's structure and style to the content provided after the ---:

Framework: ${framework.title}
Description: ${framework.description}

Structure: 
${framework.structure}

Template: 
\`\`\`
${framework.promptTemplate}
\`\`\`
---
Content to transform into a tweet:

`;

      await navigator.clipboard.writeText(prompt);
      setCopied(true);
      toast({
        title: "Copied",
        description: "Framework prompt copied to clipboard",
      });
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      toast({
        title: "Failed to copy",
        description: "Please try again",
        variant: "destructive",
      });
    }
  };

  const formatNumber = (num: number) => {
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
    return num.toString();
  };

  return (
    <div className="border-b border-border pb-6 mb-6 last:border-b-0">
      <div className="space-y-4">
        <div>
          <h3 className="text-lg font-medium mb-2">{framework.title}</h3>
          <p className="text-sm text-muted-foreground font-light leading-relaxed mb-3">
            {framework.description}
          </p>
          <div className="flex gap-4 text-sm flex-wrap">
            <div>
              <span className="font-medium text-accent">{formatNumber(framework.metrics.avgViews)}</span>
              <span className="text-muted-foreground ml-1">avg views</span>
            </div>
            <div>
              <span className="font-medium text-accent">{formatNumber(framework.metrics.avgLikes)}</span>
              <span className="text-muted-foreground ml-1">avg likes</span>
            </div>
            <div>
              <span className="font-medium text-accent">{formatNumber(framework.metrics.avgRetweets)}</span>
              <span className="text-muted-foreground ml-1">avg retweets</span>
            </div>
            <div>
              <span className="font-medium text-accent">{formatNumber(framework.metrics.avgReplies)}</span>
              <span className="text-muted-foreground ml-1">avg replies</span>
            </div>
            <div>
              <span className="font-medium text-accent">{formatNumber(framework.metrics.avgQuotes)}</span>
              <span className="text-muted-foreground ml-1">avg quotes</span>
            </div>
            <div>
              <span className="font-medium text-accent">{formatNumber(framework.metrics.avgBookmarks)}</span>
              <span className="text-muted-foreground ml-1">avg bookmarks</span>
            </div>
          </div>
        </div>

        <div className="space-y-3">
          <div>
            <h4 className="text-sm font-medium mb-2">Structure:</h4>
            <div className="space-y-1">
              {framework.structure.split('\n').map((line, index) => (
                <div key={index} className="flex items-start gap-2 text-sm">
                  <span className="text-accent font-medium min-w-[20px]">{index + 1}.</span>
                  <span className="text-muted-foreground">{line.replace(/^\d+\.\s*/, '')}</span>
                </div>
              ))}
            </div>
          </div>

          <div>
            <h4 className="text-sm font-medium mb-2">Template:</h4>
            <div className="bg-muted/30 p-3 rounded border text-xs font-mono text-muted-foreground whitespace-pre-line">
              {framework.promptTemplate}
            </div>
          </div>
        </div>

        <Button
          onClick={handleCopy}
          variant="outline"
          size="sm"
          className="w-full h-8 text-xs"
          disabled={copied}
        >
          {copied ? (
            <div className="flex items-center gap-1">
              <Check className="w-3 h-3" />
              Copied
            </div>
          ) : (
            <div className="flex items-center gap-1">
              <Copy className="w-3 h-3" />
              Copy Prompt
            </div>
          )}
        </Button>
      </div>
    </div>
  );
};