# Dot.cards Backend technical assessment

## General information and structure
<br> 
A generic database proxy - that is, a REST API for CRUD on a SQL database - using Typescript and Node.JS. Translates REST language into valid SQL statements using API endpoint handlers, written in Typescript/Node. Used the server framework Express and MySQL. The database proxy implements a system to ingest schema files (JSON files) from a folder named "schemas" inside the root project folder, and builds the database schema based on that on server startup. All the JSON files that you want to be ingested will have to be included inside the "schemas" folder.
<br>
<br>
The CRUD(Create, Read, Update and Delete) SQL statements map to: 
<br> Create --> POST /:collection
<br> Read --> GET /:collection/:id
<br> Update --> POST /:collection/:id 
<br> Delete --> DELETE /:collection/:id

The database proxy checks for the existence of the tables specified by our example schema and creates/adds columns if not detected. The database is defined as a mysql docker image, and both Docker and docker-compose files are included in a folder named "docker" inside the root folder.

## What additional changes you might need to make if the application were intended to run in a concurrent environment
<br>
If the application were intended to run in a concurrent environment, we would need to handle certain parameters to ensure data consistency and data integrity. To manage database connections effectively, we can use the connection pool to share database connections between concurrent requests. We will need to use concurrency control techniques to handle multiple simultaneous updates to the same record, based on the requirements of the system. This could also involve error handling and validation. To manage any shared resources, we can use multithreading techniques such as locks. We can test the system for various loads by scaling up step by step, to observe performance at each level and identify any issues. We will need a proper logging system in place to monitor real-time processing and performance.
