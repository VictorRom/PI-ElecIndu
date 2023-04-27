import socket as sock
import CborToJson as cbj
import pymongo as pm

FROM_CONNECTED_USER = "from connected user: "
MONGO_URL_EXAMPLE_LOCALHOST = "mongodb://root:example@localhost:27017"
CBOR_RECIEVED = "Cbor recieved"
RECIEVED_FROM_CLIENT = "Nothing recieved from client"


def server_program(host, port, callback):
    server_socket = sock.socket()  # get instance
    server_socket.bind((host, port))  # bind host address and port together

    # configure how many client the server can listen simultaneously
    server_socket.listen(2)
    conn, address = server_socket.accept()  # accept new connection
    print(f"Connection from: {str(address)}")

    while True:
        # receive data stream. it won't accept data packet greater than 1024 bytes
        data = conn.recv(1024)
        if not data: break  # if data is not received break
        res = callback(data)
        if res is not None:
            conn.send(res.encode())  # send data to the client

    conn.close()  # close the connection


def handleData(data):
    if data != None:
        recieved_msg = cbj.getJSON(data)
        print(FROM_CONNECTED_USER, print(recieved_msg))

        # TODO extract code to be complient with the database
        client = pm.MongoClient(MONGO_URL_EXAMPLE_LOCALHOST)
        client["test"]["test"].insert_one(recieved_msg)
        client.close()

        return CBOR_RECIEVED
    return RECIEVED_FROM_CLIENT


if __name__ == '__main__':
    server_program(sock.gethostname(), 5000, handleData)
