import socket as sock
import CborToJson as cbj
import pymongo as pm


def server_program(host, port, callback):
    server_socket = sock.socket()  # get instance
    server_socket.bind((host, port))  # bind host address and port together

    # configure how many client the server can listen simultaneously
    server_socket.listen(2)
    conn, address = server_socket.accept()  # accept new connection
    print("Connection from: " + str(address))

    while True:
        # receive data stream. it won't accept data packet greater than 1024 bytes
        data = conn.recv(1024)
        if not data: break # if data is not received break
        res = callback(data)
        if res != None:
            conn.send(res.encode())  # send data to the client

    conn.close()  # close the connection

def handleData(data):
    if data != None:
        recieved_msg = cbj.getJSON(data)
        print("from connected user: ", print(recieved_msg))

        #send data to database
        client = pm.MongoClient("mongodb://root:example@localhost:27017")
        client["test"]["test"].insert_one(recieved_msg)
        client.close()

        return "Cbor recieved"
    return "Nothing recieved from client"

if __name__ == '__main__':
    server_program(sock.gethostname(), 5000, handleData)