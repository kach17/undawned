/**
 * Game class - Core game engine
 * Handles game loop, state management, and rendering
 */
class Game {
    constructor(canvasId) {
        // Canvas and renderer setup
        this.canvas = document.getElementById(canvasId);
        this.ctx = this.canvas.getContext('2d');
        this.renderer = new Renderer(this.canvas, this);
        
        // Game state
        this.daen = 10; // Starting Daen energy
        this.lanes = [];
        this.selectedMinionType = null;
        this.gameOver = false;
        
        // Wave management
        this.waveNumber = 0;
        this.waveTimer = 0;
        this.baseWaveInterval = 30000; // Base time between waves (30 seconds)
        this.minWaveInterval = 10000;  // Minimum time between waves (10 seconds)
        this.waveInterval = this.baseWaveInterval;
        this.heroesInWave = 0;
        this.heroesRemaining = 0;
        this.onslaughtTriggered = false;
        this.onslaughtComplete = false;
        this.bossWave = false;
        this.spawnTimer = 0;
        this.spawnDelay = 1000; // Start with 1 second between spawns
        
        // Grid configuration
        this.laneCount = 7;
        this.tileCount = 10;
        
        // Set initial canvas size and calculate dimensions
        this.resizeCanvas();
        
        // Initialize lanes
        this.initializeLanes();
        
        // Animation frame ID for cancellation
        this.animationFrameId = null;
        
        // Game state flags
        this.isPaused = false;
        this.isPreparingNextWave = false;
        this.preparationTimer = 0;
    }
    
    /**
     * Initialize the game lanes
     */
    initializeLanes() {
        for (let i = 0; i < this.laneCount; i++) {
            const lane = new Lane(i, this.tileCount, this);
            this.lanes.push(lane);
        }
    }
    
    // Note: Input handling is now in InputHandler class
    
    /**
     * Resize canvas to fit container
     */
    resizeCanvas() {
        const container = this.canvas.parentElement;
        const width = Math.min(container.clientWidth, 1200); // Max width for better visibility
        const height = Math.min(container.clientHeight, 800); // Max height
        
        this.canvas.width = width;
        this.canvas.height = height;
        
        // Recalculate tile dimensions
        this.tileWidth = this.canvas.width / this.tileCount;
        this.laneHeight = this.canvas.height / this.laneCount;
        
        // Update renderer dimensions
        this.renderer.updateDimensions();
        
        // Update any UI elements that depend on canvas size
        this.updateUIAfterResize();
    }
    
    /**
     * Update UI elements after canvas resize
     */
    updateUIAfterResize() {
        // Update any UI elements that depend on canvas size
        const minionButtons = document.getElementById('minion-buttons');
        if (minionButtons) {
            minionButtons.style.width = `${this.canvas.width}px`;
        }
    }
    
    /**
     * Select a minion type for placement
     * @param {string} minionType - The type of minion to select
     */
    selectMinion(minionType) {
        this.selectedMinionType = minionType;
    }
    
    /**
     * Check if a minion can be placed at the specified position
     * @param {number} laneIndex - The lane index (0 to laneCount-1)
     * @param {number} tileIndex - The tile index (0 to tileCount-1)
     * @returns {boolean} True if minion can be placed, false otherwise
     */
    canPlaceMinion(laneIndex, tileIndex) {
        // Validate position
        if (laneIndex < 0 || laneIndex >= this.laneCount || 
            tileIndex < 0 || tileIndex >= this.tileCount) {
            return false;
        }
        
        // Check if a minion is selected and we have enough Daen
        if (!this.selectedMinionType) {
            return false;
        }
        
        const MinionClass = MinionRegistry[this.selectedMinionType];
        if (!MinionClass || this.daen < MinionClass.cost) {
            return false;
        }
        
        // Check if the tile is empty
        const lane = this.lanes[laneIndex];
        return lane && lane.tiles && lane.tiles[tileIndex] && !lane.tiles[tileIndex].minion;
    }
    
