# React + Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react/README.md) uses [Babel](https://babeljs.io/) for Fast Refresh
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react-swc) uses [SWC](https://swc.rs/) for Fast Refresh

---

AI price evaluation (OpenAI) setup

Short answer: Yes — you need to register at OpenAI and create an API key to use the “Spørg AI om prisen” feature on Gear CardDetails.

What you need
- An OpenAI account: https://platform.openai.com/signup
- An API key: create it here after logging in: https://platform.openai.com/api-keys
- In many cases you must enable billing on your OpenAI account to use paid models like gpt-4o-mini.

Configure the project
1) Create a .env file in the project root (same folder as package.json):

   VITE_OPENAI_API_KEY=sk-...your_key_here...

2) Restart the dev server so Vite picks up the new env var:

   npm run dev

3) In the app, open a Gear item and click “Spørg AI om prisen”. A modal will open with the AI’s evaluation.

How it works
- The client calls OpenAI’s Chat Completions API (model: gpt-4o-mini) using the key from VITE_OPENAI_API_KEY.
- The request includes the current item’s brand, model, price, condition, year, location and description to generate a brief Danish evaluation.

Troubleshooting
- Missing key: You will see an error like “Mangler OpenAI API nøgle. Tilføj VITE_OPENAI_API_KEY i din .env fil.” Ensure the .env file exists and you restarted the dev server.
- 401/Unauthorized: Regenerate the key and verify that billing is enabled in your OpenAI account.
- CORS/Network errors: For production, avoid calling OpenAI directly from the client. Proxy the request via your backend to keep the API key server-side and to control CORS.

Security notes
- Never commit your .env file or your API key to version control.
- Rotate your key immediately if it’s ever exposed.

---

Server‑side (safer) setup with .NET backend

Why server‑side?
- Your OpenAI API key never ships to the browser.
- You can add rate‑limits, input validation, logging, and abuse protection.
- You avoid CORS and ad‑block issues from calling third‑party APIs in the browser.

Frontend changes (already applied in this repo)
- The client now calls your backend at POST {apiBaseUrl}/api/AI/evaluate-price and no longer talks to OpenAI directly.
- The request body is a simple JSON payload with the item data:
  {
    "brand": string,
    "model": string,
    "price": number,
    "condition": string,
    "year": number,
    "location": string,
    "description": string
  }
- The frontend expects a JSON response like:
  { "content": "...AI tekst..." }

How to implement the .NET endpoint
Below is a minimal ASP.NET Core example using HttpClient to call OpenAI’s Chat Completions API. Place your OpenAI key in a server‑side secret (environment variable OPENAI_API_KEY or user‑secrets).

Minimal API example (Program.cs)

var builder = WebApplication.CreateBuilder(args);
var services = builder.Services;

services.AddEndpointsApiExplorer();
services.AddSwaggerGen();
services.AddCors(o =>
{
    o.AddDefaultPolicy(p => p
        .WithOrigins("http://localhost:5173", "https://localhost:5173") // Vite dev
        .AllowAnyHeader()
        .AllowAnyMethod()
        .AllowCredentials());
});

var app = builder.Build();
app.UseCors();
app.UseSwagger();
app.UseSwaggerUI();

