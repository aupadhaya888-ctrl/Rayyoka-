/* =========================================================
   RAYYOKA V1
   Main Application JavaScript
   ========================================================= */

"use strict";

/* =========================
   RAYYOKA MENU
   ========================= */

const menuItems = [
  {
    id: 1,
    name: "Veg Momo",
    category: "momo",
    price: 120,
    emoji: "🥟",
    description: "Steamed vegetable momo"
  },
  {
    id: 2,
    name: "Chicken Momo",
    category: "momo",
    price: 150,
    emoji: "🥟",
    description: "Steamed chicken momo"
  },
  {
    id: 3,
    name: "Veg Fry Momo",
    category: "momo",
    price: 140,
    emoji: "🥟",
    description: "Crispy fried vegetable momo"
  },
  {
    id: 4,
    name: "Chicken Fry Momo",
    category: "momo",
    price: 170,
    emoji: "🥟",
    description: "Crispy fried chicken momo"
  },

  {
    id: 5,
    name: "Veg Chawmin",
    category: "chawmin",
    price: 120,
    emoji: "🍜",
    description: "Vegetable chowmein"
  },
  {
    id: 6,
    name: "Chicken Chawmin",
    category: "chawmin",
    price: 150,
    emoji: "🍜",
    description: "Chicken chowmein"
  },
  {
    id: 7,
    name: "Egg Chawmin",
    category: "chawmin",
    price: 140,
    emoji: "🍜",
    description: "Egg chowmein"
  },
  {
    id: 8,
    name: "Mix Chawmin",
    category: "chawmin",
    price: 180,
    emoji: "🍜",
    description: "Chicken and egg chowmein"
  },

  {
    id: 9,
    name: "Veg Fried Rice",
    category: "rice",
    price: 120,
    emoji: "🍚",
    description: "Vegetable fried rice"
  },
  {
    id: 10,
    name: "Egg Fried Rice",
    category: "rice",
    price: 140,
    emoji: "🍚",
    description: "Egg fried rice"
  },
  {
    id: 11,
    name: "Chicken Fried Rice",
    category: "rice",
    price: 160,
    emoji: "🍚",
    description: "Chicken fried rice"
  },
  {
    id: 12,
    name: "Mix Fried Rice",
    category: "rice",
    price: 190,
    emoji: "🍚",
    description: "Chicken and egg fried rice"
  },

  {
    id: 13,
    name: "Veg Noodles",
    category: "noodles",
    price: 120,
    emoji: "🍜",
    description: "Vegetable noodles"
  },
  {
    id: 14,
    name: "Chicken Noodles",
    category: "noodles",
    price: 150,
    emoji: "🍜",
    description: "Chicken noodles"
  },
  {
    id: 15,
    name: "Egg Noodles",
    category: "noodles",
    price: 140,
    emoji: "🍜",
    description: "Egg noodles"
  },
  {
    id: 16,
    name: "Mix Noodles",
    category: "noodles",
    price: 180,
    emoji: "🍜",
    description: "Chicken and egg noodles"
  },

  {
    id: 17,
    name: "Black Tea",
    category: "drinks",
    price: 30,
    emoji: "🍵",
    description: "Hot black tea"
  },
  {
    id: 18,
    name: "Milk Tea",
    category: "drinks",
    price: 40,
    emoji: "☕",
    description: "Hot milk tea"
  },
  {
    id: 19,
    name: "Black Coffee",
    category: "drinks",
    price: 50,
    emoji: "☕",
    description: "Hot black coffee"
  },
  {
    id: 20,
    name: "Milk Coffee",
    category: "drinks",
    price: 60,
    emoji: "☕",
    description: "Hot milk coffee"
  },
  {
    id: 21,
    name: "Soft Drink",
    category: "drinks",
    price: 80,
    emoji: "🥤",
    description: "Cold soft drink"
  }
];


/* =========================
   APP STATE
   ========================= */

