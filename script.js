document.addEventListener('DOMContentLoaded', function() {
    initApp();
});

function initApp() {
    initLoginSystem();
    initNotificationSystem();
    initNavigation();
    initModals();
    initDoctorBooking();
    initMedicineCart();
    initReportTracking();
    initQuickActions();
    initToastSystem();
    initDashboardSwitcher();
    updateDashboardDates();
    initDoctorDashboard();
    initNurseDashboard();
}

function initLoginSystem() {
    const loginForm = document.getElementById('loginForm');
    const loginScreen = document.getElementById('loginScreen');
    const loginError = document.getElementById('loginError');
    
    loginForm.addEventListener('submit', function(e) {
        e.preventDefault();
        
        const username = document.getElementById('loginUsername').value.toLowerCase();
        const password = document.getElementById('loginPassword').value;
        
        const credentials = {
            'patient': { password: 'patient123', dashboard: 'patient', name: 'Guest User' },
            'nurse': { password: 'nurse123', dashboard: 'nurse', name: 'Nurse Sarah' },
            'doctor': { password: 'doctor123', dashboard: 'doctor', name: 'Dr. Priya Sharma' }
        };
        
        if (credentials[username] && credentials[username].password === password) {
            currentUser = {
                role: credentials[username].dashboard,
                name: credentials[username].name
            };
            loginScreen.style.animation = 'fadeOut 0.5s ease forwards';
            setTimeout(() => {
                loginScreen.style.display = 'none';
                switchDashboard(credentials[username].dashboard);
                showToast('success', 'Welcome!', `Logged in as ${credentials[username].name}`);
            }, 500);
        } else {
            loginError.textContent = 'Invalid username or password';
            loginError.style.display = 'block';
            document.getElementById('loginUsername').style.borderColor = '#E74C3C';
            document.getElementById('loginPassword').style.borderColor = '#E74C3C';
        }
    });
    
    document.getElementById('loginUsername').addEventListener('input', function() {
        this.style.borderColor = '';
        document.getElementById('loginPassword').style.borderColor = '';
        document.getElementById('loginError').style.display = 'none';
    });
    
    document.getElementById('loginPassword').addEventListener('input', function() {
        this.style.borderColor = '';
        document.getElementById('loginUsername').style.borderColor = '';
        document.getElementById('loginError').style.display = 'none';
    });
}

function logout() {
    currentUser = null;
    const loginScreen = document.getElementById('loginScreen');
    loginScreen.style.display = 'flex';
    loginScreen.style.animation = 'fadeIn 0.5s ease forwards';
    document.getElementById('loginUsername').value = '';
    document.getElementById('loginPassword').value = '';
    document.getElementById('loginError').style.display = 'none';
}

let cart = [];
let currentDashboard = 'patient';
let selectedDoctor = null;
let currentUser = null;

