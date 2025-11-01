// Mobile Navigation Toggle
const hamburger = document.getElementById('hamburger');
const navMenu = document.getElementById('navMenu');

hamburger.addEventListener('click', () => {
    navMenu.classList.toggle('active');
    hamburger.classList.toggle('active');
});

// Close mobile menu when clicking on a link
document.querySelectorAll('.nav-menu a').forEach(link => {
    link.addEventListener('click', () => {
        navMenu.classList.remove('active');
        hamburger.classList.remove('active');
    });
});

// Menu Filter Functionality
const tabButtons = document.querySelectorAll('.tab-button');
const menuItems = document.querySelectorAll('.menu-item');

tabButtons.forEach(button => {
    button.addEventListener('click', () => {
        // Remove active class from all buttons
        tabButtons.forEach(btn => btn.classList.remove('active'));
        // Add active class to clicked button
        button.classList.add('active');

        const category = button.getAttribute('data-category');

        menuItems.forEach(item => {
            if (category === 'all' || item.getAttribute('data-category') === category) {
                item.style.display = 'flex';
                item.classList.remove('hidden');
            } else {
                item.style.display = 'none';
                item.classList.add('hidden');
            }
        });
    });
});

// Smooth Scroll for Navigation Links
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            const offsetTop = target.offsetTop - 70; // Account for fixed navbar
            window.scrollTo({
                top: offsetTop,
                behavior: 'smooth'
            });
        }
    });
});

// Navbar Background on Scroll
window.addEventListener('scroll', () => {
    const navbar = document.querySelector('.navbar');
    if (window.scrollY > 50) {
        navbar.style.boxShadow = '0 4px 20px rgba(0, 0, 0, 0.15)';
    } else {
        navbar.style.boxShadow = '0 4px 6px rgba(0, 0, 0, 0.1)';
    }
});

// Contact Form Submission
const contactForm = document.getElementById('contactForm');

contactForm.addEventListener('submit', (e) => {
    e.preventDefault();
    
    // Get form values
    const name = document.getElementById('name').value;
    const email = document.getElementById('email').value;
    const message = document.getElementById('message').value;

    // Simple validation
    if (name && email && message) {
        // In a real application, you would send this data to a server
        alert(`Thank you, ${name}! Your message has been received. We'll get back to you soon at ${email}.`);
        
        // Reset form
        contactForm.reset();
    } else {
        alert('Please fill in all fields.');
    }
});

// Animate menu items on scroll
const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
};

const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.style.animation = 'fadeInUp 0.6s ease forwards';
            observer.unobserve(entry.target);
        }
    });
}, observerOptions);

// Observe menu items
menuItems.forEach(item => {
    observer.observe(item);
});

// ============ CART FUNCTIONALITY ============
let cart = JSON.parse(localStorage.getItem('cart')) || [];
let invoices = JSON.parse(localStorage.getItem('invoices')) || [];
let invoiceCounter = parseInt(localStorage.getItem('invoiceCounter')) || 1000;

const cartIcon = document.getElementById('cartIcon');
const cartIconContainer = document.getElementById('cartIconContainer');
const cartSidebar = document.getElementById('cartSidebar');
const cartOverlay = document.getElementById('cartOverlay');
const closeCart = document.getElementById('closeCart');
const cartItems = document.getElementById('cartItems');
const cartBadge = document.getElementById('cartBadge');
const proceedCheckout = document.getElementById('proceedCheckout');

// Cart management functions
function updateCartIcon() {
    const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
    cartBadge.textContent = totalItems;
    if (totalItems > 0) {
        cartIconContainer.style.display = 'block';
    } else {
        cartIconContainer.style.display = 'none';
    }
}

function getMenuItemData(id) {
    const menuItem = document.querySelector(`[data-id="${id}"]`);
    if (menuItem) {
        return {
            id: parseInt(id),
            name: menuItem.getAttribute('data-name'),
            price: parseFloat(menuItem.getAttribute('data-price'))
        };
    }
    return null;
}

function addToCart(id) {
    const itemData = getMenuItemData(id);
    if (!itemData) return;

    const existingItem = cart.find(item => item.id === id);
    if (existingItem) {
        existingItem.quantity++;
    } else {
        cart.push({ ...itemData, quantity: 1 });
    }

    saveCart();
    updateCartIcon();
    renderCart();
    showNotification('Item added to cart!');
}

