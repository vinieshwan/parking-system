'use strict';

module.exports = {
	ListEntryPointsRoute: require('./entry-points/list'),
	GetParkingComplexRoute: require('./parking-complex/get'),
	ParkHistoryRoute: require('./parking-histories/park'),
	UnparkHistoryRoute: require('./parking-histories/unpark'),
	GetParkingSlotRoute: require('./parking-slots/get'),
	AddEntryPointsRoute: require('./entry-points/add')
};
