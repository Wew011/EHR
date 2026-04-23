// --- Initialize Dynamic Dates on Load ---
document.addEventListener('DOMContentLoaded', () => {
    const dateEl = document.getElementById('current-date-display');
    const bannerDateEl = document.getElementById('banner-date-display');
    
    if(dateEl && bannerDateEl) {
        const fullOptions = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
        const shortOptions = { month: 'short', day: 'numeric', year: 'numeric' };
        bannerDateEl.innerText = new Date().toLocaleDateString('en-US', fullOptions);
        dateEl.innerText = new Date().toLocaleDateString('en-US', shortOptions);
    }
});

// Helper for precise timestamps format: M/D/YYYY HH:MM:SS
function getExactTimestamp() {
    let d = new Date();
    return `${d.getMonth()+1}/${d.getDate()}/${d.getFullYear()} ${d.getHours().toString().padStart(2,'0')}:${d.getMinutes().toString().padStart(2,'0')}:${d.getSeconds().toString().padStart(2,'0')}`;
}

// --- Navigation Logic ---
function login() {
    document.getElementById('login-screen').style.display = 'none';
    document.getElementById('app-layout').style.display = 'flex';
    initData(); 
}

function showSection(sectionId, navElement) {
    document.querySelectorAll('.content-section').forEach(sec => sec.classList.remove('active'));
    document.getElementById(sectionId).classList.add('active');
    if (navElement) {
        document.querySelectorAll('.nav-links li').forEach(li => li.classList.remove('active'));
        navElement.classList.add('active');
    }
}

// --- Local Storage & Data Management ---
let patients = [];
let appointments = [];
let labs = [];
let pharmacy = [];
let currentViewedPatientId = null; 

function initData() {
    // Upgraded to v4 to ensure plain-text dates render perfectly
    if (localStorage.getItem('ehr_patients_v4')) {
        patients = JSON.parse(localStorage.getItem('ehr_patients_v4'));
    } else {
        patients = [
            { id: 'P001', name: 'Sarah Johnson', age: 34, sex: 'Female', contact: '555-1234', blood: 'O+', date: '4/15/2024', room: 'General Ward - Bed 1', doctor: 'Dr. Maria Santos', diet: 'General Diet', allergies: 'None', complaint: 'Routine Checkup', vitals: { bpSys: 142, bpDia: 88, hr: 78, temp: 37.0, spo2: 98, resp: 16, bmi: 22.5 }, record: { neuro: 'Alert', resp: 'Normal/Regular', skin: 'Normal', bowel: 'Normal Active', edema: 'None', timestamp: '4/15/2024 09:30:00' } }, 
            { id: 'P002', name: 'Michael Chen', age: 45, sex: 'Male', contact: '555-5678', blood: 'A+', date: '4/18/2024', room: 'Private Room 102', doctor: 'Dr. Juan Dela Cruz', diet: 'Low Sodium', allergies: 'Penicillin', complaint: 'Chest Pain', vitals: { bpSys: 165, bpDia: 95, hr: 85, temp: 37.2, spo2: 97, resp: 18, bmi: 26.1 }, record: { neuro: 'Lethargic', resp: 'Labored', skin: 'Pale', bowel: 'Hypoactive', edema: '1+ Pitting', timestamp: '4/18/2024 14:20:15' } },
            { id: 'P003', name: 'Emily Rodriguez', age: 28, sex: 'Female', contact: '555-3456', blood: 'B-', date: '4/10/2024', room: 'Outpatient', doctor: 'Dr. Elena Reyes', diet: 'Regular', allergies: 'Peanuts', complaint: 'Fever', vitals: { bpSys: 115, bpDia: 75, hr: 68, temp: 36.8, spo2: 99, resp: 14, bmi: 21.0 }, record: { neuro: 'Alert', resp: 'Normal/Regular', skin: 'Normal', bowel: 'Normal Active', edema: 'None', timestamp: '4/10/2024 11:05:40' } }
        ];
        saveData();
    }

    if (localStorage.getItem('ehr_appointments_v2')) {
        appointments = JSON.parse(localStorage.getItem('ehr_appointments_v2'));
    } else {
        appointments = [
            { id: 1, name: 'Sarah Johnson', time: 'Today, 09:00 AM', doc: 'Dr. Maria Santos', type: 'Follow-up', status: 'completed' },
            { id: 2, name: 'Emily Rodriguez', time: 'Tomorrow, 09:30 AM', doc: 'Dr. Elena Reyes', type: 'Checkup', status: 'pending' }
        ];
        saveData();
    }

    if (localStorage.getItem('ehr_labs_v2')) {
        labs = JSON.parse(localStorage.getItem('ehr_labs_v2'));
    } else {
        labs = [
            { id: 1, name: 'Sarah Johnson', test: 'Lipid Panel', date: '2024-04-22', status: 'completed' },
            { id: 2, name: 'Michael Chen', test: 'Microalbumin', date: '2024-04-22', status: 'pending' }
        ];
        saveData();
    }

    if (localStorage.getItem('ehr_pharmacy_v2')) {
        pharmacy = JSON.parse(localStorage.getItem('ehr_pharmacy_v2'));
    } else {
        pharmacy = [
            { id: 1, name: 'Sarah Johnson', meds: 'Amoxicillin 500mg', doc: 'Dr. Maria Santos', status: 'dispensed' },
            { id: 2, name: 'Michael Chen', meds: 'Losartan 50mg', doc: 'Dr. Juan Dela Cruz', status: 'pending' }
        ];
        saveData();
    }

    updateDashboards();
    populateTable();
    populateAppointments();
    populateLabs();
    populatePharmacy();
}

