using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Net.Http.Headers;
using DRYV1.Data;
using DRYV1.Models; // hvor MusicGearUpdateDTO ligger

[ApiController]
[Route("api/[controller]")]
public class AIController : ControllerBase
{
    private readonly IHttpClientFactory _httpClientFactory;

    public AIController(IHttpClientFactory httpClientFactory)
    {
        _httpClientFactory = httpClientFactory;
    }

    [HttpPost("evaluate-price")]
     // eller [AllowAnonymous] hvis endpoint skal være offentligt
    public async Task<IActionResult> EvaluatePrice([FromBody] MusicGearUpdateDTO gear)
    {
        var apiKey = Environment.GetEnvironmentVariable("OPENAI_API_KEY");
        if (string.IsNullOrWhiteSpace(apiKey))
            return Problem("Server config error: missing OPENAI_API_KEY", statusCode: 500);

        // Kun de felter vi behøver
        var brand = gear.Brand ?? "Ukendt";
        var model = gear.Model ?? "Ukendt";
        var price = gear.Price ?? 0;
        var condition = gear.Condition ?? "Ukendt";
        var year = gear.Year == 0 ? "Ukendt" : gear.Year.ToString();
        var location = gear.Location ?? "Ukendt";
        var description = gear.Description ?? "Ingen beskrivelse";

        var prompt = $@"Du er en erfaren priskontrol-assistent for brugt musikudstyr i Danmark. Vurder om prisen virker fair og giv kort rådgivning.

Produkt: {brand} {model}
Pris: {price} DKK
Stand/tilstand: {condition}
Årgang: {year}
Lokation: {location}
Beskrivelse: {description}

Opgave:
1) Giv en kort vurdering om prisen virker lav, fair eller høj (1 linje med et tydeligt “Vurdering”).
2) Angiv 3-4 punkter med relevante detaljer (fx kendte prisniveauer, efterspørgsel, kendte fejl/fordele, tilbehør, årgang/stand).
3) Afslut med en samlet anbefaling: køb nu, vent på bedre pris, eller undgå helt. (1-2 linjer).
Svar på dansk.";

        var client = _httpClientFactory.CreateClient();
        client.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", apiKey);

        var body = new
        {
            model = "gpt-3.5-turbo",
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