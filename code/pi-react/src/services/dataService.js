import axios from 'axios'

const client = axios.create({
    baseURL: 'http://localhost:5000/api', // à modifier selon l'adresse du serveur
  });

export class TrailData {
    constructor(idTrakker, start, end){
        this.id = idTrakker;
        this.start = start;
        this.end = end;
    }

    get(responseCallback, errorCallback=(_)=>{}) {
        client.get(`/trail/${this.id}/${this.start}/${this.end}`)
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

    /**
     * Get the data of the trakker of 24 last hours
     * @param {({points:[number], trailInfos:{}, globalImp:number, denivele:[number]}) => void} responseCallback
     * @param {(error) => void} errorCallback
     */
    get(responseCallback, errorCallback=(_)=>{}) {
        client.get(`/live/${this.id}`)
            .then(response => {
                responseCallback(response.data)
            }).catch(error => {
                errorCallback(error)
            }
        )
    }
}