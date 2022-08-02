//========== STRUCTURE DATA

//========== PACKAGE
const { EventEmitter } = require("node:events")
const axios = require('axios')
const WebSocket = require("ws");

//========= CLASS
class Client extends EventEmitter {
  constructor(options = {}) {
    super()

    this.token = options?.token || null;
  }

  login(token) {
    if (this.token === null) {
      if (!token) throw new Error("Token Tidak Ada")
    }
    this.startWebsocket()
  }

  destroy() {
    return this.ws.destroy()
  }

  startWebsocket() {
    let wssurl = 'wss://api.guilded.gg/v1/websocket'

    this.ws = new WebSocket(wssurl, {
      headers: {
        Authorization: `Bearer ${this.token}`
      },
    });

    this.ws.onopen = () => {
      console.log('Lumine.js Succesfull To Connect Websocket');
    }
    this.ws.onclose = this.ws.onerror = (e) => {
      this.ws = null
      console.log('Reconnect...')
      this.startWebsocket()
    }

    var OPCodes = {
      WELLCOME: 0
    }

    this.ws.onmessage = ({ data }) => {
      let packet = JSON.parse(data)

      switch (packet.type) {
        case OPCodes.WELLCOME:
          setInterval(function() {
            this.ws.ping()
          }.bind(this), packet.d.heartbeatIntervalMs)
          break;
      }

    };
  }

  requestAPI(method = "", params = "", data) {

  }

}

module.exports = Client