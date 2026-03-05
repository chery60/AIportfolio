import re
import sys

filepath = '/Users/cepl/Documents/AI Projects /NewTool/portfolio/src/data/projects.ts'

with open(filepath, 'r', encoding='utf-8') as f:
    content = f.read()

# I want to be safe, so I'll only do it within the `alchemy-design-system`'s canvasElements.
start_idx = content.find("id: 'alchemy-design-system'")
end_idx = content.find("id: 'flow-app'")

if start_idx == -1 or end_idx == -1:
    print("Could not find project blocks")
    sys.exit(1)

alchemy_content = content[start_idx:end_idx]

def replace_y(match):
    prefix = match.group(1)
    y_val = int(match.group(2))
    suffix = match.group(3)
    
    # We are shifting everything related to rows below the flow diagrams.
    # Flow diagrams end at y=847+480=1327 or 847+520=1367.
    # So we shift any y value >= 1327 by +40.
    if y_val >= 1327:
        return f"{prefix}{y_val + 40}{suffix}"
    return match.group(0)

# match `y:` or `y=` or `y = ` or `y≈` with a number
# we need to preserve any surrounding text if we capture it
# Let's use a regex that safely catches the y-value assignment or comment
new_alchemy_content = re.sub(r'(y\s*[:=≈]\s*)(\d+)([^0-9]?)', replace_y, alchemy_content)

# We also need to change height of fd-current and fd-kiosk from 480 to 520
new_alchemy_content = new_alchemy_content.replace(
    "id: 'fd-current', type: 'flow-diagram', x: 80, y: 847, width: 620, height: 480",
    "id: 'fd-current', type: 'flow-diagram', x: 80, y: 847, width: 620, height: 520"
)
new_alchemy_content = new_alchemy_content.replace(
    "id: 'fd-kiosk', type: 'flow-diagram', x: 780, y: 847, width: 620, height: 480",
    "id: 'fd-kiosk', type: 'flow-diagram', x: 780, y: 847, width: 620, height: 520"
)

# And correctly update the comments for tracking the bottom
new_alchemy_content = new_alchemy_content.replace('847+480', '847+520')
new_alchemy_content = new_alchemy_content.replace('1327', '1367')

content = content[:start_idx] + new_alchemy_content + content[end_idx:]

with open(filepath, 'w', encoding='utf-8') as f:
    f.write(content)

print("Done")
