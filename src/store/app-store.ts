import { create } from "zustand";
import { persist } from "zustand/middleware";
import {
  AppState,
  GroupInfo,
  MembershipStatus,
  CheckQueueItem,
  UserInfo,
} from "../lib/types";
import { getMembershipRole } from "../lib/is-member-of-groups";
import { findFacebookInfo } from "../lib/find-facebook-info";

function isDefined<T>(value: T | null | undefined): value is T {
  return value !== null && value !== undefined;
}

interface AppStore extends AppState {
  // Actions
  addGroup: (group: GroupInfo) => void;
  removeGroup: (groupId: string) => void;
  updateGroup: (groupId: string, updates: Partial<GroupInfo>) => void;
  clearGroups: () => void;
  importGroups: (groups: GroupInfo[]) => void;

  addToQueue: (userNameOrId: string) => Promise<void>;
  removeFromQueue: (id: string) => void;
  processQueue: () => Promise<void>;

  addRecentCheck: (check: MembershipStatus) => void;
  clearRecentChecks: () => void;

  setAutoDetect: (enabled: boolean) => void;
  setMaxRecentChecks: (max: number) => void;

  // Bulk operations
  addMultipleUsersToQueue: (userIds: string[], groupIds: string[]) => void;
  checkSingleMembership: (
    userId: string,
    groupId: string,
    userInfoFromQueue?: UserInfo
  ) => Promise<MembershipStatus>;
  checkUserMembership: (userName: string) => Promise<UserInfo | null>;
}

// Check if extension context is valid
function isExtensionContextValid(): boolean {
  try {
    return !!(chrome && chrome.runtime && chrome.runtime.id && chrome.storage);
  } catch (error) {
    return false;
  }
}

// Chrome storage adapter with context validation
const chromeStorageAdapter: any = {
  getItem: async (name: string): Promise<string | null> => {
    if (!isExtensionContextValid()) {
      console.log("Extension context invalid, falling back to localStorage");
      try {
        return localStorage.getItem(name);
      } catch {
        return null;
      }
    }

    try {
      const result = await chrome.storage.local.get([name]);
      return result[name] || null;
    } catch (error) {
      console.error("Error getting from Chrome storage:", error);
      // Fallback to localStorage
      try {
        return localStorage.getItem(name);
      } catch {
        return null;
      }
    }
  },
  setItem: async (name: string, value: string): Promise<void> => {
    if (!isExtensionContextValid()) {
      console.log("Extension context invalid, falling back to localStorage");
      try {
        localStorage.setItem(name, value);
        return;
      } catch (error) {
        console.error("Error setting localStorage:", error);
        return;
      }
    }

    try {
      await chrome.storage.local.set({ [name]: value });
    } catch (error) {
      console.error("Error setting Chrome storage:", error);
      // Fallback to localStorage
      try {
        localStorage.setItem(name, value);
      } catch (fallbackError) {
        console.error("Error setting localStorage fallback:", fallbackError);
      }
    }
  },
  removeItem: async (name: string): Promise<void> => {
    if (!isExtensionContextValid()) {
      console.log("Extension context invalid, falling back to localStorage");
      try {
        localStorage.removeItem(name);
        return;
      } catch (error) {
        console.error("Error removing from localStorage:", error);
        return;
      }
    }

    try {
      await chrome.storage.local.remove([name]);
    } catch (error) {
      console.error("Error removing from Chrome storage:", error);
      // Fallback to localStorage
      try {
        localStorage.removeItem(name);
      } catch (fallbackError) {
        console.error(
          "Error removing from localStorage fallback:",
          fallbackError
        );
      }
    }
  },
};

