let listProductHTML = document.querySelector('.listProduct');
let listCartHTML = document.querySelector('.listCart');
let iconCart = document.querySelector('.icon-cart');
let body = document.querySelector('body');
let closeCart = document.querySelector('.close');
let products = [];
let cart = [];

// Check if cart elements exist before adding event listeners
if (iconCart && closeCart) {
    iconCart.addEventListener('click', () => {
        body.classList.toggle('showCart');
    });
    
    closeCart.addEventListener('click', () => {
        body.classList.toggle('showCart');
    });
}

// Scroll behavior for navigation
document.addEventListener('DOMContentLoaded', () => {
    let lastScrollY = window.scrollY;
    const nav = document.querySelector('.main-nav');
    
    if (nav) {
        window.addEventListener('scroll', () => {
            const currentScrollY = window.scrollY;
            
            if (window.innerWidth <= 768) { // Only apply on mobile
                if (currentScrollY > lastScrollY) {
                    nav.classList.remove('header-visible');
                    nav.classList.add('header-hidden');
                } else {
                    nav.classList.remove('header-hidden');
                    nav.classList.add('header-visible');
                }
            }
            
            lastScrollY = currentScrollY;
        });
    }
});

const addDataToHTML = () => {
    if (!listProductHTML) return; // Exit if element doesn't exist
    
    // add new data
    if(products.length > 0) {
        products.forEach(product => {
            let newProduct = document.createElement('div');
            newProduct.dataset.id = product.id;
            newProduct.classList.add('item');
            newProduct.innerHTML = 
            `<img src="${product.image}" alt="">
            <h2>${product.name}</h2>
            <div class="price">KES${product.price}</div>
            <button class="addCart" style="cursor: pointer;">Ajouter au panier</button>`;
            listProductHTML.appendChild(newProduct);
        });
    }
}

// Only add event listener if element exists
if (listProductHTML) {
    listProductHTML.addEventListener('click', (event) => {
        let positionClick = event.target;
        if(positionClick.classList.contains('addCart')){
            let id_product = positionClick.parentElement.dataset.id;
            addToCart(id_product);
        }
    });
}

const updateCartCount = () => {
    const cartCount = document.querySelector('.cart-count');
    if (cartCount) {
        const totalItems = cart.reduce((total, item) => total + item.quantity, 0);
        cartCount.textContent = totalItems;
    }
}

const addToCart = (product_id) => {
    let positionThisProductInCart = cart.findIndex((value) => value.product_id == product_id);
    if(cart.length <= 0){
        cart = [{
            product_id: product_id,
            quantity: 1
        }];
    }else if(positionThisProductInCart < 0){
        cart.push({
            product_id: product_id,
            quantity: 1
        });
    }else{
        cart[positionThisProductInCart].quantity = cart[positionThisProductInCart].quantity + 1;
    }
    addCartToHTML();
    addCartToMemory();
    updateCartCount();
}
const addCartToMemory = () => {
    localStorage.setItem('cart', JSON.stringify(cart));
}
const addCartToHTML = () => {
    listCartHTML.innerHTML = '';
    if(cart.length > 0){
        cart.forEach(item => {
            let newItem = document.createElement('div');
            newItem.classList.add('item');
            newItem.dataset.id = item.product_id;

            let positionProduct = products.findIndex((value) => value.id == item.product_id);
            let info = products[positionProduct];
            listCartHTML.appendChild(newItem);
            newItem.innerHTML = `
            <div class="image">
                    <img src="${info.image}">
                </div>
                <div class="name">
                ${info.name}
                </div>
                <div class="totalPrice">KES${info.price * item.quantity}</div>
                <div class="quantity">
                    <span class="minus"><</span>
                    <span>${item.quantity}</span>
                    <span class="plus">></span>
                </div>
            `;
        })
    }
}

listCartHTML.addEventListener('click', (event) => {
    let positionClick = event.target;
    if(positionClick.classList.contains('minus') || positionClick.classList.contains('plus')){
        let product_id = positionClick.parentElement.parentElement.dataset.id;
        let type = 'minus';
        if(positionClick.classList.contains('plus')){
            type = 'plus';
        }
        changeQuantityCart(product_id, type);
    }
})
const changeQuantityCart = (product_id, type) => {
    let positionItemInCart = cart.findIndex((value) => value.product_id == product_id);
    if(positionItemInCart >= 0){
        let info = cart[positionItemInCart];
        switch (type) {
            case 'plus':
                cart[positionItemInCart].quantity = cart[positionItemInCart].quantity + 1;
                break;

            default:
                let changeQuantity = cart[positionItemInCart].quantity - 1;
                if (changeQuantity > 0) {
                    cart[positionItemInCart].quantity = changeQuantity;
                }else{
                    cart.splice(positionItemInCart, 1);
                }
                break;
        }
    }
    addCartToHTML();
    addCartToMemory();
    updateCartCount();
}