function saveData() {
    localStorage.setItem('ehr_patients_v4', JSON.stringify(patients));
    localStorage.setItem('ehr_appointments_v2', JSON.stringify(appointments));
    localStorage.setItem('ehr_labs_v2', JSON.stringify(labs));
    localStorage.setItem('ehr_pharmacy_v2', JSON.stringify(pharmacy));
    updateDashboards();
}

// --- Dashboards & Modern Modals ---
function updateDashboards() {
    document.getElementById('dash-patient-count').innerText = patients.length;
    document.getElementById('dash-appt-count').innerText = appointments.length;
    document.getElementById('dash-lab-count').innerText = labs.length;
    if(document.getElementById('dash-rx-count')) document.getElementById('dash-rx-count').innerText = pharmacy.length;

    let pendingAppts = appointments.filter(a => a.status === 'pending').length;
    let pendingLabs = labs.filter(l => l.status === 'pending').length;
    let criticalPatients = patients.filter(p => p.vitals && p.vitals.spo2 !== '-' && (p.vitals.spo2 < 90 || p.vitals.bpSys > 160)).length;
    
    const badge = document.getElementById('notification-badge');
    if (badge) {
        if (pendingAppts > 0 || pendingLabs > 0 || criticalPatients > 0) badge.style.display = 'block';
        else badge.style.display = 'none';
    }
    populateRecentPatientsWidget();
}

function showNotifications() {
    let pendingAppts = appointments.filter(a => a.status === 'pending').length;
    let pendingLabs = labs.filter(l => l.status === 'pending').length;
    let criticalPatients = patients.filter(p => p.vitals && p.vitals.spo2 !== '-' && (p.vitals.spo2 < 90 || p.vitals.bpSys > 160)).length;
    
    const list = document.getElementById('notification-list');
    list.innerHTML = '';

    if (criticalPatients === 0 && pendingAppts === 0 && pendingLabs === 0) {
        list.innerHTML = `
            <div class="notif-item">
                <div class="notif-icon notif-success"><i class="fas fa-check-circle"></i></div>
                <div class="notif-content"><h4>All caught up!</h4><p>No new notifications at this time.</p></div>
            </div>`;
    } else {
        if (criticalPatients > 0) {
            list.innerHTML += `
                <div class="notif-item" style="background: #fff1f2; border-color: #fecaca;">
                    <div class="notif-icon notif-danger"><i class="fas fa-exclamation-triangle"></i></div>
                    <div class="notif-content"><h4>Critical Patients Alert</h4><p>${criticalPatients} Patient(s) flagged as CRITICAL. Check vitals immediately.</p></div>
                </div>`;
        }
        if (pendingAppts > 0) {
            list.innerHTML += `
                <div class="notif-item">
                    <div class="notif-icon notif-warning"><i class="far fa-calendar-alt"></i></div>
                    <div class="notif-content"><h4>Pending Appointments</h4><p>${pendingAppts} Appointment(s) waiting for confirmation.</p></div>
                </div>`;
        }
        if (pendingLabs > 0) {
            list.innerHTML += `
                <div class="notif-item">
                    <div class="notif-icon notif-info"><i class="fas fa-vial"></i></div>
                    <div class="notif-content"><h4>Pending Lab Results</h4><p>${pendingLabs} Lab test(s) currently awaiting results.</p></div>
                </div>`;
        }
    }
    document.getElementById('notification-modal').style.display = 'flex';
}

function closeNotificationModal() { document.getElementById('notification-modal').style.display = 'none'; }