export const useAppStore = create<AppStore>()(
  persist(
    (set, get) => ({
      // Initial state
      groups: [],
      recentChecks: [],
      queue: [],
      isProcessing: false,
      autoDetectEnabled: true,
      maxRecentChecks: 200,

      // Actions
      addGroup: (group) =>
        set((state) => ({
          groups: [...state.groups.filter((g) => g.id !== group.id), group],
        })),

      removeGroup: (groupId) =>
        set((state) => ({
          groups: state.groups.filter((g) => g.id !== groupId),
        })),

      clearGroups: () => set({ groups: [] }),

      importGroups: (groups) =>
        set((state) => {
          const groupMap = new Map(state.groups.map((g) => [g.id, g]));
          groups.forEach((g) => groupMap.set(g.id, g));
          return { groups: Array.from(groupMap.values()) };
        }),

      updateGroup: (groupId, updates) =>
        set((state) => ({
          groups: state.groups.map((g) =>
            g.id === groupId ? { ...g, ...updates } : g
          ),
        })),

      addToQueue: async (userNameOrId) => {
        const userInfo = await findFacebookInfo(userNameOrId);
        if (!userInfo) {
          if (isExtensionContextValid()) {
            chrome.runtime.sendMessage({
              type: "NOTIFICATION",
              title: "User Not Found",
              message: `Could not find user: ${userNameOrId}`,
            });
          }
          return;
        }

        const userId = userInfo.id;
        const state = get();
        const { groups, queue } = state;

        const newQueueItems: CheckQueueItem[] = groups
          .map((group): CheckQueueItem | null => {
            const existingItem = queue.find(
              (item) => item.userId === userId && item.groupId === group.id
            );
            if (existingItem) return null;

            return {
              id: `${userId}-${group.id}-${Date.now()}`,
              userId,
              groupId: group.id,
              priority: 0,
              addedAt: Date.now(),
              status: "PENDING",
              userInfo: userInfo,
            };
          })
          .filter(isDefined);

        if (newQueueItems.length > 0) {
          set({ queue: [...queue, ...newQueueItems] });
          if (!state.isProcessing) {
            get().processQueue();
          }
        }
      },

      removeFromQueue: (id) =>
        set((state) => ({
          queue: state.queue.filter((item) => item.id !== id),
        })),

      processQueue: async () => {
        const state = get();
        if (state.isProcessing) return;

        const pendingItems = state.queue.filter(
          (item) => item.status === "PENDING"
        );
        if (pendingItems.length === 0) return;

        set({ isProcessing: true });

        const BATCH_SIZE = 5;
        const itemsToProcess = pendingItems.slice(0, BATCH_SIZE);

        try {
          set((s) => ({
            queue: s.queue.map((q) =>
              itemsToProcess.some((i) => i.id === q.id)
                ? { ...q, status: "PROCESSING" }
                : q
            ),
          }));

          await Promise.all(
            itemsToProcess.map(async (item) => {
              try {
                await get().checkSingleMembership(
                  item.userId,
                  item.groupId,
                  item.userInfo
                );
                set((s) => ({
                  queue: s.queue.map((q) =>
                    q.id === item.id ? { ...q, status: "COMPLETED" } : q
                  ),
                }));
              } catch (error) {
                console.error("Error processing queue item:", item.id, error);
                set((s) => ({
                  queue: s.queue.map((q) =>
                    q.id === item.id ? { ...q, status: "ERROR" } : q
                  ),
                }));
              }
            })
          );
        } finally {
          set((s) => ({
            isProcessing: false,
            // Clean up completed items
            queue: s.queue.filter((q) => q.status !== "COMPLETED"),
          }));

          // If there are still items in the queue, process them
          if (get().queue.some((item) => item.status === "PENDING")) {
            setTimeout(() => get().processQueue(), 100);
          }
        }
      },

      addRecentCheck: (check) =>
        set((state) => {
          const filtered = state.recentChecks.filter(
            (c) => !(c.userId === check.userId && c.groupId === check.groupId)
          );
          const newChecks = [check, ...filtered].slice(
            0,
            state.maxRecentChecks
          );
          return { recentChecks: newChecks };
        }),

      clearRecentChecks: () => set({ recentChecks: [] }),

      setAutoDetect: (enabled) => set({ autoDetectEnabled: enabled }),

      setMaxRecentChecks: (max) => set({ maxRecentChecks: max }),

      addMultipleUsersToQueue: (userIds, groupIds) => {
        userIds.forEach((userId) => {
          groupIds.forEach((groupId) => {
            get().addToQueue(userId);
          });
        });
      },

      checkSingleMembership: async (
        userId,
        groupId,
        userInfoFromQueue?: UserInfo
      ) => {
        try {
          const [role, userInfo] = await Promise.all([
            getMembershipRole({ userId, groupId }),
            userInfoFromQueue
              ? Promise.resolve(userInfoFromQueue)
              : findFacebookInfo(userId).catch(() => null),
          ]);

          const group = get().groups.find((g) => g.id === groupId);

          const status: MembershipStatus = {
            userId,
            groupId,
            status: role,
            checkedAt: Date.now(),
            userInfo: userInfo || undefined,
            groupInfo: group,
          };

          get().addRecentCheck(status);
          return status;
        } catch (error) {
          console.error("Error checking membership:", error);
          const status: MembershipStatus = {
            userId,
            groupId,
            status: "ERROR" as const,
            checkedAt: Date.now(),
            userInfo: userInfoFromQueue,
          };
          get().addRecentCheck(status);
          return status;
        }
      },

      checkUserMembership: async (userName) => {
        const { groups, addRecentCheck } = get();
        if (groups.length === 0) {
          if (isExtensionContextValid()) {
            chrome.runtime.sendMessage({
              type: "NOTIFICATION",
              title: "No Groups Configured",
              message: "Add groups in the sidebar to check membership.",
            });
          }
          return null;
        }

        set({ isProcessing: true });

        try {
          const userInfo = await findFacebookInfo(userName);
          if (!userInfo) {
            if (isExtensionContextValid()) {
              chrome.runtime.sendMessage({
                type: "NOTIFICATION",
                title: "User Not Found",
                message: `Could not find info for user: ${userName}`,
              });
            }
            return null;
          }

          const userId = userInfo.id;

          // Add placeholder "CHECKING" statuses immediately for better UX
          groups.forEach((group) => {
            addRecentCheck({
              userId,
              groupId: group.id,
              status: "CHECKING",
              checkedAt: Date.now(),
              userInfo: userInfo,
              groupInfo: group,
            });
          });

          const checkPromises = groups.map((group) =>
            getMembershipRole({ userId, groupId: group.id })
              .then((role) => ({ group, role, error: null }))
              .catch((error) => ({
                group,
                role: "ERROR" as const,
                error,
              }))
          );

          const results = await Promise.all(checkPromises);

          for (const result of results) {
            const status: MembershipStatus = {
              userId,
              groupId: result.group.id,
              status: result.role as MembershipStatus["status"],
              checkedAt: Date.now(),
              userInfo: userInfo,
              groupInfo: result.group,
            };
            addRecentCheck(status);
          }

          if (isExtensionContextValid()) {
            chrome.runtime.sendMessage({
              type: "NOTIFICATION",
              title: "Check Complete",
              message: `Checked ${userInfo.name || userName} against ${
                groups.length
              } groups.`,
            });
          }
          return userInfo;
        } catch (error) {
          console.error("Error during membership check:", error);
          if (isExtensionContextValid()) {
            chrome.runtime.sendMessage({
              type: "NOTIFICATION",
              title: "Check Failed",
              message: `An error occurred while checking ${userName}.`,
            });
          }
          return null;
        } finally {
          set({ isProcessing: false });
        }
      },
    }),
    {
      name: "facebook-group-checker-store",
      storage: chromeStorageAdapter,
    }
  )
);
