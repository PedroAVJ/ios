import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { join } from "node:path";
import test from "node:test";

const root = new URL("..", import.meta.url).pathname;

async function text(path) {
  return readFile(join(root, path), "utf8");
}

test("Codex and Claude publish one synchronized private plugin", async () => {
  const codex = JSON.parse(await text(".codex-plugin/plugin.json"));
  const claude = JSON.parse(await text(".claude-plugin/plugin.json"));
  const packageJSON = JSON.parse(await text("package.json"));

  assert.equal(codex.name, "ios");
  assert.equal(codex.version, "0.1.2");
  assert.equal(claude.name, codex.name);
  assert.equal(claude.version, codex.version);
  assert.equal(packageJSON.version, codex.version);
  assert.equal(codex.interface.category, "Developer Tools");
  assert.equal(codex.interface.logo, "./assets/ios-plugin-icon.svg");
  assert.equal(codex.interface.composerIcon, codex.interface.logo);
  assert.equal(codex.skills, "./skills/");
  assert.equal(claude.skills, codex.skills);
});

test("the skill requires lossless framework boundaries", async () => {
  const skill = await text("skills/ios-development/SKILL.md");
  const api = await text(
    "skills/ios-development/references/api-selection.md",
  );
  const runtime = await text(
    "skills/ios-development/references/runtime-contracts.md",
  );

  assert.match(skill, /Prefer a throwing API, `Result`, typed delegate callback/);
  assert.match(skill, /immediately translate[\s\S]*app-owned error/);
  assert.match(skill, /throws\(Failure\)/);
  assert.match(skill, /Catch Apple's untyped `Error` at exactly one adapter/);
  assert.match(skill, /Switch exhaustively over the owned enum too/);
  assert.match(skill, /future SDK case makes the build fail/);
  assert.match(skill, /`@unchecked Sendable` as framework-boundary escape/);
  assert.match(skill, /Retry only a failure documented or observed to be transient/);
  assert.match(api, /reject APIs that collapse them into a[\s\S]*Boolean/);
  assert.match(api, /AVAudioSession\.ErrorCode\(rawValue: error\.code\)/);
  assert.match(api, /throws\(CaptureStartFailure\)/);
  assert.match(api, /@unknown default/);
  for (const appleCase of [
    "none",
    "mediaServicesFailed",
    "isBusy",
    "incompatibleCategory",
    "cannotInterruptOthers",
    "missingEntitlement",
    "siriIsRecording",
    "cannotStartPlaying",
    "cannotStartRecording",
    "badParam",
    "insufficientPriority",
    "resourceNotAvailable",
    "unspecified",
    "expiredSession",
    "sessionNotActive",
  ]) {
    assert.match(api, new RegExp(`\\.${appleCase}\\b`));
  }
  assert.match(runtime, /Swift type safety answers questions/);
  assert.match(runtime, /Unknown framework error[\s\S]*fail safely/);
  assert.doesNotMatch(`${skill}\n${api}\n${runtime}`, /\[TODO/);
});

test("audio and App Intent guidance preserves the typed foreground route", async () => {
  const skill = await text("skills/ios-development/SKILL.md");
  const audio = await text(
    "skills/ios-development/references/audio-app-intents.md",
  );

  assert.match(skill, /AVAudioEngine\.start\(\)/);
  assert.match(skill, /AVAudioRecorder\.record\(\)[\s\S]*returning `false`/);
  assert.match(skill, /\.foreground\(\.dynamic\)/);
  assert.match(skill, /continueInForeground/);
  assert.match(skill, /ForegroundContinuableIntent/);
  assert.match(audio, /cannotStartRecording.*561145187/);
  assert.match(audio, /`unspecified` \(`what`\)/);
  assert.match(audio, /Exhaustively switch over[\s\S]*\.unspecified/);
  assert.match(audio, /must not recursively request foreground again/);
  assert.match(audio, /do not compare magic numbers throughout the product/);
});

test("validation is digital and honest about simulator scope", async () => {
  const skill = await text("skills/ios-development/SKILL.md");
  const validation = await text(
    "skills/ios-development/references/digital-validation.md",
  );

  assert.match(
    skill,
    /Physical hardware\s+is not required to prove error classification/,
  );
  assert.match(validation, /Pure policy tests/);
  assert.match(validation, /Build-for-testing/);
  assert.match(validation, /Structural invariants/);
  assert.match(validation, /SWIFT_TREAT_WARNINGS_AS_ERRORS = YES/);
  assert.match(validation, /reject equality chains and catch-all/);
  assert.match(validation, /inject hardware\/policy outcomes/);
  assert.match(validation, /never make a physical device a prerequisite/);
  assert.match(
    validation,
    /never describe simulator success as proof of physical microphone/,
  );
});

test("the icon is original local artwork with recorded provenance", async () => {
  const icon = await text("assets/ios-plugin-icon.svg");
  const sources = await text("ICON-SOURCES.md");

  assert.match(icon, /^<svg/);
  assert.match(icon, /linearGradient/);
  assert.match(icon, /<path/);
  assert.match(sources, /original vector artwork/);
  assert.match(sources, /No Apple glyph/);
});
