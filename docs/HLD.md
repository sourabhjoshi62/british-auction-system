# British Auction RFQ System - High Level Design (HLD)

## 1. System Overview

The British Auction RFQ System is a web-based application that enables buyers to create Request for Quotations (RFQs) with British Auction-style competitive bidding. The system supports automatic time extensions when bidding activity occurs near the auction close time, preventing last-minute bid sniping and ensuring fair competition.

## 2. Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────────────────────┐
│                                   FRONTEND                                       │
│  ┌─────────────────────────────────────────────────────────────────────────┐    │
│  │                         React Application                                │    │
│  │  ┌──────────────┐ ┌──────────────┐ ┌──────────────┐ ┌────────────────┐  │    │
│  │  │ RFQ List     │ │ Create RFQ   │ │ RFQ Details  │ │ Submit Bid     │  │    │
│  │  │ Page         │ │ Page         │ │ Page         │ │ Modal          │  │    │
│  │  └──────────────┘ └──────────────┘ └──────────────┘ └────────────────┘  │    │
│  │                                                                          │    │
│  │  ┌─────────────────────────┐  ┌─────────────────────────────────────┐  │    │
│  │  │     API Service         │  │    WebSocket Service (STOMP)        │  │    │
│  │  │   (Axios HTTP Client)   │  │    Real-time Bid Updates            │  │    │
│  │  └─────────────────────────┘  └─────────────────────────────────────┘  │    │
│  └─────────────────────────────────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────────────────────────────────┘
                                      │
                                      │ HTTP / WebSocket
                                      ▼
┌─────────────────────────────────────────────────────────────────────────────────┐
│                                   BACKEND                                        │
│  ┌─────────────────────────────────────────────────────────────────────────┐    │
│  │                      Spring Boot Application                             │    │
│  │                                                                          │    │
│  │  ┌─────────────────────────── Controllers ──────────────────────────┐   │    │
│  │  │  RfqController    │   BidController    │   SupplierController    │   │    │
│  │  │  POST /api/rfqs   │   POST /rfqs/{id}  │   GET /api/suppliers    │   │    │
│  │  │  GET /api/rfqs    │        /bids       │                         │   │    │
│  │  └─────────────────────────────────────────────────────────────────┘   │    │
│  │                                      │                                   │    │
│  │  ┌─────────────────────────── Services ─────────────────────────────┐   │    │
│  │  │                                                                   │   │    │
│  │  │  ┌───────────────┐  ┌───────────────┐  ┌──────────────────────┐ │   │    │
│  │  │  │  RfqService   │  │  BidService   │  │ AuctionExtension     │ │   │    │
│  │  │  │  - Create RFQ │  │  - Submit Bid │  │ Service              │ │   │    │
│  │  │  │  - List RFQs  │  │  - Get Bids   │  │ - Check Trigger      │ │   │    │
│  │  │  │  - Get Details│  │  - Rankings   │  │ - Apply Extension    │ │   │    │
│  │  │  └───────────────┘  └───────────────┘  └──────────────────────┘ │   │    │
│  │  │                                                                   │   │    │
│  │  │  ┌───────────────┐  ┌───────────────────────────────────────┐   │   │    │
│  │  │  │ WebSocket     │  │         AuctionScheduler              │   │   │    │
│  │  │  │ Service       │  │  - Activate auctions at start time    │   │   │    │
│  │  │  │ - Broadcast   │  │  - Close auctions at close time       │   │   │    │
│  │  │  │   updates     │  │  - Force close at forced time         │   │   │    │
│  │  │  └───────────────┘  └───────────────────────────────────────┘   │   │    │
│  │  └───────────────────────────────────────────────────────────────────┘   │    │
│  │                                      │                                   │    │
│  │  ┌─────────────────────────── Repository ───────────────────────────┐   │    │
│  │  │  RfqRepository  │  BidRepository  │  SupplierRepo │  EventLogRepo│   │    │
│  │  └─────────────────────────────────────────────────────────────────┘   │    │
│  └─────────────────────────────────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────────────────────────────────┘
                                      │
                                      │ JPA/JDBC
                                      ▼
┌─────────────────────────────────────────────────────────────────────────────────┐
│                                  DATABASE                                        │
│  ┌─────────────────────────────────────────────────────────────────────────┐    │
│  │                       PostgreSQL / H2 (Dev)                              │    │
│  │                                                                          │    │
│  │  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐  ┌────────────────┐  │    │
│  │  │    rfqs     │  │    bids     │  │  suppliers  │  │ auction_event  │  │    │
│  │  │             │  │             │  │             │  │    _logs       │  │    │
│  │  │ - id        │  │ - id        │  │ - id        │  │ - id           │  │    │
│  │  │ - name      │  │ - rfq_id    │  │ - name      │  │ - rfq_id       │  │    │
│  │  │ - status    │  │ - supplier  │  │ - email     │  │ - event_type   │  │    │
│  │  │ - times     │  │ - charges   │  │ - phone     │  │ - description  │  │    │
│  │  │ - config    │  │ - rank      │  │             │  │ - timestamps   │  │    │
│  │  └─────────────┘  └─────────────┘  └─────────────┘  └────────────────┘  │    │
│  └─────────────────────────────────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────────────────────────────────┘
```

## 3. Component Description

### 3.1 Frontend (React)

| Component | Purpose |
|-----------|---------|
| **RfqListPage** | Displays all auctions with status, countdown timers, and lowest bids |
| **CreateRfqPage** | Form for creating new RFQs with British Auction configuration |
| **RfqDetailsPage** | Detailed view with bid table, activity log, and real-time updates |
| **SubmitBidModal** | Modal for suppliers to submit quotes |
| **CountdownTimer** | Real-time countdown to auction close with extension handling |
| **BidTable** | Displays ranked bids with charges breakdown |
| **ActivityLog** | Timeline of auction events (bids, extensions, closures) |
| **WebSocket Service** | STOMP client for real-time bid/status updates |

### 3.2 Backend (Spring Boot)

| Component | Purpose |
|-----------|---------|
| **RfqController** | REST API for RFQ CRUD operations |
| **BidController** | REST API for bid submission and retrieval |
| **SupplierController** | REST API for supplier management |
| **RfqService** | Business logic for RFQ management |
| **BidService** | Core bidding logic with extension check |
| **AuctionScheduler** | Scheduled jobs for auction lifecycle management |
| **WebSocketService** | Broadcasts real-time updates to connected clients |

### 3.3 Database

| Table | Purpose |
|-------|---------|
| **rfqs** | Stores RFQ details and British Auction configuration |
| **bids** | Stores all bid submissions with charges and rankings |
| **suppliers** | Stores supplier/carrier information |
| **auction_event_logs** | Activity log for bids, extensions, and status changes |

## 4. Data Flow

### 4.1 Bid Submission Flow

```
┌──────────┐    ┌──────────────┐    ┌──────────────┐    ┌──────────────┐
│ Supplier │───▶│  BidService  │───▶│   Check if   │───▶│   Save Bid   │
│ submits  │    │  submitBid() │    │   auction    │    │   to DB      │
│   bid    │    │              │    │   is active  │    │              │
└──────────┘    └──────────────┘    └──────────────┘    └──────────────┘
                                                               │
                                                               ▼