function removeFromCart(id) {
    cart = cart.filter(item => item.id !== id);
    saveCart();
    updateCartIcon();
    renderCart();
}

function updateQuantity(id, change) {
    const item = cart.find(item => item.id === id);
    if (item) {
        item.quantity += change;
        if (item.quantity <= 0) {
            removeFromCart(id);
        } else {
            saveCart();
            updateCartIcon();
            renderCart();
        }
    }
}

// Expose functions to global scope for onclick handlers
window.removeFromCart = removeFromCart;
window.updateQuantity = updateQuantity;

function saveCart() {
    localStorage.setItem('cart', JSON.stringify(cart));
}

function renderCart() {
    if (cart.length === 0) {
        cartItems.innerHTML = '<p class="empty-cart">Your cart is empty</p>';
        proceedCheckout.disabled = true;
        return;
    }

    proceedCheckout.disabled = false;
    cartItems.innerHTML = cart.map(item => `
        <div class="cart-item">
            <div class="cart-item-info">
                <h4>${item.name}</h4>
                <p>₹${item.price.toFixed(0)} each</p>
            </div>
            <div class="cart-item-controls">
                <div class="quantity-controls">
                    <button class="quantity-btn" onclick="updateQuantity(${item.id}, -1)">-</button>
                    <span class="quantity-display">${item.quantity}</span>
                    <button class="quantity-btn" onclick="updateQuantity(${item.id}, 1)">+</button>
                </div>
                <button class="remove-item-btn" onclick="removeFromCart(${item.id})">Remove</button>
            </div>
        </div>
    `).join('');

    updateCartTotals();
}

function updateCartTotals() {
    const subtotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const tax = subtotal * 0.08;
    const service = subtotal * 0.05;
    const total = subtotal + tax + service;

    document.getElementById('cartSubtotal').textContent = `₹${subtotal.toFixed(0)}`;
    document.getElementById('cartTax').textContent = `₹${tax.toFixed(0)}`;
    document.getElementById('cartService').textContent = `₹${service.toFixed(0)}`;
    document.getElementById('cartTotal').textContent = `₹${total.toFixed(0)}`;
}

// Cart event listeners
cartIcon?.addEventListener('click', () => {
    cartSidebar.classList.add('active');
    cartOverlay.classList.add('active');
});

closeCart?.addEventListener('click', () => {
    cartSidebar.classList.remove('active');
    cartOverlay.classList.remove('active');
});

cartOverlay?.addEventListener('click', () => {
    cartSidebar.classList.remove('active');
    cartOverlay.classList.remove('active');
});

proceedCheckout?.addEventListener('click', () => {
    if (cart.length === 0) return;
    cartSidebar.classList.remove('active');
    cartOverlay.classList.remove('active');
    document.getElementById('checkout').style.display = 'block';
    document.getElementById('checkout').scrollIntoView({ behavior: 'smooth' });
    renderCheckout();
});

// Add to cart buttons
document.querySelectorAll('.add-to-cart-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
        const id = parseInt(e.target.getAttribute('data-id'));
        addToCart(id);
    });
});

// Initialize cart
updateCartIcon();
renderCart();

// Show sales report link if invoices exist
if (invoices.length > 0) {
    document.getElementById('salesReportLink').style.display = 'block';
}

// ============ CHECKOUT FUNCTIONALITY ============
function renderCheckout() {
    const checkoutItems = document.getElementById('checkoutItems');
    const subtotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const tax = subtotal * 0.08;
    const service = subtotal * 0.05;
    const total = subtotal + tax + service;

    checkoutItems.innerHTML = cart.map(item => `
        <div class="checkout-item">
            <div>
                <strong>${item.name}</strong> x ${item.quantity}
            </div>
            <div>₹${(item.price * item.quantity).toFixed(0)}</div>
        </div>
    `).join('');

    document.getElementById('checkoutSubtotal').textContent = `₹${subtotal.toFixed(0)}`;
    document.getElementById('checkoutTax').textContent = `₹${tax.toFixed(0)}`;
    document.getElementById('checkoutService').textContent = `₹${service.toFixed(0)}`;
    document.getElementById('checkoutTotal').textContent = `₹${total.toFixed(0)}`;
}

