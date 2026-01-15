// ==================== CONFIG ====================
// PASTE YOUR NEW GOOGLE SCRIPT URL HERE
const BACKEND_URL = "https://script.google.com/macros/s/AKfycbyUzaHedsrJI6agUrIafHOqJZoXO6f6mLDJUxnieulyiRbpUyKqC566Ceihv1vQftDiIQ/exec"; 
const PASSWORD = "syndikato-ph";

let allRows = [];
let currentRow = null;

// ==================== CORE API FUNCTIONS ====================

// CORS FIX: Sending requests without specific headers prevents the "Preflight" check.
async function sendAction(payload) {
  try {
    const res = await fetch(BACKEND_URL, {
      method: "POST",
      // IMPORTANT: No headers object here! 
      // This sends data as text/plain, bypassing the CORS block.
      body: JSON.stringify(payload)
    });
    return await res.json();
  } catch (err) {
    console.error("Action Error:", err);
    alert("Operation failed. Check console.");
    return { error: err.message };
  }
}

// Uses GET for loading (faster/safer for read-only)
async function loadAllRows() {
  try {
    const res = await fetch(BACKEND_URL); // Defaults to GET
    const data = await res.json();

    if (data.error) throw new Error(data.error);

    console.log("Fetched data:", data);
    allRows = data;
    populateSelect();
    clearForm();
    currentRow = null;
  } catch (err) {
    console.error("Load Error:", err);
    alert("Error fetching data. Ensure Deployment access is set to 'Anyone'.");
  }
}

// ==================== UI LOGIC ====================

function login() {
  const pw = document.getElementById("password").value;
  if (pw !== PASSWORD) {
    document.getElementById("loginError").innerText = "Wrong password";
    return;
  }
  document.getElementById("loginDiv").classList.add("hidden");
  document.getElementById("appDiv").classList.remove("hidden");
  loadAllRows();
}

function populateSelect() {
  const sel = document.getElementById("ignSelect");
  sel.innerHTML = "<option value=''>Select IGN</option>";
  allRows.forEach(r => {
    // Only add if IGN exists
    if(r.IGN) sel.innerHTML += `<option value="${r.IGN}">${r.IGN}</option>`;
  });
}

function loadPlayer() {
  const ign = document.getElementById("ignSelect").value;
  if (!ign) {
    clearForm(); 
    return;
  }

  const player = allRows.find(r => r.IGN === ign);
  if (!player) return;

  currentRow = player._row;

  // Map sheet columns to HTML IDs
  document.getElementById("IGN").value = player.IGN || "";
  document.getElementById("Rank").value = player.Rank || "";
  document.getElementById("Role").value = player.Role || "";
  document.getElementById("Weapon1").value = player["Weapon 1"] || "";
  document.getElementById("Weapon2").value = player["Weapon 2"] || "";
  document.getElementById("Path").value = player.Path || "";
}

function buildPayload() {
  return {
    _row: currentRow,
    IGN: document.getElementById("IGN").value,
    Rank: document.getElementById("Rank").value,
    Role: document.getElementById("Role").value,
    "Weapon 1": document.getElementById("Weapon1").value,
    "Weapon 2": document.getElementById("Weapon2").value,
    Path: document.getElementById("Path").value
  };
}

function clearForm() {
  ["IGN","Rank","Role","Weapon1","Weapon2","Path"].forEach(id => document.getElementById(id).value = "");
  document.getElementById("ignSelect").value = "";
  currentRow = null;
}

// ==================== BUTTON ACTIONS ====================

async function save() {
  if (!currentRow) return alert("Select a player first to update.");
  
  const payload = { action: "updateRow", payload: buildPayload() };
  const res = await sendAction(payload);
  
  if (res.ok) {
    alert("Updated successfully!");
    loadAllRows();
  }
}

async function add() {
  const payload = { action: "addRow", payload: buildPayload() };
  const res = await sendAction(payload);
  
  if (res.ok) {
    alert("Added successfully!");
    loadAllRows();
  }
}

async function remove() {
  if (!currentRow) return alert("Select a player first to delete.");
  if (!confirm("Are you sure you want to delete this player?")) return;

  const payload = { action: "deleteRow", rowNumber: currentRow };
  const res = await sendAction(payload);
  
  if (res.ok) {
    alert("Deleted successfully!");
    loadAllRows();
  }
}