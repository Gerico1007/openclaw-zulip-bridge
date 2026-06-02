# Multi-Agent Human Bridge

> **For Hermes:** Use this document as the overnight source of truth for research, extraction, and architecture writing. Treat it as prose code, not brainstorming notes.

**Goal:** Define a cross-platform, cross-session, cross-device collaboration system where humans and multiple agents can work together through a shared conversational surface, a live execution surface, and a durable artifact/memory surface.

**Architecture:** The bridge is not a single bot. It is a layered collaboration system. Zulip provides durable threaded coordination and human-readable continuity. tmux exposed through ttyd provides live operational presence and shared execution. Simexp provides external note and URL ingestion into durable artifacts. RISE from `jgwill/llms-txt` governs how the system is reverse-engineered and specified.

**Tech Stack:** Zulip, OpenClaw Zulip plugin patterns, tmux, ttyd, reverse proxy routing, Simplenote/public-note ingestion via Simexp, RISE / SpecLang guidance from `jgwill/llms-txt`.

---

## Desired Outcome

A human can open a single public or private collaboration entry point and:
- start or join a project conversation,
- see which agent or human is carrying which line of work,
- move naturally between async discussion and live terminal activity,
- receive immediate artifact feedback in the forms that matter for the lane, including audio previews and score/partition outputs for music work,
- preserve decisions, artifacts, and context across sessions and devices,
- recover work without losing lineage when a device, session, or model changes.

Multiple agents can:
- receive work through the same collaboration fabric,
- maintain traceable thread/session identity,
- publish artifacts back into the human conversation surface,
- hand work across devices and runtimes without losing context,
- expose their activity in ways humans can inspect, interrupt, or redirect.

## Current Reality

### Zulip / OpenClaw bridge
- `openclaw-zulip-bridge` already provides a strong Zulip transport and thread adapter.
- It normalizes Zulip DMs and stream/topic conversations into routable identities.
- It persists queue state, deduplicates events, and replies back into the same conversational context.
- It is already close to a control and history layer.

### tmux / ttyd / routing
- Existing tmux sessions show active bridge thinking and operational orchestration.
- `ngrok-mux/README.md` documents a working pattern where:
  - `/` serves Zulip
  - `/terminal` serves ttyd attached to tmux
- This already expresses the live execution surface needed for collaborative presence.

### Simexp
- Simexp currently acts as a narrow ingestion/archive tool.
- It can fetch content from shared/public note URLs and save Markdown artifacts by day.
- It is useful as an ingestion edge, but it is not yet a collaboration bus or shared memory system.

### RISE / llms-txt
- `jgwill/llms-txt` provides the language discipline for reverse-engineering and specification writing.
- The most important correction is conceptual:
  - do not describe the work as “bridging the gap” or “filling the gap”
  - describe the tension between **Current Reality** and **Desired Outcome** and the structures that naturally resolve that tension.

---

## Structural Patterns Worth Preserving

### From Zulip
- stream + topic as durable collaborative identity,
- human-readable asynchronous history,
- reply continuity inside the same topic,
- access policies and role-aware message gating,
- persistent queue state for resilience across restarts.

### From tmux
- terminal state as a visible workbench,
- long-lived sessions for agents and humans,
- explicit pane/session naming as operational memory,
- the ability to attach, observe, and resume live work.

### From ttyd / shared browser terminal
- browser-accessible operational surface,
- one host exposing both discussion and execution,
- no forced switch into SSH-only workflows for observers.

### From Simexp
- external note capture into durable markdown artifacts,
- date-based archival habit,
- low-friction ingestion from shared note/public URL workflows.

### From Forest / Assembly practice
- device-aware orchestration,
- human stewardship over agent work,
- collaborator handoffs that remain legible to humans,
- bilingual or multi-register communication when useful,
- immediate perceptual feedback loops, especially audio previews and visual score artifacts for music-oriented lanes.

---

## Bridge Invariants

These are the minimum structural commitments that keep the bridge coherent across tools and nodes.