// Add click event listener for checkout button
const checkoutBtn = document.querySelector('.checkOut');
if (checkoutBtn) {
    checkoutBtn.addEventListener('click', () => {
        if (cart.length === 0) {
            alert('Your cart is empty!');
            return;
        }
        showPhoneNumberModal();
    });
}

const showPhoneNumberModal = () => {
    const modal = document.createElement('div');
    modal.classList.add('phone-modal');
    modal.innerHTML = `
        <div class="modal-content">
            <h2>Complete Your Order</h2>
            <input type="text" id="name" placeholder="Your Name" required>
            <input type="tel" id="phone" placeholder="Your Phone Number" required>
            <input type="email" id="email" placeholder="Your Email" required>
            <button onclick="submitOrder()">Confirm Order</button>
            <button onclick="closeModal()">Cancel</button>
        </div>
    `;
    document.body.appendChild(modal);
}

const closeModal = () => {
    const modal = document.querySelector('.phone-modal');
    if (modal) {
        modal.remove();
    }
}

const submitOrder = () => {
    const name = document.querySelector('#name').value;
    const phone = document.querySelector('#phone').value;
    const email = document.querySelector('#email').value;

    if (!name || !phone || !email) {
        alert('Please fill in all fields');
        return;
    }

    // Prepare order details
    const orderDetails = cart.map(item => {
        const product = products.find(p => p.id == item.product_id);
        return {
            name: product.name,
            quantity: item.quantity,
            price: product.price,
            total: product.price * item.quantity
        };
    });

    const totalAmount = orderDetails.reduce((sum, item) => sum + item.total, 0);

    // Format order details for email
    const orderItemsHTML = orderDetails.map(item => 
        `${item.name} x${item.quantity} - KES${item.total}`
    ).join('<br>');

    // Send email using EmailJS
    emailjs.send(
        'service_x9z28im', // We'll get this in step 3
        'template_x7oapec', // We'll get this in step 3
        {
            to_name: 'Shop Owner',
            from_name: name,
            from_email: email,
            phone_number: phone,
            order_details: orderItemsHTML,
            total_amount: `KES${totalAmount}`,
        }
    )
    .then(() => {
        alert('Thank you! Your order has been received. We will contact you shortly.');
        cart = [];
        addCartToHTML();
        addCartToMemory();
        updateCartCount();
        closeModal();
        body.classList.remove('showCart');
    })
    .catch((error) => {
        console.error('Error sending order:', error);
        alert('There was an error processing your order. Please try again.');
    });
}

// Add these styles
const addStyles = () => {
    const styles = document.createElement('style');
    styles.textContent = `
        .phone-modal {
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background-color: rgba(0, 0, 0, 0.5);
            display: flex;
            justify-content: center;
            align-items: center;
            z-index: 1000;
        }

        .modal-content {
            background-color: white;
            padding: 20px;
            border-radius: 5px;
            text-align: center;
        }

        .modal-content input {
            display: block;
            margin: 10px auto;
            padding: 8px;
            width: 250px;
            border: 1px solid #ddd;
            border-radius: 4px;
        }

        .modal-content button {
            margin: 5px;
            padding: 8px 20px;
            cursor: pointer;
            border: none;
            border-radius: 4px;
            background-color: #353432;
            color: white;
        }

        .modal-content button:last-child {
            background-color: #666;
        }
    `;
    document.head.appendChild(styles);
}

const initApp = () => {
    if (listProductHTML && listCartHTML) {
        addStyles(); // Add this line
        // get data product
        fetch('products.json')
        .then(response => response.json())
        .then(data => {
            products = data;
            addDataToHTML();

            // get data cart from memory
            if(localStorage.getItem('cart')){
                cart = JSON.parse(localStorage.getItem('cart'));
                addCartToHTML();
                updateCartCount();
            }
        })
        .catch(error => {
            console.error('Error loading products:', error);
        });
    }
}

initApp();
