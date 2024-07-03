const navbar_items = document.getElementById("navbar").children;
const sub_pages = document.getElementsByClassName("sub-page");
let current_active_subpage = 1;

function SelectSubPage(idx) {
	navbar_items[current_active_subpage].classList.remove("active");
	sub_pages[current_active_subpage].classList.add("hidden");
	current_active_subpage = idx;
	navbar_items[current_active_subpage].classList.add("active");
	sub_pages[current_active_subpage].classList.remove("hidden");
}

Array.from(navbar_items).forEach((elem, idx) => {
	elem.onclick = () => { SelectSubPage(idx); }
});

SelectSubPage(current_active_subpage);