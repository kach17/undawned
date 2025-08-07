/**
 * Unit - Base abstract class for all game units (minions and heroes)
 */
class Unit {
    constructor(lane, position, game) {
        if (this.constructor === Unit) {
            throw new Error("Cannot instantiate abstract Unit class");
        }
        
        this.lane = lane;
        this.position = position;
        this.game = game;
        
        // Base properties
        this.health = 100;
        this.maxHealth = 100;
        this.damage = 10;
        this.attackSpeed = 1; // Attacks per second
        this.attackRange = 1; // Tiles
        this.moveSpeed = 0.5; // Tiles per second
        this.attackCooldown = 0;
        
        // Visual properties
        this.color = '#ffffff'; // Default color
        this.size = 0.7; // Size relative to tile (0-1)
    }
    
    /**
     * Update unit state
     * @param {number} deltaTime - Time elapsed since last update in ms
     */
    update(deltaTime) {
        // Abstract method - to be implemented by subclasses
        throw new Error("Method 'update()' must be implemented by subclasses");
    }
    
    /**
     * Render the unit on the canvas
     * @param {CanvasRenderingContext2D} ctx - Canvas rendering context
     * @param {number} tileWidth - Width of a tile in pixels
     * @param {number} laneHeight - Height of a lane in pixels
     */
    render(ctx, tileWidth, laneHeight) {
        // Calculate position on canvas
        const x = this.position * tileWidth + (tileWidth / 2);
        const y = this.lane * laneHeight + (laneHeight / 2);
        const radius = Math.min(tileWidth, laneHeight) * this.size / 2;
        
        // Draw unit circle
        ctx.fillStyle = this.color;
        ctx.beginPath();
        ctx.arc(x, y, radius, 0, Math.PI * 2);
        ctx.fill();
        
        // Draw health bar
        this.renderHealthBar(ctx, x, y, radius, tileWidth);
    }
    
    /**
     * Render health bar above the unit
     * @param {CanvasRenderingContext2D} ctx - Canvas rendering context
     * @param {number} x - X position of unit center
     * @param {number} y - Y position of unit center
     * @param {number} radius - Radius of unit circle
     * @param {number} tileWidth - Width of a tile in pixels
     */
    renderHealthBar(ctx, x, y, radius, tileWidth) {
        const barWidth = radius * 2;
        const barHeight = 5;
        const barX = x - radius;
        const barY = y - radius - 10;
        
        // Background
        ctx.fillStyle = '#333333';
        ctx.fillRect(barX, barY, barWidth, barHeight);
        
        // Health fill
        const healthPercentage = this.health / this.maxHealth;
        ctx.fillStyle = this.getHealthColor(healthPercentage);
        ctx.fillRect(barX, barY, barWidth * healthPercentage, barHeight);
    }
    
    /**
     * Get color for health bar based on percentage
     * @param {number} percentage - Health percentage (0-1)
     * @returns {string} - Color in hex format
     */
    getHealthColor(percentage) {
        if (percentage > 0.6) return '#4caf50'; // Green
        if (percentage > 0.3) return '#ff9800'; // Orange
        return '#f44336'; // Red
    }
    
    /**
     * Take damage from an attack
     * @param {number} amount - Amount of damage to take
     * @returns {boolean} - True if unit died from this damage
     */
    takeDamage(amount) {
        this.health -= amount;
        if (this.health <= 0) {
            this.health = 0;
            this.die();
            return true;
        }
        return false;
    }
    
    /**
     * Handle unit death
     */
    die() {
        // To be implemented by subclasses
    }
    
    /**
     * Check if unit can attack a target
     * @param {Unit} target - Target unit
     * @returns {boolean} - True if can attack
     */
    canAttack(target) {
        // Check if target is in range
        const distance = Math.abs(this.position - target.position);
        return distance <= this.attackRange;
    }
    
    /**
     * Attack a target unit
     * @param {Unit} target - Target unit
     * @returns {boolean} - True if attack was successful
     */
    attack(target) {
        if (!this.canAttack(target)) return false;
        
        // Apply damage to target
        return target.takeDamage(this.damage);
    }
    
    /**
     * Move the unit
     * @param {number} deltaTime - Time elapsed since last update in ms
     * @param {number} direction - Direction to move (1 for right, -1 for left)
     */
    move(deltaTime, direction) {
        // Calculate movement distance
        const distance = (this.moveSpeed * deltaTime) / 1000;
        this.position += distance * direction;
        
        // Clamp position to valid range
        this.position = Math.max(0, Math.min(this.game.tileCount - 1, this.position));
    }
}