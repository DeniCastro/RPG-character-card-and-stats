
// PLAYER STATS

// Player stats which cannot be changed later
const playerName = "GVTS";
const realm = "Midland";
const playerRace = "Human";
const playerClass = "Warrior";

// Player stats which can change
let playerLevel = 100;
let playerHP = 1520;
let playerXP = 4000;
let isAlive = true;
let hasWeapon = true;
let weapon = "Omnislayer";
let sideWeapon = "Hell blaster";
let damageModefier = 15;


// INITIAL STAT DISPLAY

document.querySelector("#realm").textContent = "Realm: " + realm;
document.querySelector("#name").textContent = "Name: " + playerName;
document.querySelector("#class").textContent = "Class: " + playerClass;
document.querySelector("#level").textContent = "Level: " + playerLevel;
document.querySelector("#race").textContent = "Race: " + playerRace;
document.querySelector("#hp").textContent = "HP: " + playerHP;
document.querySelector("#alive").textContent = "Alive: " + isAlive;
document.querySelector("#weapon-status").textContent = "Has Weapon: " + hasWeapon;
document.querySelector("#damageModefier").textContent = "Damage Modifier: " + damageModefier;
document.querySelector("#xp").textContent = "Experience: " + playerXP;


// SIDE PANEL TOGGLES

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
      panel.hidden = true;
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

document.getElementById("characterButton").addEventListener("click", () => {
  togglePanel("stats");
});

document.getElementById("inventoryButton").addEventListener("click", () => {
  togglePanel("inventory");
});

document.getElementById("equipmentButton").addEventListener("click", () => {
  togglePanel("equipment");
});


// INVENTORY COUNTER

const inventoryInputs = [
  document.getElementById("inventoryItem1"),
  document.getElementById("inventoryItem2"),
  document.getElementById("inventoryItem3"),
  document.getElementById("inventoryItem4"),
  document.getElementById("inventoryItem5")
];

const inventoryCounter = document.getElementById("inventoryCounter");

function updateInventoryCounter() {
  const filledSlots = inventoryInputs.filter(input => {
    return input.value.trim() !== "";
  }).length;

  inventoryCounter.textContent = `${filledSlots}/5`;
}

// Update whenever an inventory input changes
inventoryInputs.forEach(input => {
  input.addEventListener("input", updateInventoryCounter);
});

// Display the initial count
updateInventoryCounter();


// BOSS AND NPC ELEMENTS

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


// COMBAT DICE AND OUTCOMES

// Generate a random number between 1 and 20
function rollD20() {
  return Math.floor(Math.random() * 20) + 1;
}

// Convert the roll into a combat outcome
function getFightResult(roll) {
  if (roll === 1) return "Critical Failure";
  if (roll <= 4) return "Attack Failed";
  if (roll <= 9) return "Weak Hit";
  if (roll <= 15) return "Normal Hit";
  if (roll <= 19) return "Strong Hit";
  return "Critical Hit";
}

// Determine the damage multiplier from the roll
function getFightMultiplier(roll) {
  if (roll <= 4) return 0;
  if (roll <= 9) return 0.5;
  if (roll <= 15) return 1;
  if (roll <= 19) return 1.5;
  return 2.5;
}

// Display whole numbers without decimal places
function formatDamage(damage) {
  return Number.isInteger(damage) ? damage : damage.toFixed(1);
}


// EXPERIENCE POINTS

function awardXP(amount) {
  if (!Number.isFinite(amount) || amount <= 0) {
    return "";
  }

  const actualAmount = Math.floor(amount);

  if (actualAmount <= 0) {
    return "";
  }

  playerXP += actualAmount;

  document.querySelector("#xp").textContent =
    "Experience: " + playerXP;

  return `Gained ${actualAmount} XP.`;
}


// BOSS HEALTH

// Read and validate the boss's current HP
function getBossHealth() {
  if (bossHP.value.trim() === "") {
    return null;
  }

  const health = Number(bossHP.value);

  return Number.isFinite(health) && health >= 0
    ? health
    : null;
}

// Apply damage without allowing negative HP
function applyDamageToBoss(damage) {
  const currentHealth = getBossHealth();

  if (currentHealth === null) {
    return null;
  }

  const remaining = Math.max(0, currentHealth - damage);

  bossHP.value = formatDamage(remaining);

  return remaining;
}


// RESOLVE COMBAT