1. **One lane, many surfaces:** one collaborative lane may appear in Zulip, tmux, ttyd, and artifact storage, but it must keep one canonical identity.
2. **Async and live are peers:** Zulip is not a notification afterthought for terminal work, and tmux is not a hidden back room. Both are first-class surfaces of the same lane.
3. **Adapters stay narrow:** Zulip handles conversation transport, tmux handles execution presence, ttyd handles browser terminal exposure, and Simexp handles ingestion/archive. None should silently absorb the responsibilities of the others.
4. **Human-readable continuity wins:** every live or durable surface should point back to the lane in terms a human can follow.
5. **Per-node execution is explicit:** execution state may move between Eury, Larix, Tilia, or later nodes, but node changes must appear as continuation within one route, not as a new unnamed lane.
6. **Artifacts are publishable, not merely saved:** an artifact is incomplete until the bridge can identify where it came from, what route it belongs to, and where humans were told about it.

---

## Creative Advancement Scenarios

### Creative Advancement Scenario: Human opens a project lane and agents join
**Desired Outcome:** A human opens one collaboration lane and sees async discussion, live execution, and resulting artifacts stay aligned.

**Current Reality:** Zulip topics, tmux sessions, and note artifacts exist, but they are only partially linked and require manual mental stitching.

**Natural Progression:** The bridge assigns one canonical route identity to the work item, maps that identity to a Zulip topic, a tmux workspace, and an artifact trail, then makes each surface point to the others.

**Resolution:** The human experiences one coherent project lane instead of separate tools.

### Creative Advancement Scenario: An agent hands work from one device/runtime to another
**Desired Outcome:** An agent working on one node can hand off work to another node without losing context, thread identity, or artifact lineage.

**Current Reality:** Device-specific sessions and naming exist, but routing and provenance are implicit.

**Natural Progression:** The bridge carries canonical route metadata including node, actor, session, topic, and artifact references across surfaces.

**Resolution:** Device changes feel like continuation, not restart.

### Creative Advancement Scenario: External notes become first-class project memory
**Desired Outcome:** Shared note content enters the collaboration fabric as durable, attributable, retrievable project context.

**Current Reality:** Simexp can archive note URLs, but the results are not yet normalized into the broader collaboration model.

**Natural Progression:** Simexp becomes an ingestion adapter that emits artifacts with canonical metadata and posts those artifacts back into the active collaboration lane.

**Resolution:** External notes become visible project memory rather than side files.

---

## Screens

### Collaboration Surface
The primary human-facing conversation surface.
- **Behavior:** Hosts project discussions, collaborator handoffs, approvals, agent summaries, and artifact announcements.
- **Layout:** Usually manifests as Zulip streams and topics.

### Live Execution Surface
The surface where humans and agents observe or perform active terminal work.
- **Behavior:** Exposes running sessions, logs, commands, and resumable workspaces.
- **Layout:** Usually manifests as tmux sessions rendered locally or through ttyd.

### Artifact Surface
The durable surface where extracted notes, generated specs, media, and archives persist.
- **Behavior:** Stores canonical artifacts, metadata, and references back to the collaboration lane.
- **Layout:** File-backed markdown/json artifacts first, with future room for indexed storage.
- **Feedback expectation:** For music-oriented or sensory work, artifact publication should include immediate playable/listenable feedback when possible, not just text links.

## Components

### Canonical Route Identity
Defines the shared identity of one collaborative lane.
- **Behavior:** Assigns a stable route key across discussion, execution, and artifacts.
- **Boundary:** Owns lane identity only. It does not fetch messages, open tmux, proxy ttyd, or write artifacts.
- **Layout:** Includes `account`, `space`, `thread`, `node`, `actor`, and `session` semantics.

