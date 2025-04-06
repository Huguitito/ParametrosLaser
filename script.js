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
    db.ref("machines/" + editingMachineId).set(newMachine)
      .then(() => {
        showNotification("Máquina actualizada correctamente");
        machineForm.reset();
        editingMachineId = null;
      })
      .catch(error => console.error("Error al actualizar máquina:", error));
  } else {
    db.ref("machines").push(newMachine)
      .then(() => {
        showNotification("Máquina guardada correctamente");
        machineForm.reset();
      })
      .catch(error => console.error("Error al guardar máquina:", error));
  }
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
            <button class="action-btn edit" onclick="editMachine('${key}')"><i class="fas fa-edit"></i> Editar</button>
            <button class="action-btn delete" onclick="deleteMachine('${key}')"><i class="fas fa-trash"></i> Borrar</button>
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
    
    // Desplazar la pantalla al formulario
    document.getElementById("machines-section").scrollIntoView({ behavior: 'smooth' });
  });
}

function deleteMachine(id) {
  if (confirm("¿Está seguro de eliminar esta máquina?")) {
    db.ref("machines/" + id).remove()
      .then(() => showNotification("Máquina eliminada correctamente"))
      .catch(error => console.error("Error al eliminar máquina:", error));
  }
}

// Guardar parámetro
parameterForm.addEventListener("submit", (e) => {
  e.preventDefault();
  const process = document.getElementById("process-type").value;
  const material = document.getElementById("material").value;
  const thickness = document.getElementById("thickness").value;
  const speed = document.getElementById("speed").value;
  const power = document.getElementById("power").value;
  const hatch = document.getElementById("hatch").value; // Ya no es obligatorio
  const obs = document.getElementById("observations").value;
  const machine = document.getElementById("machine-select").value;

  const param = { process, material, thickness, speed, power, hatch, obs, machine };

  if (editingParamId) {
    db.ref("parameters/" + editingParamId).set(param)
      .then(() => {
        showNotification("Parámetro actualizado correctamente");
        parameterForm.reset();
        editingParamId = null;
      })
      .catch(error => console.error("Error al actualizar parámetro:", error));
  } else {
    db.ref("parameters").push(param)
      .then(() => {
        showNotification("Parámetro guardado correctamente");
        parameterForm.reset();
      })
      .catch(error => console.error("Error al guardar parámetro:", error));
  }
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
          <td>${param.hatch || '-'}</td>
          <td>${param.obs || '-'}</td>
          <td>${param.machine}</td>
          <td class="no-print">
            <button class="action-btn edit" onclick="editParam('${key}')"><i class="fas fa-edit"></i> Editar</button>
            <button class="action-btn delete" onclick="deleteParam('${key}')"><i class="fas fa-trash"></i> Borrar</button>
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
    document.getElementById("hatch").value = param.hatch || '';
    document.getElementById("observations").value = param.obs || '';
    document.getElementById("machine-select").value = param.machine;
    editingParamId = id;
    
    // Desplazar la pantalla al formulario
    document.getElementById("parameter-form").scrollIntoView({ behavior: 'smooth' });
  });
}

function deleteParam(id) {
  if (confirm("¿Está seguro de eliminar este parámetro?")) {
    db.ref("parameters/" + id).remove()
      .then(() => showNotification("Parámetro eliminado correctamente"))
      .catch(error => console.error("Error al eliminar parámetro:", error));
  }
}

function printAll() {
  preparePrint();
  window.print();
}

function printByMachine() {
  const machine = prompt("Ingrese el nombre de la máquina:");
  if (machine) {
    Array.from(parameterTable.rows).forEach((row) => {
      row.style.display = row.cells[7].textContent === machine ? "" : "none";
    });
    preparePrint();
    window.print();
    loadParameters(); // Recargar tabla después de imprimir
  }
}

function printByMaterial() {
  const material = prompt("Ingrese el nombre del material:");
  if (material) {
    Array.from(parameterTable.rows).forEach((row) => {
      row.style.display = row.cells[1].textContent === material ? "" : "none";
    });
    preparePrint();
    window.print();
    loadParameters(); // Recargar tabla después de imprimir
  }
}

// Función para preparar la impresión
function preparePrint() {
  document.title = "Parámetros de Láser - " + new Date().toLocaleDateString();
}

// Función para mostrar notificaciones
function showNotification(message) {
  // Crear elemento de notificación
  const notification = document.createElement('div');
  notification.textContent = message;
  notification.style.position = 'fixed';
  notification.style.bottom = '20px';
  notification.style.right = '20px';
  notification.style.backgroundColor = '#4CAF50';
  notification.style.color = 'white';
  notification.style.padding = '10px 20px';
  notification.style.borderRadius = '4px';
  notification.style.zIndex = '9999';
  notification.style.boxShadow = '0 2px 10px rgba(0,0,0,0.2)';
  
  // Añadir al DOM
  document.body.appendChild(notification);
  
  // Eliminar después de 3 segundos
  setTimeout(() => {
    notification.style.opacity = '0';
    notification.style.transition = 'opacity 0.5s ease';
    setTimeout(() => {
      document.body.removeChild(notification);
    }, 500);
  }, 3000);
}

// Inicialización
loadMachines();
loadParameters();

// Quitar el atributo required del campo hatch
document.addEventListener('DOMContentLoaded', function() {
  document.getElementById('hatch').removeAttribute('required');
});