// ==========================================
// 1. INITIAL STAT DISPLAY & BACKEND SYNC
// ==========================================

// Function to fetch character data from backend and display it
async function loadCharacterStats() {
    try {
        const response = await fetch('http://localhost:5000/api/characters'); // Requests character list from Express API
        const characters = await response.json();

        // If a character exists in MongoDB, use it! Otherwise, use default fallback values.
        if (characters.length > 0) {
            const char = characters[0]; 

            document.getElementById('name').textContent = `Name: ${char.name || "GVTS"}`;
            document.getElementById('realm').textContent = `Realm: ${char.realm || "Midland"}`;
            document.getElementById('class').textContent = `Class: ${char.charClass || "Warrior"}`;
            document.getElementById('level').textContent = `Level: ${char.level || 100}`;
            document.getElementById('race').textContent = `Race: ${char.race || "Human"}`;
            document.getElementById('hp').textContent = `HP: ${char.hp || 1520}`;
            document.getElementById('alive').textContent = `Alive: ${char.alive !== false}`;
            document.getElementById('weapon-status').textContent = `Has Weapon: ${char.hasWeapon !== false}`;
            document.getElementById('damageModefier').textContent = `Damage Modifier: ${char.damageModifier || 15}`;
            document.getElementById('xp').textContent = `Experience: ${char.xp || 4000}`;
        } else {
            // Fallback default display if database is empty
            document.getElementById('name').textContent = "Name: GVTS";
            document.getElementById('realm').textContent = "Realm: Midland";
            document.getElementById('class').textContent = "Class: Warrior";
            document.getElementById('level').textContent = "Level: 100";
            document.getElementById('race').textContent = "Race: Human";
            document.getElementById('hp').textContent = "HP: 1520";
            document.getElementById('alive').textContent = "Alive: true";
            document.getElementById('weapon-status').textContent = "Has Weapon: true";
            document.getElementById('damageModefier').textContent = "Damage Modifier: 15";
            document.getElementById('xp').textContent = "Experience: 4000";
        }
    } catch (error) {
        console.error('Error loading character stats from backend:', error);
    }
}

// Run when the page loads
document.addEventListener('DOMContentLoaded', loadCharacterStats);


// ==========================================
// 2. SIDE PANEL TOGGLES
// ==========================================

const sidePanel = document.getElementById("sidePanel");

const panels = {
    stats: document.getElementById("characterStats"),
    inventory: document.getElementById("inventoryContent"),
    equipment: document.getElementById("equipmentContent")
};

let currentPanel = null;

function togglePanel(name) {
    // Clicking the currently open panel closes it
    if (currentPanel === name) {
        sidePanel.classList.remove("open");
        document.body.classList.remove("sidebar-open");

        Object.values(panels).forEach(panel => {
            panel.hidden = true; // Hides all panel contents
        });

        currentPanel = null;
        return;
    }

    // Show only the selected panel
    Object.entries(panels).forEach(([panelName, panel]) => {
        panel.hidden = panelName !== name;
    });

    sidePanel.classList.add("open");
    document.body.classList.add("sidebar-open");

    currentPanel = name;
}

// Event listeners for sidebar navigation buttons
document.getElementById("characterButton").addEventListener("click", () => {
    togglePanel("stats");
});

document.getElementById("inventoryButton").addEventListener("click", () => {
    togglePanel("inventory");
});

document.getElementById("equipmentButton").addEventListener("click", () => {
    togglePanel("equipment");
});


// ==========================================
// 3. INVENTORY COUNTER
// ==========================================

const inventoryInputs = [
    document.getElementById("inventoryItem1"),
    document.getElementById("inventoryItem2"),
    document.getElementById("inventoryItem3"),
    document.getElementById("inventoryItem4"),
    document.getElementById("inventoryItem5")
];

const inventoryCounter = document.getElementById("inventoryCounter");

function updateInventoryCounter() {
    // Counts how many inventory slots contain text
    const filledSlots = inventoryInputs.filter(input => {
        return input.value.trim() !== "";
    }).length;

    inventoryCounter.textContent = `${filledSlots}/5`; // Updates counter display (e.g., 2/5)
}

// Update whenever an inventory input changes
inventoryInputs.forEach(input => {
    input.addEventListener("input", updateInventoryCounter);
});

updateInventoryCounter();


// ==========================================
// 4. BOSS AND NPC ELEMENTS & COMBAT
// ==========================================

const bossName = document.getElementById("bossName");
const bossHP = document.getElementById("bossHP");
const actionResult = document.getElementById("actionResult");

const damageDealtInput = document.getElementById("damageDealt");
const damageReceivedInput = document.getElementById("damageReceived");
const xpGainedInput = document.getElementById("xpGained");
const applyDamageButton = document.getElementById("applyDamageButton");

const npcNameInput = document.getElementById("npcName");
const npcXPGainInput = document.getElementById("npcXPGain");
const applyNpcXPButton = document.getElementById("applyNpcXPButton");

// Local trackers for active session
let playerXP = 4000;
let playerHP = 1520;
let isAlive = true;

// Generate a random number between 1 and 20 for d20 rolls
function rollD20() {
    return Math.floor(Math.random() * 20) + 1;
}

