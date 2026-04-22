// --- Navigation Logic ---
function login() {
    document.getElementById('login-screen').style.display = 'none';
    document.getElementById('app-layout').style.display = 'flex';
}

function showSection(sectionId, navElement) {
    document.querySelectorAll('.content-section').forEach(sec => sec.classList.remove('active'));
    document.getElementById(sectionId).classList.add('active');
    if (navElement) {
        document.querySelectorAll('.nav-links li').forEach(li => li.classList.remove('active'));
        navElement.classList.add('active');
    }
}

// --- Dummy Data (10 Patients) ---
const dummyPatients = [
    { id: 'P001', name: 'Sarah Johnson', age: 34, sex: 'Female', contact: '(555) 123-4567', blood: 'O+', date: '2024-04-15', vitals: { bpSys: 142, bpDia: 88, hr: 78, temp: 37.0, spo2: 98, resp: 16, bmi: 22.5 } }, 
    { id: 'P002', name: 'Michael Chen', age: 45, sex: 'Male', contact: '(555) 234-5678', blood: 'A+', date: '2024-04-18', vitals: { bpSys: 165, bpDia: 95, hr: 85, temp: 37.2, spo2: 97, resp: 18, bmi: 26.1 } }, 
    { id: 'P003', name: 'Emily Rodriguez', age: 28, sex: 'Female', contact: '(555) 345-6789', blood: 'B-', date: '2024-04-10', vitals: { bpSys: 115, bpDia: 75, hr: 68, temp: 36.8, spo2: 99, resp: 14, bmi: 21.0 } },
    { id: 'P004', name: 'Robert Williams', age: 62, sex: 'Male', contact: '(555) 456-7890', blood: 'AB+', date: '2024-04-20', vitals: { bpSys: 130, bpDia: 85, hr: 75, temp: 38.2, spo2: 96, resp: 20, bmi: 28.4 } }, 
    { id: 'P005', name: 'Amanda Foster', age: 31, sex: 'Female', contact: '(555) 567-8901', blood: 'B+', date: '2024-04-12', vitals: { bpSys: 110, bpDia: 70, hr: 125, temp: 36.6, spo2: 98, resp: 22, bmi: 23.1 } }, 
    { id: 'P006', name: 'David Kim', age: 55, sex: 'Male', contact: '(555) 678-9012', blood: 'A-', date: '2024-04-05', vitals: { bpSys: 125, bpDia: 82, hr: 45, temp: 36.5, spo2: 96, resp: 12, bmi: 24.5 } }, 
    { id: 'P007', name: 'Lisa Thompson', age: 41, sex: 'Female', contact: '(555) 789-0123', blood: 'O-', date: '2024-04-19', vitals: { bpSys: 118, bpDia: 78, hr: 72, temp: 37.0, spo2: 98, resp: 16, bmi: 22.8 } },
    { id: 'P008', name: 'James Anderson', age: 70, sex: 'Male', contact: '(555) 890-1234', blood: 'O+', date: '2024-04-14', vitals: { bpSys: 85, bpDia: 55, hr: 60, temp: 36.0, spo2: 95, resp: 14, bmi: 20.2 } }, 
    { id: 'P009', name: 'Jennifer Martinez', age: 25, sex: 'Female', contact: '(555) 901-2345', blood: 'A+', date: '2024-04-21', vitals: { bpSys: 120, bpDia: 80, hr: 70, temp: 36.9, spo2: 88, resp: 18, bmi: 21.5 } }, 
    { id: 'P010', name: 'Thomas Brown', age: 48, sex: 'Male', contact: '(555) 012-3456', blood: 'AB-', date: '2024-04-16', vitals: { bpSys: 130, bpDia: 85, hr: 85, temp: 37.3, spo2: 97, resp: 16, bmi: 25.0 } }
];