    /**
     * Place a minion at the specified position
     * @param {number} laneIndex - The lane index (0 to laneCount-1)
     * @param {number} tileIndex - The tile index (0 to tileCount-1)
     * @returns {boolean} True if minion was placed, false otherwise
     */
    placeMinionAt(laneIndex, tileIndex) {
        if (!this.canPlaceMinion(laneIndex, tileIndex)) {
            return false;
        }
        
        const MinionClass = MinionRegistry[this.selectedMinionType];
        const lane = this.lanes[laneIndex];
        
        // Create a new minion instance
        const minion = new MinionClass(laneIndex, tileIndex, this);
        
        // Try to place the minion
        if (lane.placeMinion(minion, tileIndex)) {
            // Deduct Daen cost
            this.daen -= MinionClass.cost;
            
            // Update UI
            this.updateDaenDisplay();
            
            // Play placement sound or effect
            this.playSound('place');
            
            return true;
        }
        
        return false;
    }
    
    /**
     * Update the Daen display in the UI
     */
    updateDaenDisplay() {
        const daenElement = document.getElementById('daen-count');
        if (daenElement) {
            daenElement.textContent = Math.floor(this.daen);
        }
    }
    
    /**
     * Display floating text at a position
     * @param {string} text - The text to display
     * @param {number} [x=this.canvas.width/2] - X position (centered by default)
     * @param {number} [y=this.canvas.height/2] - Y position (centered by default)
     * @param {string} [color='#ffffff'] - Text color
     * @param {number} [duration=1000] - Duration in ms
     * @param {string} [font='24px Arial'] - Font style
     * @param {string} [effect='none'] - Optional effect: 'fade', 'grow', or 'none'
     * @returns {void}
     */
    showFloatingText(text, x, y, color, duration, font, effect) {
        this.renderer.showFloatingText(text, x, y, color, duration, font, effect);
    }
    
    /**
     * Generate Daen over time
     * @param {number} deltaTime - Time elapsed since last update in ms
     */
    generateDaen(deltaTime) {
        // Base Daen generation: 1 Daen per 2 seconds
        this.daen += (deltaTime / 2000);
        this.updateDaenDisplay();
    }
    
    /**
     * Get the wave scaling factor for hero stats
     * @returns {number} Scaling factor (1.0 for wave 1, 1.05 for wave 2, etc.)
     */
    getWaveScaling() {
        // 5% increase per wave, starting from wave 1
        return 1 + ((this.waveNumber - 1) * 0.05);
    }

    /**
     * Calculate the number of heroes to spawn in this wave
     * @returns {number} Number of heroes to spawn
     */
    calculateHeroCount() {
        // Base heroes: 10 + 5 per wave
        let count = 10 + (this.waveNumber * 5);
        
        // Boss wave (every 5 waves) has 50% more heroes
        if (this.waveNumber % 5 === 0) {
            count = Math.floor(count * 1.5);
            this.bossWave = true;
        } else {
            this.bossWave = false;
        }
        
        return count;
    }
    
    /**
     * Check if onslaught should be triggered
     */
    checkForOnslaught() {
        if (this.onslaughtTriggered || this.onslaughtComplete) return;
        
        // Trigger onslaught when 20% of wave remains
        const onslaughtThreshold = Math.ceil(this.heroesInWave * 0.2);
        if (this.heroesRemaining <= onslaughtThreshold) {
            this.triggerOnslaught();
        }
    }
    
    /**
     * Trigger the onslaught phase
     * @param {number} [multiplier=2] - Multiplier for the number of additional heroes
     * @param {string} [message='ONSLAUGHT!'] - Message to display
     * @param {string} [color='#ff0000'] - Text color for the message
     * @param {number} [duration=2000] - How long to show the message in milliseconds
     * @param {string} [font='48px Arial'] - Font style for the message
     */
    triggerOnslaught(multiplier = 2, message = 'ONSLAUGHT!', color = '#ff0000', duration = 2000, font = '48px Arial') {
        this.onslaughtTriggered = true;
        this.onslaughtComplete = false;
        
        // Add more heroes for onslaught based on multiplier
        const onslaughtCount = Math.ceil(this.heroesInWave * multiplier);
        this.heroesInWave += onslaughtCount;
        this.heroesRemaining += onslaughtCount;
        
        // Faster spawn rate during onslaught
        this.spawnDelay = this.bossWave ? 400 : 500;
        
        // Visual/audio feedback
        this.showFloatingText(
            message,
            this.canvas.width / 2, 
            this.canvas.height / 2, 
            color, 
            duration,
            font
        );
    }
    
