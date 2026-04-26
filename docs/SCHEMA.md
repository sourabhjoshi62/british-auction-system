# Database Schema Design

## Entity Relationship Diagram

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                                                                             │
│  ┌─────────────────┐         ┌─────────────────┐         ┌──────────────┐  │
│  │    suppliers    │         │      rfqs       │         │    bids      │  │
│  ├─────────────────┤         ├─────────────────┤         ├──────────────┤  │
│  │ PK id           │         │ PK id           │◀───┐    │ PK id        │  │
│  │    name         │         │    reference_id │    │    │ FK rfq_id    │──┼──┐
│  │    email        │         │    name         │    │    │ FK supplier  │──┼──┤
│  │    phone        │         │    description  │    │    │    _id       │  │  │
│  │    contact_     │◀────────│    bid_start    │    │    │    freight_  │  │  │
│  │    person       │         │    bid_close    │    │    │    charges   │  │  │
│  │    created_at   │         │    forced_close │    └────│    origin_   │  │  │
│  └─────────────────┘         │    status       │         │    charges   │  │  │
│          ▲                   │    trigger_     │         │    dest_     │  │  │
│          │                   │    window       │         │    charges   │  │  │
│          │                   │    extension_   │         │    total     │  │  │
│          │                   │    duration     │         │    rank      │  │  │
│          │                   │    trigger_type │         │    is_latest │  │  │
│          │                   │    created_at   │         │    submitted │  │  │
│          │                   └─────────────────┘         └──────────────┘  │
│          │                           │                                      │
│          │                           │                                      │
│          │                           ▼                                      │
│          │                   ┌─────────────────┐                            │
│          │                   │ auction_event   │                            │
│          │                   │    _logs        │                            │
│          │                   ├─────────────────┤                            │
│          │                   │ PK id           │                            │
│          └───────────────────│ FK rfq_id       │                            │
│                              │    event_type   │                            │
│                              │    description  │                            │
│                              │    event_data   │                            │
│                              │    prev_close   │                            │
│                              │    new_close    │                            │
│                              │    triggered_by │                            │
│                              │    created_at   │                            │
│                              └─────────────────┘                            │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

## Table Definitions

### 1. suppliers

Stores supplier/carrier information.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | BIGINT | PK, AUTO_INCREMENT | Unique identifier |
| name | VARCHAR(200) | NOT NULL | Supplier company name |
| email | VARCHAR(255) | UNIQUE | Contact email |
| phone | VARCHAR(50) | | Phone number |
| contact_person | VARCHAR(200) | | Primary contact name |
| created_at | TIMESTAMP | NOT NULL | Record creation time |

```sql
CREATE TABLE suppliers (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(200) NOT NULL,
    email VARCHAR(255) UNIQUE,
    phone VARCHAR(50),
    contact_person VARCHAR(200),
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);
```

### 2. rfqs

Stores RFQ details with British Auction configuration.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | BIGINT | PK, AUTO_INCREMENT | Unique identifier |
| reference_id | VARCHAR(50) | NOT NULL, UNIQUE | Human-readable reference (e.g., RFQ-A1B2C3D4) |
| name | VARCHAR(200) | NOT NULL | RFQ name/title |
| description | TEXT | | Detailed description |
| bid_start_time | TIMESTAMP | NOT NULL | When bidding opens |
| bid_close_time | TIMESTAMP | NOT NULL | Current close time (can be extended) |
| original_close_time | TIMESTAMP | | Initial close time before extensions |
| forced_close_time | TIMESTAMP | NOT NULL | Hard deadline (no extensions beyond) |
| pickup_date | DATE | | Service/pickup date |
| status | VARCHAR(20) | NOT NULL | DRAFT, ACTIVE, CLOSED, FORCE_CLOSED |
| british_auction_enabled | BOOLEAN | NOT NULL, DEFAULT TRUE | Enable auto-extension |
| trigger_window_minutes | INTEGER | NOT NULL, DEFAULT 10 | X - Monitoring window |
| extension_duration_minutes | INTEGER | NOT NULL, DEFAULT 5 | Y - Extension time |
| extension_trigger_type | VARCHAR(20) | NOT NULL | BID_RECEIVED, RANK_CHANGE, L1_CHANGE |
| created_at | TIMESTAMP | NOT NULL | Record creation time |
| updated_at | TIMESTAMP | | Last update time |