// --- Patient Table Generation & Row Highlighting ---
function populateTable() {
    const tbody = document.getElementById('patients-tbody');
    tbody.innerHTML = '';

    dummyPatients.forEach(patient => {
        let v = patient.vitals;
        let isRowCritical = false;
        if (v.spo2 < 90 || v.bpSys > 160 || v.bpSys < 90 || v.hr > 120 || v.hr < 50 || v.temp > 37.5) {
            isRowCritical = true;
        }

        let rowClass = isRowCritical ? 'critical-row' : '';
        let rowHtml = `
            <tr class="${rowClass}">
                <td>
                    <img src="https://ui-avatars.com/api/?name=${patient.name}&background=random&color=fff&rounded=true&size=36" style="vertical-align: middle; margin-right: 12px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
                    <div style="display: inline-block; vertical-align: middle;">
                        <strong style="color: var(--text-dark);">${patient.name}</strong><br>
                        <span style="font-size: 12px; color: var(--text-light);">${patient.age} yrs • ${patient.sex}</span>
                    </div>
                </td>
                <td style="font-weight: 500;">${patient.id}</td>
                <td>${patient.contact}</td>
                <td><span style="background: #fee2e2; color: #ef4444; padding: 4px 8px; border-radius: 6px; font-weight: 600; font-size: 12px;">${patient.blood}</span></td>
                <td>${patient.date}</td>
                <td><span class="view-btn" onclick="openModal('${patient.id}')">View Details</span></td>
            </tr>
        `;
        tbody.innerHTML += rowHtml;
    });
}
populateTable();

// --- NEW: Appointments Table Data ---
const dummyAppointments = [
    { name: 'Sarah Johnson', time: 'Today, 09:00 AM', doc: 'Dr. Emily Watson', type: 'Follow-up', status: 'completed' },
    { name: 'Michael Chen', time: 'Today, 10:00 AM', doc: 'Dr. James Martinez', type: 'Checkup', status: 'completed' },
    { name: 'Amanda Foster', time: 'Today, 11:30 AM', doc: 'Dr. Emily Watson', type: 'Consultation', status: 'scheduled' },
    { name: 'James Anderson', time: 'Today, 02:00 PM', doc: 'Dr. Sarah Lee', type: 'Procedure', status: 'scheduled' },
    { name: 'Emily Rodriguez', time: 'Tomorrow, 09:30 AM', doc: 'Dr. James Martinez', type: 'Checkup', status: 'pending' }
];

function populateAppointments() {
    const tbody = document.getElementById('appointments-tbody');
    tbody.innerHTML = '';
    dummyAppointments.forEach(app => {
        let rowHtml = `
            <tr>
                <td><strong>${app.name}</strong></td>
                <td>${app.time}</td>
                <td>${app.doc}</td>
                <td>${app.type}</td>
                <td><span class="status-badge status-${app.status}">${app.status}</span></td>
                <td><span class="view-btn" style="background:transparent; padding:0;">Edit</span></td>
            </tr>
        `;
        tbody.innerHTML += rowHtml;
    });
}
populateAppointments();

// --- NEW: Lab Results Table Data ---
const dummyLabs = [
    { name: 'Sarah Johnson', test: 'Lipid Panel', date: '2024-04-22', status: 'completed', action: 'View Result' },
    { name: 'Michael Chen', test: 'Microalbumin', date: '2024-04-22', status: 'pending', action: 'Awaiting' },
    { name: 'Robert Williams', test: 'BNP', date: '2024-04-21', status: 'completed', action: 'View Result' },
    { name: 'Lisa Thompson', test: 'Vitamin D', date: '2024-04-20', status: 'pending', action: 'Awaiting' },
    { name: 'James Anderson', test: 'PSA', date: '2024-04-19', status: 'critical', action: 'Urgent Review' }
];

function populateLabs() {
    const tbody = document.getElementById('labs-tbody');
    tbody.innerHTML = '';
    dummyLabs.forEach(lab => {
        let actionStyle = lab.status === 'critical' ? 'color: var(--danger-red); font-weight: bold;' : 'color: var(--primary); font-weight: 600; cursor: pointer;';
        let rowHtml = `
            <tr>
                <td><strong>${lab.name}</strong></td>
                <td>${lab.test}</td>
                <td>${lab.date}</td>
                <td><span class="status-badge status-${lab.status}">${lab.status}</span></td>
                <td><span style="${actionStyle}">${lab.action}</span></td>
            </tr>
        `;
        tbody.innerHTML += rowHtml;
    });
}
populateLabs();

// --- Modal & Chart Logic ---
let vitalsChartInstance = null;

