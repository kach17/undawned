/**
 * Lane - Represents a horizontal row in the game grid
 * Contains tiles and manages heroes in the lane
 */
class Lane {
    constructor(index, tileCount, game) {
        this.index = index;
        this.tileCount = tileCount;
        this.game = game;
        
        // Create tiles
        this.tiles = [];
        for (let i = 0; i < tileCount; i++) {
            this.tiles.push(new Tile(index, i, game));
        }
        
        // Track heroes in this lane
        this.heroes = [];
        
        // Track minions for easy access
        this.minions = [];
    }
    
    /**
     * Update the lane state
     * @param {number} deltaTime - Time elapsed since last update in ms
     */
    update(deltaTime) {
        // Update all tiles
        for (const tile of this.tiles) {
            tile.update(deltaTime);
        }
        
        // Update all heroes
        for (let i = this.heroes.length - 1; i >= 0; i--) {
            this.heroes[i].update(deltaTime);
        }
    }
    
    /**
     * Render the lane
     * @param {CanvasRenderingContext2D} ctx - Canvas rendering context
     */
    render(ctx) {
        const tileWidth = this.game.tileWidth;
        const laneHeight = this.game.laneHeight;
        
        // Render all tiles
        for (const tile of this.tiles) {
            tile.render(ctx, tileWidth, laneHeight);
        }
        
        // Render all heroes
        for (const hero of this.heroes) {
            hero.render(ctx, tileWidth, laneHeight);
        }
    }
    
    /**
     * Check if a minion can be placed at the specified tile position
     * @param {number} tileIndex - The tile index
     * @returns {boolean} - True if placement is allowed
     */
    canPlaceAt(tileIndex) {
        // Validate tile index
        if (tileIndex < 0 || tileIndex >= this.tileCount) {
            return false;
        }
        
        // Check if tile is empty
        return this.tiles[tileIndex].isEmpty();
    }
    
    /**
     * Place a minion at the specified tile position
     * @param {Minion} minion - The minion to place
     * @param {number} tileIndex - The tile index
     * @returns {boolean} - True if placement was successful
     */
    placeMinion(minion, tileIndex) {
        if (!this.canPlaceAt(tileIndex)) return false;
        
        // Place minion on tile
        const success = this.tiles[tileIndex].placeMinion(minion);
        
        // Add to minions list if successful
        if (success) {
            this.minions.push(minion);
        }
        
        return success;
    }
    
    /**
     * Remove a minion from the lane
     * @param {Minion} minion - The minion to remove
     */
    removeMinion(minion) {
        // Remove from minions list
        const index = this.minions.indexOf(minion);
        if (index !== -1) {
            this.minions.splice(index, 1);
        }
        
        // Remove from tile
        const tileIndex = Math.floor(minion.position);
        if (tileIndex >= 0 && tileIndex < this.tileCount) {
            const tile = this.tiles[tileIndex];
            if (tile.minion === minion) {
                tile.removeMinion();
            }
        }
    }
    
    /**
     * Add a hero to the lane
     * @param {Hero} hero - The hero to add
     */
    addHero(hero) {
        this.heroes.push(hero);
    }
    
    /**
     * Remove a hero from the lane
     * @param {Hero} hero - The hero to remove
     */
    removeHero(hero) {
        const index = this.heroes.indexOf(hero);
        if (index !== -1) {
            // Notify Dreadchant minions in this lane about the hero's death
            for (const minion of this.minions) {
                if (minion.onEnemyDeath && typeof minion.onEnemyDeath === 'function') {
                    minion.onEnemyDeath(hero);
                }
            }
            
            // Award Daen for hero kill (50% chance, 1 Daen per hero)
            if (Math.random() < 0.5) {
                this.game.daen += 1;
                this.game.updateDaenDisplay();
                
                // Show floating text for Daen gain
                this.game.showFloatingText(
                    '+1 Daen',
                    hero.position * this.game.tileWidth,
                    this.index * this.game.laneHeight + 20,
                    '#9c27b0' // Purple color
                );
            }
            
            this.heroes.splice(index, 1);
        }
    }
}