let cart = [];
let orders = loadOrders();
let activeCategory = "all";


/* =========================
   DOM READY
   ========================= */

document.addEventListener("DOMContentLoaded", function () {

  setupNavigation();
  setupQuickActions();
  setupSalesPage();
  setupDashboardButtons();
  setupModal();
  setupMobileMenu();

  renderFoodMenu();
  renderMenuManagement();
  updateAllDisplays();
  updateClock();

  setInterval(updateClock, 1000);

});


/* =========================
   LOCAL STORAGE
   ========================= */

function loadOrders() {

  try {

    const saved = localStorage.getItem("rayyoka_orders");

    if (!saved) {
      return [];
    }

    return JSON.parse(saved);

  } catch (error) {

    console.error("Could not load orders:", error);

    return [];

  }

}


function saveOrders() {

  localStorage.setItem(
    "rayyoka_orders",
    JSON.stringify(orders)
  );

}


/* =========================
   NAVIGATION
   ========================= */

function setupNavigation() {

  document.querySelectorAll(".nav-item").forEach(function (button) {

    button.addEventListener("click", function () {

      const page = button.dataset.page;

      showPage(page);

      closeMobileMenu();

    });

  });

}


function setupQuickActions() {

  document.querySelectorAll("[data-page-target]").forEach(function (button) {

    button.addEventListener("click", function () {

      const page = button.dataset.pageTarget;

      showPage(page);

    });

  });

}


function showPage(pageName) {

  document.querySelectorAll(".page").forEach(function (page) {

    page.classList.remove("active-page");

  });


  const targetPage = document.getElementById(pageName);

  if (!targetPage) {
    return;
  }

  targetPage.classList.add("active-page");


  document.querySelectorAll(".nav-item").forEach(function (button) {

    button.classList.remove("active");

    if (button.dataset.page === pageName) {
      button.classList.add("active");
    }

  });


  const headings = {
    dashboard: "Dashboard",
    sales: "New Sale",
    orders: "Orders",
    menu: "Menu",
    customers: "Customers",
    reports: "Reports"
  };

  document.getElementById("pageHeading").textContent =
    headings[pageName] || "RAYYOKA";

}


/* =========================
   MOBILE MENU
   ========================= */

function setupMobileMenu() {

  const button = document.getElementById("mobileMenu");

  if (!button) {
    return;
  }

  button.addEventListener("click", function () {

    document.querySelector(".sidebar").classList.toggle("open");

  });

}


function closeMobileMenu() {

  document.querySelector(".sidebar").classList.remove("open");

}


/* =========================
   CLOCK
   ========================= */

function updateClock() {

  const now = new Date();

  const time = now.toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit"
  });

  const date = now.toLocaleDateString([], {
    weekday: "long",
    day: "numeric",
    month: "short",
    year: "numeric"
  });

  document.getElementById("clock").textContent = time;

  document.getElementById("currentDate").textContent = date;

}


/* =========================
   DASHBOARD BUTTONS
   ========================= */

function setupDashboardButtons() {

  const buttons = [
    "dashboardNewSale",
    "emptyNewSale"
  ];

  buttons.forEach(function (id) {

    const button = document.getElementById(id);

    if (button) {

      button.addEventListener("click", function () {

        showPage("sales");

      });

    }

  });

}


/* =========================
   SALES PAGE
   ========================= */

function setupSalesPage() {

  document.querySelectorAll(".category").forEach(function (button) {

    button.addEventListener("click", function () {

      document.querySelectorAll(".category").forEach(function (btn) {
        btn.classList.remove("active");
      });

      button.classList.add("active");

      activeCategory = button.dataset.category;

      renderFoodMenu();

    });

  });


  const search = document.getElementById("menuSearch");

  if (search) {

    search.addEventListener("input", function () {

      renderFoodMenu();

    });

  }


  const clear = document.getElementById("clearCart");

  if (clear) {

    clear.addEventListener("click", function () {

      cart = [];

      renderCart();

      showToast("Cart cleared");

    });

  }


  const complete = document.getElementById("completeSale");

  if (complete) {

    complete.addEventListener("click", completeSale);

  }

}


