// Constants
const WHITE = 0, BLACK = 1;
const PAWN = 0, KNIGHT = 1, BISHOP = 2, ROOK = 3, QUEEN = 4, KING = 5;
const BACK_RANK_PIECES = [ROOK, KNIGHT, BISHOP, QUEEN, KING, BISHOP, KNIGHT, ROOK];
const PROMOTION_OPTIONS = [QUEEN, ROOK, BISHOP, KNIGHT];
const SIDES = ["w", "b"];
const PIECES = ["p", "n", "b", "r", "q", "k"];
const SIDE = 0, PIECE = 1;
const PAWN_RANK = [6, 1];
const BACK_RANK = [7, 0];

const FLIP_BOARD = false;

// HTML elements
const board_element = document.getElementById("board");
const modal = document.getElementById("modal");
const victory_text = document.getElementById("victory-popup-text");
const play_again_button = document.getElementById("play-again-button");
const promotion_container = document.getElementById("promotion-container");
const w_promotion_panel = document.getElementById("white-promotion-panel");
const b_promotion_panel = document.getElementById("black-promotion-panel");

// Game State
const game_state = {
	board: new Array(64),
	turn: WHITE,
	current_selection: -1,
	promotion_tile: -1,
	all_moves: [[], []],
	current_moves: [],
	castle: [[true, true], [true, true]],
	en_passant: -10
};

// Utility Functions
function GetTurn() {
	return game_state.turn & 1;
}

function GetDirection() {
	return GetTurn() * 2 - 1
}

function IsValidIndex(index) {
	return (index >= 0 && index < 64);
}

function IsValidCoordinate(r, f) {
	return (r >= 0 && r < 8 && f >= 0 && f < 8);
}

function GetIndex(r, f) {
	return IsValidCoordinate(r, f) ? (r * 8 + f) : -1;
}

function GetCoordinate(index) {
	return IsValidIndex(index) ? [(index / 8) >> 0, index % 8] : -1;
}

function GetPiece(index) {
	return IsValidIndex(index) ? game_state.board[index] : [-1, -1];
}

function SetPiece(index, p) {
	game_state.board[index] = p;
	board_element.children[index].innerHTML = "";
	if (p[SIDE] != -1 && p[PIECE] != -1) {
		let piece = document.createElement("img");
		piece.src = "./images/" + SIDES[p[SIDE]] + PIECES[p[PIECE]] + ".svg";
		board_element.children[index].appendChild(piece);
	}
}

function MovePiece(src, dst) {
	const piece = GetPiece(src);
	const turn = GetTurn();
	const en_passant = game_state.en_passant;
	game_state.en_passant = -10;
	
	// Remove Castling Rights
	if (piece[PIECE] == KING) {
		game_state.castle[turn] = [false, false];
		if (Math.abs(dst - src) == 2) {
			const dir = (dst - src) >> 1;
			SetPiece(GetIndex(BACK_RANK[GetTurn()], ((dir + 1) >> 1) * 7), [-1, -1]);
			SetPiece(dst - dir, [GetTurn(), ROOK]);
		}
	}
	else if (piece[PIECE] == ROOK) {
		if (src == [56, 0][turn])
			game_state.castle[GetTurn()][0] = false;
		else if (src == [63, 7][turn])
			game_state.castle[GetTurn()][1] = false;
	}
	else if (piece[PIECE] == PAWN) {
		// Set en passant
		if (Math.abs(dst - src) == 16)
			game_state.en_passant = dst;
		// Capture en passent
		else if (en_passant == dst - (GetDirection() * 8))
			SetPiece(en_passant, [-1, -1]);
		// Promote Pawn
		else if (dst < 8 || dst >= 56)
			StartPromotion(turn, dst);
	}

	if (GetPiece(dst)[PIECE] == KING) {
		board_element.classList.add("blurred");
		victory_text.innerHTML = ["White", "Black"][game_state.turn & 1] + " Wins!";
		modal.classList.remove("hidden");
	}
	SetPiece(dst, piece);
	SetPiece(src, [-1, -1]);
	game_state.turn += 1;
	if (FLIP_BOARD)
		board_element.classList.toggle("flip");
}

