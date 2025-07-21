// Global battle logs (not used for DOM, reserved for future use)
let battleLogs = [];

// Victory and defeat messages
const victoryMessages = {
  heroes: {
    "Juggernaut": [
      "Juggernaut: My battle thirsts for more!",
      "Juggernaut: The dance of death continues!"
    ],
    "Drow Ranger": [
      "Drow Ranger: The frozen winds guide me",
      "Drow Ranger: Precision beats brute force."
    ],
    "Keeper of the Light": [
      "Kotl: The light shall prevail!",
      "Kotl: Wisdom over strength, always."
    ]
  },
  enemies: {
    "Dire Creeps Wave": "Dire Creeps: We'll be back...stronger!",
    "Primal Beast": "Primal Beast: This isn't over, mortals! GRAAaah!",
    "Roshan, the Immortal": "Roshan: the Aegis... is yours... for now..."
  }
};

// Show the view with the given id and hide all others
function showView(viewId) {
  ['view-start', 'view-characters', 'map-container', 'view-battle', 'view-win', 'view-aegis', 'view-gameover']
    .forEach(id => {
      const el = document.getElementById(id);
      if (el) el.hidden = true;
    });
  const toShow = document.getElementById(viewId);
  toShow.hidden = false;
}

// Hero class definition
class Hero {
  constructor(name, type, hp, attack, specialAbility) {
    this.name = name;
    this.type = type;
    this.hp = hp;
    this.maxHp = hp;
    this.attack = {
      minDamage: attack.minDamage,
      maxDamage: attack.maxDamage
    };
    this.specialAbility = {
      name: specialAbility.name,
      minDamage: specialAbility.minDamage,
      maxDamage: specialAbility.maxDamage,
      used: false
    };
  }
}

// Define heroes
const heroes = [
  new Hero("Juggernaut", "Warrior", 250, { minDamage: 45, maxDamage: 60 }, { name: "Blade Fury", minDamage: 60, maxDamage: 75 }),
  new Hero("Drow Ranger", "Archer", 180, { minDamage: 60, maxDamage: 75 }, { name: "Frost Arrows", minDamage: 55, maxDamage: 70 }),
  new Hero("Keeper of the Light", "Mage", 120, { minDamage: 40, maxDamage: 55 }, { name: "Illuminate", minDamage: 70, maxDamage: 85 })
];

// Variable to store the selected hero
let currentHero = null;

// Load best score from localStorage
function loadBestScore() {
  const bestScore = localStorage.getItem('bestScore') || 0;
  const bestName = localStorage.getItem('bestPlayer') || '---';
  document.getElementById('best-score').textContent = bestScore;
  document.getElementById('best-name').textContent = bestName;
}
window.addEventListener('DOMContentLoaded', loadBestScore);

const levelMapImages = [
  {
    src: "assets/images/levels/level1_unlocked.png", // 1536×1024
    useMap: "#level_big"
  },
  {
    src: "assets/images/levels/level2_unlocked.png", // 1024×1024
    useMap: "#level_small"
  },
  {
    src: "assets/images/levels/level3_unlocked.png", // 1024×1024
    useMap: "#level_small"
  }
];

// Update the src of #lvl-map-img based on the highest unlocked level index
function updateMapImage() {
  // Find the highest unlocked level
  let highestUnlocked = 0;
  for (let i = 0; i < levels.length; i++) {
    if (!levels[i].locked) {
      highestUnlocked = i;
    }
  }

  const config = levelMapImages[highestUnlocked];

  // Get <img id="lvl-map-img"> and ensure it exists
  const mapImg = document.getElementById("lvl-map-img");
  if (!mapImg) return;

  // Change the src and usemap of the image
  mapImg.src = config.src;
  mapImg.setAttribute("usemap", config.useMap);

  // Get all <map name="..."> elements from the DOM
  const allMaps = document.querySelectorAll("map[name]");
  // Name without '#' that should remain active
  const activeMapName = config.useMap.replace("#", "");

  // For each <map> that is not active, temporarily store its name and remove it
  allMaps.forEach(m => {
    const thisName = m.getAttribute("name");
    if (thisName !== activeMapName) {
      m.dataset.origName = thisName;
      m.removeAttribute("name");
    }
  });

  // Once the new image loads, run imageMapResize only for the active <map>, then restore the others
  mapImg.addEventListener("load", function onLoad() {
    if (typeof imageMapResize === "function") {
      // Find the active <map> with name=activeMapName
      const onlyMap = document.querySelector(`map[name="${activeMapName}"]`);
      if (onlyMap) {
        // If your version supports it, pass the element
        try {
          imageMapResize(onlyMap);
        } catch (e) {
          // If it doesn't support a parameter, try calling it without arguments
          console.warn("imageMapResize for a single <map> failed:", e);
        }
      }
    }

    // Restore the name attributes on all other <map> elements
    allMaps.forEach(m => {
      if (!m.getAttribute("name") && m.dataset.origName) {
        m.setAttribute("name", m.dataset.origName);
        delete m.dataset.origName;
      }
    });

    // Remove the listener so it doesn't run on the next load
    mapImg.removeEventListener("load", onLoad);
  });
}