app.MapPost("/api/AI/evaluate-price", async (HttpContext http, IConfiguration cfg) =>
{
    var request = await http.Request.ReadFromJsonAsync(new
    {
        brand = "",
        model = "",
        price = 0m,
        condition = "",
        year = 0,
        location = "",
        description = ""
    });

    if (request is null)
        return Results.BadRequest("Invalid payload");

    string brand = request.brand ?? string.Empty;
    string model = request.model ?? string.Empty;
    string condition = request.condition ?? "Ukendt";
    string location = request.location ?? "Ukendt";
    string description = request.description ?? "Ingen beskrivelse";
    var year = request.year;
    var price = request.price;

    var prompt = $@"Du er en erfaren priskontrol-assistent for brugt musikudstyr i Danmark. Vurder om prisen virker fair og giv kort rådgivning.

Produkt: {brand} {model}
Pris: {price} DKK
Stand/tilstand: {condition}
Årgang: {(year == 0 ? "Ukendt" : year)}
Lokation: {location}
Beskrivelse: {description}

Opgave:
1) Giv en kort vurdering om prisen virker lav, fair eller høj (1 linje med et tydeligt “Vurdering”).
2) Angiv 3-6 punkter med relevante detaljer (fx kendte prisniveauer, efterspørgsel, kendte fejl/fordele, tilbehør, årgang/stand).
3) Afslut med et forslag til forhandlingsstrategi (1-2 linjer).
Svar på dansk.";

    var apiKey = Environment.GetEnvironmentVariable("OPENAI_API_KEY");
    if (string.IsNullOrWhiteSpace(apiKey))
        return Results.Problem("Server config error: missing OPENAI_API_KEY", statusCode: 500);

    using var httpClient = new HttpClient();
    httpClient.DefaultRequestHeaders.Authorization = new System.Net.Http.Headers.AuthenticationHeaderValue("Bearer", apiKey);

    var body = new
    {
        model = "gpt-4o-mini",
        messages = new object[]
        {
            new { role = "system", content = "Du hjælper brugere med at vurdere prisen på brugt musikudstyr i Danmark. Svar altid på dansk, kortfattet og konkret." },
            new { role = "user", content = prompt }
        },
        temperature = 0.3,
        max_tokens = 450
    };

    var openAiReq = new HttpRequestMessage(HttpMethod.Post, "https://api.openai.com/v1/chat/completions")
    {
        Content = new StringContent(System.Text.Json.JsonSerializer.Serialize(body), System.Text.Encoding.UTF8, "application/json")
    };
    var resp = await httpClient.SendAsync(openAiReq);
    var text = await resp.Content.ReadAsStringAsync();
    if (!resp.IsSuccessStatusCode)
        return Results.Problem($"OpenAI error {resp.StatusCode}: {text}", statusCode: (int)resp.StatusCode);

    using var doc = System.Text.Json.JsonDocument.Parse(text);
    var content = doc.RootElement
        .GetProperty("choices")[0]
        .GetProperty("message")
        .GetProperty("content")
        .GetString();

    return Results.Ok(new { content });
})
.WithName("EvaluatePrice")
.Produces(200)
.Produces(400)
.Produces(500);

app.Run();

Notes
- Store the OpenAI key on the server only (e.g., dotnet user-secrets or environment variable OPENAI_API_KEY).
- Ensure CORS allows your frontend origin.
- Optionally add authentication, rate limiting, logging, and input validation.
- If you already have MVC/controllers, create an [ApiController] with a POST action using the same logic.

Environment configuration on server
- Windows (PowerShell): $Env:OPENAI_API_KEY = "sk-..."
- Linux/macOS (bash): export OPENAI_API_KEY="sk-..."
- ASP.NET Core User Secrets (Dev): dotnet user-secrets set OPENAI_API_KEY "sk-..."


---

Integrate into your existing ASP.NET Core Program.cs (with JWT, EF, CORS, rate limiting)

Your Program.cs already configures:
- JWT auth via Microsoft.AspNetCore.Authentication.JwtBearer
- EF Core with Npgsql
- CORS for https://www.gearninja.dk and http://localhost:5173
- AspNetCoreRateLimit (global IP rate limiting)

Follow these steps to add the AI evaluation endpoint in this setup.

1) Register HttpClient
Add this near your other service registrations (top of Program.cs):

builder.Services.AddHttpClient();

2) Map the AI endpoint
Place the following after app.UseAuthentication(); app.UseAuthorization(); and before app.MapControllers();