function GetMoveType(sr, sf, dr, df) {
	const piece = GetPiece(GetIndex(dr, df));
	if (!IsValidCoordinate(dr, df) || piece[SIDE] == GetTurn())
		return -1;
	return piece[SIDE] == (1 - GetTurn()) ? 1 : 0;
}

function GetDirectionalMoves(sr, sf, dr, df, dist = 8) {
	let moves = [];
	let nr = sr, nf = sf;
	while(dist > 0) {
		nr += dr;
		nf += df;
		const move_type = GetMoveType(sr, sf, nr, nf);
		if (move_type == -1)
			break
		moves.push(GetIndex(nr, nf));
		if (move_type == 1)
			break;
		dist -= 1;
	}
	return moves;
}

function GetPawnMoves(r, f) {
	const dr = GetDirection();
	let moves = [];
	// Push
	if (GetMoveType(r, f, r+dr, f) == 0) {
		moves.push(GetIndex(r+dr, f));
		if (r == PAWN_RANK[GetTurn()] && GetMoveType(r, f, r+(dr*2), f) == 0)
			moves.push(GetIndex(r+(dr*2), f));
	}
	for (const df of [-1, 1])
		// Capture left/right
		if (GetMoveType(r, f, r+dr, f+df) == 1 || game_state.en_passant == GetIndex(r, f+df))
			moves.push(GetIndex(r+dr, f+df));
	return moves;
}

function GetKnightMoves(r, f) {
	let moves = [];
	for (const df of [-2, 2])
		for (const dr of [-1, 1])
			if (GetMoveType(r, f, r+dr, f+df) != -1)
				moves.push(GetIndex(r+dr, f+df));
	for (const df of [-1, 1])
		for (const dr of [-2, 2])
			if (GetMoveType(r, f, r+dr, f+df) != -1)
				moves.push(GetIndex(r+dr, f+df));
	return moves;
}

function GetBishopMoves(r, f) {
	return GetDirectionalMoves(r, f, -1, -1)
	.concat(GetDirectionalMoves(r, f, 1, -1))
	.concat(GetDirectionalMoves(r, f, -1, 1))
	.concat(GetDirectionalMoves(r, f, 1, 1));
}

function GetRookMoves(r, f) {
	return GetDirectionalMoves(r, f, -1, 0)
	.concat(GetDirectionalMoves(r, f, 1, 0))
	.concat(GetDirectionalMoves(r, f, 0, -1))
	.concat(GetDirectionalMoves(r, f, 0, 1));
}

function GetQueenMoves(r, f) {
	return GetBishopMoves(r, f)
	.concat(GetRookMoves(r, f));
}

function GetKingMoves(r, f) {
	const moves = GetDirectionalMoves(r, f, -1, -1, 1)
	.concat(GetDirectionalMoves(r, f,  1, -1, 1))
	.concat(GetDirectionalMoves(r, f, -1,  1, 1))
	.concat(GetDirectionalMoves(r, f,  1,  1, 1))
	.concat(GetDirectionalMoves(r, f, -1,  0, 1))
	.concat(GetDirectionalMoves(r, f,  1,  0, 1))
	.concat(GetDirectionalMoves(r, f,  0, -1, 1))
	.concat(GetDirectionalMoves(r, f,  0,  1, 1));

	if (game_state.castle[GetTurn()][0] && GetPiece(GetIndex(r, f-1))[SIDE] == -1 && GetPiece(GetIndex(r, f-2))[SIDE] == -1)
		moves.push(GetIndex(r, f-2))
	if (game_state.castle[GetTurn()][1] && GetPiece(GetIndex(r, f+1))[SIDE] == -1 && GetPiece(GetIndex(r, f+2))[SIDE] == -1)
		moves.push(GetIndex(r, f+2))
	
	return moves;
}

