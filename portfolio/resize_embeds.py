import sys

filepath = '/Users/cepl/Documents/AI Projects /NewTool/portfolio/src/data/projects.ts'

with open(filepath, 'r', encoding='utf-8') as f:
    content = f.read()

start_pattern = "      // ── ROW 6: FIGMA EMBEDS"
end_pattern = "    ]\n  },"
start_idx = content.find(start_pattern)

# find the next end_pattern
end_idx = content.find(end_pattern, start_idx)

if start_idx == -1 or end_idx == -1:
    print("Could not find patterns")
    sys.exit(1)

WIDTH = 720
HEIGHT = 540
GAP = 80
SL_GAP = 56

y_sl7 = 4193
y_fe1 = y_sl7 + 40 + SL_GAP
y_fe3 = y_fe1 + HEIGHT + GAP

y_sl8 = y_fe3 + HEIGHT + GAP
y_ve = y_sl8 + 40 + SL_GAP

y_sl9 = y_ve + HEIGHT + GAP
y_tc = y_sl9 + 40 + SL_GAP

y_sl10 = y_tc + 110 + GAP
y_sb = y_sl10 + 40 + SL_GAP

y_slgame = y_sb + HEIGHT + GAP
y_gz = y_slgame + 40 + 20
y_hint = y_gz + 680 + 20

