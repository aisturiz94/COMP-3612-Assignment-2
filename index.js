document.addEventListener("DOMContentLoaded", () => {

    const url =  "https://gist.githubusercontent.com/rconnolly/d37a491b50203d66d043c26f33dbd798/raw/37b5b68c527ddbe824eaed12073d266d5455432a/clothing-compact.json";

   /**
     * Function: Cart
     * Description: Constructor function for creating a Cart item object.
     * Input: id (number/string), name (string), option (string), price (int), quantity (int)
     * Output: A new Cart object instance
     */
    function Cart(id, name, option, price, quantity, color) {
        this.id = id;
        this.name = name;
        this.option = option;
        this.price = price;
        this.quantity = quantity;
        this.color = color;
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
        parsedProducts = JSON.parse(savedData);

        if (Array.isArray(parsedProducts)) {
            products = parsedProducts;
            setNavButtonListener(products);
            initBrowse(products);
            loadHomeProducts(products);
        }
    } else {
        console.log("before");
        fetch(url)
        .then(resp => {
            if (!resp.ok) {
                console.error("Failed to fetch products. Status:", resp.status);
                return [];
            }
            return resp.json();
        })
        .then(data => {
            if (Array.isArray(data)) {
                localStorage.setItem("products", JSON.stringify(data));
                products = data;
                setNavButtonListener(products);
                initBrowse(products);
                loadHomeProducts(products);
            } else {
                console.error("Fetched products data is not an array.");
            }
        })
        .catch(err => {
            console.error("Error fetching products:", err);
        });
    }

    //Close button for about us
    document.addEventListener("click", e => {
        const closeButton = document.querySelector("#close-window");
        const aboutView = document.querySelector("#about-view")
        if (e.target.id === closeButton.id) {
            aboutView.classList.toggle("hidden");
        }
    });

    /**
     * Function: setNavButtonListener
     * Description: Attaches click event listeners to main navigation buttons.
     * Input: products (Array of objects)
     * Output: None
     */
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

        const isDetails = e.target.classList.contains("btn-details");
        const isAdd = e.target.classList.contains("btn-add");

        if (!isDetails && !isAdd) {
            return;
        }
        const card = e.target.closest(".product-card");
        if (!card) {
            return;
        }
        const id = card.dataset.id;
        const product = products.find(p => String(p.id) === String(id));
        
        if (isDetails) {
            showProductDetail(product);
        }

        if (isAdd) {
            addToCart(product, cartItems);
        }
    });



    /**
     * Function: loadHomeProducts
     * Description: Selects random products to display on the home page 'Featured Items' section.
     * Input: products (Array of objects)
     * Output: DOM manipulation (appends product cards to home section)
     */
function loadHomeProducts(products) {
        const homeSection = document.querySelector("#featured-products");
        homeSection.replaceChildren();
        
        const h2 = document.createElement("h2");
        h2.className = "text-3xl font-bold mb-8 text-center";
        h2.textContent = "Featured Items";
        homeSection.appendChild(h2);
        
        const gridContainer = document.createElement("div");
        gridContainer.id = "home-grid";
        gridContainer.className = "grid grid-cols-1 md:grid-cols-4 gap-4";
        const template = document.querySelector("#product-card-template");

        const shuffled = [...products].sort(() => 0.5 - Math.random());
        const featured = shuffled.slice(0, 4);

        featured.forEach(product => {
            const clone = template.content.cloneNode(true);
            populateCard(clone, product); 
            gridContainer.appendChild(clone);
        });

        homeSection.appendChild(gridContainer);
    }
    /**
     * Function: initBrowse
     * Description: Sets up the Browse/Search view, including filters, sorting, and event listeners for the filter inputs.
     * Input: products (Array of objects)
     * Output: None (Sets up internal state and renders initial grid)
     */