### Zulip Transport Adapter
Turns Zulip messages into normalized bridge events and normalized bridge replies into Zulip messages.
- **Behavior:** Receives DMs and stream/topic events, derives thread/session identity, enforces policies, and publishes replies/artifacts back into the same lane.
- **Boundary:** Owns conversation transport, policy gating, attachment intake, and reply publication. It should not invent tmux topology or artifact schemas.
- **Layout:** Based on `openclaw-zulip-bridge` monitor, send, reply, and normalize layers.

### tmux Presence Adapter
Makes live execution state part of the collaboration fabric.
- **Behavior:** Maps route identities to tmux sessions/windows/panes, exposes current execution state, and links terminal work back to the collaboration lane.
- **Boundary:** Owns terminal lifecycle, naming, capture, and attach/resume semantics. It should not become the source of truth for async thread history.
- **Layout:** Session and pane naming should carry canonical route identity.

### ttyd Surface Adapter
Publishes selected tmux workspaces into browser-accessible terminals.
- **Behavior:** Makes live sessions visible to humans without requiring direct SSH.
- **Boundary:** Owns browser exposure and auth surface only. It should point at tmux, not replace tmux's session model.
- **Layout:** Mounted under `/terminal` or equivalent path on the same hostname as the collaboration surface.

### Simexp Ingestion Adapter
Converts external note/public URL content into durable artifacts.
- **Behavior:** Fetches note content, normalizes it to Markdown, attaches provenance metadata, and emits artifact references into the active lane.
- **Boundary:** Owns import and archive mechanics. It should not own route resolution, live execution, or conversation policy.
- **Layout:** Starts file-based and metadata-light, then grows into a structured artifact emitter.

### Handoff and Review Layer
Preserves human stewardship and collaborator visibility.
- **Behavior:** Posts explicit handoffs, questions, reviews, and completion notes in human-readable form.
- **Layout:** Initially Zulip topic messages with stable templates.

### Trace and Provenance Layer
Records who did what, where, and why.
- **Behavior:** Links messages, agent runs, terminals, artifacts, and decisions into one auditable story.
- **Layout:** Starts with lightweight frontmatter/JSON sidecars; can later align with richer observation tracing.

---

## Canonical Mapping Model

### Route identity levels

The bridge needs one canonical lane identity and several derived execution/publication identities.

1. **Lane identity** — stable across async discussion, live execution, and durable artifacts.
2. **Execution identity** — one lane on one node in one tmux workspace.
3. **Publication identity** — the browser-visible or artifact-visible references that point humans back into the lane.

### Normalized lane mapping

| Concern | Current Reality | Desired bridge convention |
|---|---|---|
| Zulip account | `account.accountId` in the plugin runtime | `account_id` is a first-class field in every lane and event |
| Space kind | `private` or stream message in Zulip | `space_kind` = `dm` or `stream` |
| Space key | sender email for DMs; `stream_id`/stream name for streams | `space_key` is stable and machine-facing; human labels remain separate |
| Thread key | Zulip topic, defaulting to `general` | `thread_key` always exists, with `general` treated as explicit current reality rather than omitted |
| Session key | plugin builds `route.sessionKey` or falls back to `zulip:<account>:<channelId>`, then appends `:thread:<topic>` for non-default topics | lane metadata stores both the canonical lane identity and any runtime-specific `session_key` values |
| Node | often implicit in tmux practice | every execution record carries an explicit node |

### Concrete tmux mapping convention

This is the recommended desired convention for the bridge, not a claim that it is implemented already.

- **One tmux session per `route_id` × node**
- **Session name:** `bridge.<node>.<route_slug>`
- **Window 0:** `coordination` — lane summary, recent handoff notes, quick commands
- **Window 1..n:** actor windows such as `human`, `codex`, `claude`, `simexp`, `publish`
- **Pane titles:** actor or subtask labels, never anonymous shells

Example desired mapping for a Zulip stream/topic lane:

```text
route_id: zulip.main.stream.42.topic.multi-agent-human-bridge
execution_id: zulip.main.stream.42.topic.multi-agent-human-bridge@eury
tmux session: bridge.eury.multi-agent-human-bridge
tmux windows: coordination | codex | publish
ttyd surface: /terminal/ -> selected tmux session bridge.eury.multi-agent-human-bridge
```