/* =========================
   RENDER FOOD MENU
   ========================= */

function renderFoodMenu() {

  const grid = document.getElementById("foodGrid");

  if (!grid) {
    return;
  }

  const searchInput = document.getElementById("menuSearch");

  const searchText = searchInput
    ? searchInput.value.toLowerCase().trim()
    : "";


  const filtered = menuItems.filter(function (item) {

    const categoryMatch =
      activeCategory === "all" ||
      item.category === activeCategory;

    const searchMatch =
      item.name.toLowerCase().includes(searchText);

    return categoryMatch && searchMatch;

  });


  grid.innerHTML = "";


  if (filtered.length === 0) {

    grid.innerHTML = `
      <div style="grid-column:1/-1;text-align:center;padding:40px;color:#888;">
        No food items found.
      </div>
    `;

    return;

  }


  filtered.forEach(function (item) {

    const card = document.createElement("button");

    card.className = "food-card";

    card.innerHTML = `
      <div class="food-emoji">${item.emoji}</div>

      <h3>${item.name}</h3>

      <p>${item.description}</p>

      <div class="food-price">
        NPR ${formatNumber(item.price)}
      </div>
    `;

    card.addEventListener("click", function () {

      addToCart(item.id);

    });

    grid.appendChild(card);

  });

}


/* =========================
   ADD TO CART
   ========================= */

function addToCart(itemId) {

  const item = menuItems.find(function (food) {

    return food.id === itemId;

  });


  if (!item) {
    return;
  }


  const existing = cart.find(function (cartItem) {

    return cartItem.id === itemId;

  });


  if (existing) {

    existing.quantity += 1;

  } else {

    cart.push({
      id: item.id,
      name: item.name,
      price: item.price,
      quantity: 1
    });

  }


  renderCart();

  showToast(item.name + " added");

}


/* =========================
   CART RENDER
   ========================= */

function renderCart() {

  const container = document.getElementById("cartItems");

  if (!container) {
    return;
  }


  if (cart.length === 0) {

    container.innerHTML = `
      <div class="cart-empty">
        <span>＋</span>
        <p>Add items from the menu</p>
      </div>
    `;

    updateBill();

    return;

  }


  container.innerHTML = "";


  cart.forEach(function (item) {

    const row = document.createElement("div");

    row.className = "cart-item";

    row.innerHTML = `
      <div>
        <div class="cart-item-name">
          ${item.name}
        </div>

        <div class="cart-item-price">
          NPR ${formatNumber(item.price * item.quantity)}
        </div>
      </div>

      <div class="qty-controls">

        <button class="qty-btn minus">
          −
        </button>

        <span class="qty-number">
          ${item.quantity}
        </span>

        <button class="qty-btn plus">
          ＋
        </button>

      </div>
    `;


    row.querySelector(".minus").addEventListener(
      "click",
      function () {
        changeQuantity(item.id, -1);
      }
    );


    row.querySelector(".plus").addEventListener(
      "click",
      function () {
        changeQuantity(item.id, 1);
      }
    );


    container.appendChild(row);

  });


  updateBill();

}


/* =========================
   CHANGE QUANTITY
   ========================= */

function changeQuantity(itemId, change) {

  const item = cart.find(function (cartItem) {

    return cartItem.id === itemId;

  });


  if (!item) {
    return;
  }


  item.quantity += change;


  if (item.quantity <= 0) {

    cart = cart.filter(function (cartItem) {

      return cartItem.id !== itemId;

    });

  }


  renderCart();

}


/* =========================
   BILL
   ========================= */

function calculateSubtotal() {

  return cart.reduce(function (total, item) {

    return total + item.price * item.quantity;

  }, 0);

}