const doctorPatients = [
    { id: 'P001', name: 'Rahul Sharma', age: 28, gender: 'Male', phone: '+91 98765 43210', bloodGroup: 'B+', department: 'Cardiology', condition: 'Cardiac Arrhythmia', status: 'admitted', bed: 'Bed 103', admittedDate: '2024-03-10', vitals: { bp: '130/85', heartRate: 88, temp: 98.6, spo2: 97 }, reports: [{ name: 'ECG', status: 'ready' }, { name: 'Blood Test', status: 'processing' }, { name: '2D Echo', status: 'pending' }], history: ['Hypertension (2022)', 'Diabetes Type 2 (2020)'], allergies: ['Penicillin'] },
    { id: 'P002', name: 'Priya Patel', age: 35, gender: 'Female', phone: '+91 87654 32109', bloodGroup: 'A+', department: 'General Medicine', condition: 'Viral Fever', status: 'admitted', bed: 'Bed 104', admittedDate: '2024-03-12', vitals: { bp: '120/80', heartRate: 72, temp: 101.2, spo2: 99 }, reports: [{ name: 'CBC', status: 'ready' }, { name: 'Urine Test', status: 'ready' }], history: [], allergies: [] },
    { id: 'P003', name: 'Amit Verma', age: 45, gender: 'Male', phone: '+91 76543 21098', bloodGroup: 'O+', department: 'Orthopedics', condition: 'Fracture (Leg)', status: 'admitted', bed: 'Bed 107', admittedDate: '2024-03-08', vitals: { bp: '125/82', heartRate: 76, temp: 98.4, spo2: 98 }, reports: [{ name: 'X-Ray', status: 'ready' }, { name: 'MRI', status: 'ready' }], history: ['Back Pain (2019)'], allergies: ['Sulfa'] },
    { id: 'P004', name: 'Sneha Gupta', age: 29, gender: 'Female', phone: '+91 65432 10987', bloodGroup: 'AB+', department: 'Gynecology', condition: 'Pregnancy (32 weeks)', status: 'outpatient', vitals: { bp: '118/76', heartRate: 78, temp: 98.2, spo2: 99 }, reports: [{ name: 'Ultrasound', status: 'ready' }], history: [], allergies: [] },
    { id: 'P005', name: 'Vikram Singh', age: 52, gender: 'Male', phone: '+91 54321 09876', bloodGroup: 'A-', department: 'Cardiology', condition: 'Post-Stent Care', status: 'outpatient', vitals: { bp: '135/88', heartRate: 70, temp: 98.0, spo2: 96 }, reports: [{ name: 'Lipid Profile', status: 'processing' }], history: ['CAD Stent (2023)', 'High Cholesterol'], allergies: ['Aspirin'] },
    { id: 'P006', name: 'Neha Kapoor', age: 41, gender: 'Female', phone: '+91 43210 98765', bloodGroup: 'B-', department: 'General Medicine', condition: 'Diabetes Management', status: 'outpatient', vitals: { bp: '128/84', heartRate: 74, temp: 98.4, spo2: 98 }, reports: [{ name: 'HbA1c', status: 'ready' }, { name: 'Blood Sugar Fasting', status: 'ready' }], history: ['Type 2 Diabetes (2018)', 'Hypothyroidism'], allergies: [] },
    { id: 'P007', name: 'Rajesh Kumar', age: 60, gender: 'Male', phone: '+91 32109 87654', bloodGroup: 'O-', department: 'Pulmonology', condition: 'COPD', status: 'admitted', bed: 'Bed 201', admittedDate: '2024-03-11', vitals: { bp: '140/90', heartRate: 82, temp: 98.8, spo2: 91 }, reports: [{ name: 'PFT', status: 'processing' }, { name: 'Chest X-Ray', status: 'ready' }], history: ['COPD (2015)', 'Smoking (former)'], allergies: ['Morphine'] },
    { id: 'P008', name: 'Sunita Devi', age: 55, gender: 'Female', phone: '+91 21098 76543', bloodGroup: 'A+', department: 'Oncology', condition: 'Chemotherapy Cycle 3', status: 'admitted', bed: 'Bed 202', admittedDate: '2024-03-13', vitals: { bp: '115/75', heartRate: 68, temp: 99.1, spo2: 97 }, reports: [{ name: 'CBC', status: 'ready' }, { name: 'Tumor Markers', status: 'processing' }], history: ['Breast Cancer (2023)'], allergies: [] },
    { id: 'P009', name: 'Anil Mehta', age: 38, gender: 'Male', phone: '+91 10987 65432', bloodGroup: 'AB-', department: 'Neurology', condition: 'Migraine', status: 'admitted', bed: 'Bed 204', admittedDate: '2024-03-14', vitals: { bp: '122/78', heartRate: 70, temp: 98.2, spo2: 99 }, reports: [{ name: 'MRI Brain', status: 'ready' }, { name: 'EEG', status: 'pending' }], history: ['Migraine with Aura (2010)'], allergies: ['Codeine'] },
    { id: 'P010', name: 'Meera Joshi', age: 33, gender: 'Female', phone: '+91 09876 54321', bloodGroup: 'O+', department: 'Dermatology', condition: 'Psoriasis', status: 'admitted', bed: 'Bed 206', admittedDate: '2024-03-12', vitals: { bp: '118/74', heartRate: 72, temp: 98.0, spo2: 99 }, reports: [{ name: 'Skin Biopsy', status: 'ready' }], history: ['Psoriasis (2018)'], allergies: [] },
    { id: 'P011', name: 'Kavita Rao', age: 47, gender: 'Female', phone: '+91 98765 12345', bloodGroup: 'B+', department: 'Nephrology', condition: 'Kidney Stone', status: 'admitted', bed: 'Bed 301', admittedDate: '2024-03-09', vitals: { bp: '132/86', heartRate: 78, temp: 98.6, spo2: 98 }, reports: [{ name: 'KFT', status: 'ready' }, { name: 'Ultrasound KUB', status: 'ready' }], history: ['Kidney Stones (2015)'], allergies: ['NSAIDs'] },
    { id: 'P012', name: 'Deepak Shah', age: 65, gender: 'Male', phone: '+91 87654 23456', bloodGroup: 'A+', department: 'Cardiology', condition: 'Heart Failure', status: 'admitted', bed: 'Bed 302', admittedDate: '2024-03-07', vitals: { bp: '145/92', heartRate: 85, temp: 98.4, spo2: 93 }, reports: [{ name: 'BNP', status: 'ready' }, { name: 'ECHO', status: 'ready' }, { name: 'Chest X-Ray', status: 'processing' }], history: ['CHF (2020)', 'HTN', 'DM2'], allergies: [] },
    { id: 'P013', name: 'Arjun Patel', age: 24, gender: 'Male', phone: '+91 76543 34567', bloodGroup: 'O+', department: 'General Medicine', condition: 'Dengue Fever', status: 'outpatient', vitals: { bp: '110/70', heartRate: 88, temp: 102.4, spo2: 98 }, reports: [{ name: 'Dengue NS1', status: 'ready' }, { name: 'Platelet Count', status: 'processing' }], history: [], allergies: [] },
    { id: 'P014', name: 'Raj Gupta', age: 58, gender: 'Male', phone: '+91 65432 45678', bloodGroup: 'B-', department: 'Gastroenterology', condition: 'Liver Cirrhosis', status: 'admitted', bed: 'Bed 309', admittedDate: '2024-03-06', vitals: { bp: '118/72', heartRate: 74, temp: 98.2, spo2: 97 }, reports: [{ name: 'LFT', status: 'ready' }, { name: 'PT/INR', status: 'ready' }], history: ['Alcoholic Liver Disease'], allergies: [] },
    { id: 'P015', name: 'Anita Desai', age: 42, gender: 'Female', phone: '+91 54321 56789', bloodGroup: 'A-', department: 'Psychiatry', condition: 'Anxiety Disorder', status: 'admitted', bed: 'Bed 310', admittedDate: '2024-03-13', vitals: { bp: '125/80', heartRate: 92, temp: 98.0, spo2: 99 }, reports: [{ name: 'Thyroid Profile', status: 'ready' }], history: ['GAD (2019)'], allergies: ['Lorazepam'] }
];