const checkoutForm = document.getElementById('checkoutForm');
checkoutForm?.addEventListener('submit', (e) => {
    e.preventDefault();
    
    const paymentMethod = document.querySelector('input[name="paymentMethod"]:checked').value;
    const customerName = document.getElementById('customerName').value;
    const customerEmail = document.getElementById('customerEmail').value;
    const customerPhone = document.getElementById('customerPhone').value;
    const customerAddress = document.getElementById('customerAddress').value;

    if (paymentMethod === 'qr') {
        showQRCode();
    } else {
        processOrder(paymentMethod, customerName, customerEmail, customerPhone, customerAddress);
    }
});

// ============ QR CODE FUNCTIONALITY ============
function showQRCode() {
    const subtotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const tax = subtotal * 0.08;
    const service = subtotal * 0.05;
    const total = subtotal + tax + service;

    const qrModal = document.getElementById('qrModal');
    const qrContainer = document.getElementById('qrCodeContainer');
    const qrAmount = document.getElementById('qrAmount');

    qrAmount.textContent = `₹${total.toFixed(0)}`;
    qrContainer.innerHTML = '';

    // Generate QR code for Indian UPI payment
    // Replace 'your-upi-id@paytm' with your actual UPI ID (e.g., yourname@paytm, yourname@ybl, yourname@upi)
    const upiId = 'your-upi-id@paytm'; // TODO: Replace this with your actual UPI ID
    const paymentInfo = `upi://pay?pa=${upiId}&pn=Drish%20Restaurant&am=${total.toFixed(2)}&cu=INR&tn=Restaurant%20Payment`;
    
    // Check if QRCode library is available (qrcodejs)
    if (typeof QRCode !== 'undefined') {
        try {
            // Clear container first
            qrContainer.innerHTML = '';
            
            // Create QR code using qrcodejs library
            new QRCode(qrContainer, {
                text: paymentInfo,
                width: 250,
                height: 250,
                colorDark: '#2c1810',
                colorLight: '#ffffff',
                correctLevel: QRCode.CorrectLevel.M
            });
            
            console.log('QR Code generated successfully');
        } catch (error) {
            console.error('QR Code generation error:', error);
            qrContainer.innerHTML = '<p style="color: red; padding: 20px;">Error generating QR code: ' + error.message + '</p>';
        }
    } else {
        // Fallback: Use Google Charts API for QR code generation (works offline alternative)
        const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=${encodeURIComponent(paymentInfo)}`;
        qrContainer.innerHTML = `
            <img src="${qrUrl}" alt="QR Code" style="max-width: 250px; height: auto;" />
            <p style="margin-top: 15px; font-size: 12px; color: #666;">If QR code doesn't appear, use manual payment:</p>
            <p style="margin-top: 10px; font-size: 14px;"><strong>UPI ID:</strong> ${upiId}</p>
            <p style="font-size: 14px;"><strong>Amount:</strong> ₹${total.toFixed(0)}</p>
        `;
    }

    qrModal.classList.add('active');

    // Remove existing event listener to avoid duplicates
    const confirmBtn = document.getElementById('confirmPayment');
    const newConfirmBtn = confirmBtn.cloneNode(true);
    confirmBtn.parentNode.replaceChild(newConfirmBtn, confirmBtn);
    
    newConfirmBtn.addEventListener('click', () => {
        const customerName = document.getElementById('customerName').value;
        const customerEmail = document.getElementById('customerEmail').value;
        const customerPhone = document.getElementById('customerPhone').value;
        const customerAddress = document.getElementById('customerAddress').value;
        processOrder('qr', customerName, customerEmail, customerPhone, customerAddress);
    });
}

document.getElementById('closeQRModal')?.addEventListener('click', () => {
    document.getElementById('qrModal').classList.remove('active');
});

// ============ ORDER PROCESSING & INVOICE ============
function processOrder(paymentMethod, name, email, phone, address) {
    const invoiceNumber = `INV-${invoiceCounter++}`;
    const subtotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const tax = subtotal * 0.08;
    const service = subtotal * 0.05;
    const total = subtotal + tax + service;

    const invoice = {
        invoiceNumber,
        date: new Date().toISOString(),
        customer: { 
            name: name || 'Walk-in Customer', 
            email: email || 'N/A', 
            phone: phone || 'N/A', 
            address: address || 'N/A' 
        },
        items: cart.map(item => ({ ...item })),
        subtotal,
        tax,
        service,
        total,
        paymentMethod
    };

    invoices.push(invoice);
    localStorage.setItem('invoices', JSON.stringify(invoices));
    localStorage.setItem('invoiceCounter', invoiceCounter.toString());

    // Show sales report link if first order
    if (invoices.length === 1) {
        document.getElementById('salesReportLink').style.display = 'block';
    }

    cart = [];
    saveCart();
    updateCartIcon();
    
    document.getElementById('qrModal').classList.remove('active');
    document.getElementById('checkout').style.display = 'none';
    checkoutForm.reset();

    generateInvoice(invoice);
}

function generateInvoice(invoice) {
    const invoiceBody = document.getElementById('invoiceBody');
    const invoiceModal = document.getElementById('invoiceModal');

    const date = new Date(invoice.date);
    const formattedDate = date.toLocaleDateString('en-US', { 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
    });
    const formattedTime = date.toLocaleTimeString('en-US', { 
        hour: '2-digit', 
        minute: '2-digit' 
    });

    invoiceBody.innerHTML = `
        <div class="invoice-header">
            <h1>Drish Restaurant</h1>
            <p>123 Main Street, Chennai, Tamil Nadu 600001</p>
            <p>Phone: +91 98765 43210 | Email: info@drish.com</p>
        </div>
        <div class="invoice-info">
            <div class="invoice-details">
                <h3>Invoice Details</h3>
                <p><strong>Invoice #:</strong> ${invoice.invoiceNumber}</p>
                <p><strong>Date:</strong> ${formattedDate}</p>
                <p><strong>Time:</strong> ${formattedTime}</p>
                <p><strong>Payment Method:</strong> ${invoice.paymentMethod.toUpperCase()}</p>
            </div>
            <div class="customer-details">
                <h3>Customer Details</h3>
                <p><strong>Name:</strong> ${invoice.customer.name}</p>
                <p><strong>Email:</strong> ${invoice.customer.email}</p>
                <p><strong>Phone:</strong> ${invoice.customer.phone}</p>
                <p><strong>Address:</strong> ${invoice.customer.address}</p>
            </div>
        </div>
        <div class="invoice-items">
            <table>
                <thead>
                    <tr>
                        <th>Item</th>
                        <th>Quantity</th>
                        <th>Price</th>
                        <th>Total</th>
                    </tr>
                </thead>
                <tbody>
                    ${invoice.items.map(item => `
                        <tr>
                            <td>${item.name}</td>
                            <td>${item.quantity}</td>
                            <td>₹${item.price.toFixed(0)}</td>
                            <td>₹${(item.price * item.quantity).toFixed(0)}</td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>
        </div>
        <div class="invoice-total">
            <div class="invoice-total-row">
                <span>Subtotal:</span>
                <span>₹${invoice.subtotal.toFixed(0)}</span>
            </div>
            <div class="invoice-total-row">
                <span>Tax (8%):</span>
                <span>₹${invoice.tax.toFixed(0)}</span>
            </div>
            <div class="invoice-total-row">
                <span>Service Charge (5%):</span>
                <span>₹${invoice.service.toFixed(0)}</span>
            </div>
            <div class="invoice-total-row invoice-total-final">
                <span>Total:</span>
                <span>₹${invoice.total.toFixed(0)}</span>
            </div>
        </div>
        <div style="margin-top: 30px; text-align: center; color: var(--text-light);">
            <p>Thank you for your order!</p>
        </div>
    `;

    invoiceModal.classList.add('active');
}

document.getElementById('printInvoice')?.addEventListener('click', () => {
    window.print();
});

document.getElementById('closeInvoiceModal')?.addEventListener('click', () => {
    document.getElementById('invoiceModal').classList.remove('active');
});

// ============ SALES REPORT FUNCTIONALITY ============
function showSalesReport() {
    document.getElementById('sales-report').style.display = 'block';
    document.getElementById('sales-report').scrollIntoView({ behavior: 'smooth' });
    updateSalesReport('all');
}

document.getElementById('salesReportLink')?.addEventListener('click', (e) => {
    e.preventDefault();
    showSalesReport();
});

document.querySelectorAll('.filter-btn').forEach(btn => {
    btn.addEventListener('click', () => {
        document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        const period = btn.getAttribute('data-period');
        updateSalesReport(period);
    });
});

function updateSalesReport(period) {
    let filteredInvoices = [...invoices];

    if (period !== 'all') {
        const now = new Date();
        filteredInvoices = invoices.filter(inv => {
            const invDate = new Date(inv.date);
            if (period === 'today') {
                return invDate.toDateString() === now.toDateString();
            } else if (period === 'week') {
                const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
                return invDate >= weekAgo;
            } else if (period === 'month') {
                return invDate.getMonth() === now.getMonth() && invDate.getFullYear() === now.getFullYear();
            }
            return true;
        });
    }

    // Calculate stats
    const totalSales = filteredInvoices.reduce((sum, inv) => sum + inv.total, 0);
    const totalOrders = filteredInvoices.length;
    const averageOrder = totalOrders > 0 ? totalSales / totalOrders : 0;

    document.getElementById('totalSales').textContent = `₹${totalSales.toFixed(0)}`;
    document.getElementById('totalOrders').textContent = totalOrders;
    document.getElementById('averageOrder').textContent = `₹${averageOrder.toFixed(0)}`;

    // Top selling items
    const itemCounts = {};
    filteredInvoices.forEach(inv => {
        inv.items.forEach(item => {
            if (itemCounts[item.name]) {
                itemCounts[item.name] += item.quantity;
            } else {
                itemCounts[item.name] = item.quantity;
            }
        });
    });

    const topItems = Object.entries(itemCounts)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 5);

    const topItemsList = document.getElementById('topItemsList');
    if (topItems.length > 0) {
        topItemsList.innerHTML = topItems.map(([name, quantity]) => `
            <div class="top-item">
                <span>${name}</span>
                <strong>${quantity}</strong>
            </div>
        `).join('');
    } else {
        topItemsList.innerHTML = '<p style="color: var(--text-light);">No items sold</p>';
    }

    // Order history
    const orderHistoryTable = document.getElementById('orderHistoryTable');
    if (filteredInvoices.length > 0) {
        orderHistoryTable.innerHTML = `
            <table class="order-table">
                <thead>
                    <tr>
                        <th>Invoice #</th>
                        <th>Date</th>
                        <th>Customer</th>
                        <th>Items</th>
                        <th>Total</th>
                    </tr>
                </thead>
                <tbody>
                    ${filteredInvoices.reverse().map(inv => {
                        const date = new Date(inv.date);
                        return `
                            <tr>
                                <td>${inv.invoiceNumber}</td>
                                <td>${date.toLocaleDateString()}</td>
                                <td>${inv.customer.name}</td>
                                <td>${inv.items.reduce((sum, item) => sum + item.quantity, 0)}</td>
                                <td>₹${inv.total.toFixed(0)}</td>
                            </tr>
                        `;
                    }).join('')}
                </tbody>
            </table>
        `;
    } else {
        orderHistoryTable.innerHTML = '<p style="color: var(--text-light);">No orders found</p>';
    }
}

// Export CSV
document.getElementById('exportSales')?.addEventListener('click', () => {
    let csv = 'Invoice #,Date,Customer Name,Email,Phone,Items,Subtotal,Tax,Service,Total,Payment Method\n';
    
    invoices.forEach(inv => {
        const date = new Date(inv.date).toLocaleDateString();
        const itemNames = inv.items.map(i => `${i.name} x${i.quantity}`).join('; ');
        csv += `${inv.invoiceNumber},"${date}",${inv.customer.name},${inv.customer.email},${inv.customer.phone},"${itemNames}",${inv.subtotal.toFixed(2)},${inv.tax.toFixed(2)},${inv.service.toFixed(2)},${inv.total.toFixed(2)},${inv.paymentMethod}\n`;
    });

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `sales-report-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
});

// ============ UTILITY FUNCTIONS ============
function showNotification(message) {
    const notification = document.createElement('div');
    notification.style.cssText = `
        position: fixed;
        top: 90px;
        right: 20px;
        background: var(--primary-color);
        color: white;
        padding: 15px 25px;
        border-radius: 10px;
        box-shadow: var(--shadow-lg);
        z-index: 4000;
        animation: slideIn 0.3s ease;
    `;
    notification.textContent = message;
    document.body.appendChild(notification);

    setTimeout(() => {
        notification.style.animation = 'slideOut 0.3s ease';
        setTimeout(() => notification.remove(), 300);
    }, 2000);
}

// Add slide animations
const style = document.createElement('style');
style.textContent = `
    @keyframes slideIn {
        from {
            transform: translateX(400px);
            opacity: 0;
        }
        to {
            transform: translateX(0);
            opacity: 1;
        }
    }
    @keyframes slideOut {
        from {
            transform: translateX(0);
            opacity: 1;
        }
        to {
            transform: translateX(400px);
            opacity: 0;
        }
    }
`;
document.head.appendChild(style);