```sql
CREATE TABLE rfqs (
    id BIGSERIAL PRIMARY KEY,
    reference_id VARCHAR(50) NOT NULL UNIQUE,
    name VARCHAR(200) NOT NULL,
    description TEXT,
    bid_start_time TIMESTAMP NOT NULL,
    bid_close_time TIMESTAMP NOT NULL,
    original_close_time TIMESTAMP,
    forced_close_time TIMESTAMP NOT NULL,
    pickup_date DATE,
    status VARCHAR(20) NOT NULL DEFAULT 'DRAFT',
    british_auction_enabled BOOLEAN NOT NULL DEFAULT TRUE,
    trigger_window_minutes INTEGER NOT NULL DEFAULT 10,
    extension_duration_minutes INTEGER NOT NULL DEFAULT 5,
    extension_trigger_type VARCHAR(20) NOT NULL DEFAULT 'BID_RECEIVED',
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP,
    
    CONSTRAINT chk_status CHECK (status IN ('DRAFT', 'ACTIVE', 'CLOSED', 'FORCE_CLOSED')),
    CONSTRAINT chk_trigger_type CHECK (extension_trigger_type IN ('BID_RECEIVED', 'RANK_CHANGE', 'L1_CHANGE')),
    CONSTRAINT chk_forced_after_close CHECK (forced_close_time > bid_close_time)
);

CREATE INDEX idx_rfqs_status ON rfqs(status);
CREATE INDEX idx_rfqs_bid_close_time ON rfqs(bid_close_time);
```

### 3. bids

Stores all bid submissions with charges breakdown.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | BIGINT | PK, AUTO_INCREMENT | Unique identifier |
| rfq_id | BIGINT | FK, NOT NULL | Reference to RFQ |
| supplier_id | BIGINT | FK, NOT NULL | Reference to Supplier |
| freight_charges | DECIMAL(12,2) | NOT NULL | Freight charges |
| origin_charges | DECIMAL(12,2) | DEFAULT 0 | Origin charges |
| destination_charges | DECIMAL(12,2) | DEFAULT 0 | Destination charges |
| total_amount | DECIMAL(12,2) | NOT NULL | Sum of all charges |
| transit_time_days | INTEGER | | Transit time in days |
| quote_validity_date | DATE | | Quote valid until |
| rank | INTEGER | DEFAULT 0 | Ranking (1=L1, 2=L2, etc.) |
| is_latest | BOOLEAN | NOT NULL, DEFAULT TRUE | Latest bid from supplier |
| submitted_at | TIMESTAMP | NOT NULL | Bid submission time |

```sql
CREATE TABLE bids (
    id BIGSERIAL PRIMARY KEY,
    rfq_id BIGINT NOT NULL REFERENCES rfqs(id) ON DELETE CASCADE,
    supplier_id BIGINT NOT NULL REFERENCES suppliers(id),
    freight_charges DECIMAL(12,2) NOT NULL,
    origin_charges DECIMAL(12,2) DEFAULT 0,
    destination_charges DECIMAL(12,2) DEFAULT 0,
    total_amount DECIMAL(12,2) NOT NULL,
    transit_time_days INTEGER,
    quote_validity_date DATE,
    rank INTEGER DEFAULT 0,
    is_latest BOOLEAN NOT NULL DEFAULT TRUE,
    submitted_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    
    CONSTRAINT chk_positive_freight CHECK (freight_charges >= 0),
    CONSTRAINT chk_positive_origin CHECK (origin_charges >= 0),
    CONSTRAINT chk_positive_destination CHECK (destination_charges >= 0)
);

CREATE INDEX idx_bids_rfq_id ON bids(rfq_id);
CREATE INDEX idx_bids_supplier_id ON bids(supplier_id);
CREATE INDEX idx_bids_rfq_latest ON bids(rfq_id, is_latest);
CREATE INDEX idx_bids_rfq_total ON bids(rfq_id, total_amount) WHERE is_latest = TRUE;
```