let beds = [
    { id: 'Bed 101', floor: 1, ward: 'General', status: 'available', patient: null },
    { id: 'Bed 102', floor: 1, ward: 'General', status: 'available', patient: null },
    { id: 'Bed 103', floor: 1, ward: 'Cardiac', status: 'occupied', patient: doctorPatients[0] },
    { id: 'Bed 104', floor: 1, ward: 'General', status: 'occupied', patient: doctorPatients[1] },
    { id: 'Bed 105', floor: 1, ward: 'General', status: 'available', patient: null },
    { id: 'Bed 106', floor: 1, ward: 'General', status: 'available', patient: null },
    { id: 'Bed 107', floor: 1, ward: 'Ortho', status: 'occupied', patient: doctorPatients[2] },
    { id: 'Bed 108', floor: 1, ward: 'General', status: 'available', patient: null },
    { id: 'Bed 109', floor: 1, ward: 'General', status: 'available', patient: null },
    { id: 'Bed 110', floor: 1, ward: 'General', status: 'available', patient: null },
    { id: 'Bed 201', floor: 2, ward: 'Pulmo', status: 'occupied', patient: doctorPatients[6] },
    { id: 'Bed 202', floor: 2, ward: 'Onco', status: 'occupied', patient: doctorPatients[7] },
    { id: 'Bed 203', floor: 2, ward: 'General', status: 'available', patient: null },
    { id: 'Bed 204', floor: 2, ward: 'Neuro', status: 'occupied', patient: doctorPatients[8] },
    { id: 'Bed 205', floor: 2, ward: 'General', status: 'available', patient: null },
    { id: 'Bed 206', floor: 2, ward: 'Derm', status: 'occupied', patient: doctorPatients[9] },
    { id: 'Bed 207', floor: 2, ward: 'General', status: 'available', patient: null },
    { id: 'Bed 208', floor: 2, ward: 'General', status: 'available', patient: null },
    { id: 'Bed 209', floor: 2, ward: 'General', status: 'available', patient: null },
    { id: 'Bed 210', floor: 2, ward: 'General', status: 'available', patient: null },
    { id: 'Bed 301', floor: 3, ward: 'Nephro', status: 'occupied', patient: doctorPatients[10] },
    { id: 'Bed 302', floor: 3, ward: 'Cardiac', status: 'occupied', patient: doctorPatients[11] },
    { id: 'Bed 303', floor: 3, ward: 'General', status: 'available', patient: null },
    { id: 'Bed 304', floor: 3, ward: 'General', status: 'available', patient: null },
    { id: 'Bed 305', floor: 3, ward: 'General', status: 'available', patient: null },
    { id: 'Bed 306', floor: 3, ward: 'General', status: 'available', patient: null },
    { id: 'Bed 307', floor: 3, ward: 'General', status: 'available', patient: null },
    { id: 'Bed 308', floor: 3, ward: 'General', status: 'available', patient: null },
    { id: 'Bed 309', floor: 3, ward: 'Gastro', status: 'occupied', patient: doctorPatients[13] },
    { id: 'Bed 310', floor: 3, ward: 'Psych', status: 'occupied', patient: doctorPatients[14] }
];

let patientQueue = [
    { id: 'Q001', name: 'Sneha Gupta', age: 29, gender: 'Female', reason: 'Routine Checkup', time: '10:00 AM', priority: 'normal' },
    { id: 'Q002', name: 'Vikram Singh', age: 52, gender: 'Male', reason: 'Follow-up Visit', time: '10:15 AM', priority: 'normal' },
    { id: 'Q003', name: 'Neha Kapoor', age: 41, gender: 'Female', reason: 'BP Check', time: '10:30 AM', priority: 'normal' },
    { id: 'Q004', name: 'Arjun Patel', age: 24, gender: 'Male', reason: 'Fever Consultation', time: '10:45 AM', priority: 'normal' },
    { id: 'Q005', name: 'Emergency Case', age: 45, gender: 'Male', reason: 'Chest Pain', time: 'Immediate', priority: 'emergency' },
    { id: 'Q006', name: 'Pooja Desai', age: 35, gender: 'Female', reason: 'Annual Health Check', time: '11:00 AM', priority: 'normal' }
];

function initNavigation() {
    const navLinks = document.querySelectorAll('.nav-link');
    navLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            navLinks.forEach(l => l.classList.remove('active'));
            this.classList.add('active');
            
            const targetId = this.getAttribute('href').substring(1);
            const targetSection = document.getElementById(targetId);
            if (targetSection) {
                targetSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }
        });
    });
}

function initNotificationSystem() {
    const bell = document.getElementById('notificationBell');
    const badge = document.getElementById('notificationBadge');
    const markReadBtn = document.querySelector('.mark-read');
    
    bell.addEventListener('click', function(e) {
        e.stopPropagation();
        this.classList.toggle('active');
    });
    
    document.addEventListener('click', function(e) {
        if (!bell.contains(e.target)) {
            bell.classList.remove('active');
        }
    });
    
    markReadBtn.addEventListener('click', function() {
        const unreadItems = document.querySelectorAll('.notification-item.unread');
        unreadItems.forEach(item => item.classList.remove('unread'));
        badge.textContent = '0';
        badge.style.display = 'none';
        showToast('success', 'Notifications', 'All notifications marked as read');
    });
}

function initModals() {
    const modalCloseButtons = document.querySelectorAll('.modal-close');
    const modalOverlays = document.querySelectorAll('.modal-overlay');
    
    modalCloseButtons.forEach(btn => {
        btn.addEventListener('click', function() {
            const modalId = this.getAttribute('data-modal');
            closeModal(modalId);
        });
    });
    
    modalOverlays.forEach(overlay => {
        overlay.addEventListener('click', function() {
            const modal = this.closest('.modal');
            if (modal) {
                closeModal(modal.id);
            }
        });
    });
    
    document.querySelectorAll('.modal').forEach(modal => {
        modal.addEventListener('click', function(e) {
            if (e.target === this) {
                closeModal(this.id);
            }
        });
    });
    
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape') {
            document.querySelectorAll('.modal.active').forEach(modal => {
                closeModal(modal.id);
            });
        }
    });
}

function openModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.classList.add('active');
        document.body.style.overflow = 'hidden';
    }
}

function closeModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.classList.remove('active');
        document.body.style.overflow = '';
    }
}

function initDoctorBooking() {
    const bookButtons = document.querySelectorAll('.book-btn');
    const confirmBookingBtn = document.getElementById('confirmBooking');
    
    bookButtons.forEach(btn => {
        btn.addEventListener('click', function() {
            selectedDoctor = this.getAttribute('data-doctor');
            document.getElementById('doctorName').textContent = selectedDoctor;
            
            const dateInput = document.getElementById('appointmentDate');
            const today = new Date();
            today.setDate(today.getDate() + 1);
            dateInput.min = today.toISOString().split('T')[0];
            dateInput.value = '';
            
            document.getElementById('appointmentTime').value = '';
            
            openModal('doctorModal');
        });
    });
    
    confirmBookingBtn.addEventListener('click', function() {
        const date = document.getElementById('appointmentDate').value;
        const time = document.getElementById('appointmentTime').value;
        
        if (!date || !time) {
            showToast('warning', 'Missing Information', 'Please select date and time');
            return;
        }
        
        closeModal('doctorModal');
        showSuccessModal('Appointment Confirmed!', `Your appointment with ${selectedDoctor} has been confirmed for ${formatDate(date)} at ${time}`);
        
        addNotification('info', 'Appointment confirmed', `Your appointment with ${selectedDoctor} is confirmed`);
    });
}