function generateDailyReport() {
    let today = new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
    document.getElementById('report-date').innerText = today;
    
    const list = document.getElementById('report-list');
    list.innerHTML = `
        <div class="notif-item">
            <div class="notif-icon notif-success"><i class="fas fa-users"></i></div>
            <div class="notif-content"><h4>Total Registered Patients</h4><p>${patients.length} active records</p></div>
        </div>
        <div class="notif-item">
            <div class="notif-icon notif-warning"><i class="far fa-calendar-check"></i></div>
            <div class="notif-content"><h4>Appointments Handled</h4><p>${appointments.length} scheduled sessions</p></div>
        </div>
        <div class="notif-item">
            <div class="notif-icon notif-info"><i class="fas fa-microscope"></i></div>
            <div class="notif-content"><h4>Lab Tests Recorded</h4><p>${labs.length} diagnostic tests</p></div>
        </div>
        <div class="notif-item">
            <div class="notif-icon notif-danger" style="background:#fce7f3; color:#831843; border-color:#fbcfe8;"><i class="fas fa-prescription-bottle-alt"></i></div>
            <div class="notif-content"><h4>Prescriptions Issued</h4><p>${pharmacy.length} medication scripts</p></div>
        </div>
    `;
    document.getElementById('report-modal').style.display = 'flex';
}

function closeReportModal() { document.getElementById('report-modal').style.display = 'none'; }

function populateRecentPatientsWidget() {
    const list = document.getElementById('recent-patients-list');
    if(!list) return;
    list.innerHTML = '';
    
    let recent = patients.slice(-4).reverse();
    let mockTimes = ['09:15 AM', '10:00 AM', '10:45 AM', '11:30 AM'];
    
    recent.forEach((p, index) => {
        let status = 'Stable';
        let statusClass = 'status-completed'; 
        
        if(p.vitals && p.vitals.spo2 !== '-' && (p.vitals.spo2 < 90 || p.vitals.bpSys > 160)) { 
            status = 'Critical'; 
            statusClass = 'status-critical'; 
        } else if(p.complaint.toLowerCase().includes('checkup') || p.complaint.toLowerCase().includes('fever')) { 
            status = 'Follow-up'; 
            statusClass = 'status-pending'; 
        }

        let initials = p.name.split(' ').map(n=>n[0]).join('').substring(0,2);
        let displayTime = mockTimes[index] || '12:00 PM';
        
        list.innerHTML += `
            <div class="recent-list-item">
                <div class="r-patient-info">
                    <div class="r-avatar">${initials}</div>
                    <div>
                        <h4>${p.name}</h4>
                        <p>${p.complaint} • Age ${p.age}</p>
                    </div>
                </div>
                <div class="r-patient-status">
                    <span class="status-badge ${statusClass}">${status}</span>
                    <span class="r-time">${displayTime}</span>
                </div>
            </div>
        `;
    });
}

// --- PATIENT CRUD OPERATIONS ---
function prepareNewPatient() {
    document.getElementById('patient-form').reset();
    document.getElementById('p-id').value = '';
    
    let d = new Date();
    document.getElementById('p-admission').value = `${d.getMonth()+1}/${d.getDate()}/${d.getFullYear()}`;
    
    document.getElementById('form-title').innerText = "Register New Patient";
    showSection('new-patient', document.querySelectorAll('.nav-links li')[1]);
}

function savePatient(e) {
    e.preventDefault();
    const idField = document.getElementById('p-id').value;
    
    let initialVitals = { bpSys: '-', bpDia: '-', hr: '-', temp: '-', spo2: '-', resp: '-', bmi: '-' };
    let initialRecord = { neuro: '-', resp: '-', skin: '-', bowel: '-', edema: '-', timestamp: '-' };
    
    const newPatient = {
        id: idField ? idField : 'P00' + (patients.length + 1),
        name: document.getElementById('p-name').value,
        age: document.getElementById('p-age').value,
        sex: document.getElementById('p-sex').value,
        dob: document.getElementById('p-dob').value,
        contact: document.getElementById('p-contact').value,
        address: document.getElementById('p-address').value,
        blood: document.getElementById('p-blood').value,
        room: document.getElementById('p-room').value,
        diet: document.getElementById('p-diet').value || 'Regular',
        allergies: document.getElementById('p-allergies').value || 'None',
        civil: document.getElementById('p-civil').value,
        doctor: document.getElementById('p-doc').value,
        complaint: document.getElementById('p-complaint').value,
        date: document.getElementById('p-admission').value,
        vitals: initialVitals,
        vitalsHistory: [],
        record: initialRecord
    };

    if (idField) {
        const index = patients.findIndex(p => p.id === idField);
        newPatient.vitals = patients[index].vitals; 
        newPatient.vitalsHistory = patients[index].vitalsHistory; 
        newPatient.record = patients[index].record || initialRecord;
        patients[index] = newPatient;
        alert('Patient updated successfully!');
    } else {
        patients.push(newPatient);
        alert('Patient saved successfully!');
    }

    saveData();
    populateTable();
    showSection('patient-records', document.querySelectorAll('.nav-links li')[1]);
}