function updateBill() {

  const subtotal = calculateSubtotal();

  const discount = 0;

  const total = subtotal - discount;


  document.getElementById("subtotal").textContent =
    "NPR " + formatNumber(subtotal);

  document.getElementById("discount").textContent =
    "NPR " + formatNumber(discount);

  document.getElementById("cartTotal").textContent =
    "NPR " + formatNumber(total);

}


/* =========================
   COMPLETE SALE
   ========================= */

function completeSale() {

  if (cart.length === 0) {

    showToast("Please add items first");

    return;

  }


  const customerInput =
    document.getElementById("customerName");

  const customerName =
    customerInput.value.trim() || "Walk-in Customer";


  const subtotal = calculateSubtotal();


  const order = {

    id: generateOrderId(),

    customer: customerName,

    items: cart.map(function (item) {

      return {
        id: item.id,
        name: item.name,
        price: item.price,
        quantity: item.quantity
      };

    }),

    total: subtotal,

    date: new Date().toISOString(),

    status: "Completed"

  };


  orders.unshift(order);

  saveOrders();


  document.getElementById("successTotal").textContent =
    "NPR " + formatNumber(order.total);


  document.getElementById("successMessage").textContent =
    "Order " + order.id + " for " + customerName + " has been saved.";


  document.getElementById("successModal").classList.add("show");


  cart = [];

  customerInput.value = "";

  renderCart();

  updateAllDisplays();

}


/* =========================
   ORDER ID
   ========================= */

function generateOrderId() {

  const number = orders.length + 1;

  const timestamp =
    Date.now().toString().slice(-4);

  return "RY-" +
    String(number).padStart(3, "0") +
    "-" +
    timestamp;

}


/* =========================
   MODAL
   ========================= */

function setupModal() {

  const close =
    document.getElementById("closeSuccess");

  const modal =
    document.getElementById("successModal");


  if (close) {

    close.addEventListener("click", function () {

      modal.classList.remove("show");

      showPage("orders");

    });

  }


  if (modal) {

    modal.addEventListener("click", function (event) {

      if (event.target === modal) {

        modal.classList.remove("show");

      }

    });

  }

}


/* =========================
   DASHBOARD
   ========================= */

function updateDashboard() {

  const totalRevenue = orders.reduce(function (sum, order) {

    return sum + Number(order.total || 0);

  }, 0);


  const today = new Date().toDateString();


  const todayRevenue = orders.reduce(function (sum, order) {

    const orderDate =
      new Date(order.date).toDateString();

    if (orderDate === today) {

      return sum + Number(order.total || 0);

    }

    return sum;

  }, 0);


  const customers = new Set(
    orders.map(function (order) {
      return order.customer;
    })
  );


  document.getElementById("totalSales").textContent =
    "NPR " + formatNumber(totalRevenue);


  document.getElementById("totalOrders").textContent =
    orders.length;


  document.getElementById("totalCustomers").textContent =
    customers.size;


  document.getElementById("todaySales").textContent =
    "NPR " + formatNumber(todayRevenue);


  renderDashboardOrders();

}


/* =========================
   DASHBOARD ORDERS
   ========================= */

function renderDashboardOrders() {

  const empty =
    document.getElementById("dashboardEmpty");

  const wrapper =
    document.getElementById("dashboardTableWrapper");

  const tbody =
    document.getElementById("dashboardOrdersTable");


  if (orders.length === 0) {

    empty.style.display = "block";

    wrapper.style.display = "none";

    return;

  }


  empty.style.display = "none";

  wrapper.style.display = "block";

  tbody.innerHTML = "";


  orders.slice(0, 6).forEach(function (order) {

    const tr = document.createElement("tr");

    tr.innerHTML = `
      <td><strong>${order.id}</strong></td>
      <td>${order.customer}</td>
      <td>${getItemSummary(order.items)}</td>
      <td><strong>NPR ${formatNumber(order.total)}</strong></td>
      <td>${formatTime(order.date)}</td>
    `;

    tbody.appendChild(tr);

  });

}


