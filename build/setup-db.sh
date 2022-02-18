#!/bin/bash
export $(cat .env | xargs)

checkServerStatus(){
	SERVER=$1
	PORT=$2
	mongosh --host $SERVER --port $PORT --eval db
	while [ "$?" -ne 0 ]
	do
		echo "Waiting for $SERVER to start up ======>>>>>>>"
		sleep 1
		mongosh --host $SERVER --port $PORT --eval db
	done
}


if [ $NO_OF_ENTRYPOINTS -lt 3 ]; then exit 0; fi

checkServerStatus "mongodb5" "27017"

sleep 10

mongosh --host "mongodb5" --port "27017" "./setup-db.js"