
const db = firebase.database();

const machineForm = document.getElementById("machine-form");
const parameterForm = document.getElementById("parameter-form");
const machineTable = document.querySelector("#machine-table tbody");
const parameterTable = document.querySelector("#parameter-table tbody");
const machineSelect = document.getElementById("machine-select");

let editingMachineId = null;
let editingParamId = null;

// Guardar máquina
machineForm.addEventListener("submit", (e) => {
  e.preventDefault();
  const name = document.getElementById("machine-name").value;
  const area = document.getElementById("machine-area").value;
  const power = document.getElementById("machine-power").value;
  const type = document.getElementById("machine-type").value;

  const newMachine = { name, area, power, type };

  if (editingMachineId) {
    db.ref("machines/" + editingMachineId).set(newMachine);
    editingMachineId = null;
  } else {
    db.ref("machines").push(newMachine);
  }

  machineForm.reset();
});

function loadMachines() {
  const machinesRef = db.ref("machines");

  machinesRef.on("value", (snapshot) => {
    machineTable.innerHTML = "";
    machineSelect.innerHTML = '<option value="">Seleccionar máquina</option>';

    const machines = snapshot.val();
    if (machines) {
      Object.entries(machines).forEach(([key, machine]) => {
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

        const option = document.createElement("option");
        option.value = machine.name;
        option.textContent = machine.name;
        machineSelect.appendChild(option);
      });
    }
  });
}

function editMachine(id) {
  db.ref("machines/" + id).once("value", (snapshot) => {
    const machine = snapshot.val();
    document.getElementById("machine-name").value = machine.name;
    document.getElementById("machine-area").value = machine.area;
    document.getElementById("machine-power").value = machine.power;
    document.getElementById("machine-type").value = machine.type;
    editingMachineId = id;
  });
}

function deleteMachine(id) {
  db.ref("machines/" + id).remove();
}

// Guardar parámetro
parameterForm.addEventListener("submit", (e) => {
  e.preventDefault();
  const process = document.getElementById("process-type").value;
  const material = document.getElementById("material").value;
  const thickness = document.getElementById("thickness").value;
  const speed = document.getElementById("speed").value;
  const power = document.getElementById("power").value;
  const hatch = document.getElementById("hatch").value;
  const obs = document.getElementById("observations").value;
  const machine = document.getElementById("machine-select").value;

  const param = { process, material, thickness, speed, power, hatch, obs, machine };

  if (editingParamId) {
    db.ref("parameters/" + editingParamId).set(param);
    editingParamId = null;
  } else {
    db.ref("parameters").push(param);
  }

  parameterForm.reset();
});

function loadParameters() {
  db.ref("parameters").on("value", (snapshot) => {
    parameterTable.innerHTML = "";
    const data = snapshot.val();
    if (data) {
      Object.entries(data).forEach(([key, param]) => {
        const row = document.createElement("tr");
        row.innerHTML = `
          <td>${param.process}</td>
          <td>${param.material}</td>
          <td>${param.thickness}</td>
          <td>${param.speed}</td>
          <td>${param.power}</td>
          <td>${param.hatch}</td>
          <td>${param.obs}</td>
          <td>${param.machine}</td>
          <td>
            <button class="action-btn edit" onclick="editParam('${key}')">Editar</button>
            <button class="action-btn" onclick="deleteParam('${key}')">Borrar</button>
          </td>
        `;
        parameterTable.appendChild(row);
      });
    }
  });
}

function editParam(id) {
  db.ref("parameters/" + id).once("value", (snapshot) => {
    const param = snapshot.val();
    document.getElementById("process-type").value = param.process;
    document.getElementById("material").value = param.material;
    document.getElementById("thickness").value = param.thickness;
    document.getElementById("speed").value = param.speed;
    document.getElementById("power").value = param.power;
    document.getElementById("hatch").value = param.hatch;
    document.getElementById("observations").value = param.obs;
    document.getElementById("machine-select").value = param.machine;
    editingParamId = id;
  });
}

function deleteParam(id) {
  db.ref("parameters/" + id).remove();
}

function printAll() {
  window.print();
}

function printByMachine() {
  const machine = prompt("Ingrese el nombre de la máquina:");
  Array.from(parameterTable.rows).forEach((row) => {
    row.style.display = row.cells[7].textContent === machine ? "" : "none";
  });
  window.print();
  loadParameters();
}

function printByMaterial() {
  const material = prompt("Ingrese el nombre del material:");
  Array.from(parameterTable.rows).forEach((row) => {
    row.style.display = row.cells[1].textContent === material ? "" : "none";
  });
  window.print();
  loadParameters();
}

// Inicialización
loadMachines();
loadParameters();