applyDamageButton.addEventListener("click", () => {
  const dealt = damageDealtInput.value.trim() === ""
    ? null
    : Number(damageDealtInput.value);

  const received = damageReceivedInput.value.trim() === ""
    ? null
    : Number(damageReceivedInput.value);

  // Validate each supplied value
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

  // Resolve damage dealt to the boss
  if (dealt !== null) {
    const currentHealth = getBossHealth();

    if (currentHealth === null) {
      actionResult.textContent = "Enter a valid boss HP before resolving damage.";
      bossHP.focus();
      return;
    }

    // Do not award XP repeatedly for an already defeated boss
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

      parts.push(
        `Roll ${roll}: ${outcome}. ` +
        `Damage dealt: ${formatDamage(applied)} ` +
        `(${formatDamage(dealt)} base). ${healthMessage}`
      );

      // Award XP only when this attack defeats the boss
      if (remaining === 0) {
        const xpInput = xpGainedInput.value.trim() === ""
          ? null
          : Number(xpGainedInput.value);

        if (
          xpInput !== null &&
          Number.isFinite(xpInput) &&
          xpInput > 0
        ) {
          parts.push(awardXP(xpInput));
        }
      }
    }
  }

  // Apply damage received by the player
  if (received !== null) {
    if (!isAlive) {
      parts.push(`${playerName} is already defeated.`);
    } else {
      playerHP = Math.max(0, playerHP - received);
      isAlive = playerHP > 0;

      document.querySelector("#hp").textContent = "HP: " + playerHP;
      document.querySelector("#alive").textContent = "Alive: " + isAlive;

      if (!isAlive) {
        playerXP = Math.max(0, playerXP - 5);

        document.querySelector("#xp").textContent =
          "Experience: " + playerXP;

        parts.push(`${playerName} was defeated and lost 5 XP.`);
      } else {
        parts.push(`Received ${formatDamage(received)} damage.`);
      }
    }
  }

  actionResult.textContent = parts.filter(Boolean).join(" ");
});


// NPC XP REWARDS

applyNpcXPButton.addEventListener("click", () => {
  if (!isAlive) {
    actionResult.textContent = "A defeated player cannot receive XP.";
    return;
  }

  const name = npcNameInput.value.trim() || "NPC";

  const gain = npcXPGainInput.value.trim() === ""
    ? null
    : Number(npcXPGainInput.value);

  if (gain === null || !Number.isFinite(gain) || gain <= 0) {
    actionResult.textContent = "Enter a valid positive XP amount.";
    npcXPGainInput.focus();
    return;
  }

  const actualGain = Math.floor(gain);

  if (actualGain <= 0) {
    actionResult.textContent = "The XP amount must be at least 1.";
    npcXPGainInput.focus();
    return;
  }

  const message = awardXP(actualGain);

  actionResult.textContent =
    `${name} awarded ${actualGain} XP to the player. ${message}`;
});

// Select your submit button (make sure to adjust the selector to match your button's class or id)
const applyButton = document.querySelector('.apply-btn');

if (applyButton) {
    applyButton.addEventListener('click', async (e) => {
        e.preventDefault(); // Stop form from refreshing the page

        // Grab input values based on their placeholders or IDs
        const nameInput = document.querySelector('input[placeholder="Enter enemy name"]');
        const hpInput = document.querySelector('input[placeholder="Enter HP"]');
        const damageDealtInput = document.querySelector('input[placeholder="Damage dealt"]');
        const damageReceivedInput = document.querySelector('input[placeholder="Damage received"]');
        const xpInput = document.querySelector('input[placeholder="XP gained"]');

        // Build the payload object matching your Mongoose schema
        const characterData = {
            type: "Enemy",
            name: nameInput ? nameInput.value : "Unknown Enemy",
            health: hpInput ? Number(hpInput.value) : 0,
            damageDealt: damageDealtInput ? Number(damageDealtInput.value) : 0,
            damageReceived: damageReceivedInput ? Number(damageReceivedInput.value) : 0,
            xpGained: xpInput ? Number(xpInput.value) : 0
        };

        try {
            // Send data to your Express backend
            const response = await fetch('http://localhost:5000/api/characters', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(characterData)
            });

            const result = await response.json();

            if (response.ok) {
                console.log('Success:', result);
                alert('Character saved to MongoDB successfully!');
            } else {
                console.error('Server error:', result.error);
            }
        } catch (err) {
            console.error('Failed to connect to backend:', err);
        }
    });
}npn