    /**
     * Start a new wave
     * @param {Object} [options] - Wave configuration options
     * @param {boolean} [options.isBossWave] - Whether this is a boss wave
     * @param {number} [options.heroCount] - Override calculated hero count
     * @param {number} [options.spawnDelay] - Override default spawn delay
     * @param {string} [options.waveType='normal'] - Type of wave: 'normal', 'fast', 'elite', 'mixed'
     * @param {number} [options.waveNumber] - Override the wave number
     */
    startWave(options = {}) {
        this.waveNumber = options.waveNumber !== undefined ? options.waveNumber : this.waveNumber + 1;
        this.onslaughtTriggered = false;
        this.onslaughtComplete = false;
        this.isPreparingNextWave = false;
        
        // Calculate number of heroes for this wave
        this.heroesInWave = options.heroCount || this.calculateHeroCount();
        this.heroesRemaining = this.heroesInWave;
        
        // Set spawn delay
        if (options.spawnDelay !== undefined) {
            this.spawnDelay = options.spawnDelay;
        } else {
            // Default spawn delay based on wave number (faster in later waves)
            this.spawnDelay = Math.max(300, 1000 - (this.waveNumber * 20));
            if (options.isBossWave || this.bossWave) {
                this.spawnDelay = 700; // Slightly faster for boss waves
                this.bossWave = true;
            }
        }
        
        // Reset spawn timer
        this.spawnTimer = 0;
        
        console.log(`Starting ${options.waveType || 'normal'} Wave ${this.waveNumber} with ${this.heroesInWave} heroes`);
        
        // Visual feedback for boss waves
        if (this.bossWave) {
            this.showFloatingText(
                `BOSS WAVE ${Math.floor(this.waveNumber / 5)}!`,
                this.canvas.width / 2,
                100,
                '#ff0000',
                2500,
                '36px Arial'
            );
        }
    }
    

    
    /**
     * Spawn a new wave of heroes
     * @param {Object} [options] - Wave configuration options
     * @param {number} [options.waveNumber] - Override the wave number
     * @param {number} [options.heroCount] - Override calculated hero count
     * @param {boolean} [options.isBossWave] - Force boss wave status
     * @param {number} [options.spawnDelay] - Override default spawn delay
     * @param {string} [options.waveType='normal'] - Type of wave: 'normal', 'fast', 'elite', 'mixed'
     */
    spawnWave(options = {}) {
        // Start the wave with custom options
        this.startWave({
            isBossWave: options.isBossWave,
            heroCount: options.heroCount,
            spawnDelay: options.spawnDelay,
            waveType: options.waveType,
            waveNumber: options.waveNumber
        });
        
        // Start spawning heroes
        this.spawnNextHero();
    }
    
    /**
     * Spawn the next hero in the wave
     */
    spawnNextHero() {
        if (this.heroesRemaining <= 0) {
            // No more heroes to spawn in this wave
            if (this.onslaughtTriggered) {
                this.onslaughtComplete = true;
                this.onslaughtTriggered = false;
            }
            return;
        }
        
        // Choose a random lane
        const laneIndex = Math.floor(Math.random() * this.laneCount);
        this.spawnHeroInLane(laneIndex);
        
        // Update counters
        this.heroesRemaining--;
        
        // Check for onslaught (when 20% of wave remains)
        const onslaughtThreshold = Math.ceil(this.heroesInWave * 0.2);
        if (this.heroesRemaining === onslaughtThreshold && !this.onslaughtTriggered) {
            this.triggerOnslaught();
                }
                
        // Schedule next spawn if there are more heroes to spawn
        if (this.heroesRemaining > 0) {
            // Calculate delay based on whether we're in onslaught or not
            let delay = this.spawnDelay;
            
            // Add some randomness to make it feel more organic
            delay += (Math.random() * 200) - 100; // ±100ms
            
            // Schedule next spawn
            setTimeout(() => this.spawnNextHero(), Math.max(100, delay));
        } else if (this.onslaughtTriggered) {
            // If we're in onslaught and out of heroes, mark as complete
            this.onslaughtComplete = true;
            this.onslaughtTriggered = false;
        }
    }
    