function openModal(patientId) {
    const p = dummyPatients.find(x => x.id === patientId);
    if(!p) return;

    document.getElementById('modal-patient-name').innerText = p.name;
    document.getElementById('modal-patient-info').innerText = `${p.id} • ${p.age} yrs • ${p.sex} • Admitted: ${p.date}`;

    let v = p.vitals;
    let bpClass = (v.bpSys > 160 || v.bpSys < 90) ? 'red-alert-card' : '';
    let hrClass = (v.hr > 120 || v.hr < 50) ? 'red-alert-card' : '';
    let tempClass = (v.temp > 37.5) ? 'red-alert-card' : '';
    let spo2Class = (v.spo2 < 90) ? 'red-alert-card' : '';

    document.getElementById('latest-vitals-container').innerHTML = `
        <div class="vital-box ${bpClass}"><h4>Blood Pressure</h4><h2>${v.bpSys}/${v.bpDia} <small>mmHg</small></h2></div>
        <div class="vital-box ${hrClass}"><h4>Heart Rate</h4><h2>${v.hr} <small>bpm</small></h2></div>
        <div class="vital-box ${tempClass}"><h4>Temperature</h4><h2>${v.temp}° <small>C</small></h2></div>
        <div class="vital-box ${spo2Class}"><h4>SpO2</h4><h2>${v.spo2} <small>%</small></h2></div>
        <div class="vital-box"><h4>Resp Rate</h4><h2>${v.resp} <small>br/min</small></h2></div>
        <div class="vital-box"><h4>BMI</h4><h2>${v.bmi} <small>Normal</small></h2></div>
    `;

    renderChart(p.name, v);
    populateHistoryTable(v);

    document.getElementById('patient-modal').style.display = 'flex';
    switchTab('vitals'); 
}

function closeModal() { document.getElementById('patient-modal').style.display = 'none'; }

function switchTab(tabName) {
    document.querySelectorAll('.tab-btn').forEach(btn => btn.classList.remove('active'));
    event.target.classList.add('active');
    document.querySelectorAll('.tab-content').forEach(content => content.classList.remove('active'));
    document.getElementById('tab-' + tabName).classList.add('active');
}

function renderChart(name, v) {
    const ctx = document.getElementById('vitalsChart').getContext('2d');
    if(vitalsChartInstance) vitalsChartInstance.destroy();

    Chart.defaults.font.family = "'Inter', sans-serif";
    Chart.defaults.color = '#64748b';

    const labels = ['Jan 10', 'Jan 28', 'Feb 14', 'Mar 5', 'Latest'];
    vitalsChartInstance = new Chart(ctx, {
        type: 'line',
        data: {
            labels: labels,
            datasets: [
                { label: 'Systolic BP', data: [v.bpSys-20, v.bpSys-10, v.bpSys+5, v.bpSys-5, v.bpSys], borderColor: '#ef4444', backgroundColor: '#ef4444', borderWidth: 3, tension: 0.4, pointRadius: 4, pointHoverRadius: 6 },
                { label: 'Diastolic BP', data: [v.bpDia-10, v.bpDia-5, v.bpDia+2, v.bpDia-3, v.bpDia], borderColor: '#fca5a5', backgroundColor: '#fca5a5', borderWidth: 2, borderDash: [5, 5], tension: 0.4, pointRadius: 3 },
                { label: 'Heart Rate', data: [v.hr+5, v.hr-2, v.hr+8, v.hr-4, v.hr], borderColor: '#0ea5e9', backgroundColor: '#0ea5e9', borderWidth: 3, tension: 0.4, pointRadius: 4, pointHoverRadius: 6 }
            ]
        },
        options: { 
            responsive: true, maintainAspectRatio: false,
            interaction: { mode: 'index', intersect: false },
            plugins: { legend: { position: 'top', labels: { usePointStyle: true, boxWidth: 8 } }, tooltip: { backgroundColor: 'rgba(15, 23, 42, 0.9)', titleFont: { size: 13 }, bodyFont: { size: 13 }, padding: 10, cornerRadius: 8, displayColors: true } },
            scales: { y: { grid: { color: '#f1f5f9', drawBorder: false } }, x: { grid: { display: false, drawBorder: false } } }
        }
    });
}

function populateHistoryTable(v) {
    const tbody = document.getElementById('history-tbody');
    tbody.innerHTML = `
        <tr style="background: #f8fafc; font-weight: 600;"><td>Latest</td><td>${v.bpSys} mmHg</td><td>${v.bpDia} mmHg</td></tr>
        <tr><td>Mar 5</td><td>${v.bpSys - 5} mmHg</td><td>${v.bpDia - 3} mmHg</td></tr>
        <tr><td>Feb 14</td><td>${v.bpSys + 5} mmHg</td><td>${v.bpDia + 2} mmHg</td></tr>
        <tr><td>Jan 28</td><td>${v.bpSys - 10} mmHg</td><td>${v.bpDia - 5} mmHg</td></tr>
        <tr><td>Jan 10</td><td>${v.bpSys - 20} mmHg</td><td>${v.bpDia - 10} mmHg</td></tr>
    `;
}