// Enemies for each level
const levels = [
  {
    name: "Wave",
    locked: false,
    completed: false,
    enemy: {
      name: "Dire Creeps Wave",
      hp: 150,
      minAttack: 12,
      maxAttack: 18,
      specialAttack: { name: "Slam", minDamage: 25, maxDamage: 30 }
    }
  },
  {
    name: "Mini Boss",
    locked: true,
    completed: false,
    enemy: {
      name: "Primal Beast",
      hp: 220,
      minAttack: 15,
      maxAttack: 22,
      specialAttack: { name: "Pulverize", minDamage: 30, maxDamage: 40 }
    }
  },
  {
    name: "Final Boss",
    locked: true,
    completed: false,
    enemy: {
      name: "Roshan, the Immortal",
      hp: 300,
      minAttack: 18,
      maxAttack: 25,
      specialAttack: { name: "Fire Breath", minDamage: 40, maxDamage: 50 }
    }
  }
];

// Variable for the current level
let currentLevel = null;

// Flag for end of battle so endBattle doesn't run twice
let battleEnded = false;

// Render the character selection screen
function renderCharacterSelection() {
  const container = document.getElementById("character-container");
  const html = `
    <div class="character-grid">
      <h1 id="Choice">Choose your Hero</h1>
      ${heroes
        .map(
          (hero, index) => `
        <div class="character-card" onclick="startGame(${index})">
          <div class="card-image">
            <img 
              src="assets/images/sprites/hero-cards/${hero.name.toLowerCase()}.png"
              alt="${hero.name}">
          </div>
          <div class="card-stats">
            <p>Name: <strong>${hero.name}</strong></p>
            <p>HP: <strong>${hero.hp}</strong></p>
            <p>Attack: <strong>${hero.attack.minDamage}-${hero.attack.maxDamage}</strong></p>
            <p>Special: <strong>${hero.specialAbility.minDamage}-${hero.specialAbility.maxDamage}</strong></p>
          </div>
        </div>
      `
        )
        .join("")}
    </div>
  `;
  container.innerHTML = html;
}

renderCharacterSelection();

// Show victory or defeat screen and allow restart
function showVictoryScreen(result) {
  const container = document.getElementById("game-container");
  container.innerHTML = `
    <div class="text-center mt-5">
      <h1 class="text-${result === 'victory' ? 'success' : 'danger'}">
        ${result === 'victory' ? 'Radiant Victory!' : 'Dire Victory!'}
      </h1>
      <button class="btn btn-primary mt-3" onclick="restartGame()">Play Again</button>
    </div>`;
}

function restartGame() {
  resetGameState();
  heroes.forEach(h => {
    h.hp = h.maxHp;
    h.specialAbility.used = false;
  });
  showView('view-start');
  renderCharacterSelection();
  loadBestScore();
}

// Show win screen after a level is cleared
function showWinScreen() {
  const winContainer = document.getElementById('view-win');
  const msg = document.getElementById('win-message');
  const winImg = document.getElementById('win-image');

  // Set the victory message and image based on level
  msg.textContent = `You conquered Level ${currentLevel + 1}!`;
  if (currentLevel === 0) {
    winImg.src = 'assets/images/backgrounds/win-screens/creep_wave_defeat.png';
    winImg.alt = 'Creep Wave Defeated';
  } else if (currentLevel === 1) {
    winImg.src = 'assets/images/backgrounds/win-screens/primal_beast_defeat.png';
    winImg.alt = 'Primal Beast Defeated';
  } else {
    winImg.src = '';
    winImg.alt = '';
  }

  winContainer.classList.add('show');
  showView('view-win');

  setTimeout(() => document.getElementById('view-win').classList.add('show'), 50);
  const timer = setTimeout(() => {
    document.getElementById('view-win').classList.remove('show');
    showView('map-container');
  }, 2500);

  document.getElementById('btn-continue').onclick = () => {
    clearTimeout(timer);
    document.getElementById('view-win').classList.remove('show');
    showView('map-container');
  };
}