    /**
     * Spawn a hero in a specific lane with customizable properties
     * @param {number} laneIndex - The lane index to spawn the hero in
     * @param {Object} [options] - Hero spawn options
     * @param {string} [options.heroType] - Force specific hero type ('militant', 'ashbolt', 'oathblade')
     * @param {number} [options.healthMultiplier=1] - Scale the hero's health
     * @param {number} [options.damageMultiplier=1] - Scale the hero's damage
     * @param {number} [options.speedMultiplier=1] - Scale the hero's speed
     * @param {number} [options.startTile] - Override starting tile position
     * @returns {Hero} The spawned hero instance
     */
    spawnHeroInLane(laneIndex, options = {}) {
        if (laneIndex < 0 || laneIndex >= this.lanes.length) {
            console.error(`Invalid lane index: ${laneIndex}`);
            return null;
        }
        
        const waveScaling = this.getWaveScaling();
        const startTile = options.startTile !== undefined ? options.startTile : this.tileCount - 1;
        
        // Determine hero type
        let hero;
        if (options.heroType) {
            // Use specified hero type if provided
            switch (options.heroType.toLowerCase()) {
                case 'ashbolt':
                case 'ashboltscout':
                    hero = new AshboltScout(laneIndex, startTile, this);
                    break;
                case 'oathblade':
                    hero = new Oathblade(laneIndex, startTile, this);
                    break;
                case 'militant':
                default:
                    hero = new Militiant(laneIndex, startTile, this);
            }
        } else {
            // Randomly select based on wave number if no type specified
            const heroTypeRoll = Math.random();
            if (this.waveNumber >= 10 && heroTypeRoll > 0.7) {
                hero = new Oathblade(laneIndex, startTile, this);
            } else if (this.waveNumber >= 5 && heroTypeRoll > 0.5) {
                hero = new AshboltScout(laneIndex, startTile, this);
            } else {
                hero = new Militiant(laneIndex, startTile, this);
            }
        }
        
        // Apply scaling and multipliers
        const healthScale = waveScaling * (options.healthMultiplier || 1);
        const damageScale = waveScaling * (options.damageMultiplier || 1);
        const speedScale = options.speedMultiplier || 1;
        
        // Apply base scaling
        hero.health = Math.ceil(hero.health * healthScale);
        hero.maxHealth = hero.health;
        hero.damage = Math.ceil(hero.damage * damageScale);
        hero.moveSpeed *= speedScale;
        
        // Boss wave scaling (every 5 waves)
        if (this.waveNumber % 5 === 0) {
            hero.health = Math.ceil(hero.health * 1.5);
            hero.maxHealth = hero.health;
            hero.damage = Math.ceil(hero.damage * 1.5);
            hero.moveSpeed *= 0.8; // Slightly slower but tougher
        }
        
        // More aggressive speed scaling in later waves
        const waveSpeedScale = Math.min(1.5, 1 + ((this.waveNumber - 1) * 0.02)); // Increased cap to 50%
        hero.moveSpeed *= waveSpeedScale;
        
        // Random speed variation for more dynamic waves
        hero.moveSpeed *= (0.9 + Math.random() * 0.2); // ±10% speed variation
        
        // Add to lane
        this.lanes[laneIndex].addHero(hero);
        
        // Show wave indicator for player
        this.showFloatingText(
            `Wave ${this.waveNumber} - ${hero.constructor.name}`,
            this.canvas.width / 2,
            50,
            '#ffffff',
            2000
        );
        
        return hero;
    }
    
    /**
     * Check if any hero has reached the castle (game over condition)
     */
    checkGameOver() {
        for (const lane of this.lanes) {
            for (const hero of lane.heroes) {
                if (hero.position <= 0) {
                    this.gameOver = true;
                    this.victory = false;
                    return;
                }
            }
        }
        
        // Check for victory (all waves cleared)
        if (this.waveNumber >= 10 && this.areAllHeroesDead()) {
            this.gameOver = true;
            this.victory = true;
        }
    }
    
    /**
     * Check if all heroes are dead
     * @returns {boolean} True if all heroes are dead, false otherwise
     */
    areAllHeroesDead() {
        for (const lane of this.lanes) {
            if (lane.heroes.length > 0) {
                return false;
            }
        }
        
        // If we get here, all heroes are dead
        // Start preparation for next wave if we're not already in preparation
        if (!this.isPreparingNextWave && this.heroesRemaining === 0 && this.waveNumber > 0) {
            this.startNextWavePreparation();
        }
        
        return true;
    }
    
