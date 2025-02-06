import { ClearSearchParams } from "./common.js";

const navbar_items = document.getElementById("navbar").children;
const sub_pages = document.getElementsByClassName("sub-page");
const sub_page_names = ["about", "resume", "projects"];
let current_active_subpage = -1;

function InitSubPage() {
	const url = new URL(window.location.href);
	const requested_tab = url.searchParams.get("tab");
	const previous_tab = localStorage.getItem("current_active_subpage");
	let desired_tab = 1;
	
	if (requested_tab && sub_page_names.includes(requested_tab.toLowerCase()))
		desired_tab = sub_page_names.indexOf(requested_tab.toLowerCase())
	else if (previous_tab != undefined)
		desired_tab = previous_tab;
	
	ClearSearchParams();
	SelectSubPage(desired_tab);
}

function SelectSubPage(idx) {
	if (idx != current_active_subpage) {
		if (current_active_subpage != -1) {
			navbar_items[current_active_subpage].classList.remove("active");
			sub_pages[current_active_subpage].classList.add("hidden");
		}
		current_active_subpage = idx;
		navbar_items[current_active_subpage].classList.add("active");
		sub_pages[current_active_subpage].classList.remove("hidden");
		localStorage.setItem("current_active_subpage", idx);
	}
}

Array.from(navbar_items).forEach((elem, idx) => {
	elem.onclick = () => { SelectSubPage(idx); }
});

InitSubPage();