// Convert the d20 roll into a descriptive combat outcome
function getFightResult(roll) {
    if (roll === 1) return "Critical Failure";
    if (roll <= 4) return "Attack Failed";
    if (roll <= 9) return "Weak Hit";
    if (roll <= 15) return "Normal Hit";
    if (roll <= 19) return "Strong Hit";
    return "Critical Hit";
}

// Determine the damage multiplier based on the roll result
function getFightMultiplier(roll) {
    if (roll <= 4) return 0;
    if (roll <= 9) return 0.5;
    if (roll <= 15) return 1;
    if (roll <= 19) return 1.5;
    return 2.5;
}

// Display whole numbers cleanly without trailing decimals
function formatDamage(damage) {
    return Number.isInteger(damage) ? damage : damage.toFixed(1);
}

// Award Experience Points to the player
function awardXP(amount) {
    if (!Number.isFinite(amount) || amount <= 0) return "";
    const actualAmount = Math.floor(amount);
    if (actualAmount <= 0) return "";

    playerXP += actualAmount;
    document.querySelector("#xp").textContent = "Experience: " + playerXP;
    return `Gained ${actualAmount} XP.`;
}

// Read and validate the boss's current health pool
function getBossHealth() {
    if (bossHP.value.trim() === "") return null;
    const health = Number(bossHP.value);
    return Number.isFinite(health) && health >= 0 ? health : null;
}

// Apply damage to boss without letting health drop below zero
function applyDamageToBoss(damage) {
    const currentHealth = getBossHealth();
    if (currentHealth === null) return null;
    const remaining = Math.max(0, currentHealth - damage);
    bossHP.value = formatDamage(remaining);
    return remaining;
}

// Handle combat resolution when "APPLY DAMAGE / RESOLVE" is clicked
applyDamageButton.addEventListener("click", () => {
    const dealt = damageDealtInput.value.trim() === "" ? null : Number(damageDealtInput.value);
    const received = damageReceivedInput.value.trim() === "" ? null : Number(damageReceivedInput.value);

    if (
        (dealt !== null && (!Number.isFinite(dealt) || dealt < 0)) ||
        (received !== null && (!Number.isFinite(received) || received < 0))
    ) {
        actionResult.textContent = "Damage must be a valid, non-negative number.";
        return;
    }

    if (dealt === null && received === null) {
        actionResult.textContent = "Enter damage dealt or damage received.";
        return;
    }

    const parts = [];

    // Process attack dealt to the boss
    if (dealt !== null) {
        const currentHealth = getBossHealth();
        if (currentHealth === null) {
            actionResult.textContent = "Enter a valid boss HP before resolving damage.";
            bossHP.focus();
            return;
        }

        if (currentHealth === 0) {
            parts.push(`${bossName.value.trim() || "The boss"} has already been defeated.`);
        } else {
            const roll = rollD20();
            const outcome = getFightResult(roll);
            const multiplier = getFightMultiplier(roll);
            const applied = dealt * multiplier;
            const remaining = applyDamageToBoss(applied);

            const healthMessage = remaining === 0
                ? `${bossName.value.trim() || "The boss"} was defeated.`
                : `${bossName.value.trim() || "The boss"} has ${formatDamage(remaining)} HP remaining.`;

            parts.push(`Roll ${roll}: ${outcome}. Damage dealt: ${formatDamage(applied)} (${formatDamage(dealt)} base). ${healthMessage}`);

            if (remaining === 0) {
                const xpInput = xpGainedInput.value.trim() === "" ? null : Number(xpGainedInput.value);
                if (xpInput !== null && Number.isFinite(xpInput) && xpInput > 0) {
                    parts.push(awardXP(xpInput));
                }
            }
        }
    }

    // Process incoming damage received by the player
    if (received !== null) {
        if (!isAlive) {
            parts.push("GVTS is already defeated.");
        } else {
            playerHP = Math.max(0, playerHP - received);
            isAlive = playerHP > 0;

            document.querySelector("#hp").textContent = "HP: " + playerHP;
            document.querySelector("#alive").textContent = "Alive: " + isAlive;

            if (!isAlive) {
                playerXP = Math.max(0, playerXP - 5); // XP penalty on player defeat
                document.querySelector("#xp").textContent = "Experience: " + playerXP;
                parts.push("GVTS was defeated and lost 5 XP.");
            } else {
                parts.push(`Received ${formatDamage(received)} damage.`);
            }
        }
    }

    actionResult.textContent = parts.filter(Boolean).join(" ");
});

// Handle NPC rewards when "APPLY XP TO PLAYER" is clicked
applyNpcXPButton.addEventListener("click", () => {
    if (!isAlive) {
        actionResult.textContent = "A defeated player cannot receive XP.";
        return;
    }

    const name = npcNameInput.value.trim() || "NPC";
    const gain = npcXPGainInput.value.trim() === "" ? null : Number(npcXPGainInput.value);

    if (gain === null || !Number.isFinite(gain) || gain <= 0) {
        actionResult.textContent = "Enter a valid positive XP amount.";
        npcXPGainInput.focus();
        return;
    }

    const actualGain = Math.floor(gain);
    const message = awardXP(actualGain);

    actionResult.textContent = `${name} awarded ${actualGain} XP to the player. ${message}`;
});