function editPatient(id) {
    const p = patients.find(x => x.id === id);
    if (!p) return;

    document.getElementById('p-id').value = p.id;
    document.getElementById('p-name').value = p.name;
    document.getElementById('p-age').value = p.age;
    document.getElementById('p-sex').value = p.sex;
    document.getElementById('p-contact').value = p.contact;
    document.getElementById('p-admission').value = p.date;
    document.getElementById('p-address').value = p.address || '';
    document.getElementById('p-blood').value = p.blood;
    document.getElementById('p-room').value = p.room;
    document.getElementById('p-diet').value = p.diet;
    document.getElementById('p-allergies').value = p.allergies;
    document.getElementById('p-doc').value = p.doctor;
    document.getElementById('p-complaint').value = p.complaint;

    document.getElementById('form-title').innerText = "Edit Patient Record";
    showSection('new-patient', document.querySelectorAll('.nav-links li')[1]);
}

function deletePatient(id) {
    if (confirm("Are you sure you want to delete this patient? This action cannot be undone.")) {
        patients = patients.filter(p => p.id !== id);
        saveData();
        populateTable();
    }
}

function populateTable() {
    const tbody = document.getElementById('patients-tbody');
    tbody.innerHTML = '';

    patients.forEach(patient => {
        let v = patient.vitals;
        let isRowCritical = false;
        if (v && v.spo2 !== '-' && (v.spo2 < 90 || v.bpSys > 160 || v.bpSys < 90 || v.hr > 120 || v.hr < 50 || v.temp > 37.5)) {
            isRowCritical = true;
        }

        let rowClass = isRowCritical ? 'critical-row' : '';
        let rowHtml = `
            <tr class="${rowClass}">
                <td>
                    <img src="https://ui-avatars.com/api/?name=${patient.name}&background=831843&color=fff&rounded=true&size=40" style="vertical-align: middle; margin-right: 15px; box-shadow: 0 2px 5px rgba(0,0,0,0.1);">
                    <div style="display: inline-block; vertical-align: middle;">
                        <strong style="color: var(--text-dark); font-size: 15px;">${patient.name}</strong><br>
                        <span style="font-size: 12px; color: var(--text-light); font-weight: 500;">${patient.age} yrs • ${patient.sex}</span>
                    </div>
                </td>
                <td style="font-weight: 700; color: var(--primary);">${patient.id}</td>
                <td><span style="background: var(--primary-light); padding: 6px 10px; border-radius: 8px; font-size: 12px; font-weight: 700; color: var(--primary);"><i class="fas fa-bed" style="margin-right: 4px;"></i> ${patient.room}</span></td>
                <td><span style="background: #fee2e2; color: #e11d48; padding: 6px 10px; border-radius: 8px; font-weight: 800; font-size: 12px;">${patient.blood}</span></td>
                <td style="font-weight: 500;">${patient.date}</td>
                <td class="action-cell">
                    <span class="view-btn" onclick="openModal('${patient.id}')">View</span>
                    <i class="fas fa-edit edit-icon" onclick="editPatient('${patient.id}')" title="Edit"></i>
                    <i class="fas fa-trash delete-icon" onclick="deletePatient('${patient.id}')" title="Delete"></i>
                </td>
            </tr>
        `;
        tbody.innerHTML += rowHtml;
    });
}