function GetValidMoves(r, f) {
	const piece = GetPiece(GetIndex(r, f));
	if (piece[SIDE] != GetTurn())
		return [];
	switch (piece[PIECE]) {
	case PAWN:
		return GetPawnMoves(r, f);
	case KNIGHT:
		return GetKnightMoves(r, f);
	case BISHOP:
		return GetBishopMoves(r, f);
	case ROOK:
		return GetRookMoves(r, f);
	case QUEEN:
		return GetQueenMoves(r, f);
	case KING:
		return GetKingMoves(r, f);
	}
}

function UpdateValidMoves(moves) {
	for (const move of game_state.current_moves)
		board_element.children[move].classList.remove("move");
	game_state.current_moves = moves;
	for (const move of game_state.current_moves)
		board_element.children[move].classList.add("move");
}

function SelectTile(index) {
	if (index == game_state.current_selection)
		return;
	
	const [r, f] = GetCoordinate(index);
	if (game_state.current_selection != -1) { // There is already a piece selected
		board_element.children[game_state.current_selection].classList.remove("selected");
		if (game_state.current_moves.indexOf(index) != -1) {
			MovePiece(game_state.current_selection, index);
			UpdateValidMoves([]);
			game_state.current_selection = -1;
			return;
		}
	}

	UpdateValidMoves(GetValidMoves(r, f));
	if (GetPiece(GetIndex(r, f))[SIDE] == GetTurn())
		board_element.children[index].classList.add("selected");
	game_state.current_selection = index;
}

function TileOnclick(e) {
	SelectTile(parseInt(e.target.dataset.index));
}

function GetPromotionPanel(side) {
	return [w_promotion_panel, b_promotion_panel][side];
}

function PromotePiece(e) {
	const side = 1 - GetTurn();
	SetPiece(game_state.promotion_tile, [side, PROMOTION_OPTIONS[e.target.dataset.index]]);
	promotion_container.classList.add("hidden");
	GetPromotionPanel(side).classList.add("hidden");
}

function StartPromotion(side, position) {
	game_state.promotion_tile = position;
	promotion_container.classList.remove("hidden");
	GetPromotionPanel(side).classList.remove("hidden");
}

function InitPromotionPanel(side) {
	const promotion_panel = GetPromotionPanel(side);
	for (let i = 0; i < 4; i++) {
		let tile = document.createElement("div");
		tile.classList.add("tile");
		tile.onclick = PromotePiece;
		tile.dataset.index = i;
		let piece = document.createElement("img");
		piece.src = "./images/" + SIDES[side] + PIECES[PROMOTION_OPTIONS[i]] + ".svg";
		tile.appendChild(piece);
		promotion_panel.appendChild(tile);
	}
	promotion_panel.classList.add("hidden");
}

function InitBoard() {
	modal.classList.add("hidden");
	board_element.innerHTML = "";
	board_element.classList.remove("blurred");
	game_state.turn = WHITE;
	
	for (let i = 0; i < 64; i++) {
		let tile = document.createElement("div");
		tile.classList.add("tile");
		tile.classList.add(["white", "black"][(i + i / 8) & 1]);
		tile.onclick = TileOnclick;
		tile.dataset.index = i;
		game_state.board[i] = [-1, -1];
		board_element.appendChild(tile);
	}
	
	for (let i = 0; i < 8; i++) {
		SetPiece(GetIndex(0, i), [BLACK, BACK_RANK_PIECES[i]]);
		SetPiece(GetIndex(1, i), [BLACK, PAWN]);
		SetPiece(GetIndex(6, i), [WHITE, PAWN]);
		SetPiece(GetIndex(7, i), [WHITE, BACK_RANK_PIECES[i]]);
	}
	
	InitPromotionPanel(WHITE);
	InitPromotionPanel(BLACK);
}

play_again_button.onclick = InitBoard;
InitBoard();