### 4. auction_event_logs

Activity log for all auction events.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | BIGINT | PK, AUTO_INCREMENT | Unique identifier |
| rfq_id | BIGINT | FK, NOT NULL | Reference to RFQ |
| event_type | VARCHAR(30) | NOT NULL | Type of event |
| description | VARCHAR(500) | NOT NULL | Human-readable description |
| event_data | TEXT | | JSON data with event details |
| previous_close_time | TIMESTAMP | | For extensions: previous close time |
| new_close_time | TIMESTAMP | | For extensions: new close time |
| triggered_by | BIGINT | | Supplier ID who triggered event |
| triggered_by_name | VARCHAR(200) | | Supplier name for display |
| created_at | TIMESTAMP | NOT NULL | Event timestamp |

```sql
CREATE TABLE auction_event_logs (
    id BIGSERIAL PRIMARY KEY,
    rfq_id BIGINT NOT NULL REFERENCES rfqs(id) ON DELETE CASCADE,
    event_type VARCHAR(30) NOT NULL,
    description VARCHAR(500) NOT NULL,
    event_data TEXT,
    previous_close_time TIMESTAMP,
    new_close_time TIMESTAMP,
    triggered_by BIGINT,
    triggered_by_name VARCHAR(200),
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    
    CONSTRAINT chk_event_type CHECK (event_type IN (
        'BID_SUBMITTED', 'BID_UPDATED', 'TIME_EXTENDED', 
        'RANK_CHANGED', 'AUCTION_STARTED', 'AUCTION_CLOSED', 'AUCTION_FORCE_CLOSED'
    ))
);

CREATE INDEX idx_event_logs_rfq_id ON auction_event_logs(rfq_id);
CREATE INDEX idx_event_logs_created_at ON auction_event_logs(created_at DESC);
```

## Key Relationships

| Relationship | Type | Description |
|--------------|------|-------------|
| rfqs → bids | 1:N | One RFQ has many bids |
| suppliers → bids | 1:N | One supplier has many bids |
| rfqs → auction_event_logs | 1:N | One RFQ has many event logs |

## Enums

### RfqStatus
- `DRAFT` - RFQ created but not yet active
- `ACTIVE` - Bidding is open
- `CLOSED` - Auction closed at bid close time
- `FORCE_CLOSED` - Auction closed at forced close time

### ExtensionTriggerType
- `BID_RECEIVED` - Any bid triggers extension
- `RANK_CHANGE` - Any ranking change triggers extension
- `L1_CHANGE` - Only lowest bidder change triggers extension

### EventType
- `BID_SUBMITTED` - New bid submitted
- `BID_UPDATED` - Supplier updated their bid
- `TIME_EXTENDED` - Auction time was extended
- `RANK_CHANGED` - Supplier rankings changed
- `AUCTION_STARTED` - Auction became active
- `AUCTION_CLOSED` - Auction closed normally
- `AUCTION_FORCE_CLOSED` - Auction force-closed at deadline

## Sample Queries

### Get ranked bids for an RFQ
```sql
SELECT b.*, s.name as supplier_name
FROM bids b
JOIN suppliers s ON b.supplier_id = s.id
WHERE b.rfq_id = ? AND b.is_latest = TRUE
ORDER BY b.total_amount ASC;
```

### Get auctions to close
```sql
SELECT * FROM rfqs 
WHERE status = 'ACTIVE' 
AND bid_close_time <= CURRENT_TIMESTAMP;
```

### Count extensions for an RFQ
```sql
SELECT COUNT(*) FROM auction_event_logs
WHERE rfq_id = ? AND event_type = 'TIME_EXTENDED';
```

### Get lowest bid for an RFQ
```sql
SELECT b.*, s.name as supplier_name
FROM bids b
JOIN suppliers s ON b.supplier_id = s.id
WHERE b.rfq_id = ? AND b.is_latest = TRUE AND b.rank = 1;
```
