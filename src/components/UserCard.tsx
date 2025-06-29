import React from "react";
import { Card, CardContent } from "./ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { Badge } from "./ui/badge";
import { Button } from "./ui/button";
import { ExternalLink, Copy, UserCheck, Loader } from "lucide-react";
import { MembershipStatus } from "../lib/types";

interface UserCardProps {
  membership: MembershipStatus;
}

const getStatusBadge = (status: MembershipStatus["status"]) => {
  switch (status) {
    case "MEMBER":
      return <Badge variant="success">Member</Badge>;
    case "ADMIN":
      return <Badge variant="destructive">Admin</Badge>;
    case "MODERATOR":
      return <Badge variant="warning">Moderator</Badge>;
    case "NOT_MEMBER":
      return <Badge variant="secondary">Not Member</Badge>;
    case "ERROR":
      return <Badge variant="error">Error</Badge>;
    case "CHECKING":
      return (
        <Badge variant="outline" className="flex items-center space-x-1">
          <Loader className="h-3 w-3 animate-spin" />
          <span>Checking...</span>
        </Badge>
      );
    default:
      return <Badge variant="outline">Unknown</Badge>;
  }
};

const getUserInitials = (name: string | null | undefined) => {
  if (!name) return "?";
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
};

export const UserCard: React.FC<UserCardProps> = ({ membership }) => {
  const userProfileUrl = `https://www.facebook.com/${membership.userId}`;
  const groupMemberUrl = `https://www.facebook.com/groups/${membership.groupId}/user/${membership.userId}`;

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    // You could add a toast notification here for better feedback
  };

  const handleOpen = (url: string) => {
    chrome.tabs.create({ url });
  };

  return (
    <Card className="w-full">
      <CardContent className="p-4">
        <div className="flex items-start space-x-4">
          <Avatar className="h-12 w-12">
            <AvatarImage
              src={membership.userInfo?.images.avatar || undefined}
              alt={membership.userInfo?.name || "User"}
            />
            <AvatarFallback>
              {getUserInitials(membership.userInfo?.name)}
            </AvatarFallback>
          </Avatar>

          <div className="flex-1 space-y-2">
            <div className="space-y-1">
              <div className="flex items-center justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <h3
                    className="font-semibold text-sm cursor-pointer hover:underline truncate"
                    onClick={() => handleOpen(userProfileUrl)}
                    title={
                      membership.userInfo?.name || `User ${membership.userId}`
                    }
                  >
                    {membership.userInfo?.name || `User ${membership.userId}`}
                  </h3>
                </div>
                <div
                  className="cursor-pointer flex-shrink-0"
                  onClick={() => handleOpen(groupMemberUrl)}
                  title="View User in Group"
                >
                  {getStatusBadge(membership.status)}
                </div>
              </div>

              {membership.groupInfo && (
                <p className="text-xs text-muted-foreground truncate">
                  in{" "}
                  <a
                    href={membership.groupInfo.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hover:underline"
                    onClick={(e) => {
                      e.preventDefault();
                      handleOpen(membership.groupInfo?.url || "");
                    }}
                    title="Open Group"
                  >
                    {membership.groupInfo.name}
                  </a>
                </p>
              )}

              <p className="text-xs text-muted-foreground">
                Checked {new Date(membership.checkedAt).toLocaleString()}
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2 pt-1">
              <div className="flex items-center space-x-1 rounded-md border p-1 bg-muted/30">
                <span className="text-xs font-medium pl-1">Profile:</span>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleCopy(userProfileUrl)}
                  className="h-7 w-7 p-0"
                  title="Copy Profile URL"
                >
                  <Copy className="h-3.5 w-3.5" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleOpen(userProfileUrl)}
                  className="h-7 w-7 p-0"
                  title="Open Profile"
                >
                  <ExternalLink className="h-3.5 w-3.5" />
                </Button>
              </div>

              {membership.groupInfo && (
                <div className="flex items-center space-x-1 rounded-md border p-1 bg-muted/30">
                  <span className="text-xs font-medium pl-1">Group:</span>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleCopy(groupMemberUrl)}
                    className="h-7 w-7 p-0"
                    title="Copy Member Link"
                  >
                    <Copy className="h-3.5 w-3.5" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleOpen(groupMemberUrl)}
                    className="h-7 w-7 p-0"
                    title="View in Group"
                  >
                    <UserCheck className="h-3.5 w-3.5" />
                  </Button>
                </div>
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
