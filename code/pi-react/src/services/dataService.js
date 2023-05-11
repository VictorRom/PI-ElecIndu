import axios from 'axios'

const client = axios.create({
    baseURL: 'http://localhost:8080/', // à modifier selon l'adresse du serveur
  });

export class TrailData {
    constructor(idTrakker, start, end){
        this.id = idTrakker;
        this.start = start;
        this.end = end;
    }

    get(responseCallback, errorCallback=(_)=>{}) {
        client.get(`/trail/dts=${this.start}&dte=${this.end}`)
            .then(response => {
                responseCallback(response.data)
            }).catch(error => {
                errorCallback(error)
            }
        )
    }
}

export class LiveData {
    constructor(idTrakker){
        this.id = idTrakker;
    }

    get(responseCallback, errorCallback=(_)=>{}) {
        client.get(`/live`)
            .then(response => {
                responseCallback(response.data)
            }).catch(error => {
                errorCallback(error)
            }
        )
    }
}