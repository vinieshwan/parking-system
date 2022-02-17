module.exports = {
	bsonType: 'object',
	required: [
		'name',
		'type',
		'distances',
		'parkingComplexId',
		'ratePerHour',
		'isOccupied',
		'createdAt',
		'updatedAt'
	],
	properties: {
		name: {
			bsonType: 'string',
			description: 'Name of the parking slot.'
		},
		type: {
			bsonType: 'int',
			enum: [0, 1, 2],
			description:
				'Slot type. 0 for small size vehicles, 1 for medium size vehicles and 2 for large size vehicles.'
		},
		distances: {
			bsonType: 'object',
			description:
				'The map of distance from the slot to all entry points. Should contain a key/value pair of entryPointId and its distance.'
		},
		parkingComplexId: {
			bsonType: 'objectId',
			description: 'The parking complex id this slot belongs to.'
		},
		ratePerHour: {
			bsonType: 'int',
			description: 'The rate per hour when occupying the slot.'
		},
		isOccupied: {
			bsonType: 'bool',
			description:
				'Identifier when checking the availability status of the slot.'
		},
		createdAt: {
			bsonType: 'date',
			description: 'The date the parking slot was added to the system.'
		},
		updatedAt: {
			bsonType: 'date',
			description: 'The latest date the parking slot object was updated.'
		}
	}
};
