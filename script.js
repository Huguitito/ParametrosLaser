// Cargar máquinas desde Firebase y llenar los select
function loadMachines() {
  const machineSelect = document.getElementById("machine-select");
  const filterSelect = document.getElementById("filter-machine");

  machineSelect.innerHTML = '<option value="">Seleccionar máquina</option>';
  filterSelect.innerHTML = '<option value="">Todas</option>';

  firebase.database().ref("machines").once("value", (snapshot) => {
    snapshot.forEach((child) => {
      const name = child.val().name;
      const option1 = document.createElement("option");
      const option2 = document.createElement("option");
      option1.value = name;
      option2.value = name;
      option1.textContent = name;
      option2.textContent = name;
      machineSelect.appendChild(option1);
      filterSelect.appendChild(option2);
    });
  });
}

// Agregar máquina
const machineForm = document.getElementById("machine-form");
machineForm.addEventListener("submit", (e) => {
  e.preventDefault();
  const name = document.getElementById("machine-name").value;
  const area = document.getElementById("machine-area").value;
  const power = document.getElementById("machine-power").value;
  const type = document.getElementById("machine-type").value;

  const newRef = firebase.database().ref("machines").push();
  newRef.set({ name, area, power, type }, loadMachines);
  machineForm.reset();
});

// Agregar parámetro
const paramForm = document.getElementById("parameter-form");
paramForm.addEventListener("submit", (e) => {
  e.preventDefault();
  const data = {
    type: document.getElementById("process-type").value,
    material: document.getElementById("material").value,
    thickness: document.getElementById("thickness").value,
    speed: document.getElementById("speed").value,
    power: document.getElementById("power").value,
    hatch: document.getElementById("hatch").value,
    observations: document.getElementById("observations").value,
    machine: document.getElementById("machine-select").value
  };
  firebase.database().ref("parameters").push(data, () => {
    paramForm.reset();
    loadParameters();
  });
});

// Mostrar parámetros
function loadParameters() {
  const tableBody = document.querySelector("#parameter-table tbody");
  const filter = document.getElementById("filter-machine").value;

  firebase.database().ref("parameters").once("value", (snapshot) => {
    tableBody.innerHTML = "";
    snapshot.forEach((child) => {
      const param = child.val();
      if (!filter || param.machine === filter) {
        const row = document.createElement("tr");
        row.innerHTML = `
          <td>${param.type}</td>
          <td>${param.material}</td>
          <td>${param.thickness}</td>
          <td>${param.speed}</td>
          <td>${param.power}</td>
          <td>${param.hatch}</td>
          <td>${param.observations}</td>
          <td>${param.machine}</td>
        `;
        tableBody.appendChild(row);
      }
    });
  });
}

document.getElementById("filter-machine").addEventListener("change", loadParameters);

// Cargar datos al iniciar
window.onload = () => {
  loadMachines();
  loadParameters();
};