// End of battle processing
function endBattle() {
  if (battleEnded) return;
  battleEnded = true;

  // Mark current level as completed
  levels[currentLevel].completed = true;

  // Unlock the next level, if it exists, and update the map image
  if (currentLevel < levels.length - 1) {
    levels[currentLevel + 1].locked = false;
    updateMapImage();
  }

  // Visually disable the completed area
  disableCompletedArea(currentLevel);

  if (currentHero.hp > 0) {
    // If player won and it's the last level, go to Aegis
    if (currentLevel === levels.length - 1) {
      setTimeout(() => {
        showView('view-aegis');
        document.getElementById('Red').disabled = false;
        document.getElementById('Yellow').disabled = false;
      }, 3000);
    } else {
      // Display victory messages
      const heroMsgs = victoryMessages.heroes[currentHero.name];
      const randHero = heroMsgs[Math.floor(Math.random() * heroMsgs.length)];
      const enemyMsg = victoryMessages.enemies[currentEnemy.name];
      const logsCont = document.getElementById('battle-logs');

      logsCont.innerHTML = `
        <img src="assets/images/backgrounds/bg-logs.png" class="log-bg" alt="Logs Frame">
        <div class="log-entry final-message">
          <img src="assets/images/icons/victory.png" class="log-icon">${randHero}
        </div>
        <div class="log-entry final-message">
          <img src="assets/images/icons/enemy_defeat.png" class="log-icon">${enemyMsg}
        </div>
      `;

      document.getElementById('Red').disabled = true;
      document.getElementById('Yellow').disabled = true;

      // Show the win screen, then return to the map
      setTimeout(() => showWinScreen(), 3000);
    }
  } else {
    // Defeat → Game Over
    showGameOverScreen(false);
  }

  // Disable action buttons in any case
  document.getElementById('Red').disabled = true;
  document.getElementById('Yellow').disabled = true;
}

// Show Game Over screen
function showGameOverScreen(isVictory) {
  const view = document.getElementById('view-gameover');
  view.className = isVictory ? "victory-bg" : "defeat-bg";
  document.getElementById('gameover-message').textContent = isVictory ? "Radiant Victory!" : "Dire Victory!";
  showView('view-gameover');
  if (!isVictory) {
    document.getElementById('btn-submit-score').onclick = () => {
      const playerName = document.getElementById('player-name').value.trim() || 'Player1';
      updateBestScore(playerName);
      restartGame();
    };
  }
}

// Save best score to localStorage
function updateBestScore(playerName) {
  const currentScore = currentLevel * 100 + currentHero.hp;
  const stored = parseInt(localStorage.getItem('bestScore')) || 0;
  if (currentScore > stored) {
    localStorage.setItem('bestScore', currentScore);
    localStorage.setItem('bestPlayer', playerName);
  }
}

// Visually disable a completed area on the map
function disableCompletedArea(lvlIndex) {
  // Get ALL <area> elements from both maps (level_big & level_small)
  const areasBig = Array.from(document.querySelectorAll('map#level_big area'));
  const areasSmall = Array.from(document.querySelectorAll('map#level_small area'));
  // Create a flat array
  const allAreas = areasBig.concat(areasSmall);
  const area = allAreas[lvlIndex];
  if (!area) return; // if no <area> at this index, stop
  area.style.opacity = "0.5";
  area.style.filter = "grayscale(100%)";
  area.title = "Completed";
}

// Start a level and initialize battle
function startLevel() {
  if (currentLevel < 0 || currentLevel >= levels.length) {
    showView('view-aegis');
    return;
  }
  battleEnded = false;
  battleLogs = [];
  document.getElementById('battle-logs').innerHTML = `
    <img src="assets/images/backgrounds/bg-logs.png" class="log-bg" alt="Logs Frame">
  `;
  currentEnemy = JSON.parse(JSON.stringify(levels[currentLevel].enemy));
  currentEnemy.maxHp = currentEnemy.hp;
  renderBattleInterface();
  setTimeout(() => {
    document.getElementById('Red').disabled = false;
    document.getElementById('Yellow').disabled = currentHero.specialAbility.used;
  }, 100);
}

