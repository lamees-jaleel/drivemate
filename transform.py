import os
import re

base_dir = r"c:\Drivemate\drivemate-frontend\src\app\pages"
dashboards = ['expert', 'compliance', 'admin']

# The standard sidebar footer
sidebar_footer = '''
    <div class="sidebar-footer">
      <button class="logout-button" type="button" (click)="logout()">
        <span class="nav-icon">⇥</span> Sign Out
      </button>
      <p>
        DRIVEMATE
        <span>•</span>
        YOUR ROAD. REIMAGINED.
      </p>
    </div>
'''

for dash in dashboards:
    folder = os.path.join(base_dir, f"{dash}-dashboard")
    html_path = os.path.join(folder, f"{dash}-dashboard.html")
    css_path = os.path.join(folder, f"{dash}-dashboard.css")
    
    if not os.path.exists(html_path):
        continue
        
    html = open(html_path, 'r', encoding='utf-8').read()
    
    # 1. Sidebar Top & Profile
    # Just leave them alone, but make sure they use .owner-mini-profile if they don't already?
    # Actually, expert-dashboard already uses owner-mini-profile!
    
    # 2. Sidebar Footer
    # Replace the existing sign out button container with .sidebar-footer
    html = re.sub(r'<div class="sidebar-nav"[^>]*margin-top:\s*auto[^>]*>.*?</div>', sidebar_footer, html, flags=re.DOTALL)
    html = re.sub(r'<div class="sidebar-bottom">.*?</div>', sidebar_footer, html, flags=re.DOTALL)
    
    # 3. Main wrapper
    html = html.replace('<main class="dashboard-main">', '<main class="main-area">')
    
    # 4. Topbar
    topbar_regex = r'<section class="topbar">.*?</section>'
    
    role_label = dash.upper() + " PORTAL"
    topbar_replacement = f'''
    <header class="topbar">
      <div class="topbar-left">
        <button class="menu-button" type="button" (click)="toggleSidebar()">☰</button>
        <div>
          <p class="topbar-label">{role_label}</p>
          <h1>Dashboard</h1>
        </div>
      </div>
      <div class="topbar-right">
        <button class="notification-button" type="button">🔔</button>
        <div class="topbar-user">
          <div class="topbar-avatar">
            {{{{ firstName.charAt(0).toUpperCase() }}}}
          </div>
          <div class="topbar-user-text">
            <strong>{{{{ currentUser?.fullName }}}}</strong>
            <span>{{{{ currentUser?.email }}}}</span>
          </div>
        </div>
      </div>
    </header>
    <div class="dashboard-content">
'''
    html = re.sub(topbar_regex, topbar_replacement, html, flags=re.DOTALL)
    
    # 5. Hero -> Welcome
    html = html.replace('<section class="hero">', '<section class="welcome-section">')
    html = html.replace('<div class="hero-copy">', '<div>')
    html = html.replace('class="hero-description"', 'class="welcome-copy"')
    
    # 6. Append </div> before </main>
    html = html.replace('</main>', '  </div>\n  </main>')
    
    with open(html_path, 'w', encoding='utf-8') as f:
        f.write(html)
        
    # CSS: We need to wipe the structural CSS.
    css = open(css_path, 'r', encoding='utf-8').read()
    
    # Let's find the split point. 
    # For expert, it's around .expert-requests-list or .scanner-card
    # For compliance, it's around .advisory-card
    # For admin, it's around .admin-table
    
    # A generic approach: we wipe everything before the first role-specific block.
    if dash == 'expert':
        split_idx = css.find('/* =========================================================\n   EXPERT WORKSPACE')
        if split_idx == -1: split_idx = css.find('.expert-requests-list')
    elif dash == 'compliance':
        split_idx = css.find('/* =========================================================\n   ADVISORY')
        if split_idx == -1: split_idx = css.find('.shield-card')
    elif dash == 'admin':
        split_idx = css.find('/* =========================================================\n   ADMIN STATS')
        if split_idx == -1: split_idx = css.find('.admin-table')
        
    if split_idx != -1:
        new_css = "@import '../../shared/styles/portal-layout.css';\n\n" + css[split_idx:]
        with open(css_path, 'w', encoding='utf-8') as f:
            f.write(new_css)

print("Done")
