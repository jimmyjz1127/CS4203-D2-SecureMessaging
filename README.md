# CS4203-D2


# Files
.
├── client /                        : Contains all client code 
│   ├── node_modules                : Contains dependencies 
│   └── src /                       
│       └── components/             : Contains react components 
│       |   ├── pages /             
│       |   │   ├── expire/         : Contains code for token expiry page 
│       |   │   ├── home/           : Contains logic for retrieving group data 
│       |   │   ├── login/          : Contains logic for login protocol 
│       |   │   └── register/       : Contains logic of registration protocol 
│       │   └── modals /
│       │       ├── message         : Contains code for message bubbles 
│       │       └── MessageModal    : Contains logic for send/retrieve messages, group creation and management 
│       ├── App.js                  : Root react component 
│       └── Config.js               : Contains server port and url 
└── server /
    ├── node_modules                : Server side dependencies 
    ├── src /
    │   ├── authentication /
    │   │   ├── authenation.js      : Code for checking JWT token signature validity 
    │   │   └── token.js            : Contains code for generating JWT Tokens 
    │   ├── routes /
    │   │   └── index.js            : Contains all HTTP route handlers 
    │   ├── config.js               : Contains url and port configurations, and database connection config
    │   ├── database_init.tx        : Contains DDL for creating database (NOT DUMP FILE)
    │   ├── database.js             : Contains SQL prepared statement functions 
    │   ├── pool.js                 : Contains code for connecting to SQL server (my host server)
    │   └── server.js               : Contains functionality for starting server and setting up dependencies 
    └── .env                        : Contains secrets used for signing JWT Tokens 


# Instructions 

## To Run Application 
    1. Execute the following command in both the "client" and "server" directory : npm install
    2. Navigate to : ./server
    3. Execute in terminal : npm run dev 
    4. Application should automatically open browser to url of application (should take 10-15 seconds)
    5. If not, manually open browser and navigate to : http://localhost:3030 

## To Change port that client runs on 
    1. Navigate to : ./client 
    2. Open package.json 
    3. Locate the "scripts" element 
    4. Locate line in the scripts elements containing : PORT=3030 react-scripts start (should be around line 25)
    5. Change the number 3030 to your port of choice 
    6. Navigate to : ./server/src
    7. Open config.js 
    8. Locate variable : client_port 
    9. Change value of client_port to port of choice 

## To Change port that server runs on 
    1. Navigate to : ./server/src 
    2. Open config.js 
    3. Locate variable server_port 
    4. Change value to port of choice 
    5. Navigate to : ./client/src
    6. Open config.js 
    7. Locate variable server_port 
    8. Change value to port of choice  

## To configure database 
    1. Navigate to : ./server/src 
    2. Open config.js 
    3. locate the variable : db_config 
    4. Change field values to your respective MySql server configurations 

## Database setup with dump file 
    1. The dump file is located at : ./server/CS4203_Dump.sql 
    2. SSH into your host server : <username>.teaching.cs.st-andrews.ac.uk
    3. Run the following command in terminal to get your MariaDB credentials : mysql-initial-settings 
    4. This will return your MariaDB credentials which will need be set in the following file : ./server/src/config.js (the db_config variable)
    5. This will also return the command needed to launch the MariaDB command line interface which you must run  
    6. Create a database : CREATE DATABASE [database name];
    7. Exit the MariaDB Command line interface : exit;
    8. Run the following command to dump the dump file into the newly created database : mysql -u [MariaDB username] -p [database name] < [path/to/dump/file.sql] 
    9. This should automatically execute the dump file SQL DDL statements to create the necessary tables and triggers 

