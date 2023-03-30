# Transformer

The transformer is a python server that recieves the data from the embedded module and store it to the database.

## Workflow

The server listen on a port to recieve data on cbor format. The data is parsed to JSON format then sent to the database.

## Notes

For now, the server is in python because it was the easiest way to implement it and python is a good langage to do a proof of concept.
