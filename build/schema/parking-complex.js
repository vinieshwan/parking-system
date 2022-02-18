module.exports = {
	bsonType: 'object',
	required: [
		'name',
		'flatRate',
		'continuousHourThreshold',
		'dayRate',
		'createdAt',
		'updatedAt'
	],
	properties: {
		name: {
			bsonType: 'string',
			description: 'Name of the parking complex.'
		},
		parkingSlots: {
			bsonType: 'array',
			description: 'Contains list of parking slot ids.'
		},
		entryPoints: {
			bsonType: 'array',
			description: 'Contains list of entry points ids.'
		},
		flatRate: {
			bsonType: 'object',
			required: ['rate', 'hours'],
			properties: {
				rate: {
					bsonType: 'int',
					description: 'The flat rate.'
				},
				hours: {
					bsonType: 'int',
					description: 'The length of hours the flat rate may take effect.'
				}
			},
			description:
				'The initial rate when a vehicle parks for the defined hour length.'
		},
		dayRate: {
			bsonType: 'int',
			description: 'Rate per 24 hour.'
		},
		continuousHourThreshold: {
			bsonType: 'int',
			description:
				'Number of hours will the vehicle can still be considered on a continuous rate.'
		},
		createdAt: {
			bsonType: 'date',
			description: 'The date the parking complex was added to the system.'
		},
		updatedAt: {
			bsonType: 'date',
			description: 'The latest date the parking complex object was updated.'
		}
	}
};
