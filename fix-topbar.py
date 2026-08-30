import os
import re

base_dir = r"c:\Drivemate\drivemate-frontend\src\app\pages"
dashboards = ['expert', 'compliance', 'admin']

for dash in dashboards:
    folder = os.path.join(base_dir, f"{dash}-dashboard")
    html_path = os.path.join(folder, f"{dash}-dashboard.html")
    if os.path.exists(html_path):
        html = open(html_path, 'r', encoding='utf-8').read()
        html = re.sub(r'<button class="notification-button"[^>]*>.*?</button>', '', html)
        with open(html_path, 'w', encoding='utf-8') as f:
            f.write(html)
print("Removed topbar ?? icon")