// --- APPOINTMENTS CRUD ---
function openAppointmentModal() {
    document.getElementById('new-appt-name').value = '';
    document.getElementById('new-appt-type').value = 'Checkup';
    document.getElementById('add-appointment-modal').style.display = 'flex';
}
function closeAppointmentModal() { document.getElementById('add-appointment-modal').style.display = 'none'; }
function saveAppointment(e) {
    e.preventDefault();
    let name = document.getElementById('new-appt-name').value;
    let type = document.getElementById('new-appt-type').value;
    appointments.push({ id: Date.now(), name: name, time: 'Pending Schedule', doc: 'Unassigned', type: type, status: 'pending' });
    saveData(); populateAppointments(); closeAppointmentModal();
    showSection('appointments-section', document.querySelectorAll('.nav-links li')[2]);
}
function cycleApptStatus(id) {
    let appt = appointments.find(a => a.id === id);
    if(appt.status === 'pending') appt.status = 'scheduled';
    else if(appt.status === 'scheduled') appt.status = 'completed';
    else if(appt.status === 'completed') appt.status = 'cancelled';
    else appt.status = 'pending';
    saveData(); populateAppointments();
}
function deleteAppointment(id) {
    if(confirm("Delete this appointment?")) { appointments = appointments.filter(a => a.id !== id); saveData(); populateAppointments(); }
}
function populateAppointments() {
    const tbody = document.getElementById('appointments-tbody'); tbody.innerHTML = '';
    appointments.forEach(app => {
        tbody.innerHTML += `<tr>
            <td><strong style="color:var(--text-dark);">${app.name}</strong></td><td>${app.time}</td><td>${app.doc}</td><td>${app.type}</td>
            <td><span class="status-badge status-${app.status}">${app.status}</span></td>
            <td class="action-cell"><span class="view-btn" style="background:var(--primary-light); color:var(--primary);" onclick="cycleApptStatus(${app.id})">Update</span> <i class="fas fa-trash delete-icon" onclick="deleteAppointment(${app.id})"></i></td>
        </tr>`;
    });
}

// --- LABS CRUD ---
function openLabModal() {
    document.getElementById('new-lab-name').value = '';
    document.getElementById('new-lab-test').value = '';
    document.getElementById('add-lab-modal').style.display = 'flex';
}
function closeLabModal() { document.getElementById('add-lab-modal').style.display = 'none'; }
function saveLab(e) {
    e.preventDefault();
    let name = document.getElementById('new-lab-name').value;
    let test = document.getElementById('new-lab-test').value;
    labs.push({ id: Date.now(), name: name, test: test, date: new Date().toISOString().split('T')[0], status: 'pending' });
    saveData(); populateLabs(); closeLabModal();
    showSection('labs-section', document.querySelectorAll('.nav-links li')[3]);
}
function cycleLabStatus(id) {
    let lab = labs.find(l => l.id === id);
    if(lab.status === 'pending') lab.status = 'completed';
    else if(lab.status === 'completed') lab.status = 'critical';
    else lab.status = 'pending';
    saveData(); populateLabs();
}
function deleteLab(id) {
    if(confirm("Delete this lab record?")) { labs = labs.filter(l => l.id !== id); saveData(); populateLabs(); }
}
function populateLabs() {
    const tbody = document.getElementById('labs-tbody'); tbody.innerHTML = '';
    labs.forEach(lab => {
        tbody.innerHTML += `<tr>
            <td><strong style="color:var(--text-dark);">${lab.name}</strong></td><td>${lab.test}</td><td>${lab.date}</td>
            <td><span class="status-badge status-${lab.status}">${lab.status}</span></td>
            <td class="action-cell"><span class="view-btn" style="background:var(--primary-light); color:var(--primary);" onclick="cycleLabStatus(${lab.id})">Update</span> <i class="fas fa-trash delete-icon" onclick="deleteLab(${lab.id})"></i></td>
        </tr>`;
    });
}

// --- PHARMACY CRUD ---
function openPharmacyModal() {
    document.getElementById('new-pharm-name').value = '';
    document.getElementById('new-pharm-med').value = '';
    document.getElementById('add-pharmacy-modal').style.display = 'flex';
}
function closePharmacyModal() { document.getElementById('add-pharmacy-modal').style.display = 'none'; }
function savePharmacy(e) {
    e.preventDefault();
    let name = document.getElementById('new-pharm-name').value;
    let med = document.getElementById('new-pharm-med').value;
    pharmacy.push({ id: Date.now(), name: name, meds: med, doc: 'Unassigned', status: 'pending' });
    saveData(); populatePharmacy(); closePharmacyModal();
    showSection('pharmacy-section', document.querySelectorAll('.nav-links li')[4]);
}
function cycleMedStatus(id) {
    let med = pharmacy.find(m => m.id === id);
    if(med.status === 'pending') med.status = 'dispensed';
    else med.status = 'pending';
    saveData(); populatePharmacy();
}
function deleteMed(id) {
    if(confirm("Delete this pharmacy order?")) { pharmacy = pharmacy.filter(m => m.id !== id); saveData(); populatePharmacy(); }
}
function populatePharmacy() {
    const tbody = document.getElementById('pharmacy-tbody'); tbody.innerHTML = '';
    pharmacy.forEach(rx => {
        tbody.innerHTML += `<tr>
            <td><strong style="color:var(--text-dark);">${rx.name}</strong></td><td><i class="fas fa-pills" style="color: var(--secondary); margin-right:5px;"></i> ${rx.meds}</td><td>${rx.doc}</td>
            <td><span class="status-badge status-${rx.status}">${rx.status}</span></td>
            <td class="action-cell"><span class="view-btn" style="background:var(--primary-light); color:var(--primary);" onclick="cycleMedStatus(${rx.id})">Update</span> <i class="fas fa-trash delete-icon" onclick="deleteMed(${rx.id})"></i></td>
        </tr>`;
    });
}