function initMedicineCart() {
    const addToCartButtons = document.querySelectorAll('.add-cart-btn');
    const checkoutBtn = document.getElementById('checkoutBtn');
    const trackOrderBtn = document.getElementById('trackOrderBtn');
    const placeOrderBtn = document.getElementById('placeOrder');
    
    addToCartButtons.forEach(btn => {
        btn.addEventListener('click', function() {
            const medicine = this.getAttribute('data-medicine');
            const price = parseInt(this.getAttribute('data-price'));
            
            const existingItem = cart.find(item => item.medicine === medicine);
            if (existingItem) {
                showToast('warning', 'Already Added', `${medicine} is already in your cart`);
                return;
            }
            
            cart.push({ medicine, price, quantity: 1 });
            updateCartUI();
            showToast('success', 'Added to Cart', `${medicine} has been added`);
            
            this.innerHTML = '<i class="fas fa-check"></i> Added';
            this.style.background = 'var(--success)';
            this.disabled = true;
            
            setTimeout(() => {
                this.innerHTML = '<i class="fas fa-cart-plus"></i> Add to Cart';
                this.style.background = 'var(--accent)';
                this.disabled = false;
            }, 2000);
        });
    });
    
    checkoutBtn.addEventListener('click', function() {
        if (cart.length === 0) {
            showToast('warning', 'Cart Empty', 'Please add medicines to your cart');
            return;
        }
        openModal('medicineModal');
        updateCartModal();
    });
    
    trackOrderBtn.addEventListener('click', function() {
        openModal('orderTrackingModal');
    });
    
    placeOrderBtn.addEventListener('click', function() {
        if (cart.length === 0) return;
        
        closeModal('medicineModal');
        cart = [];
        updateCartUI();
        showSuccessModal('Order Placed!', 'Your medicines will be delivered within 2-3 hours');
        addNotification('warning', 'Order placed', 'Your medicine order is out for delivery');
    });
}

function updateCartUI() {
    const cartSummary = document.getElementById('cartSummary');
    const cartCount = document.getElementById('cartCount');
    
    if (cart.length > 0) {
        cartSummary.classList.add('active');
        cartCount.textContent = cart.length;
    } else {
        cartSummary.classList.remove('active');
    }
}

function updateCartModal() {
    const cartItemsList = document.getElementById('cartItemsList');
    const emptyCart = document.getElementById('emptyCart');
    const cartTotal = document.getElementById('cartTotal');
    const subtotal = document.getElementById('subtotal');
    const grandTotal = document.getElementById('grandTotal');
    
    if (cart.length === 0) {
        cartItemsList.innerHTML = `
            <div class="empty-cart">
                <i class="fas fa-shopping-cart"></i>
                <p>Your cart is empty</p>
                <span>Add medicines to get started</span>
            </div>
        `;
        cartTotal.style.display = 'none';
        return;
    }
    
    let itemsHTML = '';
    let total = 0;
    
    cart.forEach((item, index) => {
        itemsHTML += `
            <div class="cart-item">
                <div class="cart-item-info">
                    <div class="cart-item-icon">
                        <i class="fas fa-capsules"></i>
                    </div>
                    <div class="cart-item-details">
                        <h5>${item.medicine}</h5>
                        <span>Qty: ${item.quantity}</span>
                    </div>
                </div>
                <div class="cart-item-price">
                    <strong>₹${item.price}</strong>
                    <button class="remove-item" onclick="removeFromCart(${index})">Remove</button>
                </div>
            </div>
        `;
        total += item.price;
    });
    
    cartItemsList.innerHTML = itemsHTML;
    subtotal.textContent = `₹${total}`;
    grandTotal.textContent = `₹${total}`;
    cartTotal.style.display = 'block';
}

function removeFromCart(index) {
    const removedItem = cart[index];
    cart.splice(index, 1);
    updateCartUI();
    updateCartModal();
    showToast('success', 'Removed', `${removedItem.medicine} removed from cart`);
}

function initReportTracking() {
    const downloadButtons = document.querySelectorAll('.download-btn');
    
    downloadButtons.forEach(btn => {
        btn.addEventListener('click', function() {
            const reportName = this.getAttribute('data-report');
            showSuccessModal('Report Downloaded', `${reportName} has been downloaded successfully`);
            addNotification('success', 'Report Ready', `${reportName} is available for download`);
        });
    });
}

