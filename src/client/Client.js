//========== STRUCTURE DATA
const Constants = require("./../util/constants.js")

const UserClient = require("./../structure/UserClient.js")
const Message = require("./../structure/Message.js")
//========== PACKAGE
const { EventEmitter } = require("node:events")
const axios = require('axios')
const WebSocket = require("ws");

//========= CLASS
class Client extends EventEmitter {
  constructor(options = {}) {
      super()

    this.token = options?.token || null;
    this.advmode = options?.advance || false
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

    this.ws.onopen = (data) => {
      console.log('Lumine.js Succesfull To Connect Websocket');
    }
    this.ws.onclose = this.ws.onerror = (e) => {
      this.ws = null
      console.log('Reconnect...')
      this.startWebsocket()
    }

    var OPCodes = {
      WELLCOME: 1
    }

    this.ws.onmessage = ({ data }) => {
      let packet = JSON.parse(data)
      switch (packet.op) {
        case OPCodes.WELLCOME:
          this.emit("ready", new UserClient(packet.d, this))
          const packg = require("./../../package.json")
          console.log(`====== Lumine.js (Project)\n${packg.name} - ${packg.version}\n\nNow Login To ${new UserClient(packet.d, this).username}\n======`)
          setInterval(function() {
            this.ws.ping()
          }.bind(this), packet.d.heartbeatIntervalMs - 3000)
          break;
      }
      
      console.log(packet)
      
      switch(packet.t) {
        case "ChatMessageCreated":
          this.emit("messageCreate", new Message(packet.d, this))
        break;
      }

    };
  }

  requestAPI(method = "", params = "", data) {
    let object = {
      method: method,
      url: "https://www.guilded.gg/api/v1" + params,
      headers: {
        Authorization: `Bearer ${this.token}`,
        "Accept": "application/json",
        "Content-type": "application/json"
      }
    }
  
    if (data) object.data = data
    console.log(object)
  
    return axios(object).then(x => "").catch(err => {
      console.log(err)
    })
  }
  
  sendMessage(channelId, data) {
    this.requestAPI("POST", Constants.ENDPOINTS.MESSAGE(channelId), data)
  }
}

module.exports = Client