new_block = f"""      // ── ROW 6: FIGMA EMBEDS ───────────────────────────────────────────────
      // dd row-2 bottom: y=3923+190=4073 → sl-7 y=4113+80=4153
      // sl h=40 → fe y=4193+40+56=4249
      // 2 embeds side by side max: width={WIDTH} each, gap={GAP}
      // fe-3 on next row
      {{
        id: 'sl-7', type: 'section-label', x: 80, y: {y_sl7}, width: 560, height: 40,
        data: {{ title: 'LIVE FIGMA FILES — SITEMAP, VIEW SUMMARY & TASK FLOWS', color: '#A855F7' }}
      }},
      {{
        id: 'fe-1', type: 'figma-embed', x: 80, y: {y_fe1}, width: {WIDTH}, height: {HEIGHT},
        data: {{
          title: 'Kiosk · Sitemap',
          description: 'Full sitemap — from entering restaurant to food pickup',
          figmaUrl: 'https://www.figma.com/embed?embed_host=share&url=https%3A%2F%2Fwww.figma.com%2Fdesign%2Fo3nHV47UkzxHDz7OMfDrn2%2FKiosk%3Fnode-id%3D2436-101059%26t%3DeZhWgo3YibYXDxqn-4',
          accentColor: '#A855F7',
        }}
      }},
      {{
        id: 'fe-2', type: 'figma-embed', x: {80 + WIDTH + GAP}, y: {y_fe1}, width: {WIDTH}, height: {HEIGHT},
        data: {{
          title: 'Kiosk · View Summary',
          description: 'High-level view summary of the kiosk design',
          figmaUrl: 'https://www.figma.com/embed?embed_host=share&url=https%3A%2F%2Fwww.figma.com%2Fdesign%2Fo3nHV47UkzxHDz7OMfDrn2%2FKiosk%3Fnode-id%3D65860-7363%26t%3D7aXa5YustdH1dbnO-4',
          accentColor: '#6366F1',
        }}
      }},
      {{
        id: 'fe-3', type: 'figma-embed', x: 80, y: {y_fe3}, width: {WIDTH}, height: {HEIGHT},
        data: {{
          title: 'Kiosk · Task Flows',
          description: 'Developer-ready task flows broken into buildable phases',
          figmaUrl: 'https://www.figma.com/embed?embed_host=share&url=https%3A%2F%2Fwww.figma.com%2Fdesign%2Fo3nHV47UkzxHDz7OMfDrn2%2FKiosk%3Fnode-id%3D5470-288291',
          accentColor: '#EC4899',
        }}
      }},

      // ── ROW 7: VIDEO EMBEDS ───────────────────────────────────────────────
      // fe bottom: y={y_fe3}+{HEIGHT}={y_fe3+HEIGHT} → sl-8 y={y_fe3+HEIGHT}+{GAP}={y_sl8}
      // sl h=40 → ve y={y_sl8}+40+{SL_GAP}={y_ve}
      {{
        id: 'sl-8', type: 'section-label', x: 80, y: {y_sl8}, width: 400, height: 40,
        data: {{ title: 'PROTOTYPE PRESENTATION — VIDEO WALKTHROUGHS', color: '#EC4899' }}
      }},
      {{
        id: 've-1', type: 'video-embed', x: 80, y: {y_ve}, width: {WIDTH}, height: {HEIGHT},
        data: {{
          title: 'Kiosk Prototype · Walk-through 1',
          description: 'Full order flow — start to payment. Portrait mode. Redwood Cafe theme.',
          videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
          accentColor: '#C74B18',
        }}
      }},
      {{
        id: 've-2', type: 'video-embed', x: {80 + WIDTH + GAP}, y: {y_ve}, width: {WIDTH}, height: {HEIGHT},
        data: {{
          title: 'Kiosk Prototype · Walk-through 2',
          description: 'Bilingual flow with Spanish support. Landscape mode walkthrough.',
          videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
          accentColor: '#6366F1',
        }}
      }},

      // ── ROW 8: TAGS ───────────────────────────────────────────────────────
      // ve bottom: y={y_ve}+{HEIGHT}={y_ve+HEIGHT} → sl-9 y={y_ve+HEIGHT}+{GAP}={y_sl9}
      // sl h=40 → tc y={y_sl9}+40+{SL_GAP}={y_tc}
      {{
        id: 'sl-9', type: 'section-label', x: 80, y: {y_sl9}, width: 340, height: 40,
        data: {{ title: 'SKILLS APPLIED', color: '#C74B18' }}
      }},
      {{
        id: 'tc-1', type: 'tag-cluster', x: 80, y: {y_tc}, width: 820, height: 110,
        data: {{
          title: 'SKILLS APPLIED',
          tags: [
            {{ label: 'UX Research', color: '#C74B18' }},
            {{ label: 'User Personas', color: '#F59E0B' }},
            {{ label: 'Information Architecture', color: '#10B981' }},
            {{ label: 'Kiosk UX', color: '#6366F1' }},
            {{ label: 'Figma Prototyping', color: '#A855F7' }},
            {{ label: 'Enterprise Design', color: '#EC4899' }},
            {{ label: 'Accessibility', color: '#22D3EE' }},
            {{ label: '0→1 Product', color: '#FBBF24' }},
          ]
        }}
      }},

      // ── STORYBOARDS ──────────────────────────────────────────────────────
      // tc bottom: y={y_tc}+110={y_tc+110} → sl-10 y={y_tc+110}+{GAP}={y_sl10}
      // sl h=40 → sb y={y_sl10}+40+{SL_GAP}={y_sb}
      {{
        id: 'sl-10', type: 'section-label', x: 80, y: {y_sl10}, width: 400, height: 40,
        data: {{ title: 'THE PROBLEM & SOLUTION — STORYBOARD', color: '#F59E0B' }}
      }},
      {{
        id: 'sb-problem', type: 'storyboard', x: 80, y: {y_sb}, width: {WIDTH}, height: {HEIGHT}, zIndex: 10,
        data: {{
          boardType: 'problem',
          dialogues: [
            {{ characterName: 'Harry', text: "Let's grab some lunch here, I'm starving.", color: '#3B82F6' }},
            {{ characterName: 'Wife', text: "Sure, let's go inside.", color: '#F97316' }},
            {{ characterName: 'Harry', text: "Whoa, look at that queue...", color: '#3B82F6' }},
            {{ characterName: 'Harry', text: "This is taking forever.", color: '#3B82F6' }},
            {{ characterName: 'Wife', text: "We've been waiting for 30 minutes! This is ridiculous.", color: '#F97316' }},
            {{ characterName: 'Janice (Manager)', text: "Carl is the only one taking orders. We're so short-staffed.", color: '#06B6D4' }},
            {{ characterName: 'Carl (Cashier)', text: "Sorry, let me fix that order...", color: '#22C55E' }},
            {{ characterName: 'Janice (Manager)', text: "This manual process is too slow. Guests are leaving!", color: '#06B6D4' }}
          ]
        }}
      }},
      {{
        id: 'sb-solution', type: 'storyboard', x: {80 + WIDTH + GAP}, y: {y_sb}, width: {WIDTH}, height: {HEIGHT}, zIndex: 10,
        data: {{
          boardType: 'solution',
          dialogues: [
            {{ characterName: 'Harry', text: "Let's try this place again. They have new screens.", color: '#3B82F6' }},
            {{ characterName: 'Wife', text: "Oh, self-service kiosks? Let's see if it's faster.", color: '#F97316' }},
            {{ characterName: 'Harry', text: "Wow, ordering was so easy and quick!", color: '#3B82F6' }},
            {{ characterName: 'Wife', text: "And no waiting in a huge line!", color: '#F97316' }},
            {{ characterName: 'Carl (Cashier)', text: "With the kiosks taking orders, I have time to prep food faster!", color: '#22C55E' }},
            {{ characterName: 'Janice (Manager)', text: "Our service times are down, and our average order size has increased! The kiosks are a huge success.", color: '#06B6D4' }}
          ]
        }}
      }},

      // ── GAME ZONE ─────────────────────────────────────────────────────────
      // sb bottom: y={y_sb}+{HEIGHT}={y_sb+HEIGHT} → sl-game y={y_sb+HEIGHT}+{GAP}={y_slgame}
      // sl h=40 → gz y={y_slgame}+40+20={y_gz}
      // gz bottom: y={y_gz}+680={y_gz+680} → hints y≈{y_hint}
      {{
        id: 'sl-game', type: 'section-label', x: 80, y: {y_slgame}, width: 480, height: 40,
        data: {{ title: '🎮 CREWMATE DASH — PLAY & HIRE ME', color: '#C74B18' }}
      }},
      {{
        id: 'gz-1', type: 'game-zone', x: 80, y: {y_gz}, width: 1160, height: 680,
        data: {{
          title: 'Crewmate Dash',
          accentColor: '#C74B18',
          contactEmail: 'saicharan@example.com',
          contactLinkedIn: 'https://linkedin.com/in/saicharan',
        }}
      }},
      {{
        id: 'sn-game-hint', type: 'sticky-note', x: 80, y: {y_hint}, width: 280, height: 120,
        data: {{
          content: '🕹️ Dodge obstacles & get on the leaderboard. Space or tap to jump!',
          color: 'yellow',
          rotation: -1.2,
        }}
      }},
      {{
        id: 'sn-game-hint2', type: 'sticky-note', x: 380, y: {y_hint + 15}, width: 260, height: 110,
        data: {{
          content: '⚠️ Only 1 player at a time — queue up if someone is already playing!',
          color: 'pink',
          rotation: 1,
        }}
      }},
"""

content = content[:start_idx] + new_block + content[end_idx:]

content = content.replace("canvasSize: { width: 2700, height: 10000 }", f"canvasSize: {{ width: 2700, height: {y_hint + 200} }}")

with open(filepath, 'w', encoding='utf-8') as f:
    f.write(content)

print("Done")