function initQuickActions() {
    const bookDoctorCard = document.getElementById('bookDoctorCard');
    const orderMedicinesCard = document.getElementById('orderMedicinesCard');
    const viewReportsCard = document.getElementById('viewReportsCard');
    
    bookDoctorCard.addEventListener('click', function() {
        const doctorsSection = document.getElementById('services');
        doctorsSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
    
    orderMedicinesCard.addEventListener('click', function() {
        const medicinesSection = document.querySelector('.medicines-section');
        medicinesSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
    
    viewReportsCard.addEventListener('click', function() {
        const reportsSection = document.querySelector('.reports-section');
        reportsSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
}

function initToastSystem() {
    // Toast system initialized
}

function showToast(type, title, message) {
    const container = document.getElementById('toastContainer');
    
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    
    let iconClass = 'fa-info-circle';
    if (type === 'success') iconClass = 'fa-check-circle';
    if (type === 'error') iconClass = 'fa-exclamation-circle';
    if (type === 'warning') iconClass = 'fa-exclamation-triangle';
    
    toast.innerHTML = `
        <div class="toast-icon">
            <i class="fas ${iconClass}"></i>
        </div>
        <div class="toast-content">
            <h5>${title}</h5>
            <p>${message}</p>
        </div>
        <button class="toast-close" onclick="this.parentElement.remove()">
            <i class="fas fa-times"></i>
        </button>
    `;
    
    container.appendChild(toast);
    
    setTimeout(() => {
        toast.style.animation = 'slideIn 0.3s ease-out reverse';
        setTimeout(() => toast.remove(), 300);
    }, 4000);
}

function showSuccessModal(title, message) {
    document.getElementById('successTitle').textContent = title;
    document.getElementById('successMessage').textContent = message;
    openModal('successModal');
}

document.getElementById('closeSuccessModal').addEventListener('click', function() {
    closeModal('successModal');
});

function addNotification(type, title, message) {
    const badge = document.getElementById('notificationBadge');
    const list = document.querySelector('.notification-list');
    
    let iconClass = 'fa-bell';
    if (type === 'success') iconClass = 'fa-check-circle';
    if (type === 'info') iconClass = 'fa-calendar-check';
    if (type === 'warning') iconClass = 'fa-pills';
    
    const notificationHTML = `
        <div class="notification-item unread">
            <div class="notification-icon ${type}">
                <i class="fas ${iconClass}"></i>
            </div>
            <div class="notification-content">
                <p>${message}</p>
                <span>Just now</span>
            </div>
        </div>
    `;
    
    list.insertAdjacentHTML('afterbegin', notificationHTML);
    
    const currentCount = parseInt(badge.textContent) || 0;
    badge.textContent = currentCount + 1;
    badge.style.display = 'flex';
}

function formatDate(dateString) {
    const date = new Date(dateString);
    const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
    return date.toLocaleDateString('en-US', options);
}

// Search functionality
const globalSearch = document.getElementById('globalSearch');
if (globalSearch) {
    globalSearch.addEventListener('input', function(e) {
        const query = e.target.value.toLowerCase();
        
        if (query.length > 2) {
            let section = null;
            
            if (query.includes('doctor') || query.includes('appointment')) {
                section = document.getElementById('services');
            } else if (query.includes('medicine') || query.includes('medicine') || query.includes('order')) {
                section = document.querySelector('.medicines-section');
            } else if (query.includes('report') || query.includes('test')) {
                section = document.querySelector('.reports-section');
            }
            
            if (section) {
                section.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }
        }
    });
}

const medicineSearch = document.getElementById('medicineSearch');
if (medicineSearch) {
    medicineSearch.addEventListener('input', function(e) {
        const query = e.target.value.toLowerCase();
        const cards = document.querySelectorAll('.medicine-card');
        
        cards.forEach(card => {
            const name = card.querySelector('h4').textContent.toLowerCase();
            const desc = card.querySelector('.medicine-desc').textContent.toLowerCase();
            
            if (name.includes(query) || desc.includes(query) || query === '') {
                card.style.display = 'block';
                card.style.animation = 'fadeIn 0.3s ease-out';
            } else {
                card.style.display = 'none';
            }
        });
    });
}

// Smooth scroll for all anchor links
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function(e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            target.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
    });
});

// Add CSS animation
const style = document.createElement('style');
style.textContent = `
    @keyframes fadeIn {
        from {
            opacity: 0;
            transform: translateY(10px);
        }
        to {
            opacity: 1;
            transform: translateY(0);
        }
    }
`;
document.head.appendChild(style);

// Button click ripple effect
document.querySelectorAll('button').forEach(button => {
    button.addEventListener('click', function(e) {
        const rect = this.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        
        const ripple = document.createElement('span');
        ripple.style.cssText = `
            position: absolute;
            width: 10px;
            height: 10px;
            background: rgba(255,255,255,0.5);
            border-radius: 50%;
            left: ${x}px;
            top: ${y}px;
            transform: translate(-50%, -50%) scale(0);
            animation: ripple 0.6s linear;
            pointer-events: none;
        `;
        
        this.style.position = 'relative';
        this.style.overflow = 'hidden';
        this.appendChild(ripple);
        
        setTimeout(() => ripple.remove(), 600);
    });
});

const rippleStyle = document.createElement('style');
rippleStyle.textContent = `
    @keyframes ripple {
        to {
            transform: translate(-50%, -50%) scale(20);
            opacity: 0;
        }
    }
`;
document.head.appendChild(rippleStyle);

// Counter animation for stats
function animateCounter(element, target, duration = 2000) {
    let start = 0;
    const increment = target / (duration / 16);
    
    function update() {
        start += increment;
        if (start < target) {
            element.textContent = Math.floor(start);
            requestAnimationFrame(update);
        } else {
            element.textContent = target;
        }
    }
    
    update();
}

// Intersection Observer for scroll animations
const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
};

const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.style.animation = 'fadeIn 0.6s ease-out forwards';
            observer.unobserve(entry.target);
        }
    });
}, observerOptions);

document.querySelectorAll('.action-card, .doctor-card, .medicine-card, .report-card').forEach(card => {
    card.style.opacity = '0';
    observer.observe(card);
});

// Health meter animation on load
setTimeout(() => {
    const meterFill = document.querySelector('.meter-fill');
    if (meterFill) {
        meterFill.style.width = '0%';
        setTimeout(() => {
            meterFill.style.width = '85%';
        }, 500);
    }
}, 1000);

function initDashboardSwitcher() {
    const switcherBtn = document.getElementById('dashboardSwitcher');
    const switcherDropdown = document.getElementById('switcherDropdown');
    const switcherOptions = document.querySelectorAll('.switcher-option');
    
    switcherBtn.addEventListener('click', function(e) {
        e.stopPropagation();
        if (currentUser) {
            updateSwitcherOptions();
        }
        switcherDropdown.classList.toggle('active');
    });
    
    document.addEventListener('click', function(e) {
        if (!switcherDropdown.contains(e.target)) {
            switcherDropdown.classList.remove('active');
        }
    });
    
    switcherOptions.forEach(option => {
        option.addEventListener('click', function() {
            const dashboard = this.getAttribute('data-dashboard');
            switchDashboard(dashboard);
            
            switcherOptions.forEach(opt => opt.classList.remove('active'));
            this.classList.add('active');
            
            switcherDropdown.classList.remove('active');
        });
    });
}