function initBrowse(products) {
    /* cache DOM elements */
    const searchInput = document.querySelector("#product-search");
    const sortSelect = document.querySelector("#sort-select");
    const genderSelect = document.querySelector("#filter-gender");
    const categorySelect = document.querySelector("#filter-category");
    const clearBtn = document.querySelector("#clear-filters");
    const activeFiltersContainer = document.querySelector("#active-filters");

    let filters = {
        search: "",
        gender: "",
        category: "",
        sort: "name-asc"
    };

    /**
     * Function: applyFilters
     * Description: Applies filters to sort products array .
     * Input: None
     * Output: None
     */
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

            const createChip = (label, type) => {
                const btn = document.createElement("button");
                btn.className = "flex items-center gap-2 px-3 py-1 bg-gray-100 text-xs font-bold uppercase tracking-wider rounded-full hover:bg-gray-200 transition-colors";
                btn.innerHTML = `<span>${label}</span><span class="text-gray-500 hover:text-red-500">✕</span>`;
                
                btn.onclick = () => {

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


    /**
     * Function: renderBrowseGrid
     * Description: Renders the product grid for the Browse page based on the filtered list.
     * Input: list (Array of product objects)
     * Output: DOM manipulation (updates grid content)
     */
    function renderBrowseGrid(list) {
        const grid = document.querySelector("#display-items-grid");
        const template = document.querySelector("#product-card-template");

        grid.querySelectorAll(".product-card").forEach(c => c.remove());

        list.forEach(product => {
            const clone = template.content.cloneNode(true);
            populateCard(clone, product);
            grid.appendChild(clone);
        });
    }

    /**
     * Function: activateButtonListener
     * Description: Enables all buttons within a specific view container.
     * Input: viewId (string - id prefix of the view)
     * Output: None (DOM attributes updated)
     */
    function activateButtonListener(viewId) {
        let pageButtons = document.querySelectorAll(`#${viewId}-view button`);
        pageButtons.forEach(button => {
            button.disabled = false;
        })
    }

    /**
     * Function: disableButtonListener
     * Description: Disables all buttons within a specific view container to prevent interaction while hidden.
     * Input: viewId (string - id prefix of the view)
     * Output: None (DOM attributes updated)
     */
    function disableButtonListener(viewId) {
        let pageButtons = document.querySelectorAll(`#${viewId}-view button`);
        pageButtons.forEach(button => {
            button.disabled = true;
        })
    }

    /**
     * Function: pageButtonClicked
     * Description: Checks if a clicked ID corresponds to a valid page navigation button.
     * Input: buttonId (string)
     * Output: Boolean (true if valid page, false otherwise)
     */
    function pageButtonClicked(buttonId) {
        const navIds = ["home", "women", "men", "browse", "about"];
        let answer = false;

        if (navIds.find(navId => navId == buttonId)) {
            answer = true;
        }
        return answer;
    }

    /**
     * Function: changePage
     * Description: Handles hiding all views and showing the requested one.
     * Input: viewId (string), products (Array of objects)
     * Output: None (DOM classes updated)
     */
    function changePage(viewId, products) {
            const views = ["home-view", "women-view", "men-view" ,"browse-view", "product-view","about-view"];

            if (viewId == "women" || viewId == "men"){
                loadGenderProducts(viewId, products);
            }
            views.forEach(view => {
                document.getElementById(view).classList.add("hidden");
                disableButtonListener(viewId);
            });

            document.getElementById(`${viewId}-view`).classList.remove("hidden");
            activateButtonListener(viewId);
    }
    
    /**
     * Function: showProductDetail
     * Description: Orchestrates the loading of the Product Detail view for a specific item.
     * Input: product (Object)
     * Output: None (DOM updates and page change)
     */
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

        styleProductPage(elements.title, elements.price, elements.desc, elements.material, elements.colour, elements.btnAdd, elements.sizeOptions);

        populateProductInfo(product, elements);

        setupBreadcrumbs(product, elements.crumbs);

        setupSizeButtons(product, elements.sizeOptions);

        setupQuantityControls(elements.qtyInput, elements.qtyMinus, elements.qtyPlus);

        setupAddToCartButton(product, elements.btnAdd, elements.qtyInput);

        renderRelatedProducts(product);
        changePage("product", products);
    }

    /**
     * Function: populateProductInfo
     * Description: Fills the product detail elements (Image, Title, Desc, Material, Color) with data.
     * Input: product (Object), els (Object containing DOM elements)
     * Output: None (DOM content updated)
     */
    function populateProductInfo(product, els) {
        els.img.src = `https://placehold.co/600x800/F3F4F6/9CA3AF?text=${product.name.substring(0,3).toUpperCase()}`;
        els.img.alt = product.name;
        els.title.textContent = product.name;
        els.price.textContent = `$${product.price.toFixed(2)}`;
        els.desc.textContent = product.description;
        
        els.material.replaceChildren();
        const matLabel = document.createElement("span");
        matLabel.className = "font-bold text-black uppercase tracking-wide text-xs";
        matLabel.textContent = "Material: ";
        els.material.appendChild(matLabel);
        els.material.appendChild(document.createTextNode(product.material));
        
        els.colour.replaceChildren();
        
        const wrapper = document.createElement("div");
        wrapper.className = "flex items-center gap-2";
        
        const colLabel = document.createElement("span");
        colLabel.className = "font-bold text-black uppercase tracking-wide text-xs";
        colLabel.textContent = "Colour:";
        
        const colValue = document.createElement("span");
        colValue.textContent = product.color[0].name;
        
        const colDot = document.createElement("div");
        colDot.className = "w-4 h-4 rounded-full border border-gray-300";
        colDot.style.backgroundColor = product.color[0].hex;
        
        wrapper.appendChild(colLabel);
        wrapper.appendChild(colValue);
        wrapper.appendChild(colDot);
        
        els.colour.appendChild(wrapper);
    }
    /**
     * Function: setupBreadcrumbs
     * Description: Configures the breadcrumb navigation links on the Product Detail page.
     * Input: product (Object), crumbs (Object containing breadcrumb DOM elements)
     * Output: None (Event listeners attached)
     */
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
    /**
     * Function: setupSizeButtons
     * Description: Generates interactive size buttons.
     * Input: product (Object), container (DOM Element)
     * Output: None (Buttons appended to container)
     */
    function setupSizeButtons(product, container) {
        if (!container) return;
        container.innerHTML = "";

        let selectedSize = product.sizes[0];

        product.sizes.forEach((size, index) => {
            const btn = document.createElement("button");
            btn.type = "button";
            btn.textContent = size;

            btn.className =
                "size-btn w-10 h-10 border border-gray-300 text-sm font-medium flex items-center justify-center transition-colors hover:border-black rounded";

            if (index === 0) {
                btn.classList.add("bg-black", "text-white", "border-black");
                container.dataset.selectedSize = size; 
            }

            btn.onclick = () => {
                container.dataset.selectedSize = size;

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
    /**
     * Function: setupQuantityControls
     * Description: Initializes the quantity input field.
     * Input: input (DOM Input Element)
     * Output: None
     */
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
    /**
     * Function: setupAddToCartButton
     * Description: Configures the main 'Add to Cart' button with current product and quantity logic.
     * Input: product (Object), btn (DOM Button Element), input (DOM Input Element for quantity)
     * Output: None (Event listener attached)
     */
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
    /**
     * Function: renderRelatedProducts
     * Description: Finds and displays up to 4 other products in the same category.
     * Input: product (Object - the current product to exclude)
     * Output: DOM manipulation (Related grid updated)
     */
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

    /**
     * Function: loadGenderProducts
     * Description: Renders the product grid for gender-specific views (Men/Women).
     * Input: genderView (string - 'men' or 'women'), products (Array of objects)
     * Output: DOM manipulation (Grid updated)
     */
function loadGenderProducts(genderView, products) {
        const container = document.querySelector(`#${genderView}-products`);
        const template = document.querySelector("#product-card-template");
        
        container.replaceChildren();
        
        const grid = document.createElement("div");
        grid.className = "grid grid-cols-1 gap-y-10 gap-x-6 sm:grid-cols-2 lg:grid-cols-4 xl:gap-x-8";
        container.appendChild(grid);

        const filtered = products.filter(p => p.gender === `${genderView}s`);
        
        filtered.forEach(product => {
            const clone = template.content.cloneNode(true);
            populateCard(clone, product);
            grid.appendChild(clone);
        });
    }
    /**
     * Function: populateCard
     * Description: Helper function to fill a product card template with data. Used across Home, Browse, and Related sections.
     * Input: clone (DocumentFragment/Node), product (Object)
     * Output: None (DOM elements inside clone are updated)
     */
    function populateCard(clone, product) {
        const card = clone.querySelector(".product-card");
        const img = clone.querySelector(".product-image");
        const title = clone.querySelector(".product-title");
        const price = clone.querySelector(".product-price");
        const addBtn = clone.querySelector(".btn-add");
        const detailBtn = clone.querySelector(".btn-details");
        
        const colorDot = clone.querySelector(".product-color-dot");
        const colorName = clone.querySelector(".product-color-name");

        card.dataset.id = product.id;
        addBtn.dataset.productId = product.id;
        
        if (detailBtn){
            detailBtn.dataset.productId = product.id; 
        }

        img.src = `https://placehold.co/600x800/F3F4F6/9CA3AF?text=PLace+Holder`;
        img.alt = product.name;
        title.textContent = product.name;
        price.textContent = `$${product.price.toFixed(2)}`;

        //Color logic
        const col = product.color[0];
        colorName.textContent = col.name;
        colorDot.style.backgroundColor = col.hex;
    }

    /**
     * Function: openCartDrawer
     * Description: Slides the cart drawer into view.
     * Input: None
     * Output: DOM class updates (removes transform translate)
     */
    function openCartDrawer() {
        drawer.classList.remove("translate-x-full");
        drawerOverlay.classList.remove("opacity-0", "pointer-events-none");
    }

    /**
     * Function: closeCartDrawer
     * Description: Slides the cart drawer out of view.
     * Input: None
     * Output: DOM class updates (adds transform translate)
     */
    function closeCartDrawer() {
        drawer.classList.add("translate-x-full");
        drawerOverlay.classList.add("opacity-0", "pointer-events-none");
    }

    drawerOverlay.addEventListener("click", closeCartDrawer);
    drawerCloseBtn.addEventListener("click", closeCartDrawer);

    cartButton.addEventListener("click", () => {
        updateCartDrawer();  
        openCartDrawer();
    });

    /**
     * Function: updateCartDrawer
     * Description: Re-renders the entire cart drawer, including item list, totals, shipping logic, and tax calculations.
     * Input: None (Uses global cartItems)
     * Output: DOM manipulation (Cart drawer content updated)
     */
    function updateCartDrawer() {
        const drawerList = document.querySelector("#cart-drawer-items");
        const template = document.querySelector("#cart-item");

        const shippingSelect = document.querySelector("#shipping-select");
        const destinationSelect = document.querySelector("#destination-select");
        const checkoutBtn = document.querySelector("#drawer-checkout");

        drawerList.innerHTML = "";

        let subtotal = 0;
        let totalQty = 0;
        for (let item of cartItems) { 
            totalQty += item.quantity
        };

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
            qtyContainer.textContent = item.quantity;
            price.textContent = `$${(item.price * item.quantity).toFixed(2)}`;
            subtotal += item.price * item.quantity;

            options.textContent = ``;
            const sizeLabel = document.createElement("div");
            const colorLabel = document.createElement("div");

            sizeLabel.textContent = `Size: ${item.option || "N/A"}`;
            colorLabel.textContent = `Colour: ${item.color?.name || "N/A"}`;

            options.appendChild(sizeLabel);
            options.appendChild(colorLabel);

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

    /**
     * Function: addToCart
     * Description: Adds a product to the global cart state, or increments quantity if it already exists.
     * Input: product (Object), cartItems (Array)
     * Output: None (State updated)
     */
    function addToCart(product, cartItems) {

        const id = product.id;
        const name = product.name;
        const price = product.price;
        const color = product.color[0];
        let sizeContainer = document.querySelector("#size-options");
        let selectedSize = sizeContainer?.dataset.selectedSize || product.sizes[0];
        let selectedColor = product.color?.[0] || { name: "N/A", hex: "#000000" };

        let existingItem = cartItems.find(item => 
            item.id == id && item.option == option && item.color?.name === color.name
        );

        if (existingItem) {
            existingItem.quantity++;
        } else {
            cartItems.push(new Cart(id, name, selectedSize, price, 1, selectedColor));
        }

        updateCartIconNum();
        updateCartDrawer();
        saveCart();
    }

    /**
     * Function: removeFromCart
     * Description: Completely removes a specific item (id + option) from the cart.
     * Input: id (number/string), option (string)
     * Output: None (State updated)
     */
    function removeFromCart(id, option) {
        cartItems = cartItems.filter(item => !(item.id == id && item.option == option));
        updateCartIconNum();
        updateCartDrawer();
        saveCart();
    }
    /**
     * Function: updateCartIconNum
     * Description: Updates the red badge on the cart icon with the total quantity of items.
     * Input: None
     * Output: DOM text update
     */
    function updateCartIconNum() { 
        let totalQty = 0; 
        for (let item of cartItems) { 
            totalQty += item.quantity; 
        } 
        document.querySelector("#cart-count").textContent = totalQty; 
    }
    /**
     * Function: saveCart
     * Description: Persists the current cart state to localStorage.
     * Input: None
     * Output: None (Side effect: writes to localStorage)
     */
    function saveCart() {
    localStorage.setItem("cart", JSON.stringify(cartItems));
    }
    /**
     * Function: decreaseCartItem
     * Description: Decrements item quantity, or removes it if quantity reaches 0.
     * Input: item (Cart object)
     * Output: None
     */
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
    /**
     * Function: increaseCartItem
     * Description: Increments item quantity by 1.
     * Input: item (Cart object)
     * Output: None
     */
    function increaseCartItem(item) {
        item.quantity++;

        saveCart();
        updateCartDrawer();
        updateCartIconNum();
    }
    /**
     * Function: styleProductPage
     * Description: Applies Tailwind CSS classes dynamically to the product detail page elements.
     * Input: titleEl, priceEl, descEl, materialEl, colourEl, btnAdd, sizeOptions (DOM Elements)
     * Output: None (DOM classes updated)
     */
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
    /**
     * Function: showToaster
     * Description: Creates and displays a temporary notification message at the bottom of the screen.
     * Input: message (string)
     * Output: None (DOM manipulation: append temporary div)
     */
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



});

