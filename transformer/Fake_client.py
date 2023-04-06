# fake client to test the server by sending a cbor file

import socket as sock
import cbor2 as cb2

def client_program(host, port, sendCallback, receiveCallback):
    client_socket = sock.socket()  # instantiate
    client_socket.connect((host, port))  # connect to the server
    client_socket.send(sendCallback())  # send data
    receiveCallback(client_socket.recv(1024)) # handle response
    client_socket.close()  # close the connection

def send():
    dict = {"coordinates": [
          8.134863519050327,
          47.02492394298815
        ],
        "serial" : 123,
        "other" : "test"}

    return cb2.dumps(dict)

def handle(data):
    msg = data.decode()
    print('Received from server: ' + msg)  # show in terminal

if __name__ == '__main__':
    client_program(sock.gethostname(), 5000, send, handle)