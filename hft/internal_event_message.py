from .outbound_message_primitives import MessageFactory, InternalEventMessage


class MarketReadyToStartMessage(InternalEventMessage):

    required_fields = ('market_id', 'subsession_id')


class MarketReadyToEndMessage(InternalEventMessage):

    required_fields = ('market_id', 'subsession_id')


class MarketStartMessage(InternalEventMessage):

    required_fields = ('market_id', 'subsession_id', 'session_length')


class MarketEndMessage(InternalEventMessage):

    required_fields = ('market_id', 'subsession_id')


class ReferencePriceChangeMessage(InternalEventMessage):

    required_fields = ('reference_price', 'market_id', 'subsession_id')


class OrderImbalanceChangeMessage(InternalEventMessage):

    required_fields = (
        'order_imbalance', 'market_id', 'subsession_id', 'buy_sell_indicator',
        'trader_ids')


class BBOChangeMessage(InternalEventMessage):

    required_fields = (
        'best_bid', 'best_offer', 'volume_at_best_bid', 'volume_at_best_offer',
        'next_offer', 'next_bid', 'order_imbalance', 'market_id', 
        'subsession_id', 'buy_sell_indicator', 'trader_ids')


class ELOInternalEventMessageFactory(MessageFactory):

    message_types = {
        'market_ready_to_start': MarketReadyToStartMessage,
        'market_ready_to_end': MarketReadyToEndMessage,
        'reference_price_change': ReferencePriceChangeMessage,
        'order_imbalance_change': OrderImbalanceChangeMessage,
        'bbo_change': BBOChangeMessage,
        'market_start': MarketStartMessage,
        'market_end': MarketEndMessage
    }