**Project Document: Undawn**

---

**1. Game Overview**

- **Title**: Undawn
- **Genre**: Reverse Tower Defense (Web-based)
- **Theme**: Dark-fantasy, grim world where the player is the Dark Emperor fending off invading "heroic" forces.
- **Perspective**: 2D, side-view, lane-based defense
- **Platform**: Web (HTML/JS/Canvas), offline-capable
- **Goal**: Prevent heroes from reaching the left side (castle) using Daen-powered minions.

---

**2. Core Principles**

- **Lightweight**: Optimized for browser; minimal DOM and memory use.
- **Object-Oriented**: Strict class-based structure for units, lanes, game state.
- **Extendable**: New minions/heroes are easy to implement and register.
- **Minimalist**: Clean, functional, short code. No unnecessary abstraction.
- **Maintainable**: Human-readable naming and modular architecture.

---

**3. Game Mechanics**

- **Grid**: 7 lanes x 9 tiles (fixed lane system)
- **Energy**: "Daen" is generated over time or via special minions. Spent to place units.
- **Victory Condition**: Survive waves; prevent all heroes from breaching the left end.
- **Defeat Condition**: Any hero crosses the left-most tile.

---

**4. Development Phases**

**Phase 1 – Core MVP**

- 7-lane grid
- Basic minions and heroes
- Unit placement, movement, attack
- Daen generation and spending
- Game loop with win/lose detection

**Phase 2 – Unit System Expansion**

- Add special minion and hero abilities
- Implement cooldowns, tooltips
- Polished placement and interaction

**Phase 3 – UI/UX Polish**

- Sidebar interface for minions
- Hover/click unit details
- Animations (minimal, CSS or canvas-based)

**Phase 4 – Performance & Cleanup**

- Memory profiling
- Efficient updates and rendering
- Minified production build

**Phase 5 – Extensions**

- More units, wave patterns
- LocalStorage-based progress/save
- Level selector and difficulty scale

---

**5. Core Class Architecture (Simplified)**

```ts
abstract class Unit {
  health: number;
  damage: number;
  speed: number;
  lane: number;
  position: number;
  abstract update(): void;
  abstract render(): void;
}

class Minion extends Unit {
  cost: number;
  cooldown: number;
  update() {...}
  render() {...}
}

class Hero extends Unit {
  specialAbility?: () => void;
  update() {...}
  render() {...}
}

class Tile {
  minion: Minion | null;
  update() {...}
}

class Game {
  lanes: Lane[];
  daen: number;
  update() {...}
  render() {...}
}
```

---

**6. Minion Units**

| Name                 | Role             | Ability                                |
| -------------------- | ---------------- | -------------------------------------- |
| **Ashling**          | Basic melee      | Cheap, low HP attacker                 |
| **Gravelim**         | Ranged           | Fires slow projectiles from distance   |
| **Gnarlroot**        | Blocker          | High HP, no attack                     |
| **Dreadchant**       | Daen Converter   | Gains Daen from enemy deaths in lane   |
| **Carrion Husk**     | Area denial      | Explodes on death (3x3 AoE)            |
| **Spineshade**       | Anti-armor       | Bonus damage vs armored heroes         |
| **Gravemaid**        | Lifestealer      | Heals on attack                        |
| **Necrothurge**      | Mass reanimation | Revives dead units on screen at 25% HP |
| **Daemon Altar**     | Daen Generator   | Pulses +1 Daen every 4s                |
| **Wormbound Knight** | Elite tank       | Magic-immune cleave unit               |
| **Soulweft**         | Summoner         | Periodically spawns Ashlings nearby    |

---

**7. Hero Units**

| Name                | Role         | Ability                                   |
| ------------------- | ------------ | ----------------------------------------- |
| **Militiant**       | Basic melee  | Walks and attacks                         |
| **Pikedead**        | Anti-swarm   | Strikes 2 tiles ahead                     |
| **Ashbolt Scout**   | Ranged       | Fast, ranged attacker                     |
| **Cleansed Sister** | Healer       | Heals adjacent allies periodically        |
| **Oathblade**       | Bruiser      | Attacks faster as HP drops                |
| **Seer-Warden**     | Detector     | Prioritizes stealth/invisible units       |
| **Gildmarcher**     | Daen denial  | Minions killed by her give no Daen        |
| **Saint-Husk**      | Reviver      | Comes back once at 50% HP                 |
| **Lightforged**     | Anti-rez     | Prevents resurrection of units it kills   |
| **Blightbreaker**   | Anti-support | Silences adjacent minion abilities on hit |
| **Banner Judge**    | Buffer       | Boosts allies in same lane                |

---

**8. Tools and Tech**

- **Language**: JavaScript or TypeScript
- **Rendering**: HTML5 Canvas (or light DOM if preferred)
- **Assets**: Vector or minimalist sprites (low-res PNG or procedural)
- **No framework**: Pure JS for full control and performance
- **Storage**: LocalStorage for optional save data

---

**9. Collaboration Plan**

- Shared git repository for version control
- Task list tracked via simple markdown TODOs or project board
- Code reviewed for function-focused clarity, not fluff
- Avoid excessive abstraction: prioritize simplicity and output

---

**End of Document**

