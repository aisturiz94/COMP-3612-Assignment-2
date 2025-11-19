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











//NOT REMOTHLY FINISHFED
    // function renderBrowseGrid(grid,items) {
    //     const gridTemplate = document.querySelector("product-card-template");
    // }

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