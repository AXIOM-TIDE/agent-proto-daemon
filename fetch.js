/**
 * fetch.js — Agent Protocol Tracker
 *
 * Tracks daily activity across the four agent protocols that matter:
 *   x402 — Coinbase's HTTP 402 payment standard (coinbase/x402)
 *   MCP  — Model Context Protocol (modelcontextprotocol/specification)
 *   ACP  — Agent Client Protocol (zed-industries/agent-client-protocol)
 *   MPP  — Multi-agent Payment Protocol (placeholder, spec still emerging)
 *
 * Metrics per protocol: stars (cumulative), stars Δ24h, commits 24h,
 * open issues, latest release, repo description.
 *
 * Sources: GitHub REST API (unauthenticated — 60 req/hr/IP, enough for daily).
 */

const UA = {
  'User-Agent': 'conk-agent-proto-daemon/1.0 (+https://conk.app)',
  Accept:       'application/vnd.github+json',
};

const PROTOCOLS = [
  { key: 'x402', name: 'x402',        owner: 'coinbase',                repo: 'x402',                    blurb: 'HTTP 402 payment standard for paid API endpoints' },
  { key: 'mcp',  name: 'MCP',         owner: 'modelcontextprotocol',    repo: 'specification',           blurb: 'Model Context Protocol — LLM tool/resource standard' },
  { key: 'acp',  name: 'ACP',         owner: 'zed-industries',          repo: 'agent-client-protocol',   blurb: 'Agent Client Protocol — IDE/agent interop' },
  { key: 'mpp',  name: 'MPP',         owner: null,                      repo: null,                      blurb: 'Multi-agent Payment Protocol — spec emerging' },
];

async function safely(label, fn, fallback = null) {
  try { return await fn(); }
  catch (e) { console.warn(`[fetch] ${label} failed: ${e.message}`); return fallback; }
}

async function gh(path) {
  const r = await fetch(`https://api.github.com${path}`, {
    headers: UA,
    signal:  AbortSignal.timeout(12_000),
  });
  if (!r.ok) throw new Error(`GitHub ${r.status} ${r.statusText} on ${path}`);
  return r.json();
}

async function getProtocolMetrics(p) {
  if (!p.owner || !p.repo) {
    return {
      key:         p.key,
      name:        p.name,
      blurb:       p.blurb,
      tracked:     false,
      note:        'No canonical repo yet — placeholder.',
    };
  }

  const since = new Date(Date.now() - 86400_000).toISOString();

  return safely(`gh:${p.owner}/${p.repo}`, async () => {
    const [repo, commits, release] = await Promise.all([
      gh(`/repos/${p.owner}/${p.repo}`),
      gh(`/repos/${p.owner}/${p.repo}/commits?since=${since}&per_page=100`),
      gh(`/repos/${p.owner}/${p.repo}/releases/latest`).catch(() => null),
    ]);

    return {
      key:           p.key,
      name:          p.name,
      blurb:         p.blurb,
      tracked:       true,
      repo:          `${p.owner}/${p.repo}`,
      url:           repo.html_url,
      description:   repo.description || '',
      stars:         repo.stargazers_count,
      forks:         repo.forks_count,
      openIssues:    repo.open_issues_count,
      commitsDay:    Array.isArray(commits) ? commits.length : 0,
      defaultBranch: repo.default_branch,
      latestRelease: release ? {
        tag:         release.tag_name,
        name:        release.name,
        publishedAt: release.published_at,
      } : null,
      pushedAt:      repo.pushed_at,
    };
  }, {
    key:     p.key,
    name:    p.name,
    blurb:   p.blurb,
    tracked: true,
    error:   'fetch failed',
  });
}

export async function fetchSuiStats() {  // kept name for index.js compat
  console.log('[fetch] Pulling agent protocol activity...');

  const results = await Promise.all(PROTOCOLS.map(getProtocolMetrics));
  const tracked = results.filter(r => r.tracked && !r.error).length;

  console.log(`[fetch] ${tracked}/${PROTOCOLS.length} protocols pulled cleanly.`);

  return {
    fetchedAt: new Date().toISOString(),
    protocols: results,
  };
}