function updateSwitcherOptions() {
    const switcherOptions = document.querySelectorAll('.switcher-option');
    
    if (!currentUser) {
        switcherOptions.forEach(opt => {
            opt.style.display = 'flex';
            opt.classList.remove('active');
        });
        const patientOpt = document.querySelector('.switcher-option[data-dashboard="patient"]');
        if (patientOpt) patientOpt.classList.add('active');
        return;
    }
    
    switcherOptions.forEach(opt => {
        if (opt.dataset.dashboard === currentUser.role) {
            opt.style.display = 'flex';
            opt.classList.add('active');
        } else {
            opt.style.display = 'none';
        }
    });
}

function switchDashboard(dashboard) {
    if (currentUser && currentUser.role !== dashboard) {
        showToast('warning', 'Access Denied', `You are logged in as ${currentUser.role}. Please logout first.`);
        return;
    }
    
    const patientSections = document.querySelectorAll('.hero, .quick-actions, .doctors-section, .medicines-section, .reports-section, .help-section');
    const footer = document.querySelector('.footer');
    const doctorDashboard = document.getElementById('doctorDashboard');
    const nurseDashboard = document.getElementById('nurseDashboard');
    const currentDashboardLabel = document.getElementById('currentDashboard');
    const profileName = document.getElementById('profileName');
    const profileRole = document.getElementById('profileRole');
    
    patientSections.forEach(section => section.classList.add('hidden'));
    if (footer) footer.classList.add('hidden');
    
    doctorDashboard.classList.add('hidden');
    nurseDashboard.classList.add('hidden');
    
    switch(dashboard) {
        case 'patient':
            currentDashboard = 'patient';
            currentDashboardLabel.textContent = 'Patient';
            profileName.textContent = 'Guest User';
            profileRole.textContent = 'Patient';
            patientSections.forEach(section => section.classList.remove('hidden'));
            if (footer) footer.classList.remove('hidden');
            break;
            
        case 'doctor':
            currentDashboard = 'doctor';
            currentDashboardLabel.textContent = 'Doctor';
            profileName.textContent = 'Dr. Priya Sharma';
            profileRole.textContent = 'Cardiologist';
            doctorDashboard.classList.remove('hidden');
            break;
            
        case 'nurse':
            currentDashboard = 'nurse';
            currentDashboardLabel.textContent = 'Nurse';
            profileName.textContent = 'Nurse Sarah';
            profileRole.textContent = 'Head Nurse';
            nurseDashboard.classList.remove('hidden');
            break;
    }
    
    window.scrollTo({ top: 0, behavior: 'smooth' });
    
    if (currentUser) {
        updateSwitcherOptions();
    }
}

function updateDashboardDates() {
    const today = new Date();
    const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
    const formattedDate = today.toLocaleDateString('en-US', options);
    
    const doctorDate = document.getElementById('doctorDate');
    const nurseDate = document.getElementById('nurseDate');
    
    if (doctorDate) doctorDate.textContent = formattedDate;
    if (nurseDate) nurseDate.textContent = formattedDate;
}

function initDoctorDashboard() {
    renderDoctorPatients('all');
    
    document.querySelectorAll('.filter-tab').forEach(tab => {
        tab.addEventListener('click', function() {
            document.querySelectorAll('.filter-tab').forEach(t => t.classList.remove('active'));
            this.classList.add('active');
            renderDoctorPatients(this.dataset.filter);
        });
    });
    
    document.getElementById('refreshDoctorData')?.addEventListener('click', function() {
        this.classList.add('spinning');
        setTimeout(() => this.classList.remove('spinning'), 1000);
        updateDoctorStats();
        showToast('info', 'Refreshed', 'Patient data updated');
    });
    
    document.getElementById('closePatientDetail')?.addEventListener('click', function() {
        document.getElementById('patientDetailPanel').classList.remove('open');
    });
}

function renderDoctorPatients(filter) {
    const container = document.getElementById('doctorPatientsList');
    if (!container) return;
    
    let filtered = doctorPatients;
    if (filter === 'admitted') filtered = doctorPatients.filter(p => p.status === 'admitted');
    if (filter === 'outpatient') filtered = doctorPatients.filter(p => p.status === 'outpatient');
    
    container.innerHTML = filtered.map(patient => `
        <div class="doc-patient-item" data-id="${patient.id}">
            <div class="doc-patient-main">
                <div class="doc-patient-avatar ${patient.status === 'admitted' ? 'admitted' : 'outpatient'}">
                    <i class="fas fa-user"></i>
                </div>
                <div class="doc-patient-info">
                    <h4>${patient.name}</h4>
                    <span class="doc-patient-id">${patient.id} • ${patient.age}y ${patient.gender} • ${patient.bloodGroup}</span>
                    <div class="doc-patient-condition">
                        <span class="dept-tag">${patient.department}</span>
                        <span class="condition-text">${patient.condition}</span>
                        ${patient.status === 'admitted' ? `<span class="bed-tag"><i class="fas fa-bed"></i> ${patient.bed}</span>` : ''}
                    </div>
                </div>
                <div class="doc-patient-status ${patient.status === 'admitted' ? 'status-admitted' : 'status-outpatient'}">
                    ${patient.status === 'admitted' ? 'Admitted' : 'Outpatient'}
                </div>
            </div>
            <div class="doc-patient-vitals">
                <div class="vital-item"><i class="fas fa-heart"></i> ${patient.vitals.heartRate} bpm</div>
                <div class="vital-item"><i class="fas fa-tint"></i> ${patient.vitals.bp}</div>
                <div class="vital-item"><i class="fas fa-thermometer"></i> ${patient.vitals.temp}°F</div>
                <div class="vital-item ${patient.vitals.spo2 < 95 ? 'warning' : ''}"><i class="fas fa-wind"></i> ${patient.vitals.spo2}%</div>
            </div>
            <div class="doc-patient-reports">
                <span class="reports-label"><i class="fas fa-file-medical"></i> Reports:</span>
                ${patient.reports.map(r => `<span class="report-badge ${r.status}">${r.name}</span>`).join('')}
            </div>
        </div>
    `).join('');
    
    container.querySelectorAll('.doc-patient-item').forEach(item => {
        item.addEventListener('click', () => showPatientDetail(item.dataset.id));
    });
    
    updateDoctorStats();
}

