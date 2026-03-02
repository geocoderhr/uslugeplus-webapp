from pathlib import Path
import re

ROOT = Path(".")
INDEX = ROOT / "index.html"
ROUTER = ROOT / "js/core/router.js"

def read_text(p: Path) -> str:
    return p.read_text(encoding="utf-8", errors="ignore")

def parse_screen_ids() -> list[str]:
    s = read_text(ROUTER)
    m = re.search(r"SCREEN_IDS\s*=\s*\[(.*?)\]", s, flags=re.S)
    if not m:
        # fallback: keep known defaults if regex fails
        return ["lang-screen", "loading-screen", "policy-screen", "profile-screen", "main-menu"]
    chunk = m.group(1)
    return re.findall(r"'([^']+)'|\"([^\"]+)\"", chunk)

def flatten_pairs(pairs):
    out=[]
    for a,b in pairs:
        out.append(a or b)
    return [x for x in out if x]

SCREEN_IDS = flatten_pairs(parse_screen_ids())

html_lines = read_text(INDEX).splitlines()

# 1) collect DOM ids grouped by "current screen"
screen_of: dict[str, str] = {}
all_ids: set[str] = set()

current_screen = None
div_open_stack = []

screen_start_re = re.compile(r'<div[^>]*\bid="([^"]+)"')
id_re = re.compile(r'\bid="([^"]+)"')

for line in html_lines:
    m = screen_start_re.search(line)
    if m:
        maybe = m.group(1)
        if maybe in SCREEN_IDS:
            current_screen = maybe

    for dom_id in id_re.findall(line):
        all_ids.add(dom_id)
        if dom_id in SCREEN_IDS:
            screen_of.setdefault(dom_id, dom_id)
        else:
            screen_of.setdefault(dom_id, current_screen or "(outside-screens)")

# 2) scan usages across project files (js + app.js + styles.css)
scan_paths = []
for p in [ROOT/"app.js", ROOT/"styles.css"]:
    if p.exists():
        scan_paths.append(p)

for p in (ROOT/"js").rglob("*"):
    if p.is_file() and p.suffix in {".js", ".css", ".html"}:
        scan_paths.append(p)

def find_hits(dom_id: str):
    hits=[]
    needle_variants = [
        f"'{dom_id}'",
        f'"{dom_id}"',
        f"#{dom_id}",
        dom_id
    ]
    for p in scan_paths:
        try:
            lines = read_text(p).splitlines()
        except Exception:
            continue
        for i, ln in enumerate(lines, start=1):
            if dom_id in ln:
                # light filter to avoid too much noise
                if any(v in ln for v in needle_variants):
                    hits.append((str(p), i, ln.strip()))
                    if len(hits) >= 8:
                        return hits
    return hits

# 3) write markdown
out = []
out.append("# ID_MAP (автоматически сгенерировано)\n")
out.append("Эта карта отвечает на вопрос: **какой DOM-id к какому экрану относится и в каких файлах встречается**.\n")
out.append(f"Список экранов из `js/core/router.js`: {', '.join(SCREEN_IDS)}\n")

def md_escape(s: str) -> str:
    return s.replace("|", "\\|")

out.append("## Таблица\n")
out.append("| Screen | DOM id | Где встречается (первые совпадения) |")
out.append("|---|---|---|")

for dom_id in sorted(all_ids):
    scr = screen_of.get(dom_id, "(unknown)")
    hits = find_hits(dom_id)
    if hits:
        where = "<br>".join([f"`{h[0]}:{h[1]}`" for h in hits[:5]])
    else:
        where = "_не найдено в коде (только в HTML)_"
    out.append(f"| `{md_escape(scr)}` | `{md_escape(dom_id)}` | {where} |")

(Path("ID_MAP.md")).write_text("\n".join(out) + "\n", encoding="utf-8")
print("OK: generated ID_MAP.md")
