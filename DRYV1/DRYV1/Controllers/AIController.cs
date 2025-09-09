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

Vigtigt:
- Vintage-instrumenter (over 30 år) vurderes højere end almindelige brugte instrumenter.
- Kendte og eftertragtede brands fra 50’erne–70’erne kan have høj værdi, uanset om det er guitar, bas eller trommer.
- Sjældne specifikationer, originale pickups, originale cases og ekstra tilbehør øger samlerværdien.
- Brug kun data fra brand, model, pris, stand, årgang, lokation og beskrivelse.
- Tag ikke højde for billeder eller visuelle spor.

Reference-priser for vintage i Danmark (ca. DKK):
- Fender (1950–1970): 30.000 – 80.000
- Gibson (1950–1970): 50.000 – 120.000
- Martin (1950–1970): 30.000 – 70.000
- Rickenbacker (1960–1975): 25.000 – 60.000
- Gretsch (1950–1970): 40.000 – 90.000
- PRS (1990–2000): 25.000 – 50.000
- Vox / andre britiske vintage (1960–1970): 20.000 – 50.000
- Ludwig / Slingerland / Rogers trommer (1950–1970): 15.000 – 50.000
- Neumann mikrofoner (1950–1980): 15.000 – 120.000+
- Neve konsoller / moduler (1960–1980): 200.000 – 1.500.000+
- API konsoller / moduler (1967–1980): 50.000 – 500.000+
- SSL konsoller (1970–1990): 150.000 – 1.000.000+
- Telefunken mikrofoner (1950–1970): 20.000 – 80.000+

Opgave:

1) 1) Hvis produktet tilhører en **vintage-kategori** (guitar, bas, tromme, vintage amp/konsol, mikrofon, studiegear) og AI har information om produktet i sin træningsdata:
   - Hvis prisen ligger under referenceintervallet, start med 'Vurdering: lav pris', giv 3-4 konkrete observationer og afslut med anbefaling: 'Køb nu' eller 'Vent eller undgå'.
   - Hvis prisen ligger inden for referenceintervallet, start med 'Vurdering: lav / fair / høj pris', giv 3-4 observationer og afslut med anbefaling.
   - Hvis prisen ligger over referenceintervallet, skriv: 'Prisen ligger væsentligt over normalintervallet for dette brand og årgang. Vurdering kræver ekspertise i samlerværdi, sjældenhed og originale dele.' Giv 2-3 observationer om sjældne karakteristika, men **brug ikke lav/fair/høj vurdering**.
2) Hvis produktet **ikke tilhører en vintage-kategori**, og AI har information om produktet i sin træningsdata:
   - Start med 'Vurdering: lav / fair / høj pris', baseret på pris, stand, tilbehør og lokation. Giv 3-4 observationer og afslut med anbefaling.
3) Hvis produktet **ikke findes i AI’s træningsdata**, skriv: 'Jeg har ikke info om produktet i min træningsdata' og giv ingen yderligere vurdering eller anbefaling.
4) Hold alle svar realistiske, kritiske og kortfattede. Tag kun stilling til oplysninger, der er tilgængelige. Manglende billeder påvirker ikke vurderingen.";

        var client = _httpClientFactory.CreateClient();
        client.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", apiKey);

        // Body til Responses API
        var body = new
        {
            model = "gpt-4o",
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