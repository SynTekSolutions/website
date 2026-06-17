# Laravel Instructions
applyTo: "**/*.{php,blade.php}"

---

# Stack

- Laravel (latest stable)
- PHP 8.2+
- Eloquent ORM
- Livewire (if interactive UI needed server-side)
- Laravel Sanctum (API auth)
- Pest (testing)

---

# Project Structure

```
app/
  Actions/        # Single-responsibility business logic
  Http/
    Controllers/  # Thin controllers — delegate to Actions
    Requests/     # Form request validation
    Resources/    # API resource transformers
  Models/         # Eloquent models
  Services/       # External service integrations
  Enums/          # PHP 8.1+ backed enums
  Exceptions/     # Custom exception classes
database/
  migrations/
  seeders/
  factories/
resources/
  views/          # Blade templates
routes/
  web.php
  api.php
tests/
  Feature/
  Unit/
```

---

# Controllers

Controllers must be thin.

```php
// Good
class CreateLeadController extends Controller
{
    public function __invoke(CreateLeadRequest $request, CreateLead $action): JsonResponse
    {
        $lead = $action->handle($request->validated());
        return response()->json(LeadResource::make($lead), 201);
    }
}

// Bad — business logic in controller
class LeadController extends Controller
{
    public function store(Request $request)
    {
        $validated = $request->validate([...]);
        $lead = new Lead();
        $lead->email = $validated['email'];
        // ... 30 more lines
    }
}
```

Rules:

- One controller per action where possible (`__invoke`)
- Always type-hint dependencies
- Always use Form Requests for validation
- Always use API Resources for responses

---

# Actions

Single-responsibility classes for business logic.

```php
// app/Actions/Leads/CreateLead.php

final class CreateLead
{
    public function handle(array $data): Lead
    {
        return DB::transaction(function () use ($data) {
            $lead = Lead::create([
                'email'   => $data['email'],
                'name'    => $data['name'],
                'source'  => $data['source'] ?? 'website',
            ]);

            event(new LeadCreated($lead));

            return $lead;
        });
    }
}
```

---

# Models

```php
final class Lead extends Model
{
    protected $fillable = ['email', 'name', 'source', 'status'];

    protected $casts = [
        'status'     => LeadStatus::class,  // Enum cast
        'created_at' => 'datetime',
    ];

    // Relationships
    public function notes(): HasMany
    {
        return $this->hasMany(LeadNote::class);
    }

    // Scopes
    public function scopeActive(Builder $query): Builder
    {
        return $query->where('status', LeadStatus::Active);
    }
}
```

Rules:

- Always define `$fillable` — never use `$guarded = []`
- Cast enums explicitly
- Keep business logic out of models — use Actions
- Name scopes as verbs: `scopeActive`, `scopePending`

---

# Validation

Always use Form Requests:

```php
// app/Http/Requests/CreateLeadRequest.php

class CreateLeadRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'email'  => ['required', 'email', 'max:255', 'unique:leads,email'],
            'name'   => ['required', 'string', 'max:100'],
            'source' => ['nullable', 'string', 'in:website,referral,ads'],
        ];
    }

    public function messages(): array
    {
        return [
            'email.unique' => 'This email is already registered.',
        ];
    }
}
```

---

# API Resources

Always transform Eloquent models before returning:

```php
class LeadResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id'         => $this->id,
            'email'      => $this->email,
            'name'       => $this->name,
            'status'     => $this->status->label(),
            'created_at' => $this->created_at->toISOString(),
        ];
    }
}
```

Never return raw `$model->toArray()` in API responses.

---

# Database

```php
// Migration standards
Schema::create('leads', function (Blueprint $table) {
    $table->id();
    $table->string('email')->unique();
    $table->string('name');
    $table->string('source')->default('website');
    $table->string('status')->default('pending');
    $table->timestamps();
    $table->softDeletes();  // If applicable

    $table->index('status');  // Index frequently queried columns
});
```

Rules:

- Always add indexes for columns used in `WHERE`, `ORDER BY`
- Use `softDeletes()` for any user-facing data
- Never modify existing migrations in production — create new ones
- Use database transactions for multi-step operations

---

# Enums

Use PHP 8.1+ backed enums:

```php
enum LeadStatus: string
{
    case Pending  = 'pending';
    case Active   = 'active';
    case Closed   = 'closed';

    public function label(): string
    {
        return match($this) {
            self::Pending => 'Pending Review',
            self::Active  => 'Active',
            self::Closed  => 'Closed',
        };
    }
}
```

---

# Error Handling

```php
// Custom exceptions
class LeadNotFoundException extends ModelNotFoundException
{
    public function __construct(string $id)
    {
        parent::__construct("Lead [{$id}] not found.");
    }
}

// In Handler or globally
$this->renderable(function (LeadNotFoundException $e) {
    return response()->json(['error' => $e->getMessage()], 404);
});
```

---

# Testing with Pest

```php
// tests/Feature/CreateLeadTest.php

it('creates a lead successfully', function () {
    $response = post('/api/leads', [
        'email' => 'client@company.com',
        'name'  => 'John Doe',
    ]);

    $response->assertCreated();
    $response->assertJsonStructure(['data' => ['id', 'email', 'name']]);
    assertDatabaseHas('leads', ['email' => 'client@company.com']);
});

it('rejects duplicate email', function () {
    Lead::factory()->create(['email' => 'existing@company.com']);

    post('/api/leads', ['email' => 'existing@company.com', 'name' => 'Jane'])
        ->assertUnprocessable()
        ->assertJsonValidationErrors(['email']);
});
```

Every Action and Controller must have at least one Feature test.

---

# Security Checklist

Before shipping any endpoint:

- [ ] Input validated via Form Request
- [ ] Auth middleware applied where required
- [ ] Rate limiting on public endpoints
- [ ] No raw SQL queries — use Eloquent query builder
- [ ] Sensitive data excluded from API Resources
- [ ] CSRF protection active on web routes
