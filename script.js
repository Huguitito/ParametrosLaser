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
function submitNew(e) {
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
}
paramForm.onsubmit = submitNew;

// Mostrar parámetros con opción de editar y borrar
function loadParameters() {
  const tableBody = document.querySelector("#parameter-table tbody");
  const filter = document.getElementById("filter-machine").value;

  firebase.database().ref("parameters").once("value", (snapshot) => {
    tableBody.innerHTML = "";
    snapshot.forEach((child) => {
      const key = child.key;
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
          <td>
            <button onclick="editParameter('${key}')">Editar</button>
            <button onclick="deleteParameter('${key}')">Borrar</button>
          </td>
        `;
        tableBody.appendChild(row);
      }
    });
  });
}

// Editar parámetro
function editParameter(key) {
  firebase.database().ref(`parameters/${key}`).once("value", (snapshot) => {
    const param = snapshot.val();
    document.getElementById("process-type").value = param.type;
    document.getElementById("material").value = param.material;
    document.getElementById("thickness").value = param.thickness;
    document.getElementById("speed").value = param.speed;
    document.getElementById("power").value = param.power;
    document.getElementById("hatch").value = param.hatch;
    document.getElementById("observations").value = param.observations;
    document.getElementById("machine-select").value = param.machine;

    paramForm.removeEventListener("submit", submitNew);
    paramForm.onsubmit = (e) => {
      e.preventDefault();
      const updated = {
        type: document.getElementById("process-type").value,
        material: document.getElementById("material").value,
        thickness: document.getElementById("thickness").value,
        speed: document.getElementById("speed").value,
        power: document.getElementById("power").value,
        hatch: document.getElementById("hatch").value,
        observations: document.getElementById("observations").value,
        machine: document.getElementById("machine-select").value
      };
      firebase.database().ref(`parameters/${key}`).set(updated, () => {
        paramForm.reset();
        loadParameters();
        paramForm.onsubmit = submitNew;
      });
    };
  });
}

// Eliminar parámetro
function deleteParameter(key) {
  firebase.database().ref(`parameters/${key}`).remove(loadParameters);
}

// Filtro
document.getElementById("filter-machine").addEventListener("change", loadParameters);

// Cargar datos al iniciar
window.onload = () => {
  loadMachines();
  loadParameters();
};

// Imprimir por máquina
function printByMachine() {
  const filter = document.getElementById("filter-machine").value;
  const printWindow = window.open("", "", "width=800,height=600");
  printWindow.document.write("<html><head><title>Impresión</title></head><body><h2>Parámetros de corte y grabado</h2><table border='1'><thead><tr><th>Tipo</th><th>Material</th><th>Espesor</th><th>Velocidad</th><th>Potencia</th><th>Hatch</th><th>Observaciones</th><th>Máquina</th></tr></thead><tbody>");
  firebase.database().ref("parameters").once("value", (snapshot) => {
    snapshot.forEach((child) => {
      const param = child.val();
      if (!filter || param.machine === filter) {
        printWindow.document.write(`<tr><td>${param.type}</td><td>${param.material}</td><td>${param.thickness}</td><td>${param.speed}</td><td>${param.power}</td><td>${param.hatch}</td><td>${param.observations}</td><td>${param.machine}</td></tr>`);
      }
    });
    printWindow.document.write("</tbody></table></body></html>");
    printWindow.document.close();
    printWindow.print();
  });
}

// Imprimir por material
function printByMaterial() {
  const selectedMaterial = prompt("Ingresá el nombre del material a imprimir:");
  if (!selectedMaterial) return;

  const printWindow = window.open("", "", "width=800,height=600");
  printWindow.document.write("<html><head><title>Impresión</title></head><body><h2>Parámetros para: " + selectedMaterial + "</h2><table border='1'><thead><tr><th>Tipo</th><th>Material</th><th>Espesor</th><th>Velocidad</th><th>Potencia</th><th>Hatch</th><th>Observaciones</th><th>Máquina</th></tr></thead><tbody>");
  firebase.database().ref("parameters").once("value", (snapshot) => {
    snapshot.forEach((child) => {
      const param = child.val();
      if (param.material.toLowerCase() === selectedMaterial.toLowerCase()) {
        printWindow.document.write(`<tr><td>${param.type}</td><td>${param.material}</td><td>${param.thickness}</td><td>${param.speed}</td><td>${param.power}</td><td>${param.hatch}</td><td>${param.observations}</td><td>${param.machine}</td></tr>`);
      }
    });
    printWindow.document.write("</tbody></table></body></html>");
    printWindow.document.close();
    printWindow.print();
  });
}

// Agregar botones de impresión a la interfaz
const controls = document.getElementById("controls") || document.body;
const printMachineBtn = document.createElement("button");
printMachineBtn.textContent = "🖨️ Imprimir por Máquina";
printMachineBtn.onclick = printByMachine;
controls.appendChild(printMachineBtn);

const printMaterialBtn = document.createElement("button");
printMaterialBtn.textContent = "🖨️ Imprimir por Material";
printMaterialBtn.onclick = printByMaterial;
controls.appendChild(printMaterialBtn);
