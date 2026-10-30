#!/usr/bin/env python3
"""Original ElevenLabs voice and verbatim guide narration; never logs API keys.

Run through lexar.py qa with ELEVENLABS_API_KEY injected by EnvHub.
API docs checked 2026-10-30: text-to-voice/design, text-to-voice,
text-to-speech/convert, user/subscription/get at elevenlabs.io/docs/api-reference.
"""

from __future__ import annotations

import argparse
import base64
import hashlib
import json
import os
from pathlib import Path
import re
import shutil
import subprocess
import sys
from datetime import datetime, timezone
from urllib import error, parse, request

ROOT = Path(__file__).resolve().parents[1]
API = "https://api.elevenlabs.io"
VOICE_NAME = "Брат Лоренцо · Голос Валлетты"
DESIGN_MODEL = "eleven_multilingual_ttv_v2"
TTS_MODEL = "eleven_multilingual_v2"
DESCRIPTION = (
    "An entirely original fictional male narrator, about 55 years old. "
    "A warm, low, resonant baritone with gentle grain and quiet authority. "
    "Speaks fluent, clearly articulated native Russian, with only a faint "
    "Mediterranean warmth in the timbre, never a caricatured foreign accent. "
    "Calm, intimate historical walking-tour narration: measured natural pace, "
    "restrained theatrical gravity, a subtle sense of mystery, humane and reassuring. "
    "The voice of an imagined brother of the Order of Saint John, not a real person. "
    "Clean studio speech, close and intelligible, without whispers, shouting, "
    "music, sound effects, exaggerated villainy or imitation of any real person."
)
PREVIEW_TEXT = (
    "Добро пожаловать в Валлетту. Я — брат Лоренцо, вымышленный голос нашей прогулки. "
    "Перед нами город светлого камня, узких улиц и глубоких теней. Не спешите: "
    "прислушайтесь к шагам, к ветру, к далёкому звону колокола. Мы будем смотреть "
    "внимательно и говорить спокойно. Историю я назову историей, а легенду — легендой. "
    "Пусть у этой прогулки будет свой тихий ритм, и у каждого поворота — время для взгляда."
)
SETTINGS = {
    "stability": 0.67,
    "similarity_boost": 0.75,
    "style": 0.16,
    "use_speaker_boost": True,
    "speed": 0.96,
}


def now():
    return datetime.now(timezone.utc).isoformat()


def digest(value):
    return hashlib.sha256(value if isinstance(value, bytes) else value.encode("utf-8")).hexdigest()