// --- Patient Modal & Dynamic Vitals Logic ---
let vitalsChartInstance = null;

function openModal(patientId) {
    currentViewedPatientId = patientId; 
    const p = patients.find(x => x.id === patientId);
    if(!p) return;

    if (!p.vitalsHistory) p.vitalsHistory = [];
    if (!p.record) p.record = { neuro: '-', resp: '-', skin: '-', bowel: '-', edema: '-', timestamp: '-' };

    document.getElementById('modal-patient-name').innerText = p.name;
    document.getElementById('modal-patient-info').innerText = `${p.id} • ${p.age} yrs • ${p.sex} • Room: ${p.room}`;
    document.getElementById('modal-doctor').innerText = p.doctor;
    
    let allergyElem = document.getElementById('modal-allergies');
    allergyElem.innerText = p.allergies;
    if(p.allergies !== 'None' && p.allergies !== '') {
        allergyElem.style.color = '#ff0000'; 
        allergyElem.parentElement.style.background = '#ffe4e6';
        allergyElem.parentElement.style.borderColor = '#fda4af';
    } else {
        allergyElem.style.color = 'var(--text-main)';
        allergyElem.parentElement.style.background = '#f8fafc';
        allergyElem.parentElement.style.borderColor = 'var(--border-color)';
    }

    document.getElementById('modal-diet').innerText = p.diet;
    document.getElementById('modal-complaint').innerText = p.complaint;

    let v = p.vitals;
    let bpClass = (v.bpSys !== '-' && (v.bpSys > 160 || v.bpSys < 90)) ? 'red-alert-card' : '';
    let hrClass = (v.hr !== '-' && (v.hr > 120 || v.hr < 50)) ? 'red-alert-card' : '';
    let tempClass = (v.temp !== '-' && v.temp > 37.5) ? 'red-alert-card' : '';
    let spo2Class = (v.spo2 !== '-' && v.spo2 < 90) ? 'red-alert-card' : '';

    let bpDisplay = v.bpSys === '-' ? '- / -' : `${v.bpSys}/${v.bpDia}`;

    document.getElementById('latest-vitals-container').innerHTML = `
        <div class="vital-box ${bpClass}"><h4>Blood Pressure</h4><h2>${bpDisplay} <small>mmHg</small></h2></div>
        <div class="vital-box ${hrClass}"><h4>Heart Rate</h4><h2>${v.hr} <small>bpm</small></h2></div>
        <div class="vital-box ${tempClass}"><h4>Temperature</h4><h2>${v.temp}° <small>C</small></h2></div>
        <div class="vital-box ${spo2Class}"><h4>SpO2</h4><h2>${v.spo2} <small>%</small></h2></div>
        <div class="vital-box"><h4>Resp Rate</h4><h2>${v.resp} <small>br/min</small></h2></div>
        <div class="vital-box"><h4>BMI</h4><h2>${v.bmi} <small>Normal</small></h2></div>
    `;

    document.getElementById('rec-admission').innerText = p.date;
    document.getElementById('rec-timestamp').innerText = p.record.timestamp || '-';
    document.getElementById('rec-neuro').innerText = p.record.neuro;
    document.getElementById('rec-resp').innerText = p.record.resp;
    document.getElementById('rec-skin').innerText = p.record.skin;
    document.getElementById('rec-bowel').innerText = p.record.bowel;
    document.getElementById('rec-edema').innerText = p.record.edema;

    renderChart(p);
    populateHistoryTable(p);

    document.getElementById('patient-modal').style.display = 'flex';
    switchTab('overview'); 
}

function closeModal() { document.getElementById('patient-modal').style.display = 'none'; }

// --- Patient Record Update Logic ---
function openRecordModal() {
    if(!currentViewedPatientId) return;
    const p = patients.find(x => x.id === currentViewedPatientId);
    if(!p) return;

    let currentTs = (p.record.timestamp && p.record.timestamp !== '-') ? p.record.timestamp : getExactTimestamp();
    
    // Set the Admission Date in the Update modal
    document.getElementById('ur-admission').value = p.date || '';
    
    document.getElementById('ur-timestamp').value = currentTs;
    document.getElementById('ur-neuro').value = p.record.neuro;
    document.getElementById('ur-resp').value = p.record.resp;
    document.getElementById('ur-skin').value = p.record.skin;
    document.getElementById('ur-bowel').value = p.record.bowel;
    document.getElementById('ur-edema').value = p.record.edema;

    document.getElementById('update-record-modal').style.display = 'flex';
}