app.MapPost("/api/AI/evaluate-price", async (
    HttpContext http,
    IHttpClientFactory httpClientFactory
) =>
{
    var request = await http.Request.ReadFromJsonAsync(new
    {
        brand = string.Empty,
        model = string.Empty,
        price = 0m,
        condition = string.Empty,
        year = 0,
        location = string.Empty,
        description = string.Empty
    });

    if (request is null)
        return Results.BadRequest("Invalid payload");

    string brand = request.brand ?? string.Empty;
    string model = request.model ?? string.Empty;
    string condition = request.condition ?? "Ukendt";
    string location = request.location ?? "Ukendt";
    string description = request.description ?? "Ingen beskrivelse";
    var year = request.year;
    var price = request.price;

    var prompt = $@"Du er en erfaren priskontrol-assistent for brugt musikudstyr i Danmark. Vurder om prisen virker fair og giv kort rådgivning.

Produkt: {brand} {model}
Pris: {price} DKK
Stand/tilstand: {condition}
Årgang: {(year == 0 ? "Ukendt" : year)}
Lokation: {location}
Beskrivelse: {description}

Opgave:
1) Giv en kort vurdering om prisen virker lav, fair eller høj (1 linje med et tydeligt “Vurdering”).
2) Angiv 3-6 punkter med relevante detaljer (fx kendte prisniveauer, efterspørgsel, kendte fejl/fordele, tilbehør, årgang/stand).
3) Afslut med et forslag til forhandlingsstrategi (1-2 linjer).
Svar på dansk.";

    var apiKey = Environment.GetEnvironmentVariable("OPENAI_API_KEY");
    if (string.IsNullOrWhiteSpace(apiKey))
        return Results.Problem("Server config error: missing OPENAI_API_KEY", statusCode: 500);

    var client = httpClientFactory.CreateClient();
    client.DefaultRequestHeaders.Authorization = new System.Net.Http.Headers.AuthenticationHeaderValue("Bearer", apiKey);

    var body = new
    {
        model = "gpt-4o-mini",
        messages = new object[]
        {
            new { role = "system", content = "Du hjælper brugere med at vurdere prisen på brugt musikudstyr i Danmark. Svar altid på dansk, kortfattet og konkret." },
            new { role = "user", content = prompt }
        },
        temperature = 0.3,
        max_tokens = 450
    };

    var req = new HttpRequestMessage(HttpMethod.Post, "https://api.openai.com/v1/chat/completions")
    {
        Content = new StringContent(System.Text.Json.JsonSerializer.Serialize(body), System.Text.Encoding.UTF8, "application/json")
    };

    var resp = await client.SendAsync(req);
    var raw = await resp.Content.ReadAsStringAsync();
    if (!resp.IsSuccessStatusCode)
        return Results.Problem($"OpenAI error {resp.StatusCode}: {raw}", statusCode: (int)resp.StatusCode);

    using var doc = System.Text.Json.JsonDocument.Parse(raw);
    var content = doc.RootElement
        .GetProperty("choices")[0]
        .GetProperty("message")
        .GetProperty("content")
        .GetString();

    return Results.Ok(new { content });
})
// Choose ONE of the following two lines depending on your auth needs:
// .AllowAnonymous(); // If anyone can ask AI
.RequireAuthorization(); // If only authenticated users can ask AI

Notes about placement and middleware
- Keep app.UseCors(); before endpoint execution (already in your pipeline).
- You already call app.UseIpRateLimiting(); — this applies globally and will cover the new endpoint too.
- If you use cookies for auth (credentials from frontend), Ensure CORS policy has .AllowCredentials() and that the frontend calls fetch(..., { credentials: 'include' }). The client already does this.

3) Ensure CORS includes your origins
Your Program.cs already sets CORS to allow https://www.gearninja.dk and http://localhost:5173 with AllowCredentials — that’s correct for the frontend.