function showPatientDetail(patientId) {
    const patient = doctorPatients.find(p => p.id === patientId);
    if (!patient) return;
    
    const panel = document.getElementById('patientDetailPanel');
    const content = document.getElementById('detailPanelContent');
    
    panel.classList.add('open');
    
    content.innerHTML = `
        <div class="detail-header">
            <div class="detail-avatar">
                <i class="fas fa-user"></i>
            </div>
            <div class="detail-info">
                <h3>${patient.name}</h3>
                <p>${patient.id} • ${patient.age} years • ${patient.gender}</p>
                <span class="blood-tag"><i class="fas fa-tint"></i> ${patient.bloodGroup}</span>
            </div>
        </div>
        
        <div class="detail-section">
            <h4><i class="fas fa-stethoscope"></i> Current Condition</h4>
            <div class="condition-info">
                <span class="dept-label">${patient.department}</span>
                <p class="condition-main">${patient.condition}</p>
                ${patient.status === 'admitted' ? `<p class="admit-info"><i class="fas fa-calendar"></i> Admitted: ${patient.admittedDate} • ${patient.bed}</p>` : ''}
            </div>
        </div>
        
        <div class="detail-section">
            <h4><i class="fas fa-heartbeat"></i> Vital Signs</h4>
            <div class="vitals-grid">
                <div class="vital-box">
                    <i class="fas fa-heart"></i>
                    <span class="vital-val">${patient.vitals.heartRate}</span>
                    <span class="vital-label">BPM</span>
                </div>
                <div class="vital-box">
                    <i class="fas fa-tint"></i>
                    <span class="vital-val">${patient.vitals.bp}</span>
                    <span class="vital-label">BP</span>
                </div>
                <div class="vital-box">
                    <i class="fas fa-thermometer"></i>
                    <span class="vital-val">${patient.vitals.temp}°</span>
                    <span class="vital-label">Temp (F)</span>
                </div>
                <div class="vital-box ${patient.vitals.spo2 < 95 ? 'alert' : ''}">
                    <i class="fas fa-wind"></i>
                    <span class="vital-val">${patient.vitals.spo2}%</span>
                    <span class="vital-label">SpO2</span>
                </div>
            </div>
        </div>
        
        <div class="detail-section">
            <h4><i class="fas fa-file-medical"></i> Lab Reports</h4>
            <div class="reports-list">
                ${patient.reports.map(r => `
                    <div class="report-row ${r.status}">
                        <span class="report-name">${r.name}</span>
                        <span class="report-status ${r.status}">
                            ${r.status === 'ready' ? '<i class="fas fa-check-circle"></i> Ready' : r.status === 'processing' ? '<i class="fas fa-spinner fa-spin"></i> Processing' : '<i class="fas fa-clock"></i> Pending'}
                        </span>
                    </div>
                `).join('')}
            </div>
        </div>
        
        ${patient.history.length > 0 || patient.allergies.length > 0 ? `
        <div class="detail-section">
            <h4><i class="fas fa-notes-medical"></i> Medical History</h4>
            ${patient.history.length > 0 ? `<p class="history-text"><strong>Past Conditions:</strong> ${patient.history.join(', ')}</p>` : ''}
            ${patient.allergies.length > 0 ? `<p class="allergy-text"><i class="fas fa-exclamation-triangle"></i> <strong>Allergies:</strong> ${patient.allergies.join(', ')}</p>` : ''}
        </div>
        ` : ''}
        
        <div class="detail-section">
            <h4><i class="fas fa-phone"></i> Contact</h4>
            <p class="contact-text"><i class="fas fa-phone"></i> ${patient.phone}</p>
        </div>
        
        <div class="detail-actions">
            <button class="detail-btn primary"><i class="fas fa-prescription"></i> Prescribe</button>
            <button class="detail-btn secondary"><i class="fas fa-file-medical"></i> Add Report</button>
            <button class="detail-btn secondary"><i class="fas fa-procedures"></i> ${patient.status === 'admitted' ? 'Discharge' : 'Admit'}</button>
        </div>
    `;
}

function updateDoctorStats() {
    const total = doctorPatients.length;
    const appointments = 8;
    const pendingReports = doctorPatients.reduce((sum, p) => sum + p.reports.filter(r => r.status !== 'ready').length, 0);
    const admitted = doctorPatients.filter(p => p.status === 'admitted').length;
    
    document.getElementById('docTotalPatients').textContent = total;
    document.getElementById('docAppointments').textContent = appointments;
    document.getElementById('docPendingReports').textContent = pendingReports;
    document.getElementById('docAdmitted').textContent = admitted;
}

function initNurseDashboard() {
    renderPatientQueue();
    renderBeds();
    renderAdmittedPatients();
    
    document.getElementById('refreshNurseData')?.addEventListener('click', function() {
        this.classList.add('spinning');
        setTimeout(() => this.classList.remove('spinning'), 1000);
        showToast('info', 'Refreshed', 'Station data updated');
    });
    
    document.getElementById('addToQueueBtn')?.addEventListener('click', function() {
        showToast('info', 'Check In', 'Opening patient check-in form...');
    });
    
    document.getElementById('admitPatientBtn')?.addEventListener('click', function() {
        showToast('info', 'Admit Patient', 'Select a patient to admit...');
    });
}

