// ==================== CONFIG ====================
const BACKEND_URL = "https://script.google.com/macros/s/AKfycbyUzaHedsrJI6agUrIafHOqJZoXO6f6mLDJUxnieulyiRbpUyKqC566Ceihv1vQftDiIQ/exec"; // Your Apps Script deployment URL
const PASSWORD = "syndikato-ph";

let allRows = [];
let currentRow = null;

// ==================== LOGIN ====================
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

// ==================== LOAD ALL ROWS ====================
async function loadAllRows() {
  try {
    const res = await fetch(BACKEND_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "getAllRows" })
    });
    const data = await res.json();
    console.log("Fetched data:", data);

    if (!Array.isArray(data)) return alert("Failed to load sheet data");

    allRows = data;

    const sel = document.getElementById("ignSelect");
    sel.innerHTML = "<option value=''>Select IGN</option>";
    allRows.forEach(r => sel.innerHTML += `<option value="${r.IGN}">${r.IGN}</option>`);

    clearForm();
    currentRow = null;
  } catch (err) {
    console.error(err);
    alert("Error fetching sheet data");
  }
}

// ==================== FORM HANDLING ====================
function loadPlayer() {
  const ign = document.getElementById("ignSelect").value;
  if (!ign) return;

  const player = allRows.find(r => r.IGN === ign);
  if (!player) return;

  currentRow = player._row;

  ["IGN","Rank","Role","Weapon1","Weapon2","Path"].forEach(id => {
    if (id === "Weapon1") document.getElementById(id).value = player["Weapon 1"] || "";
    else if (id === "Weapon2") document.getElementById(id).value = player["Weapon 2"] || "";
    else document.getElementById(id).value = player[id] || "";
  });
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
}

// ==================== BUTTONS ====================
async function save() {
  if (!currentRow) return alert("Select a player first");
  await fetch(BACKEND_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ action:"updateRow", payload: buildPayload() })
  });
  alert("Saved!");
  loadAllRows();
}

async function add() {
  await fetch(BACKEND_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ action:"addRow", payload: buildPayload() })
  });
  alert("Added!");
  loadAllRows();
}

async function remove() {
  if (!currentRow) return alert("Select a player first");
  await fetch(BACKEND_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ action:"deleteRow", rowNumber: currentRow })
  });
  alert("Deleted!");
  loadAllRows();
}
