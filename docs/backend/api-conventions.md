# Backend API Conventions & Standards

## 1. REST API URI Conventions

All HTTP endpoints in OmniStay adhere to consistent RESTful URI conventions:

```text
/api/v1/<domain>/<resource>[/:id][/<sub-resource>]
```

### Examples:
- `GET /api/v1/hotel/bookings` — List reservations with query filters
- `POST /api/v1/hotel/bookings` — Create a new reservation
- `GET /api/v1/hotel/bookings/:id` — Retrieve a single reservation by UUID
- `POST /api/v1/hotel/bookings/:id/check-in` — Transition reservation state to checked-in
- `GET /api/v1/pos/outlets/:outletId/menus` — Retrieve menus belonging to an outlet
- `POST /api/v1/cart/items` — Add a cross-vertical item to cart

---

## 2. HTTP Methods & Response Status Codes

| Method | Idempotent | Success Code | Purpose |
| :--- | :-: | :-: | :--- |
| `GET` | Yes | `200 OK` | Retrieve resource collections or individual entities |
| `POST` | No | `201 Created` or `200 OK` | Create resources, execute state transitions, or perform actions |
| `PATCH` | No | `200 OK` | Partially update resource fields |
| `DELETE`| Yes | `200 OK` or `204 No Content` | Soft-delete or remove resources |

---

## 3. Standardized Error Payload Format

All unhandled and handled exceptions are formatted by the global `HttpExceptionFilter`:

```json
{
  "statusCode": 400,
  "timestamp": "2026-10-21T15:00:00.000Z",
  "path": "/api/v1/hotel/bookings",
  "method": "POST",
  "error": "Bad Request",
  "message": "Check-in date must be strictly prior to check-out date"
}
```

Common status codes:
- `400 Bad Request` — Validation failures, invalid date ranges, mathematical imbalances
- `401 Unauthorized` — Missing or expired JWT, invalid credentials, pending 2FA
- `403 Forbidden` — Insufficient role permissions or cross-tenant access violations
- `404 Not Found` — Resource entity not found within tenant scope
- `409 Conflict` — Duplicate unique keys (e.g. registered email or organization slug)
- `429 Too Many Requests` — Rate limiter threshold exceeded
- `503 Service Unavailable` — Database or Redis dependency connection lost

---

## 4. OpenAPI 3.1 & Swagger Documentation

Every controller method is decorated for interactive Swagger documentation:

```typescript
@ApiTags('Hotel PMS & Bookings')
@Controller('api/v1/hotel/bookings')
export class BookingController {
  @Post()
  @ApiOperation({
    summary: 'Create reservation with automated Guest Folio',
    description: 'Validates room availability, calculates nights, and auto-initializes the billing folio.',
  })
  @ApiResponse({ status: 201, description: 'Reservation confirmed' })
  @ApiResponse({ status: 400, description: 'Invalid date range or unavailable room type' })
  async createBooking(
    @Body() dto: CreateBookingDto,
    @CurrentUser() caller: AuthenticatedUserPayload,
  ) {
    return this.bookingService.createBooking(dto, caller.organizationId!, caller);
  }
}
```

The live OpenAPI specification is accessible at `/api/docs` when running the backend.
