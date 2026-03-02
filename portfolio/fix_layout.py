import re

with open("src/data/projects.ts", "r") as f:
    content = f.read()

# Shift all y coordinates >= 920 in the alchemy-design-system project by 300
def shift_y(match):
    prefix = match.group(1)
    y_val = int(match.group(2))
    suffix = match.group(3)
    if y_val >= 920 and y_val < 5000: # only in alchemy logic
        return f"{prefix}{y_val + 300}{suffix}"
    return match.group(0)

# We only want to apply this to the first project, so let's split the content
parts = content.split("id: 'flow-app',")
alchemy_part = parts[0]
rest_part = "id: 'flow-app'," + parts[1]

# Apply y shift
alchemy_part = re.sub(r'(y:\s*)(\d+)(,?)', shift_y, alchemy_part)

# Now fix the SYSTEM ARCHITECTURE section specifically
# Row 1b label
alchemy_part = alchemy_part.replace(
    "id: 'sl-arch', type: 'section-label', x: 80, y: 500, width: 400, height: 40,",
    "id: 'sl-arch', type: 'section-label', x: 80, y: 650, width: 400, height: 40,"
)

# fd-current diagram
alchemy_part = alchemy_part.replace(
    "id: 'fd-current', type: 'flow-diagram', x: 80, y: 555, width: 480, height: 380,",
    "id: 'fd-current', type: 'flow-diagram', x: 80, y: 705, width: 620, height: 480,"
)
# fd-current elements
alchemy_part = alchemy_part.replace(
    "{ id: 'kds', label: 'Kitchen Display\\nSystem',          color: '#10B981', x: 315, y: 60,  width: 140, height: 110 },",
    "{ id: 'kds', label: 'Kitchen Display\\nSystem',          color: '#10B981', x: 450, y: 60,  width: 140, height: 110 },"
)
alchemy_part = alchemy_part.replace(
    "{ id: 'pos', label: 'Point of Sale',                    color: '#F59E0B', x: 170, y: 220, width: 140, height: 110 },",
    "{ id: 'pos', label: 'Point of Sale',                    color: '#F59E0B', x: 235, y: 220, width: 140, height: 110 },"
)

# fd-kiosk diagram
alchemy_part = alchemy_part.replace(
    "id: 'fd-kiosk', type: 'flow-diagram', x: 580, y: 555, width: 480, height: 380,",
    "id: 'fd-kiosk', type: 'flow-diagram', x: 740, y: 705, width: 620, height: 480,"
)
# fd-kiosk elements
alchemy_part = alchemy_part.replace(
    "{ id: 'kiosk', label: 'Symphony\\nKiosk',                color: '#C74B18', x: 170, y: 20,  width: 140, height: 110 },",
    "{ id: 'kiosk', label: 'Symphony\\nKiosk',                color: '#C74B18', x: 235, y: 20,  width: 140, height: 110 },"
)
alchemy_part = alchemy_part.replace(
    "{ id: 'kds2', label: 'Kitchen Display\\nSystem',          color: '#10B981', x: 315, y: 190, width: 140, height: 110 },",
    "{ id: 'kds2', label: 'Kitchen Display\\nSystem',          color: '#10B981', x: 450, y: 190, width: 140, height: 110 },"
)
alchemy_part = alchemy_part.replace(
    "{ id: 'pos2', label: 'Point of Sale',                    color: '#F59E0B', x: 170, y: 220, width: 140, height: 110 },",
    "{ id: 'pos2', label: 'Point of Sale',                    color: '#F59E0B', x: 235, y: 340, width: 140, height: 110 },"
)

new_content = alchemy_part + rest_part

with open("src/data/projects.ts", "w") as f:
    f.write(new_content)

print("Done fixing layout")