// Select a hero and go to the map
function startGame(heroIndex) {
  currentHero = JSON.parse(JSON.stringify(heroes[heroIndex]));
  showView('map-container');
  updateMapImage();
}

// Normal attack action
function attack() {
  if (battleEnded || currentEnemy.hp <= 0 || currentHero.hp <= 0) return;
  // Calculate damage for hero and enemy
  const heroDamageResult = getRandomDamage(currentHero.attack.minDamage, currentHero.attack.maxDamage);
  currentEnemy.hp -= heroDamageResult.damage;

  const enemyDamageResult = getRandomDamage(currentEnemy.minAttack, currentEnemy.maxAttack);
  currentHero.hp -= enemyDamageResult.damage;

  // Ensure health values don't go below 0
  currentEnemy.hp = Math.max(0, currentEnemy.hp);
  currentHero.hp = Math.max(0, currentHero.hp);

  updateBattle(heroDamageResult, enemyDamageResult);
}

// Special attack action
function specialAttack() {
  if (battleEnded || currentEnemy.hp <= 0 || currentHero.hp <= 0) return;

  // If special ability already used, set hero damage to 0 and update
  if (currentHero.specialAbility.used) {
    updateBattle({ damage: 0, isCrit: false }, null);
    return;
  }

  // Hero attacks with special ability
  const specialDamageResult = getRandomDamage(
    currentHero.specialAbility.minDamage,
    currentHero.specialAbility.maxDamage,
    true
  );
  currentEnemy.hp -= specialDamageResult.damage;
  currentEnemy.hp = Math.max(0, currentEnemy.hp);

  // Mark that special is used and disable the button
  currentHero.specialAbility.used = true;
  disableSpecialButton();

  // If enemy died immediately from special, update and return
  if (currentEnemy.hp === 0) {
    updateBattle(specialDamageResult, null);
    return;
  }

  // Enemy performs special attack
  const enemySpecialDamage = getRandomDamage(
    currentEnemy.specialAttack.minDamage,
    currentEnemy.specialAttack.maxDamage
  );
  currentHero.hp -= enemySpecialDamage.damage;
  currentHero.hp = Math.max(0, currentHero.hp);

  updateBattle(specialDamageResult, enemySpecialDamage);
}

// Disable the special ability button
function disableSpecialButton() {
  const btn = document.getElementById('Yellow');
  btn.disabled = true;
  btn.innerHTML = `<s>${currentHero.specialAbility.name}</s><span class="text-muted">(Used)</span>`;
  btn.classList.replace('btn-warning', 'btn-secondary');
}

// Update battle UI after each action
function updateBattle(heroDamageResult = null, enemyDamageResult = null) {
  if (battleEnded) return;

  // Find the progress bars for hero and enemy
  const heroBar = document.querySelector('.hero-progress');
  const enemyBar = document.querySelector('.enemy-progress');

  if (heroBar && enemyBar) {
    // Calculate new percentages for hero and enemy
    const heroPct = (currentHero.hp / currentHero.maxHp) * 100;
    const enemyPct = (currentEnemy.hp / currentEnemy.maxHp) * 100;

    // Change the width to trigger CSS transitions
    heroBar.style.width = `${heroPct}%`;
    enemyBar.style.width = `${enemyPct}%`;

    // Update the text inside the bars
    heroBar.textContent = `HP: ${currentHero.hp}`;
    enemyBar.textContent = `HP: ${currentEnemy.hp}`;

    // Flash on enemyBar when hero deals damage
    if (heroDamageResult && heroDamageResult.damage > 0) {
      enemyBar.classList.remove('damage-flash');
      void enemyBar.offsetWidth;
      enemyBar.classList.add('damage-flash');
    }

    // Flash on heroBar when enemy deals damage
    if (enemyDamageResult && enemyDamageResult.damage > 0) {
      heroBar.classList.remove('damage-flash');
      void heroBar.offsetWidth;
      heroBar.classList.add('damage-flash');
    }
  }

  // Hero damage log entry
  if (heroDamageResult) {
    const entry = document.createElement('div');
    entry.className = 'log-entry';
    entry.innerHTML = `
      <img src="assets/images/icons/sword.png" class="log-icon">
      ${currentHero.name} dealt 
      <strong class="${heroDamageResult.isCrit ? 'crit-text' : ''}">
        ${heroDamageResult.damage}
        ${heroDamageResult.isCrit
          ? '<img src="assets/images/icons/lightning.png" class="crit-icon">'
          : ''}
      </strong>`;
    document.getElementById('battle-logs').appendChild(entry);
  }

  // Enemy damage log entry
  if (enemyDamageResult) {
    const entry = document.createElement('div');
    entry.className = 'log-entry';
    entry.innerHTML = `
      <img src="assets/images/icons/shield.png" class="log-icon">
      ${currentEnemy.name} dealt 
      <strong>${enemyDamageResult.damage}</strong>`;
    document.getElementById('battle-logs').appendChild(entry);
  }

  // Keep only the 3 most recent log entries
  const logContent = document.getElementById('battle-logs');
  const entries = logContent.querySelectorAll('.log-entry');
  if (entries.length > 3) {
    const excess = entries.length - 3;
    for (let i = 0; i < excess; i++) {
      entries[i].remove();
    }
  }

  // Check for end of battle conditions
  if (currentEnemy.hp <= 0 || currentHero.hp <= 0) {
    document.getElementById('Red').disabled = true;
    document.getElementById('Yellow').disabled = true;
    setTimeout(() => endBattle(), 1200);
  }
}