### ttyd route mapping

Verified current reality from `ngrok-mux/README.md`:
- `/` is reserved for Zulip
- `/terminal/` proxies to ttyd with `--base-path /terminal`
- the prototype ttyd command currently auto-attaches to one named tmux session (`salix-cursor`)

Therefore the bridge should separate:
- **public route path** — currently shared as `/terminal/`
- **selected tmux session** — currently chosen by ttyd startup command or future selector logic

Until route-aware ttyd selection exists, `surface_url` should refer to the shared `/terminal/` surface and pair it with explicit tmux session metadata rather than pretending each lane already has its own URL.

---

## Data

### RouteIdentity
A canonical collaboration identity.
- `route_id`: stable project-lane identifier
- `account_id`: Zulip/OpenClaw account scope when applicable
- `space_kind`: `dm` or `stream`
- `space_key`: machine-stable parent context identifier
- `space_label`: human-readable stream or peer label
- `thread_key`: canonical topic/thread key, explicit even when `general`
- `thread_label`: human-readable topic display value
- `owner`: human steward or owning role
- `active_agents`: current assigned agents or runtimes
- `current_nodes`: nodes presently hosting execution for this lane
- `session_keys`: runtime-specific session keys already in use for this lane

### BridgeEvent
Normalized inbound or outbound unit of activity.
- `event_id`
- `route_id`
- `account_id`
- `origin_surface`
- `origin_ref`
- `origin_message_id`
- `actor_type` (`human`, `agent`, `system`)
- `actor_id`
- `actor_label`
- `created_at`
- `content`
- `attachments`
- `status`
- `session_key`
- `parent_session_key`

### ZulipInboundContract
The minimum verified inbound contract already visible in `openclaw-zulip-bridge`.
- `From` — `zulip:<email>` for DMs or `zulip:channel:<channelId>` for streams
- `To` — `user:<email>` for DMs or `stream:<streamNameOrId>:<topic>` for stream replies
- `SessionKey` — base route session key, with `:thread:<topic>` suffix for non-`general` topics
- `ParentSessionKey` — preserved when a thread-specific session derives from a broader route key
- `AccountId`
- `ChatType` — `direct` or `channel`
- `ConversationLabel`
- `GroupSubject` / `GroupChannel` for stream messages
- `SenderName` / `SenderId`
- `MessageSid`
- `ReplyToId` / `MessageThreadId` when topic is not `general`
- `Timestamp`
- `WasMentioned`
- `CommandAuthorized`
- `MediaPath` / `MediaPaths` / `MediaUrl` / `MediaUrls` / `MediaType` / `MediaTypes`

### ZulipOutboundContract
The minimum verified outbound contract already visible in `openclaw-zulip-bridge`.
- target syntax supports `user:<email>` and `stream:<stream>[:topic]`
- topic override may be extracted from message content before send
- reply publication preserves the existing lane by sending back to the same resolved `To` target
- topic override is truncated to 60 characters before outbound send

### ArtifactRecord
Durable record of a generated or imported artifact.
- `artifact_id`
- `route_id`
- `account_id`
- `artifact_type`
- `source_url`
- `local_path`
- `created_at`
- `created_by`
- `node`
- `summary`
- `related_message_refs`
- `source_session_key`
- `published_to`
- `provenance_sidecar`

### MusicFeedbackBundle
Minimum first-class publication bundle for music-oriented lanes.
- `route_id`
- `summary_path` — concise human-readable description of what changed
- `audio_preview_path` — playable preview such as `.wav`, `.mp3`, or voice-note-friendly audio
- `score_paths` — one or more score artifacts such as `.musicxml`, `.pdf`, or `.png`
- `provenance_path` — metadata sidecar linking the bundle to messages, sessions, and generating actors
- `published_refs` — message/topic refs where the bundle was announced back to humans

