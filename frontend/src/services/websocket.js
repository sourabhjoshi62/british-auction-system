// import { Client } from '@stomp/stompjs'
// import SockJS from 'sockjs-client'

// class WebSocketService {
//   constructor() {
//     this.client = null
//     this.subscriptions = {}
//   }

//   connect(onConnect, onError) {
//     this.client = new Client({
//       webSocketFactory: () => new SockJS('http://localhost:8080/ws'),
//       reconnectDelay: 5000,
//       heartbeatIncoming: 4000,
//       heartbeatOutgoing: 4000,
      
//       onConnect: () => {
//         console.log('WebSocket connected')
//         if (onConnect) onConnect()
//       },
      
//       onStompError: (frame) => {
//         console.error('STOMP error:', frame)
//         if (onError) onError(frame)
//       },
      
//       onDisconnect: () => {
//         console.log('WebSocket disconnected')
//       }
//     })

//     this.client.activate()
//   }

//   disconnect() {
//     if (this.client) {
//       // Unsubscribe from all
//       Object.values(this.subscriptions).forEach(sub => {
//         if (sub) sub.unsubscribe()
//       })
//       this.subscriptions = {}
      
//       this.client.deactivate()
//       this.client = null
//     }
//   }

//   subscribeToBids(rfqId, callback) {
//     if (!this.client || !this.client.connected) {
//       console.warn('WebSocket not connected, cannot subscribe')
//       return null
//     }

//     const destination = `/topic/rfq/${rfqId}/bids`
//     const subscription = this.client.subscribe(destination, (message) => {
//       const data = JSON.parse(message.body)
//       callback(data)
//     })

//     this.subscriptions[`bids-${rfqId}`] = subscription
//     return subscription
//   }

//   subscribeToStatus(rfqId, callback) {
//     if (!this.client || !this.client.connected) {
//       console.warn('WebSocket not connected, cannot subscribe')
//       return null
//     }

//     const destination = `/topic/rfq/${rfqId}/status`
//     const subscription = this.client.subscribe(destination, (message) => {
//       const data = JSON.parse(message.body)
//       callback(data)
//     })

//     this.subscriptions[`status-${rfqId}`] = subscription
//     return subscription
//   }

//   unsubscribe(key) {
//     if (this.subscriptions[key]) {
//       this.subscriptions[key].unsubscribe()
//       delete this.subscriptions[key]
//     }
//   }
// }

// export default new WebSocketService()



// WebSocket disabled to avoid Vite + SockJS crash

class WebSocketService {
  constructor() {
    this.client = null
    this.subscriptions = {}
  }

  connect(onConnect, onError) {
    console.log("WebSocket disabled for now")

    // simulate success
    if (onConnect) onConnect()
  }

  disconnect() {
    console.log("WebSocket disconnected (dummy)")
  }

  subscribeToBids(rfqId, callback) {
    console.log("subscribeToBids disabled")
    return null
  }

  subscribeToStatus(rfqId, callback) {
    console.log("subscribeToStatus disabled")
    return null
  }

  unsubscribe(key) {
    console.log("unsubscribe disabled")
  }
}

export default new WebSocketService()