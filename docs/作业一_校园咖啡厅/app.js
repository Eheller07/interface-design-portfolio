let globalStoreName = "杭电 · 中心湖店";
let pendingItemName = "";
let pendingItemPrice = 0;
let toastTimer = null;

window.addEventListener("DOMContentLoaded", () => {
    document.getElementById("storeModal").classList.add("is-visible");
    updateClock();
    window.setInterval(updateClock, 1000);

    const searchInput = document.getElementById("productSearch");
    searchInput.addEventListener("input", () => {
        const keyword = searchInput.value.trim().toLowerCase();
        document.querySelectorAll(".product-item").forEach((item) => {
            const searchable = item.dataset.search.toLowerCase();
            item.style.display = searchable.includes(keyword) ? "grid" : "none";
        });
    });
});

function updateClock() {
    const now = new Date();
    document.getElementById("clock").textContent =
        `${String(now.getHours()).padStart(2, "0")}:${String(now.getMinutes()).padStart(2, "0")}`;
}

function confirmStore(name, info) {
    globalStoreName = name;
    document.getElementById("currentStoreName").textContent = name;
    document.getElementById("currentLocationTag").textContent = `● 已定位 · ${name}`;
    document.getElementById("currentStoreInfo").textContent = info;
    document.getElementById("storeModal").classList.remove("is-visible");
    showToast("门店已确认，可以开始点单");
}

function switchTab(tabId, el) {
    document.querySelectorAll(".page").forEach((page) => page.classList.remove("active"));
    document.getElementById(`page-${tabId}`).classList.add("active");

    const mainNav = document.getElementById("mainNav");
    mainNav.style.display = tabId === "checkout" ? "none" : "flex";

    if (tabId !== "checkout") {
        document.querySelectorAll(".nav-item").forEach((item) => item.classList.remove("active"));
        const target =
            el || document.querySelector(`.nav-item[data-tab="${tabId}"]`);
        if (target) target.classList.add("active");
    }
}

function selectCategory(el, label) {
    document.querySelectorAll(".category").forEach((item) => item.classList.remove("active"));
    el.classList.add("active");
    document.getElementById("productSectionTitle").textContent = label;
    showToast(`已切换至${label}`);
}

function openCustom(name, price) {
    pendingItemName = name;
    pendingItemPrice = price;
    document.getElementById("customName").textContent = name;
    document.getElementById("customPrice").textContent = price;
    document.getElementById("overlay").style.display = "block";
    document.getElementById("customSheet").classList.add("active");
}

function closeCustom() {
    document.getElementById("overlay").style.display = "none";
    document.getElementById("customSheet").classList.remove("active");
}

function pick(el) {
    const parent = el.parentElement;
    parent.querySelectorAll(".color-tag").forEach((tag) => tag.classList.remove("selected"));
    el.classList.add("selected");
}

function addToCartAndCheckout() {
    const selectedOptions = [...document.querySelectorAll(".color-tag.selected")]
        .map((item) => item.dataset.value)
        .join(" / ");

    closeCustom();
    document.getElementById("checkoutStoreName").textContent = `${globalStoreName}（自取）`;
    document.getElementById("checkoutItemName").textContent = pendingItemName;
    document.getElementById("checkoutSpec").textContent = selectedOptions;
    document.getElementById("checkoutPrice").textContent = pendingItemPrice;
    document.getElementById("totalPrice").textContent = pendingItemPrice;
    switchTab("checkout");
}

function switchTimeTab(el) {
    el.parentElement.querySelectorAll(".time-tab").forEach((tab) => tab.classList.remove("active"));
    el.classList.add("active");
    document.getElementById("scheduleTimeSelector").style.display =
        el.dataset.mode === "schedule" ? "block" : "none";
}

function processPayment() {
    const activeTimeTab = document.querySelector(".time-tab.active");
    const isSchedule = activeTimeTab.dataset.mode === "schedule";
    const timeValue = document.getElementById("pickupTime").value;
    const timeText = isSchedule ? `预约 ${timeValue} 取餐` : "立即取餐";

    const card = document.createElement("article");
    card.className = "order-card";
    card.addEventListener("click", () => openOrderDetail("active"));
    card.innerHTML = `
        <div class="order-head">
            <span class="order-store"></span>
            <span class="order-state">等待制作</span>
        </div>
        <div class="order-product"></div>
        <div class="order-time"></div>
        <div class="order-live-status">
            <span class="pulse-dot"></span>
            前面还有 0 杯，你的饮品即将开始制作
        </div>
    `;
    card.querySelector(".order-store").textContent = globalStoreName;
    card.querySelector(".order-product").textContent = pendingItemName;
    card.querySelector(".order-time").textContent = `下单时间：刚刚 · ${timeText}`;
    document.getElementById("orderListContainer").prepend(card);

    showToast(`支付成功 · ¥${pendingItemPrice}`);
    switchTab("orders");
}

function openOrderDetail(type) {
    document.getElementById("orderOverlay").style.display = "block";
    document.getElementById("orderDetail").classList.add("active");

    const activeStatus = document.getElementById("activeStatus");
    const doneStatus = document.getElementById("doneStatus");
    if (type === "active") {
        activeStatus.style.display = "block";
        doneStatus.style.display = "none";
        document.getElementById("detailStore").textContent = globalStoreName;
        document.getElementById("detailTime").textContent = "今日 09:30:15";
    } else {
        activeStatus.style.display = "none";
        doneStatus.style.display = "block";
        document.getElementById("detailStore").textContent = "杭电 · 创客空间店";
        document.getElementById("detailTime").textContent = "2026-06-20 09:15:44";
    }
}

function closeOrderDetail() {
    document.getElementById("orderOverlay").style.display = "none";
    document.getElementById("orderDetail").classList.remove("active");
}

function cancelOrder() {
    if (window.confirm("确定要取消此订单吗？款项将按原支付方式退回。")) {
        closeOrderDetail();
        showToast("订单已取消，退款预计 1–3 个工作日到账");
    }
}

function showToast(message) {
    const toast = document.getElementById("toast");
    window.clearTimeout(toastTimer);
    toast.textContent = message;
    toast.classList.add("show");
    toastTimer = window.setTimeout(() => toast.classList.remove("show"), 2200);
}
