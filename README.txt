Road to Immortal – README

––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––

PROJECT OVERVIEW
This is a browser-based, single-player game called “Road to Immortal.” You choose one of three heroes and battle through three levels: a wave of creeps, a mini-boss, and the final boss. Defeating all levels earns you the Aegis and a spot on the high-score board. The best score and player name are stored in your browser’s localStorage.

KEY FEATURES
•	Pixel-art, sprite-based visuals with custom “PixelFont” for retro styling
•	Multiple views: Start screen, Character Selection, Map, Battle, Level Win, Aegis Reward, Game Over
•	Three distinct heroes, each with unique HP, attack range, and a one-time special ability
•	Three enemy encounters (levels) that unlock sequentially
•	Animated progress bars for HP, crit-chance mechanics, and battle log entries with fade animations
•	Responsive layout using Bootstrap 5
•	Best-score leaderboard saved locally

––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––

GETTING STARTED

1. Unzip or clone the project folder to your local machine.
2. Ensure all files and folders are kept together in the same directory structure.
3. Open the “index.html” file in a modern web browser (Chrome, Firefox, Edge).
4. For the best fullscreen experience, press F11 (or View → Enter Full Screen) after loading the page.

––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––

FILE STRUCTURE
(project root)
├─ index.html
├─ style.css
├─ script.js
├─ assets/
│   ├─ images/
│   │   ├─ backgrounds/
│   │   ├─ fonts/
│   │   ├─ icons/
│   │   ├─ levels/
│   │   ├─ sprites/
│   │   └─ cursors/
│   └─ js/
│       └─ imageMapResizer.min.js
└─ README.txt  ← (this file)

BRIEF DESCRIPTION OF EACH FILE/FOLDER
•	index.html
•	Main HTML entry point.
•	Defines all views (“view-start,” “view-characters,” “map-container,” “view-battle,” “view-win,” “view-aegis,” “view-gameover”).
•	Includes Bootstrap CSS/JS from CDN, the custom style.css, the image-map-resizer library, and the game logic in script.js.
•	Contains inline <script> for level selection (selectLevel) and initial view setup.

•	style.css
•	Custom styling for pixelated retro look: “PixelFont” @font-face, drop-shadow/glow animations, progress-bar styles, card layouts, button hover/active effects, and full-screen backgrounds for each view.
•	Defines responsive layout for character grid, battle container flex settings, and input/button focus removal to keep the pixel aesthetic free of outlines/carets.

•	script.js
•	All core game logic in plain JavaScript (ES6+).
•	Hero constructor and array of three hero objects with name, type, HP, attack range, and one-time special ability.
•	Level definitions (enemy stats) and sequential unlocking logic.
•	showView(viewId): Hides all other views and shows the requested view.
•	renderCharacterSelection(): Dynamically populates the Character Selection screen with hero cards.
•	startGame(heroIndex): Copies the selected hero data, switches to the map view, and updates the map image.
•	selectLevel(lvlIndex, evt): Validates level locked/completed status, sets currentLevel, switches to battle view, and starts the battle.
•	startLevel(): Clones the current enemy stats, resets battle log, enables action buttons.
•	attack() and specialAttack(): Calculate random damage (includes crit chances), deduct HP, update progress bars and logs.
•	updateBattle(): Animates HP bars, adds log entries (keeps last 3), checks for battle end conditions.
•	endBattle(): Marks level completed, unlocks next level (if any), displays victory/defeat messages, and transitions to Level Win, Aegis, or Game Over screens.
•	updateBestScore(playerName): Computes score (levelIndex \* 100 + hero HP), stores to localStorage if it’s higher than existing.
•	showWinScreen(), showGameOverScreen(): Render the respective full-screen overlays with messages, input for player name, and submit buttons.
•	resetGameState(): Resets all levels to initial locked/completed status and restores map area opacity.
•	getRandomDamage(min, max, isSpecial): Returns an object {damage: number, isCrit: boolean}, where crit multiplies base damage by 3 (15% chance for normal, 25% for special).

•	assets/images/
•	backgrounds/
– bg-title, bg-battle, bg-logs, bg-aegis, bg-victory, bg-defeat, view-character-bg.png, map-bg.png
•	sprites/hero-cards/
– juggernaut.png, drow ranger.png, keeper of the light.png (character card images)
•	sprites/fight-sprites/
– juggernaut.png, drow ranger.png, keeper of the light.png, dire creeps wave.png, primal beast.png, roshan, the immortal.png (in-battle images)
•	icons/
– sword.png (hero attack icon), shield.png (enemy attack icon), lightning.png (crit icon), victory.png, enemy\_defeat.png, aegis.png (reward icon), cursors (pointer.png, play\_hover.png, default.png, special\_ability.png)
•	levels/
– level1\_unlocked.png (1536×1024), level2\_unlocked.png (1024×1024), level3\_unlocked.png (1024×1024)
•	fonts/
– pixel-font.ttf (used in style.css)

