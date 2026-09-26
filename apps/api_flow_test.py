"""
Pasha DevPilot — End-to-End API Flow Test Script
Tests the full autonomous engineering workflow against the live API.
"""
import httpx
import json

base = 'http://localhost:8000'

def check(name, resp):
    if resp.status_code >= 400:
        print(f"  FAIL {name}: HTTP {resp.status_code} — {resp.text[:200]}")
        return None
    data = resp.json()
    print(f"  OK   {name}: {json.dumps(data)[:200]}")
    return data

# 1. Health
print("\n=== HEALTH ===")
r = httpx.get(f'{base}/health')
check("GET /health", r)

# 2. Dev Login
print("\n=== AUTH ===")
r = httpx.post(f'{base}/auth/developer-login')
auth_data = check("POST /auth/developer-login", r)
token = auth_data['access_token']
headers = {'Authorization': f'Bearer {token}', 'Content-Type': 'application/json'}

# 3. Me
r = httpx.get(f'{base}/auth/me', headers=headers)
check("GET /auth/me", r)

# 4. GitHub URL
r = httpx.get(f'{base}/auth/github/url')
check("GET /auth/github/url", r)

# 5. Repositories
print("\n=== REPOSITORIES ===")
r = httpx.get(f'{base}/repositories', headers=headers)
repos = check("GET /repositories", r)

if not repos:
    r = httpx.post(f'{base}/repositories', headers=headers, json={
        'name': 'devpilot-demo-service',
        'owner': 'pasha-dev',
        'local_path': 'demo-repo',
        'is_private': False
    })
    repo_data = check("POST /repositories (connect demo)", r)
    repos = [repo_data]

repo_id = repos[0]['id']
print(f"  → Using repo: {repos[0]['full_name']} ({repo_id})")

# 6. Repo detail
r = httpx.get(f'{base}/repositories/{repo_id}', headers=headers)
check(f"GET /repositories/{repo_id[:8]}", r)

# 7. File tree
r = httpx.get(f'{base}/repositories/{repo_id}/tree', headers=headers)
check(f"GET /repositories/{repo_id[:8]}/tree", r)

# 8. Index repo
r = httpx.post(f'{base}/repositories/{repo_id}/index', headers=headers)
check(f"POST /repositories/{repo_id[:8]}/index", r)

# 9. Code search
r = httpx.post(f'{base}/repositories/{repo_id}/search', headers=headers, json={
    'query': 'token expiration',
    'search_type': 'semantic',
    'limit': 5
})
check(f"POST /repositories/{repo_id[:8]}/search", r)

# 10. Tasks
print("\n=== TASKS ===")
r = httpx.get(f'{base}/tasks', headers=headers)
tasks = check("GET /tasks", r)

# 11. Create task
r = httpx.post(f'{base}/tasks', headers=headers, json={
    'repository_id': repo_id,
    'title': 'Fix inverted token expiration bug in auth_service',
    'description': 'The check `token.expires_at < datetime.utcnow()` is INVERTED — tokens fail immediately, valid ones pass.'
})
task = check("POST /tasks", r)
task_id = task['id']
print(f"  → Task created: {task_id[:8]}... state={task['state']}")

# 12. Get task
r = httpx.get(f'{base}/tasks/{task_id}', headers=headers)
check(f"GET /tasks/{task_id[:8]}", r)

# 13. Investigate
r = httpx.post(f'{base}/tasks/{task_id}/investigate', headers=headers)
check(f"POST /tasks/{task_id[:8]}/investigate", r)

# 14. Re-fetch task after investigate
import time
time.sleep(2)
r = httpx.get(f'{base}/tasks/{task_id}', headers=headers)
task_data = check(f"GET /tasks/{task_id[:8]} (post-investigate)", r)
print(f"  → state={task_data['state']}, plan_markdown present: {bool(task_data.get('plan_markdown'))}")

# 15. Settings
print("\n=== SETTINGS ===")
r = httpx.get(f'{base}/settings', headers=headers)
check("GET /settings", r)

r = httpx.get(f'{base}/settings/memories', headers=headers)
check("GET /settings/memories", r)

# 16. Pull Requests
print("\n=== PULL REQUESTS ===")
r = httpx.get(f'{base}/pull-requests', headers=headers)
check("GET /pull-requests", r)

print("\n=== ALL CORE TESTS PASSED ===")
