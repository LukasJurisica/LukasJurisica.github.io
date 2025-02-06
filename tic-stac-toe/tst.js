// Constants
const SIDES = ["White", "Black"];
const WHITE = 0, BLACK = 1;
const SIDE = 0, SIZE = 1;

// HTML elements
const board_element = document.getElementById("board");
const modal = document.getElementById("modal");
const victory_text = document.getElementById("victory-popup-text");
const play_again_button = document.getElementById("play-again-button");

let game_state = {
	board: new Array(21),
	turn: 0,
	current_selection: -1
};

function IsWhiteIndex(index) {
	return index >= 0 && index <= 5;
}

function IsBoardIndex(index) {
	return index >= 6 && index <= 14;
}

function IsBlackIndex(index) {
	return index >= 15 && index <= 20;
}

function GetTurn() {
	return game_state.turn & 1;
}

function GetPiece(index) {
	return game_state.board[index].at(-1);
}

function GetBoardIndex(x, y) {
	return ((x + 2) * 3 + y);
}

function RenderPiece(index, [side, size]) {
	if (side != -1) {
		let piece = document.createElement("div");
		piece.classList.add("piece");
		piece.classList.add(["white", "black"][side]);
		piece.classList.add(["small", "medium", "large"][size]);
		board_element.children[index].appendChild(piece);
	}
}

function SetPiece(index, p) {
	board_element.children[index].innerHTML = "";
	if (p[SIDE] != -1 && p[SIZE] != -1) {
		game_state.board[index].push(p);
		RenderPiece(index, p);
	} else {
		game_state.board[index].pop();
		RenderPiece(index, GetPiece(index));
	}
}

function MovePiece(src, dst) {
	SetPiece(dst, GetPiece(src));
	SetPiece(src, [-1, -1]);
	const win = CheckWinConditions();
	if (win != -1) {
		board_element.classList.add("blurred");
		victory_text.innerHTML = SIDES[win] + " Wins!";
		modal.classList.remove("hidden");
	}
	game_state.turn += 1;
}

function SelectTile(index) {
	if (index == game_state.current_selection)
		return;
	else if (game_state.current_selection != -1) {
		board_element.children[game_state.current_selection].classList.remove("selected");
		const piece = GetPiece(game_state.current_selection);
		if (IsBoardIndex(index) && piece[SIDE] == GetTurn() && GetPiece(index)[SIZE] < piece[SIZE]) {
			MovePiece(game_state.current_selection, index);
			game_state.current_selection = -1;
			return;
		}
	}
	if (GetPiece(index)[SIDE] == GetTurn())
		board_element.children[index].classList.add("selected");
	game_state.current_selection = index;
}

function CheckWinCondition(x, y, dx, dy) {
	const a = GetPiece(GetBoardIndex(x, y));
	const b = GetPiece(GetBoardIndex(x + dx, y + dy));
	const c = GetPiece(GetBoardIndex(x + dx + dx, y + dy + dy));
	return ((a[SIDE] == b[SIDE]) && (b[SIDE] == c[SIDE])) ? a[SIDE] : -1;
}

function CheckWinConditions() {
	let result;
	for (let i = 0; i < 3; i++) {
		result = CheckWinCondition(i, 0, 0, 1); // Vertical
		if (result != -1) return result;
		result = CheckWinCondition(0, i, 1, 0); // Horizontal
		if (result != -1) return result;
	}
	// Diagonals
	result = CheckWinCondition(0, 0, 1, 1);
	if (result != -1) return result;
	result = CheckWinCondition(2, 0, -1, 1);
	if (result != -1) return result;
	
	return -1;
}

function TileOnclick(e) {
	SelectTile(parseInt(e.target.dataset.index));
}

function InitBoard() {
	modal.classList.add("hidden");
	board_element.innerHTML = "";
	board_element.classList.remove("blurred");
	game_state.turn = 0;
	
	for (let i = 0; i < (3 * 7); i++) {
		let tile = document.createElement("div");
		tile.classList.add("tile");
		if (IsBoardIndex(i))
			tile.classList.add(["white", "black"][i & 1]);
		tile.onclick = TileOnclick;
		tile.dataset.index = i;
		game_state.board[i] = [[-1, -1]];
		board_element.appendChild(tile);
	}
	
	for (let i = 0; i < 3; i++) {
		SetPiece(0 + i, [WHITE, i]);
		SetPiece(3 + i, [WHITE, i]);
		SetPiece(15 + i, [BLACK, i]);
		SetPiece(18 + i, [BLACK, i]);
	}
}

play_again_button.onclick = InitBoard;
InitBoard();