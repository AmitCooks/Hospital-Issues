document.addEventListener('DOMContentLoaded', function() {
    initApp();
});

function initApp() {
    initNotificationSystem();
    initNavigation();
    initModals();
    initDoctorBooking();
    initMedicineCart();
    initReportTracking();
    initQuickActions();
    initToastSystem();
}

let cart = [];
let selectedDoctor = null;

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

console.log('OpenField Healthcare - Smart Health Dashboard initialized successfully!');
