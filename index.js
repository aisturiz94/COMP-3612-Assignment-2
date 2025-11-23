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

        // OPEN the drawer
    function openCartDrawer() {
        drawer.classList.remove("translate-x-full");
        drawerOverlay.classList.remove("opacity-0", "pointer-events-none");
    }

    // CLOSE the drawer
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
            const views = ["home-view", "women-view", "men-view" ,"browse-view", "product-view", "cart-view","about-view"];

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
    //shows product details when clicking "More details"
    function showProductDetail(product) {
        const img = document.querySelector("#product-image");
        const titleEl = document.querySelector("#product-title");
        const priceEl = document.querySelector("#product-price");
        const materialEl = document.querySelector("#product-material");
        const descEl = document.querySelector("#product-description");
        const colourEl = document.querySelector("#product-colour");
        const crumbGender = document.querySelector("#breadcrumb-gender");
        const crumbCategory = document.querySelector("#breadcrumb-category");
        const crumbProduct = document.querySelector("#breadcrumb-product");
        const sizeOptions = document.querySelector("#size-options");
        const qtyInput = document.querySelector("#quantity-input");

        //store current product id on the detail element for later (cart, etc.)
        const detailArticle = document.querySelector("#product-detail");
        detailArticle.dataset.id = product.id;

        img.src = "https://placehold.co/600x400/png?text=Placeholder";
        img.alt = product.name;

        /* main info */
        titleEl.textContent = product.name;
        priceEl.textContent = `$${product.price.toFixed(2)}`;
        materialEl.textContent = product.material;
        descEl.textContent = product.description;
        colourEl.textContent = product.color[0].name;

        /* breadcrumb */
        if (product.gender === "mens") {
            crumbGender.textContent = "Men";
        } else if (product.gender === "womens") {
            crumbGender.textContent = "Women";
        } else {
            crumbGender.textContent = "All";
        }

        if (product.category) {
            const cat = product.category;
            crumbCategory.textContent = cat.charAt(0).toUpperCase() + cat.slice(1);
        } else {
            crumbCategory.textContent = "Category";
        }

        crumbProduct.textContent = product.name;

        /* sizes */
        sizeOptions.innerHTML = "";
        if (product.sizes && product.sizes.length) {
            product.sizes.forEach(size => {
                const box = document.createElement("button");
                box.type = "button";
                box.className = "size-display-box";
                box.textContent = size;
                sizeOptions.appendChild(box);
            });
        }

        //reset quantity
        if (qtyInput) {
            qtyInput.value = 1;
        }
        renderRelatedProducts(product);
        changePage("product");
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

    // OPEN the drawer
    function openCartDrawer() {
        drawer.classList.remove("translate-x-full");
        drawerOverlay.classList.remove("opacity-0", "pointer-events-none");
    }

    // CLOSE the drawer
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

        drawerList.innerHTML = "";

        let subtotal = 0;
        let totalQty = 0; 
        for (let item of cartItems) { 
            totalQty += item.quantity; 
        } 

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


            removeBtn.addEventListener("click", () => {
                removeFromCart(item.id, item.option);
            });

            drawerList.appendChild(clone);
        });

        if(totalQty == 1){
            document.querySelector("#drawer-subtotal").textContent = `Subtotal: $${subtotal.toFixed(2)} (1 item)`;
        }
        else {
            document.querySelector("#drawer-subtotal").textContent = `Subtotal: $${subtotal.toFixed(2)} (${totalQty} items)`;
        }

        saveCart();
    }

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



});

