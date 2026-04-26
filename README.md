# British Auction RFQ System

A web application for managing Request for Quotations (RFQs) with British Auction-style competitive bidding.

## Features

- **RFQ Management**: Create and manage RFQs with configurable auction settings
- **British Auction**: Automatic time extensions when bidding activity occurs near close time
- **Real-time Updates**: WebSocket-based live bid updates
- **Supplier Ranking**: Automatic L1/L2/L3 ranking based on total bid amount
- **Activity Logging**: Complete audit trail of all auction events

## Tech Stack

- **Backend**: Spring Boot 3.2, Java 17, Spring Data JPA, Spring WebSocket
- **Frontend**: React 18, Vite, Tailwind CSS, React Router
- **Database**: H2 (Development), PostgreSQL (Production)

## Project Structure

```
task/
├── backend/                 # Spring Boot backend
│   ├── src/main/java/com/rfq/
│   │   ├── controller/     # REST API controllers
│   │   ├── service/        # Business logic
│   │   ├── repository/     # Data access layer
│   │   ├── entity/         # JPA entities
│   │   ├── dto/            # Data transfer objects
│   │   ├── config/         # Configuration classes
│   │   └── exception/      # Exception handling
│   └── pom.xml
├── frontend/               # React frontend
│   ├── src/
│   │   ├── pages/         # Page components
│   │   ├── components/    # Reusable components
│   │   ├── services/      # API and WebSocket services
│   │   └── utils/         # Utility functions
│   └── package.json
└── docs/                   # Documentation
    ├── HLD.md             # High Level Design
    └── SCHEMA.md          # Database Schema
```

## Getting Started

### Prerequisites

- Java 17+
- Node.js 18+
- Maven 3.8+

### Running the Backend

```bash
cd backend

# Install dependencies and run
./mvnw spring-boot:run

# Or build and run
./mvnw clean package
java -jar target/british-auction-1.0.0.jar
```

The backend will start at `http://localhost:8080`

### Running the Frontend

```bash
cd frontend

# Install dependencies
npm install

# Start development server
npm run dev
```

The frontend will start at `http://localhost:5173`

### Accessing the Application

1. Open `http://localhost:5173` in your browser
2. Create a new RFQ using the "Create RFQ" button
3. Configure British Auction settings (trigger window, extension duration)
4. Submit bids from different suppliers
5. Watch real-time updates and automatic time extensions

### H2 Console (Development)

Access the H2 database console at `http://localhost:8080/h2-console`
- JDBC URL: `jdbc:h2:mem:rfqdb`
- Username: `sa`
- Password: (empty)

## API Documentation

### RFQ Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/rfqs` | List all RFQs |
| GET | `/api/rfqs/{id}` | Get RFQ details |
| POST | `/api/rfqs` | Create new RFQ |
| POST | `/api/rfqs/{id}/activate` | Activate RFQ |
| POST | `/api/rfqs/{id}/close` | Close RFQ |

### Bid Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/rfqs/{rfqId}/bids` | Get bids for RFQ |
| POST | `/api/rfqs/{rfqId}/bids` | Submit a bid |

### Supplier Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/suppliers` | List suppliers |
| POST | `/api/suppliers` | Create supplier |

## British Auction Configuration

| Setting | Description |
|---------|-------------|
| Trigger Window (X) | Minutes before close to monitor for activity |
| Extension Duration (Y) | Minutes to extend when triggered |
| Trigger Type | What activity triggers an extension |

### Trigger Types

- **BID_RECEIVED**: Any bid in trigger window extends auction
- **RANK_CHANGE**: Any ranking change extends auction
- **L1_CHANGE**: Only lowest bidder change extends auction

## Sample Data

The application seeds 5 sample suppliers on startup:
1. Fast Freight Inc
2. Global Logistics Co
3. Swift Carriers Ltd
4. Prime Shipping Corp
5. Express Transport LLC

## Development

### Backend Tests

```bash
cd backend
./mvnw test
```

### Frontend Build

```bash
cd frontend
npm run build
```

## Production Deployment

### Using PostgreSQL

1. Create a PostgreSQL database
2. Set environment variables:
   ```bash
   export DB_USERNAME=your_username
   export DB_PASSWORD=your_password
   ```
3. Run with production profile:
   ```bash
   java -jar target/british-auction-1.0.0.jar --spring.profiles.active=prod
   ```

## Documentation

- [High Level Design (HLD)](docs/HLD.md)
- [Database Schema](docs/SCHEMA.md)

## License

MIT