┌──────────────┐    ┌──────────────┐    ┌──────────────┐    ┌──────────────┐
│  Broadcast   │◀───│  Log Event   │◀───│   Extend     │◀───│  Recalculate │
│  via WS      │    │              │    │   if needed  │    │   Rankings   │
└──────────────┘    └──────────────┘    └──────────────┘    └──────────────┘
```

### 4.2 Extension Logic Flow

```
Bid Received
     │
     ▼
┌─────────────────────────────┐
│ Is auction ACTIVE?          │──No──▶ Reject bid
└─────────────────────────────┘
     │ Yes
     ▼
┌─────────────────────────────┐
│ Is British Auction enabled? │──No──▶ Save bid, no extension
└─────────────────────────────┘
     │ Yes
     ▼
┌─────────────────────────────┐
│ Is within trigger window?   │──No──▶ Save bid, no extension
│ (current time >= close - X) │
└─────────────────────────────┘
     │ Yes
     ▼
┌─────────────────────────────┐
│ Does trigger condition match?│──No──▶ Save bid, no extension
│ (BID_RECEIVED/RANK_CHANGE/  │
│  L1_CHANGE)                 │
└─────────────────────────────┘
     │ Yes
     ▼
┌─────────────────────────────┐
│ Calculate new close time    │
│ new_close = current_close + Y│
└─────────────────────────────┘
     │
     ▼
┌─────────────────────────────┐
│ new_close > forced_close?   │──Yes──▶ new_close = forced_close
└─────────────────────────────┘
     │ No
     ▼
┌─────────────────────────────┐
│ Update bid_close_time       │
│ Log extension event         │
│ Broadcast via WebSocket     │
└─────────────────────────────┘
```

## 5. API Endpoints

### 5.1 RFQ APIs

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/rfqs` | List all RFQs |
| GET | `/api/rfqs/{id}` | Get RFQ details with bids and events |
| POST | `/api/rfqs` | Create new RFQ |
| POST | `/api/rfqs/{id}/activate` | Manually activate RFQ |
| POST | `/api/rfqs/{id}/close` | Manually close RFQ |

### 5.2 Bid APIs

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/rfqs/{rfqId}/bids` | Get all bids for an RFQ |
| POST | `/api/rfqs/{rfqId}/bids` | Submit a new bid |

### 5.3 Supplier APIs

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/suppliers` | List all suppliers |
| POST | `/api/suppliers` | Create new supplier |

### 5.4 WebSocket Topics

| Topic | Description |
|-------|-------------|
| `/topic/rfq/{rfqId}/bids` | Real-time bid updates |
| `/topic/rfq/{rfqId}/status` | Auction status changes |

## 6. Technology Stack

| Layer | Technology |
|-------|------------|
| **Frontend** | React 18, React Router, Tailwind CSS, Axios, STOMP.js |
| **Backend** | Spring Boot 3.2, Spring Data JPA, Spring WebSocket |
| **Database** | PostgreSQL (Production), H2 (Development) |
| **Build Tools** | Maven (Backend), Vite (Frontend) |

## 7. Key Features

1. **RFQ Creation** - Create RFQs with British Auction configuration
2. **Bid Submission** - Suppliers submit quotes with charges breakdown
3. **Auto Ranking** - Automatic L1/L2/L3 ranking based on total amount
4. **Time Extension** - Automatic auction extension on trigger conditions
5. **Forced Close** - Hard deadline that cannot be exceeded
6. **Real-time Updates** - WebSocket-based live bid updates
7. **Activity Log** - Complete audit trail of auction events

## 8. Extension Trigger Types

| Type | Description |
|------|-------------|
| **BID_RECEIVED** | Any bid in trigger window extends auction |
| **RANK_CHANGE** | Any supplier ranking change extends auction |
| **L1_CHANGE** | Only lowest bidder change extends auction |

## 9. Security Considerations (Future Enhancement)

- JWT-based authentication
- Role-based access (Buyer/Supplier)
- API rate limiting
- HTTPS enforcement
- Input validation and sanitization

## 10. Scalability Considerations (Future Enhancement)

- Redis for session/cache management
- Message queue for async processing
- Database connection pooling
- Horizontal scaling with load balancer
- WebSocket cluster with sticky sessions
