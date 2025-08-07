/**
 * Minion - Base class for all player-controlled units
 * Extends the Unit class
 */
class Minion extends Unit {
    constructor(lane, position, game) {
        super(lane, position, game);
        
        // Minion-specific properties
        this.cost = 5; // Base Daen cost
        this.cooldown = 0; // Ability cooldown
    }
    
    /**
     * Update minion state
     * @param {number} deltaTime - Time elapsed since last update in ms
     */
    update(deltaTime) {
        // Decrease attack cooldown
        if (this.attackCooldown > 0) {
            this.attackCooldown -= deltaTime;
        }
        
        // Get lane object
        const lane = this.game.lanes[this.lane];
        
        // Find closest hero in range
        const target = this.findTarget(lane);
        
        // Attack if target found and cooldown is ready
        if (target && this.attackCooldown <= 0) {
            this.attack(target);
            this.attackCooldown = 1000 / this.attackSpeed; // Reset cooldown
        }
        
        // Update ability cooldown
        if (this.cooldown > 0) {
            this.cooldown -= deltaTime;
        }
    }
    
    /**
     * Find the closest hero in attack range
     * @param {Lane} lane - The lane to search in
     * @returns {Hero|null} - The target hero or null if none found
     */
    findTarget(lane) {
        let closestHero = null;
        let closestDistance = Infinity;
        
        for (const hero of lane.heroes) {
            const distance = Math.abs(this.position - hero.position);
            
            // Check if hero is in range and closer than current closest
            if (distance <= this.attackRange && distance < closestDistance) {
                closestHero = hero;
                closestDistance = distance;
            }
        }
        
        return closestHero;
    }
    
    /**
     * Handle minion death
     */
    die() {
        // Remove from lane
        const lane = this.game.lanes[this.lane];
        lane.removeMinion(this);
    }
    
    /**
     * Get class-specific static properties
     */
    static get cost() {
        return 5; // Default cost
    }
    
    static get name() {
        return 'Minion'; // Default name
    }
    
    static get description() {
        return 'Base minion unit'; // Default description
    }
}

/**
 * Ashling - Basic melee minion
 * Cheap, low HP attacker
 */
class Ashling extends Minion {
    constructor(lane, position, game) {
        super(lane, position, game);
        
        // Override base properties
        this.health = 60;
        this.maxHealth = 60;
        this.damage = 15;
        this.attackSpeed = 1.2;
        this.attackRange = 5; // Increased from 1 to 5
        this.moveSpeed = 0;
        
        // Visual properties
        this.color = '#ff5722'; // Orange-red
        this.size = 0.6;
    }
    
    static get cost() {
        return 3;
    }
    
    static get name() {
        return 'Ashling';
    }
    
    static get description() {
        return 'Cheap, low HP melee attacker';
    }
}

/**
 * Gravelim - Ranged minion
 * Fires slow projectiles from distance
 */
class Gravelim extends Minion {
    constructor(lane, position, game) {
        super(lane, position, game);
        
        // Override base properties
        this.health = 40;
        this.maxHealth = 40;
        this.damage = 12;
        this.attackSpeed = 0.8;
        this.attackRange = 7; // Increased from 3 to 7
        this.moveSpeed = 0;
        
        // Visual properties
        this.color = '#2196f3'; // Blue
        this.size = 0.55;
    }
    
    static get cost() {
        return 5;
    }
    
    static get name() {
        return 'Gravelim';
    }
    
    static get description() {
        return 'Ranged unit that fires slow projectiles';
    }
}

/**
 * Gnarlroot - Blocker minion
 * High HP, no attack
 */
class Gnarlroot extends Minion {
    constructor(lane, position, game) {
        super(lane, position, game);
        
        // Override base properties
        this.health = 200;
        this.maxHealth = 200;
        this.damage = 0;
        this.attackSpeed = 0;
        this.attackRange = 0;
        this.moveSpeed = 0;
        
        // Visual properties
        this.color = '#8bc34a'; // Green
        this.size = 0.8;
    }
    
    update(deltaTime) {
        // Gnarlroot doesn't attack, just exists as a blocker
    }
    
    static get cost() {
        return 4;
    }
    
