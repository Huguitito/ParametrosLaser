const db = firebase.database();

// FORMULARIOS
const machineForm = document.getElementById("machine-form");
const parameterForm = document.getElementById("parameter-form");

// TABLAS
const machineTable = document.getElementById("machine-table").querySelector("tbody");
const parameterTable = document.getElementById("parameter-table").querySelector("tbody");
const machineSelect = document.getElementById("machine-select");

// FUNCIONES MÁQUINAS
machineForm.addEventListener("submit", (e) => {
  e.preventDefault();
  const machine = {
    name: document.getElementById("machine-name").value,
    area: document.getElementById("machine-area").value,
    power: document.getElementById("machine-power").value,
    type: document.getElementById("machine-type").value
  };
  const newRef = db.ref("machines").push();
  newRef.set(machine);
  machineForm.reset();
});

function loadMachines() {
  db.ref("machines").on("value", (snapshot) => {
    machineTable.innerHTML = "";
    machineSelect.innerHTML = '<option value="">Seleccionar máquina</option>';
    snapshot.forEach((child) => {
      const machine = child.val();
      const id = child.key;

      // Tabla
      const row = machineTable.insertRow();
      row.innerHTML = `
        <td>${machine.name}</td>
        <td>${machine.area}</td>
        <td>${machine.power}</td>
        <td>${machine.type}</td>
        <td>
          <button class="edit" onclick="editMachine('${id}', '${machine.name}', '${machine.area}', '${machine.power}', '${machine.type}')">✏️</button>
          <button class="delete" onclick="deleteMachine('${id}')">🗑️</button>
        </td>
      `;

      // Select
      const option = document.createElement("option");
      option.value = machine.name;
      option.text = machine.name;
      machineSelect.appendChild(option);
    });
  });
}

function editMachine(id, name, area, power, type) {
  document.getElementById("machine-name").value = name;
  document.getElementById("machine-area").value = area;
  document.getElementById("machine-power").value = power;
  document.getElementById("machine-type").value = type;
  machineForm.onsubmit = function (e) {
    e.preventDefault();
    db.ref("machines/" + id).set({
      name: document.getElementById("machine-name").value,
      area: document.getElementById("machine-area").value,
      power: document.getElementById("machine-power").value,
      type: document.getElementById("machine-type").value
    });
    machineForm.reset();
    machineForm.onsubmit = defaultMachineSubmit;
  };
}
const defaultMachineSubmit = machineForm.onsubmit;

function deleteMachine(id) {
  db.ref("machines/" + id).remove();
}

// FUNCIONES PARÁMETROS
parameterForm.addEventListener("submit", (e) => {
  e.preventDefault();
  const param = {
    process: document.getElementById("process-type").value,
    material: document.getElementById("material").value,
    thickness: document.getElementById("thickness").value,
    speed: document.getElementById("speed").value,
    power: document.getElementById("power").value,
    hatch: document.getElementById("hatch").value,
    observations: document.getElementById("observations").value,
    machine: document.getElementById("machine-select").value
  };
  const newRef = db.ref("parameters").push();
  newRef.set(param);
  parameterForm.reset();
});

function loadParameters() {
  db.ref("parameters").on("value", (snapshot) => {
    parameterTable.innerHTML = "";
    snapshot.forEach((child) => {
      const param = child.val();
      const id = child.key;

      const row = parameterTable.insertRow();
      row.innerHTML = `
        <td>${param.process}</td>
        <td>${param.material}</td>
        <td>${param.thickness}</td>
        <td>${param.speed}</td>
        <td>${param.power}</td>
        <td>${param.hatch}</td>
        <td>${param.observations}</td>
        <td>${param.machine}</td>
        <td>
          <button class="edit" onclick="editParameter('${id}', ${JSON.stringify(param).replace(/"/g, '&quot;')})">✏️</button>
          <button class="delete" onclick="deleteParameter('${id}')">🗑️</button>
        </td>
      `;
    });
  });
}

function editParameter(id, param) {
  document.getElementById("process-type").value = param.process;
  document.getElementById("material").value = param.material;
  document.getElementById("thickness").value = param.thickness;
  document.getElementById("speed").value = param.speed;
  document.getElementById("power").value = param.power;
  document.getElementById("hatch").value = param.hatch;
  document.getElementById("observations").value = param.observations;
  document.getElementById("machine-select").value = param.machine;

  parameterForm.onsubmit = function (e) {
    e.preventDefault();
    db.ref("parameters/" + id).set({
      process: document.getElementById("process-type").value,
      material: document.getElementById("material").value,
      thickness: document.getElementById("thickness").value,
      speed: document.getElementById("speed").value,
      power: document.getElementById("power").value,
      hatch: document.getElementById("hatch").value,
      observations: document.getElementById("observations").value,
      machine: document.getElementById("machine-select").value
    });
    parameterForm.reset();
    parameterForm.onsubmit = defaultParameterSubmit;
  };
}
const defaultParameterSubmit = parameterForm.onsubmit;

function deleteParameter(id) {
  db.ref("parameters/" + id).remove();
}

// FUNCIONES IMPRESIÓN
function printAll() {
  window.print();
}

function printByMachine() {
  const machine = prompt("Escribí el nombre de la máquina:");
  if (!machine) return;

  const rows = parameterTable.querySelectorAll("tr");
  rows.forEach(row => {
    const machineCell = row.cells[7];
    row.style.display = (machineCell && machineCell.innerText === machine) ? "" : "none";
  });

  setTimeout(() => {
    window.print();
    rows.forEach(row => row.style.display = "");
  }, 300);
}

function printByMaterial() {
  const material = prompt("Escribí el nombre del material:");
  if (!material) return;

  const rows = parameterTable.querySelectorAll("tr");
  rows.forEach(row => {
    const materialCell = row.cells[1];
    row.style.display = (materialCell && materialCell.innerText === material) ? "" : "none";
  });

  setTimeout(() => {
    window.print();
    rows.forEach(row => row.style.display = "");
  }, 300);
}

// INICIO
loadMachines();
loadParameters();