// Render the battle interface
function renderBattleInterface() {
  showView("view-battle");
  const container = document.getElementById("game-container");

  container.innerHTML = `
    <div class="text-center">
      <h1 id="Shiny">${currentHero.name} Vs. ${currentEnemy.name}</h1>
      <div class="battle-container">
        <!-- Hero Stats -->
        <div class="hero-stats my-4">
          <img
            src="assets/images/sprites/fight-sprites/${currentHero.name.toLowerCase()}.png"
            width="300"
            alt="${currentHero.name}"
          >
          <h3>${currentHero.name}</h3>
          <div class="progress">
            <!-- Always set width:100% here so the .progress-bar exists, then update it in updateBattle() -->
            <div class="progress-bar hero-progress" style="width: 100%;">
              HP: ${currentHero.hp}
            </div>
          </div>
        </div>

        <!-- Enemy Stats -->
        <div class="enemy-stats my-4">
          <img
            src="assets/images/sprites/fight-sprites/${currentEnemy.name.toLowerCase()}.png"
            width="300"
            alt="${currentEnemy.name}"
          >
          <h3>${currentEnemy.name}</h3>
          <div class="progress">
            <div class="progress-bar bg-danger enemy-progress" style="width: 100%;">
              HP: ${currentEnemy.hp}
            </div>
          </div>
        </div>
      </div>

      <button
        id="Red"
        class="btn btn-danger m-2"
        onclick="attack()"
      >
        Attack
      </button>
      <button
        id="Yellow"
        class="btn m-2 ${currentHero.specialAbility.used ? 'btn-secondary' : 'btn-warning'}"
        onclick="specialAttack()"
        ${currentHero.specialAbility.used ? 'disabled' : ''}
      >
        ${currentHero.specialAbility.used
          ? `<s>${currentHero.specialAbility.name}</s><span class="text-muted">(Used)</span>`
          : currentHero.specialAbility.name}
      </button>
    </div>
  `;

  // Call updateBattle() immediately to animate health bars
  updateBattle();
}

// Function for random damage calculation and crit chance
function getRandomDamage(min, max, isSpecial = false) {
  const base = Math.floor(Math.random() * (max - min + 1)) + min;
  const critChance = isSpecial ? 0.25 : 0.15;
  const isCrit = Math.random() < critChance;
  return { damage: isCrit ? base * 3 : base, isCrit };
}

// Handle Aegis submission and reset game
document.getElementById('btn-aegis-submit').addEventListener('click', function() {
  const playerName = document.getElementById('aegis-player-name').value.trim() || 'Player1';
  updateBestScore(playerName);
  restartGame();
});

// Reset game state for a new session
function resetGameState() {
  levels.forEach((lvl, idx) => {
    lvl.completed = false;
    lvl.locked = idx !== 0;
  });
  currentLevel = 0;
  currentHero = null;
  const areas = document.querySelectorAll('map#level area');
  areas.forEach((area, idx) => {
    area.style.opacity = "1";
    area.style.filter = "none";
    area.title = area.alt;
  });
}
