# This file should ensure the existence of records required to run the application in every environment (production,
# development, test). The code here should be idempotent so that it can be executed at any point in every environment.
# The data can then be loaded with the bin/rails db:seed command (or created alongside the database with db:setup).
#
# Example:
#
#   ["Action", "Comedy", "Drama", "Horror"].each do |genre_name|
#     MovieGenre.find_or_create_by!(name: genre_name)
#   end
#
User.create(
  name: "Raja Hafify",
  email: "rajahafify.zaed@gmail.com",
  password: "password",
  password_confirmation: "password"
)

user = User.first

post = Post.new(
  title: "Introducing Orbwalker",
  slug: "introducing-orbwalker",
  status: :published,
  author: user
)
post.body = <<~HTML
  <h2>What is Orbwalker?</h2>
  <p>Orbwalker is a fantasy match-3 roguelike where you freely drag orbs to unleash powerful combos. Build your arsenal across procedurally generated runs — every decision shapes your path to victory.</p>

  <h2>Core Mechanic</h2>
  <p>Instead of swapping adjacent orbs, you <strong>drag one orb freely</strong> across the board under a 5‑second timer. Orbs displace others as you move, and routing a single orb can trigger cascading matches that chain across the board.</p>
  <p>Match three or more orbs of the same type in lines, L‑shapes, or T‑shapes. Each match deals damage, heals, or provides resources depending on the orb type, and longer combos multiply your effects.</p>

  <h3>The Six Orb Types</h3>
  <ul>
    <li><strong>Fire</strong> – damage</li>
    <li><strong>Ice</strong> – damage</li>
    <li><strong>Earth</strong> – damage</li>
    <li><strong>Heart</strong> – healing</li>
    <li><strong>Armor</strong> – defense</li>
    <li><strong>Gold</strong> – in‑run currency</li>
  </ul>
  <p>Damage‑type orbs scale with combo multipliers, while Heart and Gold provide flat value unaffected by combo length.</p>

  <h2>Turn-Based Combat</h2>
  <p>Every enemy broadcasts its intent before you act, so you know exactly what you're facing. Use your orb‑dragging turn to match elements, route cascades, and decide when to heal, defend, or press the attack. No memorization — just planning and reaction.</p>

  <h2>Build Your Arsenal</h2>
  <p>Between battles you'll spend gold at the shop. Equip gear that changes orb values or adds new powers, deepen your mastery in any orb type to raise its per‑match effect, and purchase relics and consumables that unlock entirely new tactical layers. Your build shapes every run.</p>

  <h2>Design Pillars</h2>
  <ul>
    <li><strong>Free Movement</strong> — full routing control with a single drag</li>
    <li><strong>Build-Driven Depth</strong> — equipment, masteries, consumables and relics define your strategy</li>
    <li><strong>Clear Enemy Intent</strong> — always know the next attack</li>
    <li><strong>Short, Readable Fights</strong> — depth from speed, not memorization</li>
    <li><strong>Fantasy First</strong> — gear and relics feel magical, not abstract</li>
    <li><strong>Cascade Mastery</strong> — chain reactions multiply damage in a satisfying combo system</li>
  </ul>

  <h2>Development Status</h2>
  <p>Orbwalker is in active development. We're building core gameplay, visual identity, and the procedural dungeon layer. Follow the devlog for the latest updates, playtest windows, and behind‑the‑scenes looks at the craft.</p>

  <h2>Get Involved</h2>
  <p><strong>Wishlist on Steam</strong> · <strong>Join our Discord community</strong> · <strong>Follow the devlog</strong> for in‑depth articles on game mechanics, art, and design.</p>
  <p>Thank you for joining us on this journey — we can't wait to put Orbwalker in your hands.</p>
HTML

post.save!