•	assets/js/imageMapResizer.min.js
•	Third-party library to auto-resize <map> areas when the responsive <img> changes size.

––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––

DEPENDENCIES
•	Bootstrap 5.3 (CSS & JS) via CDN – Provides grid system, utilities, and some UI components.
•	imageMapResizer – Ensures the responsive image maps in the Map view scale correctly when the browser window changes size.
•	No back-end server is required; all game logic runs in the browser.

––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––

HOW TO PLAY

1. Open index.html in a modern browser.
2. Press F11 for fullscreen mode (removes browser UI for better immersion).
3. On the Start screen, click the large PLAY button (pixel-styled image).
4. Choose one of three hero cards: Juggernaut (Warrior), Drow Ranger (Archer), or Keeper of the Light (Mage). Each card shows HP and attack/special-ability ranges.
5. The Map view appears, showing up to three circular areas (levels). Hover-over cursors change to indicate clickable regions.
6. Click a level area:
   •	If locked, an alert reminds you to complete previous levels first.
   •	If already completed, an alert says “You’ve already won this level!”
   •	If available, the battle view launches.
7. In Battle:
   •	The top area shows the hero sprite on the left, enemy sprite on the right, and their current HP bars.
   •	Click “Attack” for a normal attack (15% crit chance). “Special” triggers your hero’s special ability (25% crit chance), but only once per level. After using, the special button is crossed-out and disabled.
   •	Damage is randomly chosen between min and max values. Crits triple base damage. Both hero and enemy simultaneously deal damage each turn.
   •	Battle log entries appear under the HP bars, showing icons and damage amounts. Only the last three entries remain visible.
   •	When either side’s HP reaches zero, action buttons are disabled and endBattle() runs after a brief delay.
8. End-of-Battle Outcomes:
   •	If the hero wins and it’s not the final level, a short victory animation with quotes displays, then transitions back to the Map view. The next level unlocks.
   •	If the hero wins the final level (Roshan, the Immortal), the Aegis Reward view appears: enter your name and click Submit to record your score.
   •	If the hero is defeated, the Game Over view displays: enter your name and click Submit Score to record your score if it’s a new high.
9. The Best Score panel on the Start screen always shows the highest score and player name saved in localStorage. New best scores overwrite existing values.

––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––

CODE ORGANIZATION & COMMENTS
•	All JavaScript is contained in script.js, with clear function names and inline comments explaining purpose.
•	style.css uses descriptive class/ID names and grouped sections (e.g., buttons, progress bars, map container, battle logs) with comments to clarify animations and pixel-art effects.
•	HTML is semantically structured: each major screen/view is wrapped in a <div id="view-…"> with unique IDs, initially hidden or shown via showView().
•	No numbering is used in comments; all comments in script.js are concise English phrases (e.g., “// Hero class to store hero properties,” “// Calculate random damage and possible critical hits”).
•	CSS comments describe keyframe animations, hover/active styles, font-face declarations, and utility overrides (outline removal).

––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––

TROUBLESHOOTING & TIPS
•	If image maps don’t resize correctly, make sure imageMapResizer.min.js is correctly linked and that <img> has usemap attribute matching <map name>.
•	In some browsers, loading index.html directly from file:// might block localStorage or imageMapResizer. If issues arise, run a simple static server (e.g., Python: python3 -m http.server in project folder) and navigate to [http://localhost:8000](http://localhost:8000).
•	Use F11 or hide browser toolbars for a seamless pixel-art feel and to prevent accidental clicks outside the game area.
•	If you see distorted fonts, ensure assets/images/fonts/pixel-font.ttf is present and not blocked by the browser.
•	To reset all progress (levels and best-score), clear localStorage for this domain in your browser’s Developer Tools (Application → Storage → Local Storage → Delete entries).

––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––

SUGGESTIONS FOR FUTURE IMPROVEMENTS
•	Add background music and sound effects for attacks, victories, and defeats.
•	Include more levels, randomized enemy encounters, or a leveling system for heroes.
•	Allow controller/keyboard input as an alternative to mouse clicks (e.g., arrow keys to select, spacebar to attack).
•	Implement responsive scaling for very small screens (phone/tablet) by rearranging battle stats vertically.
•	Enhance AI by giving enemies cooldowns on special attacks or adaptive difficulty.
•	Add a “Settings” panel to toggle fullscreen, sound volume, and possibly a “restart from level X” feature.
•	Include a “Credits” screen to acknowledge asset sources and contributors.

––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––

Thank you for reviewing “Road to Immortal.” Press F11 for best experience and enjoy the journey to claim the Aegis!

––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––
