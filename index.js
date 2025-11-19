document.addEventListener("DOMContentLoaded", () => {

    let pageButtons = document.querySelectorAll("button");

    loadData();

    //Adds an event listener to all the buttons
    pageButtons.forEach(button => {
    button.addEventListener("click", (e) => {
        if (pageButtonClicked(e.target.id)) {
            changePage(e.target.id);
        }
    });
});
    
    // Verifies if the data is currently stored and 
    // If the data is not stored then it gets the data.
    async function loadData() {
            const savedData = localStorage.getItem("products");

            if (savedData) {
                return JSON.parse(savedData);
            }

            const response = await fetch("https://gist.githubusercontent.com/rconnolly/...");
            const data = await response.json();

            localStorage.setItem("products", JSON.stringify(data));

            return data;
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
    function changePage(viewId) {
            const views = ["home-view", "women-view", "men-view" ,"browse-view", "product-view", "cart-view"];

            views.forEach(view => {
                document.getElementById(view).classList.add("hidden");
            });

            document.getElementById(`${viewId}-view`).classList.remove("hidden");
    }


});