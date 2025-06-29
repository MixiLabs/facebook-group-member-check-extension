import React from "react";
import { useAppStore } from "../store/app-store";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Loader } from "lucide-react";
import { UserInfo } from "../lib/types";

const QueueItem: React.FC<{
  userInfo: UserInfo;
  groupName: string;
}> = ({ userInfo, groupName }) => (
  <div className="flex items-center justify-between p-2 rounded-md bg-muted/50">
    <div className="flex-1">
      <p className="text-sm font-medium truncate">{userInfo.name}</p>
      <p className="text-xs text-muted-foreground truncate">in {groupName}</p>
    </div>
    <Loader className="h-4 w-4 animate-spin text-primary" />
  </div>
);

export const QueueStatus: React.FC = () => {
  const { queue, groups } = useAppStore();

  const processingItems = queue.filter((item) => item.status === "PROCESSING");

  if (processingItems.length === 0) {
    return null;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base flex items-center">
          <Loader className="h-4 w-4 mr-2 animate-spin" />
          Processing {processingItems.length} Checks...
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-2 max-h-48 overflow-y-auto">
        {processingItems.map((item) => {
          const group = groups.find((g) => g.id === item.groupId);
          if (!item.userInfo) return null;

          return (
            <QueueItem
              key={item.id}
              userInfo={item.userInfo}
              groupName={group?.name || item.groupId}
            />
          );
        })}
      </CardContent>
    </Card>
  );
};