### ExecutionRecord
State snapshot for live work.
- `execution_id`
- `route_id`
- `node`
- `tmux_session`
- `window`
- `pane`
- `surface_url`
- `surface_kind` (`local_tmux`, `ttyd`)
- `status`
- `last_seen_at`
- `actors_present`
- `route_session_key`

---

## Verified Local Contracts and Constraints

### Verified from `openclaw-zulip-bridge`
- The plugin treats Zulip as a threaded chat surface with `chatTypes: ["direct", "channel", "group", "thread"]` and thread support enabled.
- The monitor asserts health immediately with `statusSink({ running: true, connected: true })`, confirming that runtime liveness is a first-class contract.
- Inbound stream messages use the topic as thread identity and append `:thread:<topic>` to the session key for non-default topics.
- The reply path sends back to `user:<email>` or `stream:<stream>:<topic>` targets, keeping publication inside the originating lane.
- Fallback artifact replay matches on session key prefixes, which means the bridge already has a weak but real notion of lane continuity across runtime artifacts.

### Verified from `ngrok-mux`
- The live prototype keeps Zulip at `/` and ttyd at `/terminal/` under the same host.
- ttyd supports a subpath deployment through `--base-path /terminal`.
- The current prototype exposes one tmux attachment target at a time, so route-aware multiplexing remains future work rather than current reality.

### Verified from `Simexp`
- Simexp is currently a fetch-process-save pipeline, not a collaboration bus.
- It reads configured sources or clipboard-derived sources, fetches note content, processes HTML into Markdown, and writes date-organized files.
- The current archive writer persists Markdown files only; it does not yet emit route metadata, provenance sidecars, or publication callbacks.

---

## Human-in-the-Loop Boundaries

Human stewardship remains mandatory when:
- collaborator-facing interpretations are posted as settled fact,
- routing affects public/project-visible surfaces,
- agent work changes the intended direction of a project,
- generated artifacts are elevated into reference specs or official handoffs,
- evaluation touches human aspiration, meaning, or collaborator judgment.

The bridge should make intervention natural:
- humans can interrupt,
- humans can redirect an agent lane,
- humans can request clarification,
- humans can approve or reject publication of major artifacts.

---

## Overnight Extraction Tasks

### Task 1: Formalize canonical route identity
**Objective:** Define the smallest stable shared identity linking Zulip topics, tmux sessions, and artifacts.

**Files:**
- Modify: `BRIDGE-RISE-SPEC.md`
- Create later if implementation starts: `src/bridge/route-identity.ts`

**Verification:**
- One route identity can name one Zulip topic, one tmux workspace, and one artifact trail without ambiguity.

### Task 2: Extract the Zulip transport contract
**Objective:** Identify the exact inbound/outbound bridge contract implicit in `openclaw-zulip-bridge`.

**Files:**
- Read: `src/channel.ts`
- Read: `src/zulip/monitor.ts`
- Read: `src/zulip/send.ts`
- Read: `src/zulip/reply-handler.ts`

**Verification:**
- The contract can be restated without implementation-specific language.

### Task 3: Define tmux naming and linking conventions
**Objective:** Turn existing tmux practice into explicit bridge semantics.

**Files:**
- Modify: `BRIDGE-RISE-SPEC.md`
- Read: `/home/gmusic/salix/production/ngrok-mux/README.md`

**Verification:**
- A human can infer the live execution surface from the collaboration lane, and vice versa.

### Task 4: Reframe Simexp as an ingestion adapter
**Objective:** Specify the narrow role Simexp should play in the bridge.

**Files:**
- Read: `/home/gmusic/salix/repos/ea/simexp/simexp/simex.py`
- Read: `/home/gmusic/salix/repos/ea/simexp/simexp/archiver.py`
- Read: `/home/gmusic/salix/repos/ea/simexp/simexp/processor.py`

**Verification:**
- Simexp is described as ingestion + artifact creation, not as the whole collaboration system.

