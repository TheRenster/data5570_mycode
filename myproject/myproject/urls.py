from django.contrib import admin
from django.http import HttpResponse
from django.urls import path, include


def root(request):
    html = """<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>DATA 5570 API</title>
<style>
  :root {
    --bg: #0f1419;
    --surface: #1a2332;
    --text: #e7ecf3;
    --muted: #8b9cb3;
    --accent: #3d8bfd;
    --accent-dim: #2563c4;
    --border: #2d3a4d;
  }
  * { box-sizing: border-box; }
  body {
    margin: 0;
    min-height: 100vh;
    font-family: ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, sans-serif;
    background: radial-gradient(ellipse 120% 80% at 50% -20%, #1e3a5f 0%, var(--bg) 55%);
    color: var(--text);
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 1.5rem;
  }
  .card {
    width: 100%;
    max-width: 28rem;
    background: var(--surface);
    border: 1px solid var(--border);
    border-radius: 16px;
    padding: 2rem 2rem 1.75rem;
    box-shadow: 0 24px 48px rgba(0,0,0,.35);
  }
  .badge {
    display: inline-block;
    font-size: .72rem;
    font-weight: 600;
    letter-spacing: .06em;
    text-transform: uppercase;
    color: var(--accent);
    background: rgba(61, 139, 253, .12);
    border: 1px solid rgba(61, 139, 253, .25);
    padding: .35rem .65rem;
    border-radius: 999px;
    margin-bottom: 1rem;
  }
  h1 {
    margin: 0 0 .5rem;
    font-size: 1.5rem;
    font-weight: 700;
    letter-spacing: -.02em;
    line-height: 1.25;
  }
  .lead {
    margin: 0 0 1.5rem;
    font-size: .95rem;
    color: var(--muted);
    line-height: 1.5;
  }
  nav { display: flex; flex-direction: column; gap: .5rem; }
  a {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 1rem;
    padding: .75rem 1rem;
    border-radius: 10px;
    text-decoration: none;
    color: var(--text);
    background: rgba(255,255,255,.04);
    border: 1px solid var(--border);
    font-size: .9rem;
    font-weight: 500;
    transition: background .15s, border-color .15s, transform .1s;
  }
  a:hover {
    background: rgba(61, 139, 253, .1);
    border-color: rgba(61, 139, 253, .35);
  }
  a:active { transform: scale(.99); }
  a span { color: var(--muted); font-weight: 400; font-size: .8rem; }
  footer {
    margin-top: 1.5rem;
    padding-top: 1rem;
    border-top: 1px solid var(--border);
    font-size: .75rem;
    color: var(--muted);
  }
</style>
</head>
<body>
  <div class="card">
    <span class="badge">Running</span>
    <h1>DATA 5570 API</h1>
    <p class="lead">Django backend is up. Use the links below or call the REST endpoints from your app.</p>
    <nav>
      <a href="/admin/">Django admin <span>→</span></a>
      <a href="/api/profiles/">Profiles <span>/api/profiles/</span></a>
      <a href="/api/listings/">Listings <span>/api/listings/</span></a>
    </nav>
    <footer>Local dev · SQLite</footer>
  </div>
</body>
</html>"""
    return HttpResponse(html)


urlpatterns = [
    path('', root),
    path('admin/', admin.site.urls),
    path('api/', include('barter.urls')),
]