function closeRecordModal() { document.getElementById('update-record-modal').style.display = 'none'; }

function savePatientRecord(e) {
    e.preventDefault();
    if(!currentViewedPatientId) return;
    
    const index = patients.findIndex(p => p.id === currentViewedPatientId);
    if(index === -1) return;

    // Save the new Admission Date
    patients[index].date = document.getElementById('ur-admission').value;

    patients[index].record = {
        neuro: document.getElementById('ur-neuro').value,
        resp: document.getElementById('ur-resp').value,
        skin: document.getElementById('ur-skin').value,
        bowel: document.getElementById('ur-bowel').value,
        edema: document.getElementById('ur-edema').value,
        timestamp: document.getElementById('ur-timestamp').value 
    };

    saveData();
    closeRecordModal();
    openModal(currentViewedPatientId);
    switchTab('record'); 
    alert('Patient record updated successfully!');
}

// --- Vitals History Update Logic ---
function openAddVitalsModal(recordId = null) {
    if(!currentViewedPatientId) return;
    const p = patients.find(x => x.id === currentViewedPatientId);
    if(!p) return;
    
    if (recordId) {
        const r = p.vitalsHistory.find(v => v.id === recordId);
        document.getElementById('vitals-modal-title').innerText = "Edit Vitals Record";
        document.getElementById('v-id').value = r.id;
        document.getElementById('v-date').value = r.date;
        document.getElementById('v-bpsys').value = r.bpSys;
        document.getElementById('v-bpdia').value = r.bpDia;
        document.getElementById('v-hr').value = r.hr;
        document.getElementById('v-temp').value = r.temp;
        document.getElementById('v-spo2').value = r.spo2;
        document.getElementById('v-resp').value = r.resp;
        document.getElementById('v-bmi').value = r.bmi;
    } else {
        document.getElementById('vitals-modal-title').innerText = "Record New Vitals";
        document.getElementById('v-id').value = '';
        document.getElementById('v-date').value = new Date().toISOString().split('T')[0];
        document.getElementById('v-bpsys').value = p.vitals.bpSys === '-' ? '' : p.vitals.bpSys;
        document.getElementById('v-bpdia').value = p.vitals.bpDia === '-' ? '' : p.vitals.bpDia;
        document.getElementById('v-hr').value = p.vitals.hr === '-' ? '' : p.vitals.hr;
        document.getElementById('v-temp').value = p.vitals.temp === '-' ? '' : p.vitals.temp;
        document.getElementById('v-spo2').value = p.vitals.spo2 === '-' ? '' : p.vitals.spo2;
        document.getElementById('v-resp').value = p.vitals.resp === '-' ? '' : p.vitals.resp;
        document.getElementById('v-bmi').value = p.vitals.bmi === '-' ? '' : p.vitals.bmi;
    }

    document.getElementById('add-vitals-modal').style.display = 'flex';
}

function closeAddVitalsModal() { document.getElementById('add-vitals-modal').style.display = 'none'; }

function saveVitals(e) {
    e.preventDefault();
    if(!currentViewedPatientId) return;
    
    const index = patients.findIndex(p => p.id === currentViewedPatientId);
    if(index === -1) return;

    let activeTabId = 'vitals';
    document.querySelectorAll('.tab-content').forEach(tab => {
        if(tab.classList.contains('active')) activeTabId = tab.id.replace('tab-', '');
    });

    let p = patients[index];
    let vId = document.getElementById('v-id').value;

    let newVitalData = {
        date: document.getElementById('v-date').value,
        bpSys: parseInt(document.getElementById('v-bpsys').value),
        bpDia: parseInt(document.getElementById('v-bpdia').value),
        hr: parseInt(document.getElementById('v-hr').value),
        temp: parseFloat(document.getElementById('v-temp').value),
        spo2: parseInt(document.getElementById('v-spo2').value),
        resp: parseInt(document.getElementById('v-resp').value),
        bmi: parseFloat(document.getElementById('v-bmi').value)
    };

    if (vId) {
        let rIndex = p.vitalsHistory.findIndex(r => r.id == vId);
        if(rIndex > -1) p.vitalsHistory[rIndex] = { id: parseInt(vId), ...newVitalData };
    } else {
        p.vitalsHistory.push({ id: Date.now(), ...newVitalData });
    }

    p.vitalsHistory.sort((a,b) => new Date(b.date) - new Date(a.date));
    p.vitals = p.vitalsHistory[0]; 

    saveData();
    populateTable(); 
    closeAddVitalsModal();
    openModal(currentViewedPatientId); 
    switchTab(activeTabId);
}

