
import { PolymerElement, html } from './node_modules/@polymer/polymer/polymer-element.js';
import {PlayersOrderBook} from './market_elements.js'

const MIN_BID = 0;
const MAX_ASK = 2147483647;


class MarketSession extends PolymerElement {
    static get properties() {
      return {
        eventListeners: Object,
        eventHandlers: Object,
        events: Object,
        active: {type: Boolean, observer: '_activateSession'},
        role: String,
        orderBook: Object,
        bestBid: Number,
        volumeBestBid: Number,
        bestOffer: Number,
        volumeBestOffer: Number,
        myBid: Number,
        myOffer: Number,
        inventory: Number,
        cash: Number,
        playerId: Number,
        constants: Object,
        endowment: {type: Number, 
            computed: '_inventoryValueChange(inventory, cash, bestBid, bestOffer)'},
        websocketUrl: {type: Object, value: function () {
            let protocol = 'ws://';
            if (window.location.protocol === 'https:') {
                protocol = 'wss://';
                }
            const url = (
                protocol +
                window.location.host +
                '/hft/' +
                OTREE_CONSTANTS.subsessionId + '/' +
                OTREE_CONSTANTS.marketId + '/' +
                OTREE_CONSTANTS.playerId + '/'
                )
            return url
        }}
      }
    }
    constructor() {
        super();
        this.playerId = 7
        this.orderBook = new PlayersOrderBook(this.playerId);
        console.log(this.websocketUrl)
        this.addEventListener('message', this.outboundMessage.bind(this))
        this.addEventListener('inbound-ws-message', this.inboundMessage.bind(this))
    }

    outboundMessage(event) {
        const messagePayload = event.detail.payload
        let cleanMessage = this._msgSanitize(messagePayload, 'outbound')
        this.$.websocket.send(cleanMessage)
    }
    
    inboundMessage(event) {
        const messagePayload = event.detail.payload
        let cleanMessage = this._msgSanitize(messagePayload, 'inbound')
        const messageType = cleanMessage.type
        const handlers = this.eventHandlers[messageType]
        for (let i = 0; i < handlers.length; i++) {
            let handlerName = handlers[i]
            this[handlerName](cleanMessage)
        }
    }
    
    _handleExchangeMessage(message) {
        this.orderBook.recv(message)
        if (message.player_id == this.playerId) {
            let mode = message.type == 'executed' || message.type == 'canceled' ?
                'remove' : 'add'
            this._myBidOfferUpdate(message.price, message.buy_sell_indicator, mode=mode)
        }
    }
    
    _handleExecuted(message) {
        this.cash = message.endowment
        this.inventory = message.inventory
    }
    
    _handleBestBidOfferUpdate(message) {
        this.bestBid = message.best_bid
        this.bestOffer = message.best_offer
        this.volumeBestBid = message.volume_bid
        this.volumeBestOffer = message.volume_offer
    }
    
    _myBidOfferUpdate(price, buySellIndicator, mode='add') {
        switch (buySellIndicator) {
            case 'B':
                this.myBid = mode == 'add' ? price : 0
                break
            case 'S':
                this.myOffer = mode == 'add' ? price : 0
                break
        }
    }
         
    _inventoryValueChange(inventory, cash, bestBid, bestOffer) {
        let result = null;
        if (inventory <= 0 && bestOffer != MAX_ASK) {
            result = inventory * bestOffer
        } else if (inventory > 0 && bestBid) {
            result = inventory * bestBid
        }
        return result
    }

    _msgSanitize (messagePayload, direction) {
        if (this.events[direction].hasOwnProperty(messagePayload.type)) {

            let cleanMessage = {}
            let fieldsTypes = this.events[direction][messagePayload.type]
            for (let key in fieldsTypes) {
                let fieldParser = fieldsTypes[key]
                if (!messagePayload.hasOwnProperty(key)) {
                    console.error(`error: ${key} missing in ${messagePayload}`)
                    return ;
                }

                let rawValue = messagePayload[key]
                if (typeof rawValue == 'undefined' || rawValue === null) {
                    console.error(`invalid value: ${rawValue} for key: ${key}`)
                }

                let cleanValue = fieldParser(rawValue)

                if (typeof cleanValue == 'undefined' || cleanValue === null) {
                    console.error(`parser: ${fieldParser} returned ${cleanValue} `)
                }

                cleanMessage[key] = cleanValue
            }
            return cleanMessage;
        }
        else {
            console.error(`invalid message type: ${messagePayload.type} in ${messagePayload}`);
        }

    }

    _activatesession(){
        // change some classes do some css3/ keyframes action
        // maybe add remove overlay
    }

    static get template() {return html`
        <ws-connection id="websocket" url-to-connect={{websocketUrl}}> </ws-connection>
        <info-table inventory="{{inventory}}" cash={{cash}}
            endowment={{endowment}} 
            best-bid={{bestBid}}
            best-offer={{bestOffer}} my-bid={{myBid}}
            my-offer={{myOffer}}> 
        </info-table>
    `;}

}

customElements.define('market-session', MarketSession)

