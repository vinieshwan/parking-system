module.exports = {
	bsonType: 'object',
	required: ['name', 'parkingComplexId', 'createdAt', 'updatedAt'],
	properties: {
		name: {
			bsonType: 'string',
			description: 'Name of the parking complex.'
		},
		parkingComplexId: {
			bsonType: 'objectId',
			description: 'Id of the parking complex the entry point belongs to.'
		},
		createdAt: {
			bsonType: 'date',
			description: 'The date the entry point was added to the system.'
		},
		updatedAt: {
			bsonType: 'date',
			description: 'The latest date the entry point object was updated.'
		}
	}
};
