#!/usr/bin/env python3
"""Regenerate alltime.json — the bundled all-time (incl. pre-1993) leaderboards.

Source: Pro Football Reference career-leader pages (/leaders/<cat>_career.htm),
scraped via the parse.bot "pro-football-reference.com" API. Do NOT hand-edit
alltime.json — re-run this after each NFL season instead. Rebuilding it this way
is what fixed the earlier corruption (duplicate players, per-catch averages
stored as totals, missing pre-1993 greats).

Usage:  PARSE_KEY=pmx_xxx python3 build_alltime.py
parse.bot has a daily call quota; this makes 10 calls (one per category) and
each uncached page can take ~2 min the first time (cached after).
"""
import json, os, re, time, unicodedata, urllib.request

KEY = os.environ["PARSE_KEY"]
SCRAPER_ID = "47d0af8c-0198-4534-a732-158398fc632e"   # parse.bot PFR career-leaders scraper
URL = "https://api.parse.bot/mcp"

# parse.bot category slug -> (game group, stat key in shared.js NFL_GROUPS)
MAP = [("pass_yds","passing","passingYards"), ("pass_td","passing","passingTouchdowns"),
       ("rush_yds","rushing","rushingYards"), ("rush_td","rushing","rushingTouchdowns"),
       ("rec","receiving","receptions"), ("rec_yds","receiving","receivingYards"),
       ("rec_td","receiving","receivingTouchdowns"), ("sacks","defense","sacks"),
       ("def_int","defense","interceptions"), ("scoring","scoring","totalPoints")]

def rpc(category, tries=3):
    body = json.dumps({"jsonrpc":"2.0","id":1,"method":"tools/call","params":{
        "name":"call_endpoint","arguments":{"scraper_id":SCRAPER_ID,
        "endpoint_name":"get_career_leaders","params":{"category":category}}}}).encode()
    for a in range(tries):
        try:
            req = urllib.request.Request(URL, data=body, headers={"Authorization":"Bearer "+KEY,
                "Content-Type":"application/json","Accept":"application/json, text/event-stream"})
            with urllib.request.urlopen(req, timeout=230) as r:
                raw = r.read().decode("utf-8","replace")
            if raw.lstrip().startswith(("event:","data:")):
                raw = "".join(l[5:].strip() for l in raw.splitlines() if l.startswith("data:"))
            inner = json.loads("".join(p["text"] for p in json.loads(raw)["result"]["content"]))
            if not inner.get("ok"): raise RuntimeError(inner.get("error"))
            return rows_of(inner)
        except Exception as e:
            print(f"  {category} attempt {a+1} failed: {e}")
            time.sleep(3)
    return []

def rows_of(o):
    if isinstance(o, list) and o and isinstance(o[0], dict) and "player" in o[0]: return o
    if isinstance(o, dict):
        for v in o.values():
            r = rows_of(v)
            if r: return r
    return []

def clean_name(n): return re.sub(r"[\s+*]+$","",n.strip()).strip()   # drop PFR HOF/ProBowl markers
def num(v):
    v = float(str(v).replace(",","").strip()); return int(v) if v == int(v) else v
def norm(s):
    s = unicodedata.normalize("NFD",s).encode("ascii","ignore").decode().lower()
    s = re.sub(r"[^a-z0-9\s]","",s); s = re.sub(r"\b(jr|sr|ii|iii|iv|v)\b","",s)
    return re.sub(r"\s+"," ",s).strip()

# reuse headshot URLs from the current file by matching names (parse.bot has no photos)
photo = {}
if os.path.exists("alltime.json"):
    for g in json.load(open("alltime.json")).values():
        for lst in g.values():
            for e in lst:
                if e.get("photo"): photo.setdefault(norm(e["name"]), e["photo"])

out = {}
for slug, group, key in MAP:
    rows = rpc(slug); seen = set(); lst = []
    for r in rows:
        nm = clean_name(r["player"]); nn = norm(nm)
        if not nm or nn in seen: continue
        seen.add(nn); lst.append({"name":nm, "raw":num(r["value"]), "photo":photo.get(nn,"")})
    lst.sort(key=lambda e: e["raw"], reverse=True)
    out.setdefault(group,{})[key] = lst
    print(f"{group}/{key}: {len(lst)}  #1 {lst[0]['name'] if lst else '—'}")

assert all(out[g][k] for g,_,k in [(g,s,k) for s,g,k in MAP]), "a category came back empty — re-run"
json.dump(out, open("alltime.json","w"), separators=(",",":"))
print("wrote alltime.json")
