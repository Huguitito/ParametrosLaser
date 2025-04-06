// Configuración Firebase
const firebaseConfig = {
  apiKey: "AIzaSyBmvpWKmXzEjtybCCu_f74jAaHevY6Xg88",
  authDomain: "parametroslaser.firebaseapp.com",
  projectId: "parametroslaser",
  storageBucket: "parametroslaser.appspot.com",
  messagingSenderId: "224538884368",
  appId: "1:224538884368:web:298e319d40739e44fe8d95"
};
firebase.initializeApp(firebaseConfig);
const db = firebase.database();

const parameterForm = document.getElementById("parameter-form");
const machineForm = document.getElementById("machine-form");
const machineSelect = document.getElementById("machine-select");
const parameterTable = document.getElementById("parameter-table").querySelector("tbody");
const machineTable = document.getElementById("machine-table").querySelector("tbody");
const sortBy = document.getElementById("sort-by");

parameterForm.addEventListener("submit", (e) => {
  e.preventDefault();
  const newParam = {
    process: document.getElementById("process-type").value,
    material: document.getElementById("material").value,
    thickness: document.getElementById("thickness").value,
    speed: document.getElementById("speed").value,
    power: document.getElementById("power").value,
    hatch: document.getElementById("hatch").value || "",
    notes: document.getElementById("notes").value,
    machine: machineSelect.value,
    timestamp: Date.now()
  };
  db.ref("parametros").push(newParam);
  parameterForm.reset();
});

machineForm.addEventListener("submit", (e) => {
  e.preventDefault();
  const newMachine = {
    name: document.getElementById("machine-name").value,
    area: document.getElementById("machine-area").value,
    power: document.getElementById("machine-power").value,
    type: document.getElementById("machine-type").value
  };
  db.ref("maquinas").push(newMachine);
  machineForm.reset();
});

function loadMachines() {
  db.ref("maquinas").on("value", (snapshot) => {
    machineSelect.innerHTML = "";
    machineTable.innerHTML = "";
    snapshot.forEach((child) => {
      const m = child.val();
      const option = document.createElement("option");
      option.textContent = m.name;
      option.value = m.name;
      machineSelect.appendChild(option);

      const row = document.createElement("tr");
      row.innerHTML = `
        <td>${m.name}</td>
        <td>${m.area}</td>
        <td>${m.power}</td>
        <td>${m.type}</td>
        <td><button onclick="deleteMachine('${child.key}')">🗑️</button></td>
      `;
      machineTable.appendChild(row);
    });
  });
}

function loadParameters() {
  db.ref("parametros").on("value", (snapshot) => {
    const data = [];
    snapshot.forEach((child) => {
      const param = child.val();
      param.id = child.key;
      data.push(param);
    });

    const order = sortBy.value;
    if (order) {
      data.sort((a, b) => {
        if (order === "date") return b.timestamp - a.timestamp;
        return (a[order] || "").localeCompare(b[order] || "");
      });
    }

    parameterTable.innerHTML = "";
    data.forEach((p) => {
      const row = document.createElement("tr");
      row.innerHTML = `
        <td>${p.process}</td>
        <td>${p.material}</td>
        <td>${p.thickness}</td>
        <td>${p.speed}</td>
        <td>${p.power}</td>
        <td>${p.hatch || ""}</td>
        <td>${p.notes}</td>
        <td>${p.machine}</td>
        <td><button onclick="deleteParameter('${p.id}')">🗑️</button></td>
      `;
      parameterTable.appendChild(row);
    });
  });
}

function deleteMachine(id) {
  db.ref("maquinas/" + id).remove();
}

function deleteParameter(id) {
  db.ref("parametros/" + id).remove();
}

function printTable() {
  const printContent = document.getElementById("parameter-table").outerHTML;
  const win = window.open();
  win.document.write("<html><head><title>Parámetros</title></head><body>" + printContent + "</body></html>");
  win.print();
  win.close();
}

sortBy.addEventListener("change", loadParameters);

loadMachines();
loadParameters();