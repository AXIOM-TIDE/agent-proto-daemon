/**
 * format.js — Agent Protocol activity → CONK Cast
 */

function fmtDate(iso) {
  return new Date(iso).toLocaleDateString('en-US', {
    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
  });
}

function fmtRelDate(iso) {
  if (!iso) return 'N/A';
  const days = Math.floor((Date.now() - new Date(iso).getTime()) / 86400_000);
  if (days <= 0) return 'today';
  if (days === 1) return '1 day ago';
  return `${days} days ago`;
}

function pad(s, n) {
  s = String(s);
  return s.length >= n ? s : s + ' '.repeat(n - s.length);
}

export function formatCast(data) {
  const date    = fmtDate(data.fetchedAt);
  const tracked = data.protocols.filter(p => p.tracked && !p.error && p.stars != null);
  const totalStars = tracked.reduce((s, p) => s + (p.stars || 0), 0);
  const totalCommits = tracked.reduce((s, p) => s + (p.commitsDay || 0), 0);

  // ── Hook ────────────────────────────────────────────────────────────────────
  const hook = `Agent Protocols Daily — ${date} | x402 · MCP · ACP · MPP | ${totalStars.toLocaleString()}★ tracked · ${totalCommits} commits today`;

  // ── Per-protocol detail ────────────────────────────────────────────────────
  const protoBlocks = data.protocols.map(p => {
    if (!p.tracked) {
      return `${p.name} — ${p.blurb}\n  ${p.note || 'No data.'}`;
    }
    if (p.error) {
      return `${p.name} — ${p.blurb}\n  ⚠ fetch failed (${p.error})`;
    }
    const rel = p.latestRelease;
    return [
      `${p.name} (${p.repo}) — ${p.blurb}`,
      `  ${p.url}`,
      `  Stars       : ${p.stars.toLocaleString()}`,
      `  Forks       : ${p.forks.toLocaleString()}`,
      `  Open issues : ${p.openIssues.toLocaleString()}`,
      `  Commits 24h : ${p.commitsDay}`,
      `  Last push   : ${fmtRelDate(p.pushedAt)}`,
      rel ? `  Latest tag  : ${rel.tag}${rel.name && rel.name !== rel.tag ? ` (${rel.name})` : ''} — ${fmtRelDate(rel.publishedAt)}`
          : `  Latest tag  : no releases yet`,
      p.description ? `  About       : ${p.description.replace(/\s+/g, ' ').trim().slice(0, 140)}` : '',
    ].filter(Boolean).join('\n');
  }).join('\n\n');

  const body = `AGENT PROTOCOL TRACKER — DAILY DIGEST
Date: ${date}
Published on CONK | Persisted on Walrus

━━━━━━━━━━━━━━━━━━━━━━━━━━━
TRACKED PROTOCOLS
━━━━━━━━━━━━━━━━━━━━━━━━━━━
x402 · MCP · ACP · MPP

Total stars across tracked repos : ${totalStars.toLocaleString()}
Total commits in last 24h        : ${totalCommits}

━━━━━━━━━━━━━━━━━━━━━━━━━━━
DETAIL
━━━━━━━━━━━━━━━━━━━━━━━━━━━
${protoBlocks}

━━━━━━━━━━━━━━━━━━━━━━━━━━━
DATA SOURCE
━━━━━━━━━━━━━━━━━━━━━━━━━━━
GitHub REST API (public, unauthenticated)
Fetched: ${data.fetchedAt}
Published by: Agent Protocol Daemon v1
Part of the CONK Intelligence Network — conk.app
`.trim();

  return { hook, body };
}
