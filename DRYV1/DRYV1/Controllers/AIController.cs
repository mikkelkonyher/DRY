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
    // authorized eller [AllowAnonymous] hvis endpoint skal være offentligt
    public async Task<IActionResult> EvaluatePrice([FromBody] MusicGearUpdateDTO gear)
    {
        var apiKey = Environment.GetEnvironmentVariable("OPENAI_API_KEY");
        if (string.IsNullOrWhiteSpace(apiKey))
            return Problem("Server config error: missing OPENAI_API_KEY", statusCode: 500);

        var brand = gear.Brand ?? "Ukendt";
        var model = gear.Model ?? "Ukendt";
        var price = gear.Price ?? 0;
        var condition = gear.Condition ?? "Ukendt";
        var year = gear.Year == 0 ? "Ukendt" : gear.Year.ToString();
        var location = gear.Location ?? "Ukendt";
        var description = gear.Description ?? "Ingen beskrivelse";

        var prompt = $@"
Du er en kritisk priskontrol-assistent for brugt musikudstyr i Danmark.  

Produkt: {brand} {model}
Pris: {price} DKK
Stand: {condition} (angivet som tekst, ingen billeder tilgængelige)
Årgang: {year}
Lokation: {location}
Beskrivelse: {description}

Opgave:
1) Start med en tydelig linje: 'Vurdering: lav / fair / høj pris', baseret på prisniveau, stand (som beskrevet), årgang og markedsdata.  
   - Ignorer billeder eller visuelle detaljer – brug kun de oplysninger, der er givet som tekst.  
   - Hvis der ikke findes aktuelle markedsdata, skriv: 'Prisen kan ikke vurderes præcist uden aktuelle markedstal'.  

2) Giv 3-4 observationer baseret KUN på de data, der er givet: brand, model, pris, stand, årgang, lokation og beskrivelse.
- Brug aldrig billeder eller visuelle elementer som reference.
- Hvis noget information mangler, påpeg blot at det mangler uden at tilføje spekulationer.
- Vær kortfattet og konkret.  

3) Afslut med en anbefaling KUN baseret på de observationer, du netop har listet.  
- Brug ikke generiske vendinger som ""afhænger af usikkerheder"" eller ""vent, hvis nødvendigt"".  
- Hvis observationerne viser lav pris og få risici, skriv fx ""Køb nu"".  
- Hvis observationerne viser høj pris eller risici, skriv fx ""Vent eller undgå"".  
- Hold anbefalingen på 1-2 korte sætninger.  

Vær realistisk, kritisk og kortfattet. Tag kun stilling til det, du har oplysninger om, og lad ikke manglende billeder påvirke vurderingen.";

        var client = _httpClientFactory.CreateClient();
        client.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", apiKey);

        // Body til Responses API
        var body = new
        {
            model = "gpt-4o-mini",
            input = new object[]
            {
                new { role = "system", content = "Du hjælper brugere med at vurdere prisen på brugt musikudstyr i Danmark. Svar altid på dansk, kortfattet og konkret." },
                new { role = "user", content = prompt }
            },
            temperature = 0.3,
            max_output_tokens = 450
        };

        // Endpoint: responses
        var reqMsg = new HttpRequestMessage(HttpMethod.Post, "https://api.openai.com/v1/responses")
        {
            Content = new StringContent(System.Text.Json.JsonSerializer.Serialize(body), System.Text.Encoding.UTF8, "application/json")
        };

        var resp = await client.SendAsync(reqMsg);
        var raw = await resp.Content.ReadAsStringAsync();
        if (!resp.IsSuccessStatusCode)
            return Problem($"OpenAI error {resp.StatusCode}: {raw}", statusCode: (int)resp.StatusCode);

        // Robust parsing
        using var doc = System.Text.Json.JsonDocument.Parse(raw);
        string content;

        if (doc.RootElement.TryGetProperty("output_text", out var simpleText))
        {
            content = simpleText.GetString();
        }
        else
        {
            var output = doc.RootElement.GetProperty("output")[0];
            var firstContent = output.GetProperty("content")[0];
            content = firstContent.GetProperty("text").GetString();
        }

        //Fjern Markdown fed
        if (!string.IsNullOrEmpty(content))
        {
            content = content.Replace("**", "");
        }

        return Ok(new { content });
    }
}