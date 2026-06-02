import assert from "node:assert";
import { describe, test } from "node:test";

import {
  buildBridgeRouteIdentity,
  createMusicFeedbackBundle,
  sanitizeRouteSegment,
} from "../src/bridge/route-identity.ts";

describe("sanitizeRouteSegment", () => {
  test("normalizes mixed punctuation into stable lowercase slugs", () => {
    assert.strictEqual(sanitizeRouteSegment("  Jean Guillaume / Morning Bridge!  "), "jean-guillaume-morning-bridge");
  });

  test("falls back to unknown when input has no usable characters", () => {
    assert.strictEqual(sanitizeRouteSegment("   ///   "), "unknown");
  });
});

describe("buildBridgeRouteIdentity", () => {
  test("creates a canonical route id for a stream topic and preserves human labels", () => {
    const route = buildBridgeRouteIdentity({
      accountId: "jamai",
      spaceKind: "stream",
      spaceId: "42",
      spaceLabel: "collab-enhancements",
      threadLabel: "Morning Bridge",
      owner: "Jerry",
      activeAgents: ["JamAI", "Synth", "JamAI"],
      currentNodes: ["Eury", "Eury", "Larix"],
      sessionKeys: ["zulip:jamai:42", "zulip:jamai:42:thread:Morning Bridge", "zulip:jamai:42"],
    });

    assert.deepStrictEqual(route, {
      routeId: "zulip:jamai:stream:42:thread:morning-bridge",
      accountId: "jamai",
      spaceKind: "stream",
      spaceKey: "stream:42",
      spaceLabel: "collab-enhancements",
      threadKey: "general:morning-bridge",
      threadLabel: "Morning Bridge",
      owner: "Jerry",
      activeAgents: ["JamAI", "Synth"],
      currentNodes: ["Eury", "Larix"],
      sessionKeys: ["zulip:jamai:42", "zulip:jamai:42:thread:Morning Bridge"],
    });
  });

  test("makes the general topic explicit for dm lanes", () => {
    const route = buildBridgeRouteIdentity({
      accountId: "jamai",
      spaceKind: "dm",
      spaceId: "jean@example.com",
      spaceLabel: "Jean-Guillaume",
    });

    assert.deepStrictEqual(route, {
      routeId: "zulip:jamai:dm:jean-example-com:thread:general",
      accountId: "jamai",
      spaceKind: "dm",
      spaceKey: "dm:jean@example.com",
      spaceLabel: "Jean-Guillaume",
      threadKey: "general",
      threadLabel: "general",
      owner: undefined,
      activeAgents: [],
      currentNodes: [],
      sessionKeys: [],
    });
  });
});

describe("createMusicFeedbackBundle", () => {
  test("builds the minimum human-facing artifact bundle", () => {
    const bundle = createMusicFeedbackBundle({
      routeId: "zulip:jamai:stream:42:thread:morning-bridge",
      summaryPath: "artifacts/summary.md",
      audioPreviewPath: "artifacts/preview.ogg",
      scorePaths: ["artifacts/score.musicxml", "artifacts/score.png", "artifacts/score.musicxml"],
      provenancePath: "artifacts/artifact.json",
      publishedRefs: ["zulip:stream:collab-enhancements:Morning Bridge:101", "zulip:stream:collab-enhancements:Morning Bridge:101"],
    });

    assert.deepStrictEqual(bundle, {
      routeId: "zulip:jamai:stream:42:thread:morning-bridge",
      summaryPath: "artifacts/summary.md",
      audioPreviewPath: "artifacts/preview.ogg",
      scorePaths: ["artifacts/score.musicxml", "artifacts/score.png"],
      provenancePath: "artifacts/artifact.json",
      publishedRefs: ["zulip:stream:collab-enhancements:Morning Bridge:101"],
    });
  });

  test("rejects bundles without an audio preview", () => {
    assert.throws(
      () => createMusicFeedbackBundle({
        routeId: "zulip:jamai:stream:42:thread:morning-bridge",
        summaryPath: "artifacts/summary.md",
        audioPreviewPath: "   ",
        scorePaths: ["artifacts/score.png"],
        provenancePath: "artifacts/artifact.json",
      }),
      /audioPreviewPath is required/,
    );
  });
});
