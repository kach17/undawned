/**
 * Hero - Base class for all enemy units
 * Extends the Unit class
 */
class Hero extends Unit {
    constructor(lane, position, game) {
        super(lane, position, game);
        
        // Hero-specific properties
        this.direction = -1; // Heroes move left (towards castle)
    }
    
    /**
     * Update hero state
     * @param {number} deltaTime - Time elapsed since last update in ms
     */
    update(deltaTime) {
        // Decrease attack cooldown
        if (this.attackCooldown > 0) {
            this.attackCooldown -= deltaTime;
        }
        
        // Get lane object
        const lane = this.game.lanes[this.lane];
        
        // Find closest minion in range
        const target = this.findTarget(lane);
        
        // Attack if target found and cooldown is ready
        if (target && this.attackCooldown <= 0) {
            this.attack(target);
            this.attackCooldown = 1000 / this.attackSpeed; // Reset cooldown
        } else if (!target) {
            // Move if no target in range
            this.move(deltaTime, this.direction);
        }
    }
    
    /**
     * Find the closest minion in attack range
     * @param {Lane} lane - The lane to search in
     * @returns {Minion|null} - The target minion or null if none found
     */
    findTarget(lane) {
        let closestMinion = null;
        let closestDistance = Infinity;
        
        for (const minion of lane.minions) {
            const distance = Math.abs(this.position - minion.position);
            
            // Check if minion is in range and closer than current closest
            if (distance <= this.attackRange && distance < closestDistance) {
                closestMinion = minion;
                closestDistance = distance;
            }
        }
        
        return closestMinion;
    }
    
    /**
     * Handle hero death
     */
    die() {
        // Remove from lane
        const lane = this.game.lanes[this.lane];
        lane.removeHero(this);
    }
}

/**
 * Militiant - Basic melee hero
 * Walks and attacks
 */
class Militiant extends Hero {
    constructor(lane, position, game) {
        super(lane, position, game);
        
        // Override base properties
        this.health = 80;
        this.maxHealth = 80;
        this.damage = 10;
        this.attackSpeed = 1;
        this.attackRange = 1;
        this.moveSpeed = 0.3;
        
        // Visual properties
        this.color = '#f44336'; // Red
        this.size = 0.6;
    }
}

/**
 * AshboltScout - Ranged hero
 * Fast, ranged attacker
 */
class AshboltScout extends Hero {
    constructor(lane, position, game) {
        super(lane, position, game);
        
        // Override base properties
        this.health = 50;
        this.maxHealth = 50;
        this.damage = 8;
        this.attackSpeed = 1.5;
        this.attackRange = 3;
        this.moveSpeed = 0.4;
        
        // Visual properties
        this.color = '#e91e63'; // Pink
        this.size = 0.55;
    }
}

/**
 * Oathblade - Bruiser hero
 * Attacks faster as HP drops
 */
class Oathblade extends Hero {
    constructor(lane, position, game) {
        super(lane, position, game);
        
        // Override base properties
        this.health = 120;
        this.maxHealth = 120;
        this.damage = 15;
        this.baseAttackSpeed = 0.8;
        this.attackSpeed = this.baseAttackSpeed;
        this.attackRange = 1;
        this.moveSpeed = 0.25;
        
        // Visual properties
        this.color = '#ff9800'; // Orange
        this.size = 0.7;
    }
    
    /**
     * Override update to implement special ability
     * @param {number} deltaTime - Time elapsed since last update in ms
     */
    update(deltaTime) {
        // Update attack speed based on health percentage
        const healthPercentage = this.health / this.maxHealth;
        this.attackSpeed = this.baseAttackSpeed * (2 - healthPercentage);
        
        // Call parent update method
        super.update(deltaTime);
    }
}