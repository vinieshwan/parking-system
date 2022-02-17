const Reducer = (state, action) => {
	switch (action.type) {
		case 'SET_PARKING_COMPLEX':
			return {
				...state,
				parkingComplex: action.payload
			};
		case 'SET_ENTRY_POINTS':
			return {
				...state,
				entryPoints: action.payload
			};
		case 'SET_SELECTED_SLOT':
			return {
				...state,
				selectedSlot: action.payload
			};
		case 'SET_ERROR':
			return {
				...state,
				error: action.payload
			};
		default:
			return state;
	}
};

export default Reducer;