function renderPatientQueue() {
    const container = document.getElementById('patientQueue');
    if (!container) return;
    
    if (patientQueue.length === 0) {
        container.innerHTML = '<div class="empty-queue"><i class="fas fa-check-circle"></i> No patients in queue</div>';
        return;
    }
    
    container.innerHTML = patientQueue.map((patient, index) => `
        <div class="queue-item ${patient.priority === 'emergency' ? 'emergency' : ''}" data-id="${patient.id}">
            <div class="queue-number ${patient.priority === 'emergency' ? 'emergency' : ''}">
                ${patient.priority === 'emergency' ? '!' : '#' + (index + 1)}
            </div>
            <div class="queue-patient">
                <div class="queue-avatar ${patient.priority === 'emergency' ? 'emergency' : ''}">
                    <i class="fas fa-${patient.priority === 'emergency' ? 'exclamation-triangle' : 'user'}"></i>
                </div>
                <div class="queue-info">
                    <h4>${patient.name}</h4>
                    <span>${patient.age}y ${patient.gender} • ${patient.reason}</span>
                    <span class="queue-time"><i class="fas fa-clock"></i> ${patient.time}</span>
                </div>
            </div>
            <div class="queue-actions">
                <button class="queue-btn call" title="Call Patient"><i class="fas fa-bell"></i></button>
                <button class="queue-btn done" title="Send to Doctor"><i class="fas fa-check"></i></button>
                <button class="queue-btn remove" title="Remove"><i class="fas fa-times"></i></button>
            </div>
        </div>
    `).join('');
    
    container.querySelectorAll('.queue-btn.call').forEach(btn => {
        btn.addEventListener('click', function(e) {
            e.stopPropagation();
            const name = this.closest('.queue-item').querySelector('h4').textContent;
            showToast('info', 'Calling', `Calling ${name}...`);
        });
    });
    
    container.querySelectorAll('.queue-btn.done').forEach(btn => {
        btn.addEventListener('click', function(e) {
            e.stopPropagation();
            const item = this.closest('.queue-item');
            const name = item.querySelector('h4').textContent;
            item.style.animation = 'fadeOut 0.5s ease-out forwards';
            setTimeout(() => {
                patientQueue = patientQueue.filter(p => p.name !== name);
                renderPatientQueue();
                updateNurseStats();
                showToast('success', 'Sent to Doctor', `${name} sent for checkup`);
            }, 500);
        });
    });
    
    container.querySelectorAll('.queue-btn.remove').forEach(btn => {
        btn.addEventListener('click', function(e) {
            e.stopPropagation();
            const item = this.closest('.queue-item');
            const name = item.querySelector('h4').textContent;
            item.style.animation = 'fadeOut 0.5s ease-out forwards';
            setTimeout(() => {
                patientQueue = patientQueue.filter(p => p.name !== name);
                renderPatientQueue();
                updateNurseStats();
                showToast('info', 'Removed', `${name} removed from queue`);
            }, 500);
        });
    });
    
    updateNurseStats();
}

function renderBeds() {
    const container = document.getElementById('bedsGrid');
    if (!container) return;
    
    container.innerHTML = beds.map(bed => `
        <div class="bed-card ${bed.status}" data-bed="${bed.id}">
            <div class="bed-number">${bed.id}</div>
            <div class="bed-ward">${bed.ward}</div>
            ${bed.status === 'available' ? 
                '<div class="bed-status"><i class="fas fa-check-circle"></i> Available</div>' :
                `<div class="bed-status"><i class="fas fa-user-injured"></i> ${bed.patient?.name || 'Occupied'}</div>
                 <div class="bed-condition">${bed.patient?.condition || ''}</div>`
            }
        </div>
    `).join('');
    
    container.querySelectorAll('.bed-card').forEach(card => {
        card.addEventListener('click', function() {
            const bedId = this.dataset.bed;
            const bed = beds.find(b => b.id === bedId);
            if (bed.status === 'occupied' && bed.patient) {
                showToast('info', bed.patient.name, `Condition: ${bed.patient.condition} | Vitals: HR ${bed.patient.vitals.heartRate}, BP ${bed.patient.vitals.bp}`);
            } else {
                showToast('info', 'Available', `${bedId} is available for admission`);
            }
        });
    });
}

function renderAdmittedPatients() {
    const container = document.getElementById('admittedList');
    if (!container) return;
    
    const admitted = doctorPatients.filter(p => p.status === 'admitted');
    
    document.getElementById('admittedCount').textContent = admitted.length;
    
    container.innerHTML = admitted.map(patient => `
        <div class="admitted-item">
            <div class="admitted-avatar">
                <i class="fas fa-user"></i>
            </div>
            <div class="admitted-info">
                <h4>${patient.name}</h4>
                <span>${patient.condition} • ${patient.bed}</span>
            </div>
            <div class="admitted-vitals">
                <span class="${patient.vitals.spo2 < 95 ? 'warning' : ''}">${patient.vitals.spo2}% O2</span>
            </div>
        </div>
    `).join('');
}

function updateNurseStats() {
    const available = beds.filter(b => b.status === 'available').length;
    const occupied = beds.filter(b => b.status === 'occupied').length;
    const emergency = patientQueue.filter(p => p.priority === 'emergency').length;
    
    document.getElementById('queueCount').textContent = patientQueue.length;
    document.getElementById('bedAvailable').textContent = available;
    document.getElementById('bedOccupied').textContent = occupied;
    document.getElementById('bedAvailNum').textContent = available;
    document.getElementById('bedOccNum').textContent = occupied;
    document.getElementById('emergencyCount').textContent = emergency;
}

const fadeOutStyle = document.createElement('style');
fadeOutStyle.textContent = `
    @keyframes fadeOut {
        to {
            opacity: 0;
            transform: translateX(100%);
        }
    }
    @keyframes fadeIn {
        from {
            opacity: 0;
        }
        to {
            opacity: 1;
        }
    }
    @keyframes spin {
        to { transform: rotate(360deg); }
    }
    .spinning i {
        animation: spin 1s linear infinite;
    }
    .empty-queue {
        text-align: center;
        padding: 40px;
        color: var(--gray-500);
    }
    .empty-queue i {
        font-size: 48px;
        color: var(--secondary);
        margin-bottom: 16px;
    }
`;
document.head.appendChild(fadeOutStyle);

console.log('OpenField Healthcare - Smart Health Dashboard initialized successfully!');