/* =========================
   ORDERS PAGE
   ========================= */

function renderOrders() {

  const empty =
    document.getElementById("ordersEmpty");

  const wrapper =
    document.querySelector("#orders .orders-table-wrapper");

  const tbody =
    document.getElementById("ordersTable");


  if (orders.length === 0) {

    empty.style.display = "block";

    wrapper.style.display = "none";

    return;

  }


  empty.style.display = "none";

  wrapper.style.display = "block";

  tbody.innerHTML = "";


  orders.forEach(function (order) {

    const tr = document.createElement("tr");

    tr.innerHTML = `
      <td><strong>${order.id}</strong></td>
      <td>${order.customer}</td>
      <td>${getItemSummary(order.items)}</td>
      <td><strong>NPR ${formatNumber(order.total)}</strong></td>
      <td>${formatDate(order.date)}</td>
      <td>
        <span class="status">${order.status}</span>
      </td>
    `;

    tbody.appendChild(tr);

  });

}


/* =========================
   MENU MANAGEMENT
   ========================= */

function renderMenuManagement() {

  const container =
    document.getElementById("menuManagementGrid");

  if (!container) {
    return;
  }


  container.innerHTML = "";


  menuItems.forEach(function (item) {

    const card = document.createElement("div");

    card.className = "management-card";

    card.innerHTML = `
      <div class="food-emoji">${item.emoji}</div>

      <h3>${item.name}</h3>

      <p>${item.description}</p>

      <div class="management-price">
        NPR ${formatNumber(item.price)}
      </div>
    `;

    container.appendChild(card);

  });

}


/* =========================
   CUSTOMERS
   ========================= */

function renderCustomers() {

  const empty =
    document.getElementById("customersEmpty");

  const wrapper =
    document.getElementById("customersTableWrapper");

  const tbody =
    document.getElementById("customersTable");


  const customerMap = {};


  orders.forEach(function (order) {

    const name = order.customer;


    if (!customerMap[name]) {

      customerMap[name] = {

        name: name,

        orders: 0,

        total: 0,

        lastOrder: order.date

      };

    }


    customerMap[name].orders += 1;

    customerMap[name].total += Number(order.total || 0);


    if (
      new Date(order.date) >
      new Date(customerMap[name].lastOrder)
    ) {

      customerMap[name].lastOrder =
        order.date;

    }

  });


  const customers =
    Object.values(customerMap);


  if (customers.length === 0) {

    empty.style.display = "block";

    wrapper.style.display = "none";

    return;

  }


  empty.style.display = "none";

  wrapper.style.display = "block";

  tbody.innerHTML = "";


  customers.forEach(function (customer) {

    const tr = document.createElement("tr");

    tr.innerHTML = `
      <td><strong>${customer.name}</strong></td>
      <td>${customer.orders}</td>
      <td>NPR ${formatNumber(customer.total)}</td>
      <td>${formatDate(customer.lastOrder)}</td>
    `;

    tbody.appendChild(tr);

  });

}


/* =========================
   REPORTS
   ========================= */

function renderReports() {

  const revenue =
    orders.reduce(function (sum, order) {

      return sum + Number(order.total || 0);

    }, 0);


  const count = orders.length;


  const average =
    count > 0 ? revenue / count : 0;


  const itemCounts = {};


  orders.forEach(function (order) {

    order.items.forEach(function (item) {

      if (!itemCounts[item.name]) {

        itemCounts[item.name] = 0;

      }

      itemCounts[item.name] += item.quantity;

    });

  });


  let topItem = "—";

  let topQuantity = 0;


  Object.keys(itemCounts).forEach(function (name) {

    if (itemCounts[name] > topQuantity) {

      topQuantity = itemCounts[nam
