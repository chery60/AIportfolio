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

new_block = """      // ── ROW 6: FIGMA EMBEDS ───────────────────────────────────────────────
      // dd row-2 bottom: y=3923+190=4073 → sl-7 y=4113+80=4153
      // sl h=40 → fe y=4193+40+56=4249
      // 2 embeds side by side max: width=1080 each, gap=80
      // fe-3 on next row
      {
        id: 'sl-7', type: 'section-label', x: 80, y: 4193, width: 560, height: 40,
        data: { title: 'LIVE FIGMA FILES — SITEMAP, VIEW SUMMARY & TASK FLOWS', color: '#A855F7' }
      },
      {
        id: 'fe-1', type: 'figma-embed', x: 80, y: 4249, width: 1080, height: 832,
        data: {
          title: 'Kiosk · Sitemap',
          description: 'Full sitemap — from entering restaurant to food pickup',
          figmaUrl: 'https://www.figma.com/embed?embed_host=share&url=https%3A%2F%2Fwww.figma.com%2Fdesign%2Fo3nHV47UkzxHDz7OMfDrn2%2FKiosk%3Fnode-id%3D2436-101059%26t%3DeZhWgo3YibYXDxqn-4',
          accentColor: '#A855F7',
        }
      },
      {
        id: 'fe-2', type: 'figma-embed', x: 1240, y: 4249, width: 1080, height: 832,
        data: {
          title: 'Kiosk · View Summary',
          description: 'High-level view summary of the kiosk design',
          figmaUrl: 'https://www.figma.com/embed?embed_host=share&url=https%3A%2F%2Fwww.figma.com%2Fdesign%2Fo3nHV47UkzxHDz7OMfDrn2%2FKiosk%3Fnode-id%3D65860-7363%26t%3D7aXa5YustdH1dbnO-4',
          accentColor: '#6366F1',
        }
      },
      {
        id: 'fe-3', type: 'figma-embed', x: 80, y: 5161, width: 1080, height: 832,
        data: {
          title: 'Kiosk · Task Flows',
          description: 'Developer-ready task flows broken into buildable phases',
          figmaUrl: 'https://www.figma.com/embed?embed_host=share&url=https%3A%2F%2Fwww.figma.com%2Fdesign%2Fo3nHV47UkzxHDz7OMfDrn2%2FKiosk%3Fnode-id%3D5470-288291',
          accentColor: '#EC4899',
        }
      },

      // ── ROW 7: VIDEO EMBEDS ───────────────────────────────────────────────
      // fe bottom: y=5161+832=5993 → sl-8 y=5993+80=6073
      // sl h=40 → ve y=6073+40+56=6169
      {
        id: 'sl-8', type: 'section-label', x: 80, y: 6073, width: 400, height: 40,
        data: { title: 'PROTOTYPE PRESENTATION — VIDEO WALKTHROUGHS', color: '#EC4899' }
      },
      {
        id: 've-1', type: 'video-embed', x: 80, y: 6169, width: 1080, height: 832,
        data: {
          title: 'Kiosk Prototype · Walk-through 1',
          description: 'Full order flow — start to payment. Portrait mode. Redwood Cafe theme.',
          videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
          accentColor: '#C74B18',
        }
      },
      {
        id: 've-2', type: 'video-embed', x: 1240, y: 6169, width: 1080, height: 832,
        data: {
          title: 'Kiosk Prototype · Walk-through 2',
          description: 'Bilingual flow with Spanish support. Landscape mode walkthrough.',
          videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
          accentColor: '#6366F1',
        }
      },

      // ── ROW 8: TAGS ───────────────────────────────────────────────────────
      // ve bottom: y=6169+832=7001 → sl-9 y=7001+80=7081
      // sl h=40 → tc y=7081+40+56=7177
      {
        id: 'sl-9', type: 'section-label', x: 80, y: 7081, width: 340, height: 40,
        data: { title: 'SKILLS APPLIED', color: '#C74B18' }
      },
      {
        id: 'tc-1', type: 'tag-cluster', x: 80, y: 7177, width: 820, height: 110,
        data: {
          title: 'SKILLS APPLIED',
          tags: [
            { label: 'UX Research', color: '#C74B18' },
            { label: 'User Personas', color: '#F59E0B' },
            { label: 'Information Architecture', color: '#10B981' },
            { label: 'Kiosk UX', color: '#6366F1' },
            { label: 'Figma Prototyping', color: '#A855F7' },
            { label: 'Enterprise Design', color: '#EC4899' },
            { label: 'Accessibility', color: '#22D3EE' },
            { label: '0→1 Product', color: '#FBBF24' },
          ]
        }
      },

      // ── STORYBOARDS ──────────────────────────────────────────────────────
      // tc bottom: y=7177+110=7287 → sl-10 y=7287+80=7367
      // sl h=40 → sb y=7367+40+56=7463
      {
        id: 'sl-10', type: 'section-label', x: 80, y: 7367, width: 400, height: 40,
        data: { title: 'THE PROBLEM & SOLUTION — STORYBOARD', color: '#F59E0B' }
      },
      {
        id: 'sb-problem', type: 'storyboard', x: 80, y: 7463, width: 1080, height: 832, zIndex: 10,
        data: {
          boardType: 'problem',
          dialogues: [
            { characterName: 'Harry', text: "Let's grab some lunch here, I'm starving.", color: '#3B82F6' },
            { characterName: 'Wife', text: "Sure, let's go inside.", color: '#F97316' },
            { characterName: 'Harry', text: "Whoa, look at that queue...", color: '#3B82F6' },
            { characterName: 'Harry', text: "This is taking forever.", color: '#3B82F6' },
            { characterName: 'Wife', text: "We've been waiting for 30 minutes! This is ridiculous.", color: '#F97316' },
            { characterName: 'Janice (Manager)', text: "Carl is the only one taking orders. We're so short-staffed.", color: '#06B6D4' },
            { characterName: 'Carl (Cashier)', text: "Sorry, let me fix that order...", color: '#22C55E' },
            { characterName: 'Janice (Manager)', text: "This manual process is too slow. Guests are leaving!", color: '#06B6D4' }
          ]
        }
      },
      {
        id: 'sb-solution', type: 'storyboard', x: 1240, y: 7463, width: 1080, height: 832, zIndex: 10,
        data: {
          boardType: 'solution',
          dialogues: [
            { characterName: 'Harry', text: "Let's try this place again. They have new screens.", color: '#3B82F6' },
            { characterName: 'Wife', text: "Oh, self-service kiosks? Let's see if it's faster.", color: '#F97316' },
            { characterName: 'Harry', text: "Wow, ordering was so easy and quick!", color: '#3B82F6' },
            { characterName: 'Wife', text: "And no waiting in a huge line!", color: '#F97316' },
            { characterName: 'Carl (Cashier)', text: "With the kiosks taking orders, I have time to prep food faster!", color: '#22C55E' },
            { characterName: 'Janice (Manager)', text: "Our service times are down, and our average order size has increased! The kiosks are a huge success.", color: '#06B6D4' }
          ]
        }
      },

      // ── THANK YOU / GAME HOOK ─────────────────────────────────────────────
      // sb bottom: y=7463+832=8295 → sl-thanks y=8295+100=8395
      // sl h=40 → card y=8395+40+16=8451, height=300 → ends=8751
      // sticky notes y=8751+80=8831, h=130 → ends=8961
      // gap 100 → sl-game y=8961+100=9061
      // sl h=40 → gz y=9061+40+16=9117, h=680 → ends=9797
      // hints y=9797+60=9857
      {
        id: 'sl-thanks', type: 'section-label', x: 80, y: 8395, width: 480, height: 40,
        data: { title: '👋 THAT\'S A WRAP — YOU MADE IT!', color: '#F59E0B' }
      },
      {
        id: 'cs-thanks', type: 'case-study-card', x: 80, y: 8451, width: 1080, height: 300,
        data: {
          title: 'You just reviewed the entire Oracle Symphony Kiosk case study.',
          subtitle: 'Thanks for going through every screen, every decision, every pixel.',
          description: "You've seen the problem space, the research, the architecture, the process, the prototypes — and just now, the story play out in a restaurant. That's the full picture of how I think and build. If this kind of work excites you, I'd love to chat. But first — you've earned a game. 🎮 Play Crewmate Dash below, get on the leaderboard, and then let's talk.",
          tags: ['Thanks for reading', 'Let\'s connect', 'Now go play 🕹️'],
          accentColor: '#F59E0B',
          metrics: [
            { label: 'Sections Covered', value: '10+' },
            { label: 'Time Well Spent', value: '✓' },
            { label: 'Ready to Chat?', value: 'Yes!' },
          ],
        }
      },
      {
        id: 'sn-thanks-1', type: 'sticky-note', x: 80, y: 8831, width: 280, height: 130,
        data: {
          content: '🧠 You now know more about this kiosk than most people at the company.',
          color: 'cyan',
          rotation: -1,
        }
      },
      {
        id: 'sn-thanks-2', type: 'sticky-note', x: 400, y: 8816, width: 280, height: 130,
        data: {
          content: '🏆 Beat the leaderboard and I\'ll know you were thorough AND competitive.',
          color: 'green',
          rotation: 1.2,
        }
      },
      {
        id: 'sn-thanks-3', type: 'sticky-note', x: 720, y: 8826, width: 280, height: 130,
        data: {
          content: '💌 Liked what you saw? Hit "Message Me" on the right panel — let\'s talk!',
          color: 'purple',
          rotation: -0.8,
        }
      },

      // ── GAME ZONE ─────────────────────────────────────────────────────────
      {
        id: 'sl-game', type: 'section-label', x: 80, y: 9061, width: 480, height: 40,
        data: { title: '🎮 CREWMATE DASH — PLAY & HIRE ME', color: '#C74B18' }
      },
      {
        id: 'gz-1', type: 'game-zone', x: 80, y: 9117, width: 1160, height: 680,
        data: {
          title: 'Crewmate Dash',
          accentColor: '#C74B18',
          contactEmail: 'saicharan@example.com',
          contactLinkedIn: 'https://linkedin.com/in/saicharan',
        }
      },
      {
        id: 'sn-game-hint', type: 'sticky-note', x: 80, y: 9857, width: 280, height: 120,
        data: {
          content: '🕹️ Dodge obstacles & get on the leaderboard. Space or tap to jump!',
          color: 'yellow',
          rotation: -1.2,
        }
      },
      {
        id: 'sn-game-hint2', type: 'sticky-note', x: 380, y: 9872, width: 260, height: 110,
        data: {
          content: '⚠️ Only 1 player at a time — queue up if someone is already playing!',
          color: 'pink',
          rotation: 1,
        }
      },
"""

content = content[:start_idx] + new_block + content[end_idx:]

content = content.replace("canvasSize: { width: 2700, height: 8000 }", "canvasSize: { width: 2700, height: 10000 }")
content = content.replace("canvasSize: { width: 2700, height: 8040 }", "canvasSize: { width: 2700, height: 10000 }")

with open(filepath, 'w', encoding='utf-8') as f:
    f.write(content)

print("Done")
