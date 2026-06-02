export type BridgeRouteIdentity = {
  routeId: string;
  accountId: string;
  spaceKind: "dm" | "stream";
  spaceKey: string;
  spaceLabel: string;
  threadKey: string;
  threadLabel: string;
  owner?: string;
  activeAgents: string[];
  currentNodes: string[];
  sessionKeys: string[];
};

export type MusicFeedbackBundle = {
  routeId: string;
  summaryPath: string;
  audioPreviewPath: string;
  scorePaths: string[];
  provenancePath: string;
  publishedRefs: string[];
};

function uniqueStrings(values?: Array<string | undefined | null>): string[] {
  const seen = new Set<string>();
  const result: string[] = [];
  for (const value of values ?? []) {
    const trimmed = String(value ?? "").trim();
    if (!trimmed || seen.has(trimmed)) {
      continue;
    }
    seen.add(trimmed);
    result.push(trimmed);
  }
  return result;
}

export function sanitizeRouteSegment(raw: string): string {
  const normalized = String(raw ?? "")
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
  return normalized || "unknown";
}

export function buildBridgeRouteIdentity(params: {
  accountId: string;
  spaceKind: "dm" | "stream";
  spaceId: string;
  spaceLabel: string;
  threadLabel?: string | null;
  owner?: string;
  activeAgents?: string[];
  currentNodes?: string[];
  sessionKeys?: string[];
}): BridgeRouteIdentity {
  const accountId = String(params.accountId ?? "").trim();
  const spaceKind = params.spaceKind;
  const spaceId = String(params.spaceId ?? "").trim();
  const spaceLabel = String(params.spaceLabel ?? "").trim();
  const threadLabel = String(params.threadLabel ?? "").trim() || "general";
  const threadSegment = sanitizeRouteSegment(threadLabel);

  return {
    routeId: `zulip:${accountId}:${spaceKind}:${sanitizeRouteSegment(spaceId)}:thread:${threadSegment}`,
    accountId,
    spaceKind,
    spaceKey: `${spaceKind}:${spaceId}`,
    spaceLabel,
    threadKey: threadSegment === "general" ? "general" : `general:${threadSegment}`,
    threadLabel,
    owner: params.owner?.trim() || undefined,
    activeAgents: uniqueStrings(params.activeAgents),
    currentNodes: uniqueStrings(params.currentNodes),
    sessionKeys: uniqueStrings(params.sessionKeys),
  };
}

export function createMusicFeedbackBundle(params: {
  routeId: string;
  summaryPath: string;
  audioPreviewPath: string;
  scorePaths: string[];
  provenancePath: string;
  publishedRefs?: string[];
}): MusicFeedbackBundle {
  const routeId = String(params.routeId ?? "").trim();
  const summaryPath = String(params.summaryPath ?? "").trim();
  const audioPreviewPath = String(params.audioPreviewPath ?? "").trim();
  const provenancePath = String(params.provenancePath ?? "").trim();
  const scorePaths = uniqueStrings(params.scorePaths);
  const publishedRefs = uniqueStrings(params.publishedRefs);

  if (!routeId) {
    throw new Error("routeId is required");
  }
  if (!summaryPath) {
    throw new Error("summaryPath is required");
  }
  if (!audioPreviewPath) {
    throw new Error("audioPreviewPath is required");
  }
  if (scorePaths.length === 0) {
    throw new Error("scorePaths must contain at least one artifact");
  }
  if (!provenancePath) {
    throw new Error("provenancePath is required");
  }

  return {
    routeId,
    summaryPath,
    audioPreviewPath,
    scorePaths,
    provenancePath,
    publishedRefs,
  };
}
