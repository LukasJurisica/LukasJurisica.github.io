const colours = ["White", "Black"]
const main_board = document.getElementById("standard-board");
const white_bench = document.getElementById("white-bench");
const black_bench = document.getElementById("black-bench");

const boards = [white_bench, black_bench, main_board];
	
let game_state = {
	turn: 0,
	board: [],
	moves: [],
	selected_piece: [-1, -1]
};

function PrintPiece(piece) {
	return colours[piece[0]] + " " + pieces[piece[1]]
}

// Standard Board Utility Functions

function CollectValidMoves() {
	if (game_state.selected_piece[0] == -1)
		return;
	const current_selected_piece = GetTopPiece(game_state.selected_piece)[1];

	game_state.moves = [];
	for (let index = 0; index < 9; index++)
		if (current_selected_piece > GetTopPiece([2, index])[1])
			game_state.moves.push(index);
}

function GetTopPiece(source) {
	const board = source[0];
	const index = source[1];
	
	if (board == 2) {
		const tile = game_state.board[index];
		for (let i = 2; i >= 0; i--)
			if (tile[i] != -1)
				return [tile[i], i]
	} else if (board >= 0 && board <= 1) {
		return [board, index >> 1];
	}
	return [-1, -1]
}

function MovePiece(source, dest) {
	let src_piece = GetTopPiece(source);
	const dest_piece = GetTopPiece(dest);
	
	// Update Game State
	game_state.board[dest[1]][src_piece[1]] = src_piece[0];
	if (source[0] == 2)
		game_state.board[source[1]][src_piece[1]] = -1;

	// Update UI
	const dest_tile = boards[dest[0]].children[dest[1]];
	const source_tile = boards[source[0]].children[source[1]];
	
	dest_tile.innerHTML = "";
	dest_tile.appendChild(CreatePiece(src_piece));
	
	source_tile.innerHTML = "";
	if (source[0] == 2)
		source_tile.appendChild(CreatePiece(GetTopPiece(source)));
}

function CreatePiece(data) {
	const piece = document.createElement("div");
	piece.classList.add("piece");
	piece.classList.add(["small", "medium", "big"][data[1]]);
	piece.classList.add(["white", "black"][data[0]]);
	return piece;
}

function ClearSelectedPieces() {
	const prev_selected = document.getElementsByClassName("selected");
	for (let i = 0; i < prev_selected.length; i++)
		prev_selected[i].classList.remove("selected");
	game_state.selected_piece = [-1, -1];
}

function SelectPiece(source) {
	ClearSelectedPieces();
	boards[source[0]].children[source[1]].children[0].classList.add("selected");
	game_state.selected_piece = [source[0], source[1]];
	CollectValidMoves();
}

function CheckWinCondition(x, y, dx, dy) {
	const a = GetTopPiece([2, y * 3 + x]);
	x += dx; y += dy;
	const b = GetTopPiece([2, y * 3 + x]);
	x += dx; y += dy;
	const c = GetTopPiece([2, y * 3 + x]);
	return (a[0] == b[0]) && (b[0] == c[0]) && (c[0] != -1);
}

function CheckWinConditions() {
	let result = false;
	for (let i = 0; i < 3; i++) {
		result |= CheckWinCondition(i, 0, 0, 1);
		result |= CheckWinCondition(0, i, 1, 0);
	}
	result |= CheckWinCondition(0, 0, 1, 1);
	result |= CheckWinCondition(2, 0, -1, 1);
	return result != 0;
}

function TrySelectTile(board, index) {
	if (board == 2) { // Playing Board
		const src_piece = GetTopPiece(game_state.selected_piece)
		const dest_piece = GetTopPiece([2, index]);

		if (src_piece[0] == (game_state.turn & 1) && game_state.moves.includes(index)) {
			MovePiece(game_state.selected_piece, [2, index]);
			if (CheckWinConditions()) {
				document.getElementById("victory-text").innerHTML = colours[game_state.turn & 1] + " Wins!";
				document.getElementById("modal-container").classList.remove("hidden");
			}
			game_state.turn += 1;
			ClearSelectedPieces();
		} else if (dest_piece[0] == (game_state.turn & 1) && GetTopPiece([2, index])[0] != -1) {
			SelectPiece([board, index]);
		}
	}
	else { // Benches
		if ((game_state.turn & 1) != board) // Not that player's turn
			return;
		if (boards[board].children[index].children.length == 0) // That piece has already been used
			return;
		SelectPiece([board, index]);
	}
}

function ResetBoard() {
	document.getElementById("modal-container").classList.add("hidden");

	// Initialize board
	main_board.innerHTML = "";
	game_state.board = [];
	for (let i = 0; i < 9; i++) {
		game_state.board.push([-1, -1, -1]);
		
		const tile = document.createElement("div");
		tile.classList.add("tile");
		tile.classList.add(i & 1 ? "black" : "white");
		tile.onclick = () => { TrySelectTile(2, i) };
		main_board.appendChild(tile);
	}
	
	// Initialize benches
	game_state.selected_piece = [-1, -1]
	for (let b = 0; b < 2; b++) {
		boards[b].innerHTML = "";
		for (let i = 0; i < 6; i++) {
			const tile = document.createElement("div");
			tile.classList.add("tile");
			tile.appendChild(CreatePiece([b, i >> 1]));
			tile.onclick = () => { TrySelectTile(b, i); };
			boards[b].appendChild(tile);
		}
	}
		
	game_state.turn = 0;
}

document.getElementById("replay-button").onclick = ResetBoard;
ResetBoard();