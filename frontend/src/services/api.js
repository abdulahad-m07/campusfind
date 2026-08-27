const API_BASE = import.meta.env.VITE_API_URL || ''

function getToken() {
  try {
    return localStorage.getItem('campusfind_token') || ''
  } catch {
    return ''
  }
}

function authHeaders(extra = {}) {
  const token = getToken()
  return {
    'Content-Type': 'application/json',
    ...(token && { Authorization: `Bearer ${token}` }),
    ...extra,
  }
}

// ---- Auth ----
export async function register(data) {
  const res = await fetch(`${API_BASE}/api/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  })
  if (!res.ok) {
    const err = await res.json().catch(() => ({}))
    throw new Error(err.error || 'Registration failed')
  }
  return res.json()
}

export async function login(data) {
  const res = await fetch(`${API_BASE}/api/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  })
  if (!res.ok) {
    const err = await res.json().catch(() => ({}))
    throw new Error(err.error || 'Login failed')
  }
  return res.json()
}

export async function fetchMe() {
  const res = await fetch(`${API_BASE}/api/auth/me`, { headers: authHeaders() })
  if (!res.ok) throw new Error('Not authenticated')
  return res.json()
}

// ---- Items ----
export async function fetchItems(query = '') {
  const url = query
    ? `${API_BASE}/api/items?q=${encodeURIComponent(query)}`
    : `${API_BASE}/api/items`

  const res = await fetch(url)

  if (!res.ok) {
    throw new Error('Failed to fetch items')
  }

  return res.json()
}

export async function fetchItemById(id) {
  const res = await fetch(`${API_BASE}/api/items/${id}`)

  if (!res.ok) {
    throw new Error('Item not found')
  }

  return res.json()
}

export async function uploadImage(file) {
  const formData = new FormData()
  formData.append('image', file)

  const token = getToken()
  const res = await fetch(`${API_BASE}/api/upload`, {
    method: 'POST',
    headers: token ? { Authorization: `Bearer ${token}` } : {},
    body: formData,
  })

  if (!res.ok) {
    const err = await res.json().catch(() => ({}))
    throw new Error(err.error || 'Image upload failed')
  }

  return res.json()
}

export async function createItem(itemData) {
  const res = await fetch(`${API_BASE}/api/items`, {
    method: 'POST',
    headers: authHeaders(),
    body: JSON.stringify(itemData),
  })

  if (!res.ok) {
    const err = await res.json().catch(() => ({}))
    throw new Error(err.error || 'Failed to create item')
  }

  return res.json()
}

export async function claimItem(id) {
  const res = await fetch(`${API_BASE}/api/items/${id}/claim`, {
    method: 'POST',
    headers: authHeaders(),
  })

  if (!res.ok) {
    const err = await res.json().catch(() => ({}))
    throw new Error(err.error || 'Failed to claim item')
  }

  return res.json()
}
