const db = firebase.database();

// Referencias
const machineForm = document.getElementById("machine-form");
const parameterForm = document.getElementById("parameter-form");
const machineSelect = document.getElementById("machine-select");
const machineTable = document.getElementById("machine-table").querySelector("tbody");
const parameterTable = document.getElementById("parameter-table").querySelector("tbody");

let editingMachineKey = null;
let editingParameterKey = null;

// ------------------------- MÁQUINAS -------------------------

machineForm.addEventListener("submit", (e) => {
  e.preventDefault();

  const name = document.getElementById("machine-name").value;
  const area = document.getElementById("machine-area").value;
  const power = document.getElementById("machine-power").value;
  const type = document.getElementById("machine-type").value;

  const machineData = { name, area, power, type };

  if (editingMachineKey) {
    db.ref("machines/" + editingMachineKey).set(machineData);
    editingMachineKey = null;
  } else {
    db.ref("machines").push(machineData);
  }

  machineForm.reset();
});

function loadMachines() {
  db.ref("machines").on("value", (snapshot) => {
    machineTable.innerHTML = "";
    machineSelect.innerHTML = `<option value="">Seleccionar máquina</option>`;
    snapshot.forEach((child) => {
      const machine = child.val();
      const key = child.key;

      // Tabla
      const row = document.createElement("tr");
      row.innerHTML = `
        <td>${machine.name}</td>
        <td>${machine.area}</td>
        <td>${machine.power}</td>
        <td>${machine.type}</td>
        <td>
          <button class="action-btn edit" onclick="editMachine('${key}')">Editar</button>
          <button class="action-btn" onclick="deleteMachine('${key}')">Borrar</button>
        </td>
      `;
      machineTable.appendChild(row);

      // Select
      const option = document.createElement("option");
      option.value = machine.name;
      option.textContent = machine.name;
      machineSelect.appendChild(option);
    });
  });
}

function editMachine(key) {
  db.ref("machines/" + key).once("value").then((snap) => {
    const data = snap.val();
    document.getElementById("machine-name").value = data.name;
    document.getElementById("machine-area").value = data.area;
    document.getElementById("machine-power").value = data.power;
    document.getElementById("machine-type").value = data.type;
    editingMachineKey = key;
  });
}

function deleteMachine(key) {
  db.ref("machines/" + key).remove();
}

// ------------------------- PARÁMETROS -------------------------

parameterForm.addEventListener("submit", (e) => {
  e.preventDefault();

  const processType = document.getElementById("process-type").value;
  const material = document.getElementById("material").value;
  const thickness = document.getElementById("thickness").value;
  const speed = document.getElementById("speed").value;
  const power = document.getElementById("power").value;
  const hatch = document.getElementById("hatch").value;
  const observations = document.getElementById("observations").value;
  const machine = machineSelect.value;

  const paramData = {
    processType, material, thickness, speed, power, hatch, observations, machine,
  };

  if (editingParameterKey) {
    db.ref("parameters/" + editingParameterKey).set(paramData);
    editingParameterKey = null;
  } else {
    db.ref("parameters").push(paramData);
  }

  parameterForm.reset();
});

function loadParameters() {
  db.ref("parameters").on("value", (snapshot) => {
    parameterTable.innerHTML = "";
    snapshot.forEach((child) => {
      const param = child.val();
      const key = child.key;

      const row = document.createElement("tr");
      row.innerHTML = `
        <td>${param.processType}</td>
        <td>${param.material}</td>
        <td>${param.thickness}</td>
        <td>${param.speed}</td>
        <td>${param.power}</td>
        <td>${param.hatch}</td>
        <td>${param.observations}</td>
        <td>${param.machine}</td>
        <td>
          <button class="action-btn edit" onclick="editParameter('${key}')">Editar</button>
          <button class="action-btn" onclick="deleteParameter('${key}')">Borrar</button>
        </td>
      `;
      parameterTable.appendChild(row);
    });
  });
}

function editParameter(key) {
  db.ref("parameters/" + key).once("value").then((snap) => {
    const p = snap.val();
    document.getElementById("process-type").value = p.processType;
    document.getElementById("material").value = p.material;
    document.getElementById("thickness").value = p.thickness;
    document.getElementById("speed").value = p.speed;
    document.getElementById("power").value = p.power;
    document.getElementById("hatch").value = p.hatch;
    document.getElementById("observations").value = p.observations;
    machineSelect.value = p.machine;
    editingParameterKey = key;
  });
}

function deleteParameter(key) {
  db.ref("parameters/" + key).remove();
}

// ------------------------- IMPRESIONES -------------------------

function printAll() {
  window.print();
}

function printByMachine() {
  const machine = prompt("Ingrese el nombre exacto de la máquina:");
  if (!machine) return;

  const rows = Array.from(parameterTable.querySelectorAll("tr"));
  rows.forEach(row => {
    row.style.display = row.children[7].textContent === machine ? "" : "none";
  });

  window.print();

  rows.forEach(row => row.style.display = "");
}

function printByMaterial() {
  const material = prompt("Ingrese el nombre exacto del material:");
  if (!material) return;

  const rows = Array.from(parameterTable.querySelectorAll("tr"));
  rows.forEach(row => {
    row.style.display = row.children[1].textContent === material ? "" : "none";
  });

  window.print();

  rows.forEach(row => row.style.display = "");
}

// ------------------------- INICIO -------------------------

loadMachines();
loadParameters();