function deleteVitalRecord(recordId) {
    if(!confirm("Are you sure you want to delete this vital record?")) return;
    
    const p = patients.find(x => x.id === currentViewedPatientId);
    if(!p) return;

    p.vitalsHistory = p.vitalsHistory.filter(v => v.id != recordId);
    
    if (p.vitalsHistory.length > 0) {
        p.vitalsHistory.sort((a,b) => new Date(b.date) - new Date(a.date));
        p.vitals = p.vitalsHistory[0];
    } else {
        p.vitals = { bpSys: '-', bpDia: '-', hr: '-', temp: '-', spo2: '-', resp: '-', bmi: '-' };
    }
    
    saveData();
    populateTable();
    openModal(currentViewedPatientId);
    switchTab('vitals');
}

function switchTab(tabName) {
    document.querySelectorAll('.tab-btn').forEach(btn => btn.classList.remove('active'));
    event.target.classList.add('active');
    document.querySelectorAll('.tab-content').forEach(content => content.classList.remove('active'));
    document.getElementById('tab-' + tabName).classList.add('active');
}

function renderChart(p) {
    const ctx = document.getElementById('vitalsChart').getContext('2d');
    if(vitalsChartInstance) vitalsChartInstance.destroy();

    if(!p.vitalsHistory || p.vitalsHistory.length === 0) return;

    Chart.defaults.font.family = "'Inter', sans-serif";
    Chart.defaults.color = '#71717a';

    let chartData = [...p.vitalsHistory].sort((a,b) => new Date(a.date) - new Date(b.date));

    vitalsChartInstance = new Chart(ctx, {
        type: 'line',
        data: {
            labels: chartData.map(r => r.date),
            datasets: [
                { label: 'Systolic BP', data: chartData.map(r => r.bpSys), borderColor: '#831843', backgroundColor: '#831843', borderWidth: 3, tension: 0.4, pointRadius: 5, pointHoverRadius: 7 },
                { label: 'Diastolic BP', data: chartData.map(r => r.bpDia), borderColor: '#e11d48', backgroundColor: '#e11d48', borderWidth: 2, borderDash: [5, 5], tension: 0.4, pointRadius: 4 },
                { label: 'Heart Rate', data: chartData.map(r => r.hr), borderColor: '#fb7185', backgroundColor: '#fb7185', borderWidth: 3, tension: 0.4, pointRadius: 5, pointHoverRadius: 7 }
            ]
        },
        options: { 
            responsive: true, maintainAspectRatio: false,
            interaction: { mode: 'index', intersect: false },
            plugins: { legend: { position: 'top', labels: { usePointStyle: true, boxWidth: 10, font: {weight: 'bold'} } }, tooltip: { backgroundColor: 'rgba(30, 27, 75, 0.9)', titleFont: { size: 14 }, bodyFont: { size: 14 }, padding: 12, cornerRadius: 8 } },
            scales: { y: { grid: { color: '#f1f5f9', drawBorder: false } }, x: { grid: { display: false, drawBorder: false } } }
        }
    });
}

function populateHistoryTable(p) {
    const tbody = document.getElementById('history-tbody');
    tbody.innerHTML = '';
    
    if(!p.vitalsHistory || p.vitalsHistory.length === 0) {
        tbody.innerHTML = `<tr><td colspan="5" style="text-align: center; color: var(--text-light); font-style: italic;">No vitals recorded yet.</td></tr>`;
        return;
    }

    let sortedHistory = [...p.vitalsHistory].sort((a,b) => new Date(b.date) - new Date(a.date));

    sortedHistory.forEach((r, index) => {
        let rowStyle = index === 0 ? 'background: var(--primary-light); font-weight: 800;' : '';
        tbody.innerHTML += `
            <tr style="${rowStyle}">
                <td>${r.date}</td>
                <td>${r.bpSys} mmHg</td>
                <td>${r.bpDia} mmHg</td>
                <td>${r.hr} bpm</td>
                <td class="action-cell">
                    <i class="fas fa-edit edit-icon" onclick="openAddVitalsModal(${r.id})" title="Edit"></i>
                    <i class="fas fa-trash delete-icon" onclick="deleteVitalRecord(${r.id})" title="Delete"></i>
                </td>
            </tr>
        `;
    });
}
