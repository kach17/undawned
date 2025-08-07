/**
 * Tile - Represents a single tile in the game grid
 */
class Tile {
    constructor(laneIndex, position, game) {
        this.laneIndex = laneIndex;
        this.position = position;
        this.game = game;
        this.minion = null;
    }
    
    /**
     * Check if the tile is empty (no minion)
     * @returns {boolean} - True if tile is empty
     */
    isEmpty() {
        return this.minion === null;
    }
    
    /**
     * Place a minion on this tile
     * @param {Minion} minion - The minion to place
     * @returns {boolean} - True if placement was successful
     */
    placeMinion(minion) {
        if (!this.isEmpty()) return false;
        
        this.minion = minion;
        return true;
    }
    
    /**
     * Remove the minion from this tile
     */
    removeMinion() {
        this.minion = null;
    }
    
    /**
     * Update the tile state
     * @param {number} deltaTime - Time elapsed since last update in ms
     */
    update(deltaTime) {
        // Update minion if present
        if (this.minion) {
            this.minion.update(deltaTime);
        }
    }
    
    /**
     * Render the tile
     * @param {CanvasRenderingContext2D} ctx - Canvas rendering context
     * @param {number} tileWidth - Width of a tile in pixels
     * @param {number} laneHeight - Height of a lane in pixels
     */
    render(ctx, tileWidth, laneHeight) {
        // Calculate tile position
        const x = this.position * tileWidth;
        const y = this.laneIndex * laneHeight;
        
        // Draw tile background (optional)
        // ctx.fillStyle = '#1e1e1e';
        // ctx.fillRect(x, y, tileWidth, laneHeight);
        
        // Render minion if present
        if (this.minion) {
            this.minion.render(ctx, tileWidth, laneHeight);
        }
    }
}