### Task 5: Add trace/provenance minimums
**Objective:** Define the smallest viable metadata layer for route, execution, artifact continuity, and human-facing publication bundles.

**Files:**
- Modify: `BRIDGE-RISE-SPEC.md`

**Verification:**
- Humans can recover who did what, where, and when after a session/device/model change.
- Music-oriented lanes can publish a minimum bundle containing summary, audio preview, score artifact, and provenance metadata.

---

## Source Pointers

### Local repos and docs
- `openclaw-zulip-bridge/src/channel.ts`
- `openclaw-zulip-bridge/src/zulip/monitor.ts`
- `openclaw-zulip-bridge/src/zulip/monitor-helpers.ts`
- `openclaw-zulip-bridge/src/zulip/send.ts`
- `openclaw-zulip-bridge/src/zulip/reply-handler.ts`
- `openclaw-zulip-bridge/src/zulip/fallback-reader.ts`
- `/home/gmusic/salix/production/ngrok-mux/README.md`
- `/home/gmusic/salix/repos/ea/simexp/README.md`
- `/home/gmusic/salix/repos/ea/simexp/simexp/simex.py`
- `/home/gmusic/salix/repos/llms-txt/llms-rise-framework.txt`
- `/home/gmusic/salix/repos/llms-txt/skills/rise-specification/SKILL.md`
- `/home/gmusic/salix/repos/llms-txt/llms-structural-tension-charts.txt`
- `/home/gmusic/salix/repos/llms-txt/counter_articles/agent-loop-architectures-counter-article.md`

### Terminology constraints from llms-txt
- Prefer **Current Reality** and **Desired Outcome**.
- Avoid “bridging the gap”, “filling the gap”, and similar force-based language.
- Treat specifications as autonomous prose code, not comments on the current codebase.
- Preserve advancing patterns and beloved qualities during reverse-engineering.

---

## Testing Ledger

### What changed
- Created a dedicated branch for this bridge work.
- Wrote an initial RISE-oriented architecture/spec document inside the fork.
- Anchored the document in Zulip, tmux/ttyd, Simexp, and llms-txt guidance.
- Sharpened component boundaries so Zulip, tmux, ttyd, Simexp, and provenance each keep a narrow role.
- Added a concrete mapping model for route identity, node-scoped execution identity, tmux naming, and ttyd exposure.
- Added verified inbound/outbound Zulip contracts and tightened the minimum data schema.

### What was verified
- Branch exists on the fork and tracks origin.
- Local tmux sessions expose active bridge/orchestration clues.
- `openclaw-zulip-bridge` passes its validation pipeline.
- `jgwill/llms-txt` was cloned locally and queried through Context7.
- `openclaw-zulip-bridge` currently derives session keys from Zulip account/channel identity and adds topic-derived thread suffixes for non-`general` topics.
- `openclaw-zulip-bridge` sends replies to `user:<email>` and `stream:<stream>:<topic>` targets and truncates topic overrides to 60 characters.
- `ngrok-mux` currently mounts ttyd only at `/terminal/` and its prototype binds ttyd to a single tmux attachment target.
- `Simexp` currently archives fetched content into dated Markdown files without route-aware provenance metadata.

### What remains unverified
- No implementation modules for canonical route identity exist yet.
- No route-aware ttyd selector or per-lane terminal publication surface has been implemented yet.
- No formal route-to-tmux convention has been encoded in automation yet.
- Simexp has not been upgraded into a metadata-emitting ingestion adapter yet.
- No unified trace/provenance schema has been implemented yet.
- No bridge controller currently creates or reconciles `RouteIdentity`, `ExecutionRecord`, and `ArtifactRecord` instances across repos.

### Risks
- The strongest current bridge behavior exists as patterns spread across tools rather than one explicit shared core.
- Simexp source quality is rough and should be treated as an extraction candidate, not a ready foundation.
- Multi-account / multi-node monitoring will need explicit treatment if the bridge broadens beyond a single Zulip account surface.
