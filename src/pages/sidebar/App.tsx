import React, { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../../components/ui/card";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { Badge } from "../../components/ui/badge";
import { UserCard } from "../../components/UserCard";
import { GroupCard } from "../../components/GroupCard";
import { useAppStore } from "../../store/app-store";
import {
  Play,
  Pause,
  Settings,
  Plus,
  Users,
  Clock,
  Loader,
} from "lucide-react";
import { QueueStatus } from "../../components/QueueStatus";
import { extractFacebookIdentifier } from "../../lib/extract-facebook-identifier";

// Check if extension context is valid
function isExtensionContextValid(): boolean {
  try {
    return !!(chrome && chrome.runtime && chrome.runtime.id);
  } catch (error) {
    return false;
  }
}

// Safe string trim function
function safeTrim(value: string | null | undefined): string {
  return (value || "").trim();
}

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<
    "check" | "groups" | "history" | "settings"
  >("check");
  const [newGroupId, setNewGroupId] = useState("");
  const [newGroupName, setNewGroupName] = useState("");
  const [newUserId, setNewUserId] = useState("");

  const {
    groups,
    recentChecks,
    queue,
    isProcessing,
    autoDetectEnabled,
    maxRecentChecks,
    addGroup,
    removeGroup,
    addToQueue,
    clearRecentChecks,
    setAutoDetect,
    setMaxRecentChecks,
    clearGroups,
    importGroups,
  } = useAppStore();

  useEffect(() => {
    if (chrome.storage && chrome.storage.onChanged) {
      const listener = (
        changes: { [key: string]: chrome.storage.StorageChange },
        areaName: string
      ) => {
        if (areaName === "local" && changes["facebook-group-checker-store"]) {
          console.log("Storage change detected, rehydrating store.");
          useAppStore.persist.rehydrate();
        }
      };

      chrome.storage.onChanged.addListener(listener);

      return () => {
        chrome.storage.onChanged.removeListener(listener);
      };
    }
  }, []);

  const handleAddGroup = () => {
    const groupId = safeTrim(newGroupId);
    const groupName = safeTrim(newGroupName);

    if (groupId && groupName) {
      const groupUrl = `https://www.facebook.com/groups/${groupId}`;
      addGroup({
        id: groupId,
        name: groupName,
        url: groupUrl,
      });
      setNewGroupId("");
      setNewGroupName("");
    }
  };

  const handleImportGroups = () => {
    const jsonString = safeTrim(newGroupId);
    try {
      const groupsToImport = JSON.parse(jsonString);
      if (Array.isArray(groupsToImport)) {
        importGroups(groupsToImport);
        setNewGroupId("");
      }
    } catch (e) {
      console.error("Invalid JSON for group import", e);
    }
  };

  const handleAddToQueue = async () => {
    const identifier = extractFacebookIdentifier(newUserId);
    if (identifier && groups.length > 0) {
      await addToQueue(identifier);
      setNewUserId("");
    } else if (groups.length === 0) {
      // Maybe show a notification to add groups first
      console.log("Please add groups before adding a user to the queue.");
    }
  };

  const isCheckingUser =
    isProcessing || queue.some((q) => q.status === "PENDING");

  return (
    <div className="w-full mx-auto bg-background min-h-screen overflow-x-hidden">
      {/* Header */}
      <div className="sticky top-0 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b z-10">
        <div className="p-4">
          <h1 className="text-lg font-semibold">FB Group Checker</h1>
          <div className="flex items-center space-x-2 mt-2">
            <Badge variant={autoDetectEnabled ? "success" : "secondary"}>
              Auto-detect: {autoDetectEnabled ? "ON" : "OFF"}
            </Badge>
            <Badge variant={isCheckingUser ? "warning" : "outline"}>
              {isCheckingUser ? "Processing" : "Idle"}
            </Badge>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="px-4 pb-2">
          <div className="flex space-x-1">
            {[
              { key: "check", label: "Check", icon: Play },
              { key: "groups", label: "Groups", icon: Users },
              { key: "history", label: "History", icon: Clock },
              { key: "settings", label: "Settings", icon: Settings },
            ].map(({ key, label, icon: Icon }) => (
              <Button
                key={key}
                variant={activeTab === key ? "default" : "ghost"}
                size="sm"
                onClick={() => setActiveTab(key as any)}
                className="flex-1"
              >
                <Icon className="h-4 w-4 mr-1" />
                {label}
              </Button>
            ))}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="p-4 space-y-4">
        {/* Check Tab */}
        {activeTab === "check" && (
          <div className="space-y-4">
            <QueueStatus />
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Check New User</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Input
                  placeholder="Enter User ID, Username, or URL"
                  value={newUserId}
                  onChange={(e) => setNewUserId(e.target.value)}
                  disabled={isCheckingUser}
                />

                <Button
                  className="w-full"
                  onClick={handleAddToQueue}
                  disabled={
                    isCheckingUser || !newUserId.trim() || groups.length === 0
                  }
                >
                  {isCheckingUser ? (
                    <Loader className="h-4 w-4 animate-spin mr-2" />
                  ) : null}
                  Check In All Groups
                </Button>
                {groups.length === 0 && (
                  <p className="text-xs text-center text-destructive">
                    Please add at least one group on the 'Groups' tab.
                  </p>
                )}
              </CardContent>
            </Card>
          </div>
        )}

        {/* Groups Tab */}
        {activeTab === "groups" && (
          <div className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Add New Group</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Input
                  placeholder="Group ID"
                  value={newGroupId}
                  onChange={(e) => setNewGroupId(e.target.value)}
                />
                <Input
                  placeholder="Group Name"
                  value={newGroupName}
                  onChange={(e) => setNewGroupName(e.target.value)}
                />
                <Button className="w-full" onClick={handleAddGroup}>
                  Add Group
                </Button>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Import/Export Groups</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <textarea
                  className="w-full p-2 border rounded-md text-xs h-24 bg-muted/50"
                  placeholder="Paste JSON array of groups here to import..."
                  onChange={(e) => setNewGroupId(e.target.value)}
                />
                <Button
                  variant="secondary"
                  className="w-full"
                  onClick={handleImportGroups}
                >
                  Import from JSON
                </Button>
                <Button
                  variant="outline"
                  className="w-full"
                  onClick={() =>
                    navigator.clipboard.writeText(
                      JSON.stringify(groups, null, 2)
                    )
                  }
                >
                  Export to Clipboard
                </Button>
              </CardContent>
            </Card>

            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <h3 className="text-sm font-medium">
                  Your Groups ({groups.length})
                </h3>
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={() =>
                    window.confirm("Are you sure?") && clearGroups()
                  }
                >
                  Clear All
                </Button>
              </div>
              {groups.map((group) => (
                <GroupCard
                  key={group.id}
                  group={group}
                  onRemove={() => removeGroup(group.id)}
                />
              ))}
            </div>
          </div>
        )}

        {/* History Tab */}
        {activeTab === "history" && (
          <div className="space-y-4">
            <QueueStatus />
            <div className="flex justify-between items-center">
              <h3 className="font-semibold">
                Recent Checks ({recentChecks.length})
              </h3>
              <Button
                variant="destructive"
                size="sm"
                onClick={clearRecentChecks}
              >
                Clear History
              </Button>
            </div>
            {recentChecks.length > 0 ? (
              <div className="space-y-2">
                {recentChecks.map((check) => (
                  <UserCard
                    key={`${check.userId}-${check.groupId}`}
                    membership={check}
                  />
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground text-center py-4">
                No recent checks. Start by checking a user.
              </p>
            )}
          </div>
        )}

        {/* Settings Tab */}
        {activeTab === "settings" && (
          <div className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">General Settings</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <label htmlFor="auto-detect" className="text-sm">
                    Enable Auto-Detection
                  </label>
                  <input
                    type="checkbox"
                    id="auto-detect"
                    checked={autoDetectEnabled}
                    onChange={(e) => setAutoDetect(e.target.checked)}
                    className="toggle-switch"
                  />
                </div>
                <div className="space-y-2">
                  <label htmlFor="max-recent" className="text-sm">
                    Max Recent Checks: {maxRecentChecks}
                  </label>
                  <Input
                    type="range"
                    id="max-recent"
                    min="10"
                    max="500"
                    step="10"
                    value={maxRecentChecks}
                    onChange={(e) => setMaxRecentChecks(Number(e.target.value))}
                  />
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
};

export default App;
