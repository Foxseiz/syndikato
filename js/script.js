// ==================== CONFIG ====================
const BACKEND_URL = "https://script.google.com/macros/s/AKfycbxqdnuuSZUGMHyfF8ZiET5cKcNx_s2JYHNnLPaNwb4sxnxQZaccjWvVaF4nrclLEfzI_A/exec"; // Replace with your Apps Script URL
const PASSWORD = "syndikato-ph"; // Your password

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

// ==================== FETCH ALL ROWS ====================
async function loadAllRows() {
  try {
    const res = await fetch(BACKEND_URL, {
      method: "POST",
      body: JSON.stringify({ action: "getAllRows" })
    });
    const data = await res.json();

    if (!Array.isArray(data)) return alert("Failed to load sheet data");

    allRows = data;

    const sel = document.getElementById("ignSelect");
    sel.innerHTML = "<option value=''>Select IGN</option>";
    allRows.forEach(r => sel.innerHTML += `<option value="${r.IGN}">${r.IGN}</option>`);

    // Clear form
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

  Object.keys(player).forEach(key => {
    if (key !== "_row" && document.getElementById(key)) {
      document.getElementById(key).value = player[key];
    }
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
  ["IGN", "Rank", "Role", "Weapon1", "Weapon2", "Path"].forEach(id => {
    document.getElementById(id).value = "";
  });
  document.getElementById("ignSelect").value = "";
}

// ==================== BUTTONS ====================
async function save() {
  if (!currentRow) return alert("Select a player first");

  const obj = buildPayload();
  try {
    await fetch(BACKEND_URL, {
      method: "POST",
      body: JSON.stringify({ action: "updateRow", payload: obj })
    });
    alert("Saved!");
    loadAllRows();
  } catch (err) {
    console.error(err);
    alert("Failed to save");
  }
}

async function add() {
  const obj = buildPayload();
  try {
    await fetch(BACKEND_URL, {
      method: "POST",
      body: JSON.stringify({ action: "addRow", payload: obj })
    });
    alert("Added!");
    loadAllRows();
  } catch (err) {
    console.error(err);
    alert("Failed to add");
  }
}

async function remove() {
  if (!currentRow) return alert("Select a player first");

  try {
    await fetch(BACKEND_URL, {
      method: "POST",
      body: JSON.stringify({ action: "deleteRow", rowNumber: currentRow })
    });
    alert("Deleted!");
    loadAllRows();
  } catch (err) {
    console.error(err);
    alert("Failed to delete");
  }
}
