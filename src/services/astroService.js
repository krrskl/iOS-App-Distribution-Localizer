const isTauri = () => '__TAURI__' in window

function getBaseUrl(port = 8089) {
  if (isTauri()) {
    return `http://127.0.0.1:${port}/mcp`
  }
  return '/api/astro/mcp'
}

let messageId = 0

async function callAstroTool(toolName, args = {}, port = 8089) {
  const url = getBaseUrl(port)
  const response = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      jsonrpc: '2.0',
      id: ++messageId,
      method: 'tools/call',
      params: { name: toolName, arguments: args }
    })
  })

  if (!response.ok) {
    throw new Error(`Astro request failed: ${response.status}`)
  }

  const data = await response.json()

  if (data.error) {
    throw new Error(data.error.message || 'Astro tool error')
  }

  return data.result
}

export async function testAstroConnection(port = 8089) {
  try {
    const result = await callAstroTool('list_apps', {}, port)
    return { success: true, message: 'Connected to Astro', data: result }
  } catch (error) {
    return { success: false, message: error.message }
  }
}

export async function getKeywordSuggestions(appId, store = 'us', port = 8089) {
  return callAstroTool('get_keyword_suggestions', { appId: String(appId), store }, port)
}

export async function searchAppStore(query, port = 8089) {
  return callAstroTool('search_app_store', { query }, port)
}

export async function getAppKeywords(appId, port = 8089) {
  return callAstroTool('get_app_keywords', { appId: String(appId) }, port)
}

export async function searchRankings(appId, keyword, options = {}, port = 8089) {
  return callAstroTool('search_rankings', {
    appId: String(appId),
    keyword,
    ...options
  }, port)
}
