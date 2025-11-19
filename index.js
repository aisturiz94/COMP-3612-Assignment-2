document.addEventListener("DOMContentLoaded", () => {

    const url =  "https://gist.githubusercontent.com/rconnolly/d37a491b50203d66d043c26f33dbd798/raw/37b5b68c527ddbe824eaed12073d266d5455432a/clothing-compact.json";

    let pageButtons = document.querySelectorAll("nav button");
    let products = [];

    
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
    //Adds an event listener to all the navigation buttons
    function setNavButtonListener(products){
        pageButtons.forEach(button => {
            button.addEventListener("click", (e) => {
                if (pageButtonClicked(e.target.id)) {
                    changePage(e.target.id, products);
                }
            });
        });
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
        sort: ""
    };
//Applies filters - issue rn is category breaks it
    function applyFilters() {
        let result = products.slice();

        if (filters.gender) {
            result = result.filter(p => p.gender === filters.gender + "s");
        }

        if (filters.category) {
            result = result.filter(p => p.category === filters.category);
        }

        if (filters.search) {
            const term = filters.search.toLowerCase();
            result = result.filter(p => p.name.toLowerCase().includes(term));
        }

        if (filters.sort === "price-asc") {
            result.sort((a, b) => a.price - b.price);
        }
        if (filters.sort === "price-desc") {
            result.sort((a, b) => b.price - a.price);
        }

        renderBrowseGrid(result);
    }

    /* listeners */
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

    /* first render */
    applyFilters();

    /* event delegation for buttons inside product cards */
    grid.addEventListener("click", e => {
        const card = e.target.closest(".product-card");
        if (!card) return;

        const id = card.dataset.id;
        const product = products.find(p => String(p.id) === id);

        if (e.target.classList.contains("btn-details")) {
            changePage("product");
            /*fill product view here later */
        }

        if (e.target.classList.contains("btn-add")) {
            /*connect addToCart here later */
        }
    });
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
        img.src = "https://placehold.co/600x400/png?text=Placeholder";
        img.alt = product.name;
        title.textContent = product.name;
        price.textContent = `$${product.price.toFixed(2)}`;

        grid.appendChild(clone);
    });
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
            const views = ["home-view", "women-view", "men-view" ,"browse-view", "product-view", "cart-view","about-view"];

            if (viewId == "women" || viewId == "men"){
                loadGenderProducts(viewId, products);
            }
            views.forEach(view => {
                document.getElementById(view).classList.add("hidden");
            });

            document.getElementById(`${viewId}-view`).classList.remove("hidden");
    }

    // The function creates filtered products based on the gender that was chosen
    function loadGenderProducts (genderView, products) {
            let productSection = document.querySelector(`#${genderView}-products`);
            productSection.innerHTML = '';

            products.forEach(product => {
                if (product.gender == `${genderView}s`) {
                    let figure = document.createElement("figure");

                    // ARE WE GOING TO ADD IMAGES OR NAH?
                    let img = document.createElement("img");
                    img.src = "https://placehold.co/600x400/png?text=Place+Holder";
                    img.alt = product.name;

                    let figcaption = document.createElement("figcaption");

                    let productName = document.createElement("p");
                    productName.textContent = product.name;

                    let productPrice = document.createElement("p");
                    productPrice.textContent = `$${product.price}`;

                    let addBtn = document.createElement("button");
                    addBtn.textContent = "ADD";
                    addBtn.dataset.productId = product.id;

                    let detailBtn = document.createElement("button");
                    detailBtn.textContent = "MORE DETAILS";
                    detailBtn.dataset.productId = product.id;

                    figcaption.appendChild(productName);
                    figcaption.appendChild(productPrice);
                    figcaption.appendChild(addBtn);
                    figcaption.appendChild(detailBtn);

                    figure.appendChild(img);
                    figure.appendChild(figcaption);

                    productSection.appendChild(figure);
                }
            });
    }

});