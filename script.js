import { ClearSearchParams } from "./common.js";

const navbar_items = document.getElementById("navbar").children;
const sub_pages = document.getElementsByClassName("sub-page");
const sub_page_names = ["about", "resume", "projects"];
let current_active_subpage = -1;

function InitSubPage() {
	try {
		const url = new URL(window.location.href);
		const requested_tab = url.searchParams.get("tab");
		const previous_tab = localStorage.getItem("current_active_subpage");
		let desired_tab = 1;
		
		if (requested_tab && sub_page_names.includes(requested_tab.toLowerCase()))
			desired_tab = sub_page_names.indexOf(requested_tab.toLowerCase())
		else if (previous_tab != undefined)
			desired_tab = parseInt(previous_tab);
		
		ClearSearchParams();
		SelectSubPage(desired_tab);
	} catch (error) {
		console.error('Error initializing sub page:', error);
		// Fallback to default tab
		SelectSubPage(1);
	}
}

function SelectSubPage(idx) {
	try {
		if (idx != current_active_subpage) {
			if (current_active_subpage != -1) {
				navbar_items[current_active_subpage].classList.remove("active");
				navbar_items[current_active_subpage].setAttribute("aria-selected", "false");
				sub_pages[current_active_subpage].classList.add("hidden");
				sub_pages[current_active_subpage].setAttribute("aria-hidden", "true");
			}
			current_active_subpage = idx;
			navbar_items[current_active_subpage].classList.add("active");
			navbar_items[current_active_subpage].setAttribute("aria-selected", "true");
			sub_pages[current_active_subpage].classList.remove("hidden");
			sub_pages[current_active_subpage].setAttribute("aria-hidden", "false");
			localStorage.setItem("current_active_subpage", idx);
			
			// Focus management for accessibility
			sub_pages[current_active_subpage].focus();
		}
	} catch (error) {
		console.error('Error switching tabs:', error);
		// Fallback to default tab
		SelectSubPage(1);
	}
}

// Add keyboard navigation support
function handleKeyboardNavigation(event) {
	const currentIndex = current_active_subpage;
	
	switch(event.key) {
		case 'ArrowLeft':
			event.preventDefault();
			const prevIndex = currentIndex > 0 ? currentIndex - 1 : navbar_items.length - 1;
			SelectSubPage(prevIndex);
			break;
		case 'ArrowRight':
			event.preventDefault();
			const nextIndex = currentIndex < navbar_items.length - 1 ? currentIndex + 1 : 0;
			SelectSubPage(nextIndex);
			break;
		case 'Home':
			event.preventDefault();
			SelectSubPage(0);
			break;
		case 'End':
			event.preventDefault();
			SelectSubPage(navbar_items.length - 1);
			break;
	}
}

// Add click handlers with accessibility
Array.from(navbar_items).forEach((elem, idx) => {
	elem.onclick = () => { SelectSubPage(idx); }
	
	// Add keyboard support for individual tabs
	elem.addEventListener('keydown', (event) => {
		if (event.key === 'Enter' || event.key === ' ') {
			event.preventDefault();
			SelectSubPage(idx);
		}
	});
});

// Add global keyboard navigation
document.addEventListener('keydown', (event) => {
	// Only handle navigation when focus is on navbar or main content
	const activeElement = document.activeElement;
	const isInNavbar = activeElement.closest('#navbar-container');
	const isInMain = activeElement.closest('main');
	
	if (isInNavbar || isInMain) {
		handleKeyboardNavigation(event);
	}
});

// Initialize the page
InitSubPage();