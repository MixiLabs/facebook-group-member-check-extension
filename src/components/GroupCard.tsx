import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { Button } from "./ui/button";
import { ExternalLink, Copy, Trash2 } from "lucide-react";
import { GroupInfo } from "../lib/types";

interface GroupCardProps {
  group: GroupInfo;
  onRemove?: () => void;
  onCopyUrl?: () => void;
  onOpenGroup?: () => void;
}

const getGroupInitials = (name: string) => {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
};

export const GroupCard: React.FC<GroupCardProps> = ({
  group,
  onRemove,
  onCopyUrl,
  onOpenGroup,
}) => {
  const handleCopyUrl = () => {
    navigator.clipboard.writeText(group.url);
    onCopyUrl?.();
  };

  const handleOpenGroup = () => {
    chrome.tabs.create({ url: group.url });
    onOpenGroup?.();
  };

  return (
    <Card className="w-full">
      <CardHeader className="pb-3">
        <div className="flex items-center space-x-3">
          <Avatar className="h-10 w-10">
            <AvatarImage src={group.avatar} alt={group.name} />
            <AvatarFallback>{getGroupInitials(group.name)}</AvatarFallback>
          </Avatar>

          <div className="flex-1 min-w-0">
            <CardTitle className="text-sm font-semibold truncate">
              {group.name}
            </CardTitle>
            <p className="text-xs text-muted-foreground truncate">
              ID: {group.id}
            </p>
          </div>

          <div className="flex space-x-1">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleCopyUrl}
              className="h-8 w-8 p-0"
              title="Copy Group URL"
            >
              <Copy className="h-4 w-4" />
            </Button>

            <Button
              variant="ghost"
              size="sm"
              onClick={handleOpenGroup}
              className="h-8 w-8 p-0"
              title="Open Group"
            >
              <ExternalLink className="h-4 w-4" />
            </Button>

            {onRemove && (
              <Button
                variant="ghost"
                size="sm"
                onClick={onRemove}
                className="h-8 w-8 p-0 text-destructive hover:text-destructive"
                title="Remove Group"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            )}
          </div>
        </div>
      </CardHeader>
    </Card>
  );
};