    /**
     * Start the preparation phase for the next wave
     * @param {number} [duration=15000] - Preparation time in milliseconds
     * @param {string} [message='PREPARE FOR NEXT WAVE!'] - Message to display
     * @param {string} [color='#00ff00'] - Text color for the message
     * @param {number} [durationMs=2500] - How long to show the message in milliseconds
     * @param {string} [font='36px Arial'] - Font style for the message
     */
    startNextWavePreparation(duration = 15000, message = 'PREPARE FOR NEXT WAVE!', color = '#00ff00', durationMs = 2500, font = '36px Arial') {
        if (this.isPreparingNextWave) return;
        
        // Award bonus Daen for completing the wave
        const waveBonus = 10 + (this.waveNumber * 2); // Base 10 + 2 per wave
        this.daen += waveBonus;
        this.updateDaenDisplay();
        
        // Show bonus message
        this.showFloatingText(
            `+${waveBonus} Daen Bonus!`,
            this.canvas.width / 2,
            this.canvas.height / 2 - 50,
            '#00ff00',
            2000,
            '24px Arial'
        );
        
        this.isPreparingNextWave = true;
        this.preparationTimer = duration;
        
        // Show preparation message
        this.showFloatingText(
            message,
            this.canvas.width / 2,
            this.canvas.height / 2,
            color,
            durationMs,
            font
        );
        
        console.log(`Starting ${duration/1000}-second preparation for next wave`);
    }
    
    /**
     * Update game state
     * @param {number} deltaTime - Time elapsed since last update in ms
     */
    update(deltaTime) {
        if (this.gameOver || this.isPaused) return;
        
        // Generate Daen over time (fixed at 0.64 per 2 seconds)
        this.daen += (deltaTime / 2000) * 0.64;
        this.updateDaenDisplay();
        
        // Handle wave preparation timer
        if (this.isPreparingNextWave) {
            this.preparationTimer -= deltaTime;
            if (this.preparationTimer <= 0) {
                this.isPreparingNextWave = false;
                this.spawnWave();
            }
        } else {
            // Only update wave timer if not in preparation phase
            this.waveTimer += deltaTime;
            if (this.waveTimer >= this.waveInterval && !this.heroesInWave) {
                this.waveTimer = 0;
                this.spawnWave();
            }
        }
        
        // Update all lanes
        for (const lane of this.lanes) {
            lane.update(deltaTime);
        }
        
        // Check if all heroes are dead (handles wave progression)
        this.areAllHeroesDead();
        
        // Check game over conditions
        this.checkGameOver();
    }
    
    /**
     * Draw the game background
     * @deprecated Use this.renderer.drawBackground() instead
     */
    drawBackground() {
        this.renderer.drawBackground();
    }
    
    /**
     * Draw the game grid
     * @deprecated Use this.renderer.drawGrid() instead
     */
    drawGrid() {
        this.renderer.drawGrid();
    }
    
    /**
     * Start the game loop
     */
    start() {
        let lastTime = 0;
        
        const gameLoop = (timestamp) => {
            // Calculate delta time
            const deltaTime = timestamp - (lastTime || timestamp);
            lastTime = timestamp;
            
            // Update game state if not paused
            if (!this.isPaused) {
                this.update(deltaTime);
            }
            
            // Always render, even when paused
            this.render();
            
            // Continue the game loop
            this.animationFrameId = requestAnimationFrame(gameLoop);
        };
        
        // Start the loop
        this.animationFrameId = requestAnimationFrame(gameLoop);
    }
    
    /**
     * Render the game
     */
    render() {
        // Clear the canvas
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        
        // Delegate rendering to the Renderer instance
        this.renderer.render();
    }
    
    /**
     * Stop the game loop
     */
    stop() {
        if (this.animationFrameId) {
            cancelAnimationFrame(this.animationFrameId);
            this.animationFrameId = null;
        }
    }
    
    /**
     * Restart the game
     */
    restart() {
        // Reset game state
        this.daen = 10;
        this.lanes = [];
        this.selectedMinionType = null;
        this.gameOver = false;
        this.waveNumber = 0;
        this.waveTimer = 0;
        
        // Reinitialize lanes
        this.initializeLanes();
        
        // Update UI
        this.updateDaenDisplay();
        
        // Restart game loop
        this.stop();
        this.start();
    }
}