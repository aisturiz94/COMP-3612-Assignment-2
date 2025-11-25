document.addEventListener("DOMContentLoaded", () => {

    const url =  "https://gist.githubusercontent.com/rconnolly/d37a491b50203d66d043c26f33dbd798/raw/37b5b68c527ddbe824eaed12073d266d5455432a/clothing-compact.json";


    function Cart(id, name, option, price, quantity) {
        this.id = id;
        this.name = name;
        this.option = option;
        this.price = price;
        this.quantity = quantity;
    }
    const navButtons = document.querySelectorAll("nav button");
    const cartButton = document.querySelector('#cart');
    const drawer = document.querySelector("#cart-drawer");
    const drawerOverlay = document.querySelector("#cart-drawer-overlay");
    const drawerCloseBtn = document.querySelector("#cart-drawer-close");
    let products = [];
    
    let cartItems = JSON.parse(localStorage.getItem("cart")) || [];
    updateCartIconNum();

    
    const savedData = localStorage.getItem("products");

    if (savedData) {
        products = JSON.parse(savedData);

        setNavButtonListener(products);
    }

    else{
        console.log("before");
        fetch(url)
            .then(resp => resp.json())
            .then(data => {
            localStorage.setItem("products", JSON.stringify(data));
            products = data;

            setNavButtonListener(products);
    });
    }
//Close button for about us
    document.addEventListener("click", e => {
        const closeButton = document.querySelector("#close-window");
        const aboutView = document.querySelector("#about-view")
        if (e.target.id === closeButton.id) {
            aboutView.classList.toggle("hidden");
        }
    })
    initBrowse(products);
    loadHomeProducts(products);
    //Adds an event listener to all the navigation buttons
    function setNavButtonListener(products){
        navButtons.forEach(button => {
            button.addEventListener("click", (e) => {
                if (pageButtonClicked(e.target.id)) {
                    changePage(e.target.id, products);
                }
            });
        });
        document.getElementById("logo").addEventListener("click", () => {
            changePage("home", products);
        });
    }

    //event delegation for "More Details" & "Add to Cart(not done yet" 
    document.addEventListener("click", e => {

        // Check if the click is on More Details or Add to Cart
        const isDetails = e.target.classList.contains("btn-details");
        const isAdd = e.target.classList.contains("btn-add");

        if (!isDetails && !isAdd) {
            return;
        }
        const card = e.target.closest(".product-card");
        if (!card) {
            return;
        }
        // Get the product ID from the card
        const id = card.dataset.id;
        const product = products.find(p => String(p.id) === String(id));
        // --- Handle each button type ---
        if (isDetails) {
            showProductDetail(product);
        }

        if (isAdd) {
            addToCart(product, cartItems);
        }
    });




function loadHomeProducts(products) {
        const homeSection = document.querySelector("#featured-products");
        const gridContainer = document.createElement("div");
        
        gridContainer.id = "home-grid";
        gridContainer.className = "grid grid-cols-1 md:grid-cols-4 gap-4"; 
        const template = document.querySelector("#product-card-template");

        //Pick 4 random products
        const shuffled = products.sort(() => 0.5 - Math.random());
        const featured = shuffled.slice(0, 4);

        // Loop and Append
        featured.forEach(product => {
            // Clone the template content
            const clone = template.content.cloneNode(true);
            // Populate Data
            const card = clone.querySelector(".product-card");
            const img = clone.querySelector(".product-image");
            const title = clone.querySelector(".product-title");
            const price = clone.querySelector(".product-price");
            
            card.dataset.id = product.id;

            // Set Content
            img.src = "https://placehold.co/600x400/png?text=Place+Holder";
            img.alt = product.name;
            title.textContent = product.name;
            price.textContent = `$${product.price.toFixed(2)}`;

            // Append the populated clone to the grid container
            gridContainer.appendChild(clone);
        });

        // 7. Finally, add the grid to the page
        homeSection.appendChild(gridContainer);
    }
//initializes all elements in the browse view so we can do stuff to it
//input: array of prodcuts from the JSON
function initBrowse(products) {
    /* cache DOM elements */
    const searchInput = document.querySelector("#product-search");
    const sortSelect = document.querySelector("#sort-select");
    const genderSelect = document.querySelector("#filter-gender");
    const categorySelect = document.querySelector("#filter-category");
    const clearBtn = document.querySelector("#clear-filters");
    const grid = document.querySelector("#display-items-grid");
    const activeFiltersContainer = document.querySelector("#active-filters");

    /* filter state */
    let filters = {
        search: "",
        gender: "",
        category: "",
        sort: "name-asc"
    };

    //Applies filters
    function applyFilters() {
            let result = products.slice();

            if (filters.gender) {
                result = result.filter(p => p.gender === filters.gender + "s");
            }

            if (filters.category) {
                const selectedCat = filters.category.toLowerCase();
                result = result.filter(p =>
                    p.category && p.category.toLowerCase() === selectedCat);
            }

            if (filters.search) {
                const term = filters.search.toLowerCase();
                result = result.filter(p => p.name.toLowerCase().includes(term));
            }
            
            if (filters.sort === "name-asc") {
                result.sort((a,b) => a.name.localeCompare(b.name));
            }

            if (filters.sort === "price-asc") {
                result.sort((a, b) => a.price - b.price);
            }

            if (filters.sort === "price-desc") {
                result.sort((a, b) => b.price - a.price);
            }

        renderBrowseGrid(result);
        renderActiveFilters();
    }
    function renderActiveFilters() {
            if (!activeFiltersContainer) return;
            activeFiltersContainer.innerHTML = "";

            // Helper to create a chip
            const createChip = (label, type) => {
                const btn = document.createElement("button");
                btn.className = "flex items-center gap-2 px-3 py-1 bg-gray-100 text-xs font-bold uppercase tracking-wider rounded-full hover:bg-gray-200 transition-colors";
                btn.innerHTML = `<span>${label}</span><span class="text-gray-500 hover:text-red-500">✕</span>`;
                
                btn.onclick = () => {
                    // Logic to remove specific filter
                    if (type === "search") {
                        filters.search = "";
                        searchInput.value = "";
                    } else if (type === "gender") {
                        filters.gender = "";
                        genderSelect.value = "";
                    } else if (type === "category") {
                        filters.category = "";
                        categorySelect.value = "";
                    }
                    applyFilters();
                };
                activeFiltersContainer.appendChild(btn);
            };
            // Check each filter and create chip if active
            if (filters.search) {
                createChip(`Search: "${filters.search}"`, "search");
            }
            if (filters.gender) {
                createChip(`Gender: ${filters.gender}`, "gender");
            }
            if (filters.category) {
                createChip(`Category: ${filters.category}`, "category");
            }
        }
    //Sort and apply filter
    searchInput.addEventListener("input", () => {
        filters.search = searchInput.value.trim();
        applyFilters();
    });

        genderSelect.addEventListener("change", () => {
            filters.gender = genderSelect.value; 
            applyFilters();
        });

        categorySelect.addEventListener("change", () => {
            filters.category = categorySelect.value;
            applyFilters();
        });

        sortSelect.addEventListener("change", () => {
            filters.sort = sortSelect.value;
            applyFilters();
        });

        clearBtn.addEventListener("click", () => {
            filters = { search: "", gender: "", category: "", sort: "" };

            searchInput.value = "";
            genderSelect.value = "";
            categorySelect.value = "";
            sortSelect.value = "";

            applyFilters();
        });
        applyFilters();
    }


    //Renders the grid for the browse view
    function renderBrowseGrid(list) {
        const grid = document.querySelector("#display-items-grid");
        const template = document.querySelector("#product-card-template");

        /* remove old product cards */
        grid.querySelectorAll(".product-card").forEach(c => c.remove());

        list.forEach(product => {
            const clone = template.content.cloneNode(true);

            const card = clone.querySelector(".product-card");
            const img = clone.querySelector(".product-image");
            const title = clone.querySelector(".product-title");
            const price = clone.querySelector(".product-price");

            card.dataset.id = product.id;
            img.src = "https://placehold.co/600x400/png?text=Place+holder";
            img.alt = product.name;
            title.textContent = product.name;
            price.textContent = `$${product.price.toFixed(2)}`;

            grid.appendChild(clone);
        });
    }

    //Activates a page's buttons event listener
    function activateButtonListener(viewId) {
        let pageButtons = document.querySelectorAll(`#${viewId}-view button`);
        pageButtons.forEach(button => {
            button.disabled = false;
        })
    }

    //Disables a page's buttons event listener
    function disableButtonListener(viewId) {
        let pageButtons = document.querySelectorAll(`#${viewId}-view button`);
        pageButtons.forEach(button => {
            button.disabled = true;
        })
    }

    // Verifies if a page button was clicked
    function pageButtonClicked(buttonId) {
        const navIds = ["home", "women", "men", "browse", "about"];
        let answer = false;

        if (navIds.find(navId => navId == buttonId)) {
            answer = true;
        }
        return answer;
    }

    // Changes the web page being displayed by hiding
    // all of them and setting the selected page visible.
    function changePage(viewId, products) {
        const views = ["home-view", "women-view", "men-view", "browse-view", "product-view", "cart-view"];
       
        if (viewId == "women" || viewId == "men") {
            loadGenderProducts(viewId, products);
        }

        if (viewId == "about") {
            const aboutView = document.getElementById("about-view");
            aboutView.classList.remove("hidden");
            return;
        }

        // 3. Normal Page Switching
        views.forEach(view => {
            document.getElementById(view).classList.add("hidden");
            disableButtonListener(viewId);
        });

        document.getElementById(`${viewId}-view`).classList.remove("hidden");
        activateButtonListener(viewId);
    }
    

function showProductDetail(product) {
        // 1. Cache DOM Elements
        const elements = {
            img: document.querySelector("#product-image"),
            title: document.querySelector("#product-title"),
            price: document.querySelector("#product-price"),
            material: document.querySelector("#product-material"),
            desc: document.querySelector("#product-description"),
            colour: document.querySelector("#product-colour"),
            sizeOptions: document.querySelector("#size-options"),
            qtyInput: document.querySelector("#quantity-input"),
            qtyMinus: document.querySelector("#qty-minus"),
            qtyPlus: document.querySelector("#qty-plus"),
            btnAdd: document.querySelector("#btn-add"),
            detailArticle: document.querySelector("#product-detail"),
            crumbs: {
                home: document.querySelector("#crumb-home"),
                gender: document.querySelector("#breadcrumb-gender"),
                category: document.querySelector("#breadcrumb-category"),
                product: document.querySelector("#breadcrumb-product")
            }
        };

        elements.detailArticle.dataset.id = product.id;

        // 2. Apply Styles (Safe call)
        styleProductPage(elements.title, elements.price, elements.desc, elements.material, elements.colour, elements.btnAdd, elements.sizeOptions);

        // 3. Populate Content
        populateProductInfo(product, elements);

        // 4. Setup Breadcrumbs
        setupBreadcrumbs(product, elements.crumbs);

        // 5. Setup Size Buttons
        setupSizeButtons(product, elements.sizeOptions);

        // 6. Setup Quantity Controls
        setupQuantityControls(elements.qtyInput, elements.qtyMinus, elements.qtyPlus);

        // 7. Setup Add to Cart Button
        setupAddToCartButton(product, elements.btnAdd, elements.qtyInput);

        renderRelatedProducts(product);
        changePage("product", products);
    }

    // --- Helpers ---

    function populateProductInfo(product, els) {
        els.img.src = `https://placehold.co/600x800/F3F4F6/9CA3AF?text=${product.name.substring(0,3).toUpperCase()}`;
        els.img.alt = product.name;
        els.title.textContent = product.name;
        els.price.textContent = `$${product.price.toFixed(2)}`;
        els.desc.textContent = product.description;

        els.material.innerHTML = `<span class="font-bold text-black uppercase tracking-wide text-xs">Material:</span> ${product.material}`;
        const colorName = product.color && product.color.length > 0 ? product.color[0].name : "N/A";
        els.colour.innerHTML = `<span class="font-bold text-black uppercase tracking-wide text-xs">Colour:</span> ${colorName}`;
    }

    function setupBreadcrumbs(product, crumbs) {
        if (crumbs.home) crumbs.home.onclick = () => changePage("home", products);

        let genderText = "All";
        let genderId = "browse";
        if (product.gender === "mens") { genderText = "Men"; genderId = "men"; }
        else if (product.gender === "womens") { genderText = "Women"; genderId = "women"; }

        if (crumbs.gender) {
            crumbs.gender.textContent = genderText;
            crumbs.gender.onclick = () => changePage(genderId, products);
        }

        if (product.category && crumbs.category) {
            const cat = product.category;
            crumbs.category.textContent = cat.charAt(0).toUpperCase() + cat.slice(1);
            crumbs.category.onclick = () => changePage("browse", products);
        }
        if (crumbs.product) crumbs.product.textContent = product.name;
    }

    function setupSizeButtons(product, container) {
        if (!container) return;
        container.innerHTML = "";
        if (product.sizes && product.sizes.length) {
            product.sizes.forEach((size, index) => {
                const btn = document.createElement("button");
                btn.type = "button";
                btn.textContent = size;
                btn.className = `w-10 h-10 border border-gray-300 text-sm font-medium flex items-center justify-center transition-colors hover:border-black`;
                if (index === 0) btn.classList.add("bg-black", "text-white", "border-black");

                btn.onclick = () => {
                    Array.from(container.children).forEach(b => {
                        b.classList.remove("bg-black", "text-white", "border-black");
                        b.classList.add("border-gray-300");
                    });
                    btn.classList.remove("border-gray-300");
                    btn.classList.add("bg-black", "text-white", "border-black");
                };
                container.appendChild(btn);
            });
        }
    }

    function setupQuantityControls(input, minusBtn, plusBtn) {
        if (input) input.value = 1;
        if (minusBtn) {
            const newMinus = minusBtn.cloneNode(true);
            minusBtn.parentNode.replaceChild(newMinus, minusBtn);
            newMinus.onclick = () => {
                let val = parseInt(input.value) || 1;
                if (val > 1) input.value = val - 1;
            };
        }
        if (plusBtn) {
            const newPlus = plusBtn.cloneNode(true);
            plusBtn.parentNode.replaceChild(newPlus, plusBtn);
            newPlus.onclick = () => {
                let val = parseInt(input.value) || 1;
                input.value = val + 1;
            };
        }
    }

    function setupAddToCartButton(product, btn, input) {
        if (!btn) return;
        const newBtnAdd = btn.cloneNode(true);
        btn.parentNode.replaceChild(newBtnAdd, btn);
        newBtnAdd.onclick = () => {
            const qty = input ? (parseInt(input.value) || 1) : 1;
            addToCart(product, cartItems);
            alert(`Added ${qty} x ${product.name} to cart.`);
        };
    }

    function renderRelatedProducts(product) {
        const relatedGrid = document.querySelector("#related-grid");
        const template = document.querySelector("#product-card-template");
        if (!relatedGrid || !template) return;
        
        relatedGrid.innerHTML = "";
        let related = products.filter(p => p.id !== product.id && p.category === product.category).slice(0, 4);

        related.forEach(item => {
            const clone = template.content.cloneNode(true);
            populateCard(clone, item);
            relatedGrid.appendChild(clone);
        });
    }




    function renderRelatedProducts(product) {
        const relatedGrid = document.querySelector("#related-grid");
        const template = document.querySelector("#product-card-template");
        //clear previous related items
        relatedGrid.querySelectorAll(".product-card").forEach(c => c.remove());

        let related = products.filter(p =>
            p.id !== product.id &&
            p.category === product.category
        );

        related = related.slice(0, 4);
        related.forEach(item => {
            const clone = template.content.cloneNode(true);
            const card = clone.querySelector(".product-card");
            const img = clone.querySelector(".product-image");
            const title = clone.querySelector(".product-title");
            const price = clone.querySelector(".product-price");

            card.dataset.id = item.id;
            img.src = "https://placehold.co/600x400/png?text=Place+Holder";
            img.alt = item.name;
            title.textContent = item.name;
            price.textContent = `$${item.price.toFixed(2)}`;

            relatedGrid.appendChild(clone);
        });
    }


    // The function creates filtered products based on the gender that was chosen
   function loadGenderProducts(genderView, products) {
    const container = document.querySelector(`#${genderView}-products`);
    const template = document.querySelector("#product-card-template");
    
    container.innerHTML = '<div class="grid grid-cols-1 gap-y-10 gap-x-6 sm:grid-cols-2 lg:grid-cols-4 xl:gap-x-8"></div>';
    const grid = container.querySelector('div');
    const filtered = products.filter(p => p.gender === `${genderView}s`);
    filtered.forEach(product => {
        const clone = template.content.cloneNode(true);
        populateCard(clone, product);
        grid.appendChild(clone);
    });
    }
    //Creates a card to be displayed with the product info
    function populateCard(clone, product) {
        const card = clone.querySelector(".product-card");
        const img = clone.querySelector(".product-image");
        const title = clone.querySelector(".product-title");
        const price = clone.querySelector(".product-price");
        const addBtn = clone.querySelector(".btn-add");
        const detailBtn = clone.querySelector(".btn-details");
        
        // NEW: Select the color elements
        const colorDot = clone.querySelector(".product-color-dot");
        const colorName = clone.querySelector(".product-color-name");

        // Set IDs
        card.dataset.id = product.id;
        addBtn.dataset.productId = product.id;
        
        // Also set ID on details button for your listener
        if (detailBtn){
            detailBtn.dataset.productId = product.id; 
        }

        // Set Content
        img.src = `https://placehold.co/600x800/F3F4F6/9CA3AF?text=PLace+Holder`;
        img.alt = product.name;
        title.textContent = product.name;
        price.textContent = `$${product.price.toFixed(2)}`;
    }

    // Opens the drawer
    function openCartDrawer() {
        drawer.classList.remove("translate-x-full");
        drawerOverlay.classList.remove("opacity-0", "pointer-events-none");
    }

    // Closes the drawer
    function closeCartDrawer() {
        drawer.classList.add("translate-x-full");
        drawerOverlay.classList.add("opacity-0", "pointer-events-none");
    }

    // Clicking overlay closes drawer
    drawerOverlay.addEventListener("click", closeCartDrawer);
    drawerCloseBtn.addEventListener("click", closeCartDrawer);

    // Cart icon opens drawer
    document.querySelector("#cart").addEventListener("click", () => {
        updateCartDrawer();  
        openCartDrawer();
    });

    // Updates the cart drawer display
    function updateCartDrawer() {
        const drawerList = document.querySelector("#cart-drawer-items");
        const template = document.querySelector("#cart-item");

        const shippingSelect = document.querySelector("#shipping-select");
        const destinationSelect = document.querySelector("#destination-select");
        const checkoutBtn = document.querySelector("#drawer-checkout");

        drawerList.innerHTML = "";

        let subtotal = 0;
        let totalQty = 0;
        for (let item of cartItems) totalQty += item.quantity;

        cartItems.forEach(item => {
            const clone = template.content.cloneNode(true);

            const div = clone.querySelector(".cart-item");
            const name = clone.querySelector(".cart-item-name");
            const options = clone.querySelector(".cart-item-options");
            const qtyContainer = clone.querySelector(".cart-item-quantity");
            const price = clone.querySelector(".cart-item-price");
            const removeBtn = clone.querySelector(".cart-item-remove");
            const minusBtn = clone.querySelector(".cart-item-minus");
            const plusBtn = clone.querySelector(".cart-item-plus");

            div.dataset.id = item.id;
            div.dataset.size = item.option;

            name.textContent = item.name;
            options.textContent = `Size: ${item.option}`;
            qtyContainer.textContent = item.quantity;
            price.textContent = `$${(item.price * item.quantity).toFixed(2)}`;
            subtotal += item.price * item.quantity;

            minusBtn.addEventListener("click", () => decreaseCartItem(item));
            plusBtn.addEventListener("click", () => increaseCartItem(item));
            removeBtn.addEventListener("click", () => removeFromCart(item.id, item.option));

            drawerList.appendChild(clone);
        });

        const disabled = cartItems.length === 0;
        shippingSelect.disabled = disabled;
        destinationSelect.disabled = disabled;
        checkoutBtn.disabled = disabled;

        if (!disabled) {
            if (!shippingSelect.value) {
                shippingSelect.value = "standard";
            }
            if (!destinationSelect.value) { 
                destinationSelect.value = "canada";
            }
        }

        let shippingCost = 0;
        const destination = destinationSelect.value;
        const shippingType = shippingSelect.value;

        const shippingTable = {
            canada: { standard: 10, express: 25, priority: 35 },
            "united-states": { standard: 15, express: 25, priority: 50 },
            international: { standard: 20, express: 30, priority: 50 }
        };

        if (!disabled) {
            shippingCost = subtotal > 500 ? 0 : shippingTable[destination][shippingType];
        }

        let taxRate = destination === "canada" ? 0.05 : 0.08;
        let tax = subtotal * taxRate;

        document.querySelector("#drawer-merch-total").textContent = `Merchandise Total: $${subtotal.toFixed(2)}`;
        document.querySelector("#drawer-shipping-cost").textContent = `Shipping: $${shippingCost.toFixed(2)}`;
        document.querySelector("#drawer-tax").textContent = `Tax: $${tax.toFixed(2)}`;

        const total = subtotal + shippingCost + tax;
        if(totalQty === 1){
            document.querySelector("#drawer-subtotal").textContent = `Subtotal: $${total.toFixed(2)} (1 item)`;
        } else {
            document.querySelector("#drawer-subtotal").textContent = `Subtotal: $${total.toFixed(2)} (${totalQty} items)`;
        }

        saveCart();
    }

    document.querySelector("#shipping-select").addEventListener("change", updateCartDrawer);
    document.querySelector("#destination-select").addEventListener("change", updateCartDrawer);

    // Adds an item to the cart
    function addToCart(product, cartItems) {

        const id = product.id;
        const name = product.name;
        const price = product.price;
        const option = "S"; // TODO: replace with selected size

        let existingItem = cartItems.find(item => item.id == id && item.option == option);

        if (existingItem) {
            existingItem.quantity++;
        } else {
            cartItems.push(new Cart(id, name, option, price, 1));
        }

        updateCartIconNum();
        updateCartDrawer();
        saveCart();
    }

    // Removes an item from the cart
    function removeFromCart(id, option) {
        cartItems = cartItems.filter(item => !(item.id == id && item.option == option));
        updateCartIconNum();
        updateCartDrawer();
        saveCart();
    }

    function updateCartIconNum() { 
        let totalQty = 0; 
        for (let item of cartItems) { 
            totalQty += item.quantity; 
        } 
        document.querySelector("#cart-count").textContent = totalQty; 
    }

    function saveCart() {
    localStorage.setItem("cart", JSON.stringify(cartItems));
    }

    function decreaseCartItem(item) {
        if (item.quantity > 1) {
            item.quantity--;
        } else {
            // Remove item if quantity reaches zero
            cartItems = cartItems.filter(i => !(i.id == item.id && i.option == item.option));
        }

        saveCart();
        updateCartDrawer();
        updateCartIconNum();
    }

    function increaseCartItem(item) {
        item.quantity++;

        saveCart();
        updateCartDrawer();
        updateCartIconNum();
    }

function styleProductPage(titleEl, priceEl, descEl, materialEl, colourEl, btnAdd, sizeOptions) {
        // Title & Price
        titleEl.className = "text-3xl lg:text-4xl font-black tracking-tighter uppercase mb-2";
        priceEl.className = "text-xl font-bold text-gray-900 mb-4";

        // Description & Details
        descEl.className = "text-gray-600 leading-relaxed mb-4";
        materialEl.className = "text-sm text-gray-600";
        colourEl.className = "text-sm text-gray-600";

        // Add to Cart Button
        btnAdd.className = "flex-1 bg-black text-white py-3 px-6 uppercase font-bold tracking-widest hover:bg-gray-800 transition-colors h-full"; 
        
        // Size Options Container
        sizeOptions.className = "flex flex-wrap gap-2 mt-2"; 
    }

});


    function showToaster(message) {

        const toast = document.createElement("div");
        toast.textContent = message;
        toast.className = "fixed bottom-4 right-4 bg-black text-white px-4 py-2 rounded shadow-lg opacity-0 transition-opacity duration-300 z-50";

        document.body.appendChild(toast);

        setTimeout(() => toast.classList.remove("opacity-0"), 50);

        setTimeout(() => {
            toast.classList.add("opacity-0");
            setTimeout(() => toast.remove(), 300);
        }, 3000);
    }

    document.querySelector("#drawer-checkout").addEventListener("click", () => {
        if (cartItems.length === 0) return;

        showToaster("Checkout successful! Thank you for your purchase.");

        cartItems = [];
        saveCart();
        updateCartIconNum();
        updateCartDrawer();

        closeCartDrawer();

        changePage("home", products);
    });