4) Configure the OpenAI key on the server
- Windows (PowerShell): $Env:OPENAI_API_KEY = "sk-..."
- Linux/macOS (bash): export OPENAI_API_KEY="sk-..."
- ASP.NET Core User Secrets (Dev): dotnet user-secrets set OPENAI_API_KEY "sk-..."

Optional: Controller-based alternative (if you prefer MVC controllers)
- Add a controller file AIController.cs in your DRYV1 project:

using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Net.Http.Headers;

[ApiController]
[Route("api/[controller]")]
public class AIController : ControllerBase
{
    private readonly IHttpClientFactory _httpClientFactory;

    public AIController(IHttpClientFactory httpClientFactory)
    {
        _httpClientFactory = httpClientFactory;
    }

    public record EvaluatePriceRequest(string brand, string model, decimal price, string condition, int year, string location, string description);

    [HttpPost("evaluate-price")]
    // Use one of: [AllowAnonymous] or [Authorize]
    [Authorize]
    public async Task<IActionResult> EvaluatePrice([FromBody] EvaluatePriceRequest req)
    {
        var apiKey = Environment.GetEnvironmentVariable("OPENAI_API_KEY");
        if (string.IsNullOrWhiteSpace(apiKey))
            return Problem("Server config error: missing OPENAI_API_KEY", statusCode: 500);

        var prompt = $@"Du er en erfaren priskontrol-assistent for brugt musikudstyr i Danmark. Vurder om prisen virker fair og giv kort rådgivning.

Produkt: {req.brand} {req.model}
Pris: {req.price} DKK
Stand/tilstand: {req.condition}
Årgang: {(req.year == 0 ? "Ukendt" : req.year)}
Lokation: {req.location}
Beskrivelse: {req.description}

Opgave:
1) Giv en kort vurdering om prisen virker lav, fair eller høj (1 linje med et tydeligt “Vurdering”).
2) Angiv 3-6 punkter med relevante detaljer (fx kendte prisniveauer, efterspørgsel, kendte fejl/fordele, tilbehør, årgang/stand).
3) Afslut med et forslag til forhandlingsstrategi (1-2 linjer).
Svar på dansk.";

        var client = _httpClientFactory.CreateClient();
        client.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", apiKey);

        var body = new
        {
            model = "gpt-4o-mini",
            messages = new object[]
            {
                new { role = "system", content = "Du hjælper brugere med at vurdere prisen på brugt musikudstyr i Danmark. Svar altid på dansk, kortfattet og konkret." },
                new { role = "user", content = prompt }
            },
            temperature = 0.3,
            max_tokens = 450
        };

        var reqMsg = new HttpRequestMessage(HttpMethod.Post, "https://api.openai.com/v1/chat/completions")
        {
            Content = new StringContent(System.Text.Json.JsonSerializer.Serialize(body), System.Text.Encoding.UTF8, "application/json")
        };

        var resp = await client.SendAsync(reqMsg);
        var raw = await resp.Content.ReadAsStringAsync();
        if (!resp.IsSuccessStatusCode)
            return Problem($"OpenAI error {resp.StatusCode}: {raw}", statusCode: (int)resp.StatusCode);

        using var doc = System.Text.Json.JsonDocument.Parse(raw);
        var content = doc.RootElement
            .GetProperty("choices")[0]
            .GetProperty("message")
            .GetProperty("content")
            .GetString();

        return Ok(new { content });
    }
}

- Register HttpClient: builder.Services.AddHttpClient(); in Program.cs
- Keep your existing middleware order (UseCors -> UseAuthentication -> UseAuthorization -> UseIpRateLimiting -> MapControllers)

Testing end-to-end
- Start backend (ensure OPENAI_API_KEY is set)
- Start frontend (Vite dev on :5173). Click “Spørg AI om prisen” on a Gear Card page.
- You should see the AI’s evaluation in the modal. If you protected the endpoint with [Authorize]/RequireAuthorization, ensure the user is logged in so cookies are sent (the frontend uses credentials: 'include').