export interface UserInfo {
  id: string;
  name: string | null;
  alternateName: string | null;
  gender: string | null;
  url: string | null;
  images: {
    cover: string | null;
    avatar: string | null;
  };
}

export interface GroupInfo {
  id: string;
  name: string;
  url: string;
  avatar?: string;
}

export type MembershipRole = "MEMBER" | "ADMIN" | "MODERATOR" | "NOT_MEMBER";

export interface MembershipStatus {
  userId: string;
  groupId: string;
  status: MembershipRole | "ERROR" | "CHECKING";
  checkedAt: number;
  userInfo?: UserInfo;
  groupInfo?: GroupInfo;
}

export interface CheckQueueItem {
  id: string;
  userId: string;
  groupId: string;
  priority: number;
  addedAt: number;
  status: "PENDING" | "PROCESSING" | "COMPLETED" | "ERROR";
  userInfo?: UserInfo;
}

export interface AppState {
  groups: GroupInfo[];
  recentChecks: MembershipStatus[];
  queue: CheckQueueItem[];
  isProcessing: boolean;
  autoDetectEnabled: boolean;
  maxRecentChecks: number;
}
