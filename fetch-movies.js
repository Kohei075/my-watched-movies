import { readFile, writeFile } from "node:fs/promises";

const API_KEY = process.env.TMDB_API_KEY;
if (!API_KEY) {
  console.error("環境変数 TMDB_API_KEY が設定されていません。");
  process.exit(1);
}

const BASE = "https://api.themoviedb.org/3";

async function getById(id) {
  const url = `${BASE}/movie/${id}?api_key=${API_KEY}&language=ja-JP`;
  const res = await fetch(url);
  if (!res.ok) throw new Error(`id ${id}: ${res.status}`);
  return res.json();
}

async function search(title, year) {
  const params = new URLSearchParams({
    api_key: API_KEY,
    language: "ja-JP",
    query: title,
    include_adult: "false",
  });
  if (year) params.set("primary_release_year", String(year));
  const res = await fetch(`${BASE}/search/movie?${params}`);
  if (!res.ok) throw new Error(`${title}: ${res.status}`);
  const data = await res.json();
  return data.results ?? [];
}

function pickBest(results, title, year) {
  if (!results.length) return null;
  const norm = (s) => String(s || "").replace(/[\s\/／:：・\-―]/g, "").toLowerCase();
  const nt = norm(title);
  // 完全一致 → 前方一致 → 含む の優先度でフィルタ
  const exact = results.filter((r) => norm(r.title) === nt);
  if (exact.length) return preferYear(exact, year);
  const starts = results.filter((r) => norm(r.title).startsWith(nt));
  if (starts.length) return preferYear(starts, year);
  return preferYear(results, year);
}

function preferYear(list, year) {
  if (!year) return list[0];
  const match = list.find((r) => (r.release_date || "").startsWith(String(year)));
  return match || list[0];
}

function toRecord(query, hit) {
  if (!hit) return { query, found: false };
  return {
    query,
    found: true,
    id: hit.id,
    title: hit.title,
    original_title: hit.original_title,
    release_date: hit.release_date || "",
    year: hit.release_date ? hit.release_date.slice(0, 4) : "",
    overview: hit.overview || "",
    poster_path: hit.poster_path
      ? `https://image.tmdb.org/t/p/w500${hit.poster_path}`
      : null,
  };
}

async function resolve(entry) {
  const query = typeof entry === "string" ? entry : entry.query;
  const year = typeof entry === "object" ? entry.year : undefined;
  const id = typeof entry === "object" ? entry.id : undefined;

  if (id) {
    const hit = await getById(id);
    return toRecord(query, hit);
  }

  let results = await search(query, year);
  if (!results.length && year) results = await search(query);
  const best = pickBest(results, query, year);
  return toRecord(query, best);
}

async function main() {
  const entries = JSON.parse(await readFile("movies.json", "utf8"));
  const out = [];
  const missing = [];

  for (const entry of entries) {
    const query = typeof entry === "string" ? entry : entry.query;
    try {
      const rec = await resolve(entry);
      out.push(rec);
      if (!rec.found) {
        missing.push(query);
        console.warn(`  見つからず: ${query}`);
      } else {
        console.log(`  OK: ${query} -> ${rec.title} (${rec.release_date})`);
      }
    } catch (e) {
      missing.push(query);
      out.push({ query, found: false, error: String(e) });
      console.warn(`  エラー: ${query}: ${e}`);
    }
    await new Promise((r) => setTimeout(r, 120));
  }

  await writeFile("movies-data.json", JSON.stringify(out, null, 2), "utf8");
  console.log(`\n完了: ${out.length}件 (未検出 ${missing.length}件)`);
  if (missing.length) {
    console.log("未検出タイトル:\n" + missing.map((m) => "  - " + m).join("\n"));
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