    static get name() {
        return 'Gnarlroot';
    }
    
    static get description() {
        return 'High HP blocker with no attack';
    }
}

/**
 * DaemonAltar - Daen Generator
 * Pulses +1 Daen every 20 seconds
 */
class DaemonAltar extends Minion {
    constructor(lane, position, game) {
        super(lane, position, game);
        
        // Override base properties
        this.health = 80;
        this.maxHealth = 80;
        this.damage = 0;
        this.attackSpeed = 0;
        this.attackRange = 0;
        this.moveSpeed = 0;
        
        // Special properties
        this.daenPulseRate = 20000; // 20 seconds
        this.daenPulseAmount = 1;
        this.pulseTimer = 0;
        
        // Visual properties
        this.color = '#9c27b0'; // Purple
        this.size = 0.7;
    }
    
    update(deltaTime) {
        // Update pulse timer
        this.pulseTimer += deltaTime;
        
        // Generate Daen when timer reaches pulse rate
        if (this.pulseTimer >= this.daenPulseRate) {
            this.game.daen += this.daenPulseAmount;
            this.game.updateDaenDisplay();
            this.pulseTimer = 0;
        }
    }
    
    render(ctx, tileWidth, laneHeight) {
        // Call parent render method
        super.render(ctx, tileWidth, laneHeight);
        
        // Add pulse effect when close to generating Daen
        if (this.pulseTimer > this.daenPulseRate * 0.75) {
            const x = this.position * tileWidth + (tileWidth / 2);
            const y = this.lane * laneHeight + (laneHeight / 2);
            const radius = Math.min(tileWidth, laneHeight) * this.size / 2;
            
            // Draw pulse circle
            const pulseProgress = (this.pulseTimer - (this.daenPulseRate * 0.75)) / (this.daenPulseRate * 0.25);
            const pulseRadius = radius * (1 + pulseProgress * 0.5);
            
            ctx.globalAlpha = 0.7 - pulseProgress * 0.7;
            ctx.fillStyle = '#ba68c8';
            ctx.beginPath();
            ctx.arc(x, y, pulseRadius, 0, Math.PI * 2);
            ctx.fill();
            ctx.globalAlpha = 1.0;
        }
    }
    
    static get cost() {
        return 8;
    }
    
    static get name() {
        return 'Daemon Altar';
    }
    
    static get description() {
        return 'Generates +1 Daen every 20 seconds';
    }
}

/**
 * Dreadchant - Daen Converter
 * Gains Daen from enemy deaths in lane
 */
class Dreadchant extends Minion {
    constructor(lane, position, game) {
        super(lane, position, game);
        
        // Override base properties
        this.health = 80;
        this.maxHealth = 80;
        this.damage = 10;
        this.attackSpeed = 1.0;
        this.attackRange = 2; // Increased from 1 to 2
        this.moveSpeed = 0;
        
        // Special properties
        this.daenPerKill = 3; // Daen gained per enemy death
        this.conversionRange = 3; // Range in tiles
        
        // Visual properties
        this.color = '#ff9800'; // Orange
        this.size = 0.65;
    }
    
    /**
     * Called when a hero dies in the same lane
     * @param {Hero} hero - The hero that died
     */
    onEnemyDeath(hero) {
        // Check if hero is within conversion range
        if (Math.abs(this.position - hero.position) <= this.conversionRange) {
            // Add Daen directly to the game's daen property
            this.game.daen += this.daenPerKill;
            // Update the UI to reflect the new Daen amount
            this.game.updateDaenDisplay();
            // Visual feedback
            this.game.showFloatingText(
                `+${this.daenPerKill} Daen`,
                this.position * this.game.tileWidth,
                this.lane * this.game.laneHeight + 20,
                '#ffeb3b' // Yellow
            );
        }
    }
    
    static get cost() {
        return 8;
    }
    
    static get name() {
        return 'Dreadchant';
    }
    
    static get description() {
        return 'Gains Daen when enemies die nearby';
    }
}

// Registry of all minion types
const MinionRegistry = {
    'ashling': Ashling,
    'gravelim': Gravelim,
    'gnarlroot': Gnarlroot,
    'daemonaltar': DaemonAltar,
    'dreadchant': Dreadchant
};