def write_json(path, value):
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text(json.dumps(value, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")


def artifact_dir(value=None):
    selected = value or os.environ.get("QA_OUTPUT")
    if not selected:
        raise RuntimeError("Run via lexar.py qa or provide --output under the artifacts root.")
    selected = Path(selected).expanduser().resolve()
    roots = [Path("/Volumes/Lexar 4TB/artifacts"), Path.home() / "lexar-artifacts"]
    if not any(selected == base or base in selected.parents for base in roots):
        raise RuntimeError("API payloads and QA evidence must stay under Lexar artifacts or ~/lexar-artifacts.")
    if str(selected).startswith("/Volumes/") and not Path("/Volumes/Lexar 4TB").is_mount():
        raise RuntimeError("The original Lexar volume is unavailable; no replacement directory created.")
    selected.mkdir(parents=True, exist_ok=True)
    return selected


def api_call(method, endpoint, folder, payload=None, binary=False):
    key = os.environ.get("ELEVENLABS_API_KEY")
    if not key:
        raise RuntimeError("ELEVENLABS_API_KEY is missing; inject it with envhub use impresme.")
    folder.mkdir(parents=True, exist_ok=True)
    write_json(folder / "request.json", {"method": method, "endpoint": endpoint, "body": payload})
    headers = {"xi-api-key": key, "Accept": "audio/mpeg" if binary else "application/json"}
    data = None
    if payload is not None:
        headers["Content-Type"] = "application/json"
        data = json.dumps(payload, ensure_ascii=False).encode("utf-8")
    req = request.Request(API + endpoint, data=data, headers=headers, method=method)
    try:
        with request.urlopen(req, timeout=240) as response:
            body = response.read()
            metadata = {k.lower(): v for k, v in response.headers.items() if k.lower() in {
                "request-id", "x-request-id", "history-item-id", "character-cost", "x-character-cost",
                "x-characters-used", "x-credits-used", "content-type", "content-length", "date",
            }}
            write_json(folder / "response-headers.json", metadata)
            if binary:
                if "audio" not in metadata.get("content-type", ""):
                    raise RuntimeError("ElevenLabs returned a non-audio response; no MP3 published.")
                return body, metadata
            value = json.loads(body)
            write_json(folder / "response.json", value)
            return value, metadata
    except error.HTTPError as exc:
        detail = exc.read().decode("utf-8", errors="replace").replace(key, "[REDACTED]")
        (folder / "error.txt").write_text(detail, encoding="utf-8")
        raise RuntimeError(f"ElevenLabs HTTP {exc.code}; sanitized detail saved in {folder / 'error.txt'}") from None
    except (error.URLError, TimeoutError) as exc:
        raise RuntimeError(
            f"ElevenLabs request failed ({type(exc).__name__}); inspect saved state before retrying a paid POST."
        ) from None


def subscription(folder):
    value, _ = api_call("GET", "/v1/user/subscription", folder)
    allowed = ["tier", "status", "character_count", "character_limit", "voice_slots_used", "voice_limit",
               "can_extend_character_limit", "can_extend_voice_limit", "max_credit_limit_extension", "current_overage"]
    return {name: value[name] for name in allowed if name in value}


def probe(path, evidence=None):
    result = subprocess.run([
        "ffprobe", "-v", "error", "-select_streams", "a:0", "-show_entries",
        "stream=codec_name,sample_rate,channels:format=duration,size", "-of", "json", str(path),
    ], check=True, capture_output=True, text=True)
    info = json.loads(result.stdout)
    stream = info["streams"][0]
    duration = float(info["format"]["duration"])
    if stream.get("codec_name") != "mp3" or duration <= 1 or path.stat().st_size < 1000:
        raise RuntimeError(f"Invalid MP3: {path.name}")
    if evidence:
        write_json(evidence, info)
    return round(duration, 3)


def load_guide(path):
    raw = path.read_bytes()
    guide = json.loads(raw)
    stops = guide["stops"]
    if sorted(stop["id"] for stop in stops) != list(range(1, 14)):
        raise RuntimeError("Expected exactly thirteen unique stop IDs, 1–13.")
    for stop in stops:
        if not re.fullmatch(r"[a-z0-9]+(?:-[a-z0-9]+)*", stop["slug"]):
            raise RuntimeError(f"Unsafe stop slug for stop {stop['id']}")
        if not isinstance(stop.get("narration"), str) or len(stop["narration"].strip()) < 100:
            raise RuntimeError(f"Narration is not ready for stop {stop['id']}")
    return guide, raw


def narration_hash(stops):
    return digest(json.dumps({str(s["id"]): s["narration"] for s in stops}, ensure_ascii=False, sort_keys=True))


def track_paths(output, stop, voice):
    basename = f"{stop['id']:02}-{stop['slug']}"
    version = digest(json.dumps({"text": stop["narration"], "voiceId": voice["voiceId"],
                                 "model": TTS_MODEL, "settings": SETTINGS}, ensure_ascii=False, sort_keys=True))[:16]
    folder = output / "tracks" / basename / version
    return basename, folder, folder / f"{basename}.mp3", folder / "track.json"


def checkpoint(output, stop, voice):
    _, _, mp3, metadata_path = track_paths(output, stop, voice)
    if not metadata_path.exists() or not mp3.exists():
        return None
    previous = json.loads(metadata_path.read_text(encoding="utf-8"))
    if (previous.get("narrationSha256") == digest(stop["narration"])
            and previous.get("voiceId") == voice["voiceId"] and previous.get("model") == TTS_MODEL
            and previous.get("voiceSettings") == SETTINGS
            and previous.get("audioSha256") == digest(mp3.read_bytes())):
        return previous
    return None


def status(args):
    output = artifact_dir(args.output)
    quota = subscription(output / "subscription")
    models, _ = api_call("GET", "/v1/models", output / "models")
    print(json.dumps({"subscription": quota, "ttsModels": [
        {"id": model["model_id"], "name": model.get("name"),
         "supportsRussian": any(language.get("language_id") == "ru" for language in model.get("languages", []))}
        for model in models if model.get("can_do_text_to_speech")
    ]}, ensure_ascii=False), flush=True)


def voices(args):
    output = artifact_dir(args.output)
    result, _ = api_call("GET", "/v2/voices?page_size=100", output / "voices")
    print(json.dumps([{"voiceId": value["voice_id"], "name": value.get("name"),
                       "category": value.get("category"), "labels": value.get("labels"),
                       "description": value.get("description"),
                       "languages": sorted({item.get("language", "") for item in value.get("verified_languages", [])})}
                      for value in result.get("voices", [])], ensure_ascii=False), flush=True)


def design(args):
    output = artifact_dir(args.output)
    quota = subscription(output / "subscription-before")
    if quota.get("voice_slots_used", 0) >= quota.get("voice_limit", 1):
        raise RuntimeError("No free voice slot; existing voices will not be removed.")
    payload = {"voice_description": DESCRIPTION, "model_id": DESIGN_MODEL, "text": PREVIEW_TEXT,
               "auto_generate_text": False, "loudness": 0.25, "guidance_scale": 5, "seed": 131042}
    result, headers = api_call("POST", "/v1/text-to-voice/design?output_format=mp3_44100_128", output / "design", payload)
    previews = []
    for index, preview in enumerate(result.get("previews", []), start=1):
        path = output / f"voice-preview-{index:02}.mp3"
        path.write_bytes(base64.b64decode(preview["audio_base_64"]))
        previews.append({"index": index, "generatedVoiceId": preview["generated_voice_id"],
                         "path": str(path), "duration": probe(path, output / f"preview-{index:02}-ffprobe.json"),
                         "providerDuration": preview.get("duration_secs"), "language": preview.get("language"),
                         "bytes": path.stat().st_size})
    if not previews:
        raise RuntimeError("Voice Design returned no previews.")
    summary = {"createdAt": now(), "voiceName": VOICE_NAME, "model": DESIGN_MODEL,
               "description": DESCRIPTION, "text": result.get("text", PREVIEW_TEXT),
               "previews": previews, "headers": headers, "subscriptionBefore": quota,
               "subscriptionAfter": subscription(output / "subscription-after")}
    write_json(output / "voice-previews.json", summary)
    print(json.dumps(summary, ensure_ascii=False), flush=True)


def save_voice(args):
    output = artifact_dir(args.output)
    previews = json.loads(Path(args.previews).read_text(encoding="utf-8"))
    preview = next(p for p in previews["previews"] if p["index"] == args.index)
    payload = {"voice_name": VOICE_NAME, "voice_description": DESCRIPTION,
               "generated_voice_id": preview["generatedVoiceId"],
               "labels": {"language": "ru", "gender": "male", "age": "middle_aged", "use_case": "narration"}}
    value, _ = api_call("POST", "/v1/text-to-voice", output / "create-voice", payload)
    record = {"provider": "ElevenLabs", "voiceName": value.get("name", VOICE_NAME), "voiceId": value["voice_id"],
              "createdAt": now(), "designModel": DESIGN_MODEL, "model": TTS_MODEL,
              "voiceSettings": SETTINGS, "fictional": True, "description": DESCRIPTION,
              "selectedPreview": preview["index"], "previewOriginal": preview["path"],
              "auditoryReview": "pending; no audio-listening tool available in worker catalog"}
    write_json(Path(args.voice_file), record)
    write_json(output / "voice-selection.json", record)
    print(json.dumps(record, ensure_ascii=False), flush=True)


def generate(args):
    output = artifact_dir(args.resume_dir or args.output)
    guide_path = Path(args.guide)
    guide, guide_raw = load_guide(guide_path)
    voice = json.loads(Path(args.voice_file).read_text(encoding="utf-8"))
    if voice.get("provider") != "ElevenLabs" or not voice.get("voiceId"):
        raise RuntimeError("A real saved ElevenLabs voice is required.")
    stops = sorted(guide["stops"], key=lambda stop: stop["id"])
    selected = set(map(int, args.ids.split(","))) if args.ids else set(range(1, 14))
    if not selected <= set(range(1, 14)):
        raise RuntimeError("--ids must contain stop IDs 1–13.")
    write_json(output / "source-snapshots" / f"guide-{digest(guide_raw)[:16]}.json", guide)
    signature = narration_hash(stops)
    write_json(output / "source-narration.json", {"savedBeforeGeneration": now(), "sha256": signature,
                                                "stops": [{"id": s["id"], "slug": s["slug"], "narration": s["narration"]} for s in stops]})
    quota_before = subscription(output / "subscription-before")
    cached = {stop["id"]: checkpoint(output, stop, voice) for stop in stops}
    missing_characters = sum(len(stop["narration"]) for stop in stops
                             if stop["id"] in selected and not cached[stop["id"]])
    remaining = quota_before.get("character_limit", 0) - quota_before.get("character_count", 0)
    if missing_characters > remaining:
        raise RuntimeError(f"Narration needs up to {missing_characters} characters; included remaining quota {remaining}. No overage enabled.")
    records = []
    local_files = {}
    for stop in stops:
        basename, folder, mp3, metadata_path = track_paths(output, stop, voice)
        text_hash = digest(stop["narration"])
        previous = cached[stop["id"]]
        reusable = bool(previous)
        if stop["id"] not in selected and not reusable:
            continue
        if not reusable:
            if (folder / "request.json").exists():
                raise RuntimeError(f"Stop {stop['id']}: earlier POST has no valid checkpoint. Inspect artifacts before a paid retry; originals are preserved.")
            payload = {"text": stop["narration"], "model_id": TTS_MODEL, "voice_settings": SETTINGS,
                       "seed": 30102026 + stop["id"]}
            audio, headers = api_call("POST", "/v1/text-to-speech/" + parse.quote(voice["voiceId"], safe="")
                                      + "?output_format=mp3_44100_128", folder, payload, binary=True)
            mp3.write_bytes(audio)
            record = {"id": stop["id"], "title": stop["title"], "src": f"/audio/{basename}.mp3",
                      "duration": probe(mp3, folder / "ffprobe.json"), "bytes": mp3.stat().st_size,
                      "narrationSha256": text_hash, "audioSha256": digest(audio), "characters": len(stop["narration"]),
                      "voiceId": voice["voiceId"], "voiceSettings": SETTINGS, "model": TTS_MODEL,
                      "generatedAt": now(), "providerHeaders": headers}
            write_json(metadata_path, record)
        else:
            record = previous
        records.append(record)
        local_files[stop["id"]] = mp3
        print(json.dumps({"stop": stop["id"], "duration": record["duration"], "bytes": record["bytes"],
                          "reused": reusable}, ensure_ascii=False), flush=True)
    current, _ = load_guide(guide_path)
    if narration_hash(current["stops"]) != signature:
        raise RuntimeError("Narration changed during generation. Outputs remain in artifacts; no stale tracks published.")
    public_audio = ROOT / "public/audio"
    public_audio.mkdir(parents=True, exist_ok=True)
    for track in records:
        basename = Path(track["src"]).name
        shutil.copy2(local_files[track["id"]], public_audio / basename)
    manifest = {"provider": "ElevenLabs", "voiceName": voice["voiceName"], "voiceId": voice["voiceId"],
                "fictionalVoice": voice.get("fictional", False), "model": TTS_MODEL, "designModel": voice.get("designModel"),
                "voiceOrigin": voice.get("origin", "voice-design"), "createdForThisGuide": voice.get("createdForThisGuide", True),
                "generatedAt": now(), "complete": len(records) == 13, "sourceGuideSha256": digest(guide_raw),
                "sourceNarrationSha256": signature,
                "tracks": [{k: v for k, v in track.items() if k not in {"voiceId", "voiceSettings", "providerHeaders"}}
                           for track in records]}
    write_json(ROOT / "public/data/audio-manifest.json", manifest)
    write_json(output / "audio-manifest.json", manifest)
    quota_after = subscription(output / "subscription-after")
    cost = {"subscriptionBefore": quota_before, "subscriptionAfter": quota_after,
            "creditDelta": quota_after.get("character_count", 0) - quota_before.get("character_count", 0),
            "currencyCost": None, "note": "API subscription counters are shared account usage, not a per-run currency invoice."}
    write_json(output / "usage.json", cost)
    print(json.dumps({"publishedTracks": len(records), "complete": manifest["complete"], "artifacts": str(output),
                      "usage": cost}, ensure_ascii=False), flush=True)


def validate(args):
    output = artifact_dir(args.output)
    guide, _ = load_guide(Path(args.guide))
    manifest = json.loads((ROOT / "public/data/audio-manifest.json").read_text(encoding="utf-8"))
    errors = []
    warnings = []
    tracks = manifest.get("tracks", [])
    if manifest.get("provider") != "ElevenLabs" or not manifest.get("voiceId"):
        errors.append("Missing real ElevenLabs provider/voice ID.")
    if sorted(track["id"] for track in tracks) != list(range(1, 14)):
        errors.append("Expected all thirteen unique MP3 tracks.")
    if manifest.get("sourceNarrationSha256") != narration_hash(guide["stops"]):
        errors.append("Narration changed since generation.")
    stops = {stop["id"]: stop for stop in guide["stops"]}
    for track in tracks:
        stop = stops[track["id"]]
        expected = f"/audio/{stop['id']:02}-{stop['slug']}.mp3"
        if track["src"] != expected:
            errors.append(f"Stop {stop['id']}: unexpected file path.")
            continue
        path = ROOT / "public" / track["src"].lstrip("/")
        duration = probe(path, output / f"{stop['id']:02}-ffprobe.json")
        if path.stat().st_size != track["bytes"] or digest(path.read_bytes()) != track["audioSha256"]:
            errors.append(f"Stop {stop['id']}: MP3 bytes changed.")
        if digest(stop["narration"]) != track["narrationSha256"]:
            errors.append(f"Stop {stop['id']}: narration hash mismatch.")
        if abs(duration - track["duration"]) > 0.05:
            errors.append(f"Stop {stop['id']}: duration mismatch.")
        if not 40 <= duration <= 120:
            warnings.append(f"Stop {stop['id']}: duration {duration}s is outside the approximate minute target.")
        result = subprocess.run(["ffmpeg", "-hide_banner", "-i", str(path), "-af", "volumedetect",
                                 "-f", "null", "-"], capture_output=True, text=True, check=True)
        (output / f"{stop['id']:02}-volume.txt").write_text(result.stderr, encoding="utf-8")
        match = re.search(r"max_volume: (-?[\d.]+|\-inf) dB", result.stderr)
        if not match or float(match.group(1)) < -40:
            errors.append(f"Stop {stop['id']}: audio appears silent or too quiet.")
    report = {"checkedAt": now(), "tracks": len(tracks), "errors": errors, "warnings": warnings,
              "totalDuration": round(sum(track["duration"] for track in tracks), 2),
              "auditoryReview": "Not performed by this script; reviewer must listen to voice and pronunciation."}
    write_json(output / "audio-validation.json", report)
    print(json.dumps(report, ensure_ascii=False), flush=True)
    if errors:
        raise RuntimeError("Audio validation failed.")


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    subs = parser.add_subparsers(dest="command", required=True)
    for name, handler in [("status", status), ("voices", voices), ("design", design), ("save-voice", save_voice),
                          ("generate", generate), ("validate", validate)]:
        command = subs.add_parser(name)
        command.set_defaults(handler=handler)
        command.add_argument("--output", help="External artifact directory; defaults to QA_OUTPUT.")
        if name in {"save-voice", "generate"}:
            command.add_argument("--voice-file", default=str(ROOT / ".handoff/voice.json"))
        if name == "save-voice":
            command.add_argument("--previews", required=True)
            command.add_argument("--index", type=int, required=True)
        if name in {"generate", "validate"}:
            command.add_argument("--guide", default=str(ROOT / "public/data/guide.json"))
        if name == "generate":
            command.add_argument("--resume-dir", help="Reuse the same original external audio run/checkpoints.")
            command.add_argument("--ids", help="Optional comma-separated IDs for a first real track; default all 13.")
    args = parser.parse_args()
    try:
        args.handler(args)
    except (RuntimeError, OSError, KeyError, ValueError, StopIteration, subprocess.CalledProcessError) as exc:
        print(f"ERROR: {exc}", file=sys.stderr, flush=True)
        sys.exit(1)


if __name__ == "__main__":
    main()
