using Microsoft.AspNetCore.Mvc;
using System.Net.Http.Headers;
using DRYV1.Models;

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

        var client = _httpClientFactory.CreateClient();
        client.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", apiKey);

        // ---------- TRIN 1: gpt-5-nano laver websearch ----------
        var nanoPrompt = $@"
Lav en websearch og find aktuelle brugtpriser for {brand} {model} {year} i Danmark og internationalt.
Indsaml alle relevante kilder, hvor priser findes. Medtag kun brugtpriser, ikke nye.

Returnér kun JSON uden forklaringer i dette format:

{{
  ""dk_prisinterval"": ""<laveste>–<højeste> DKK eller ca. <pris> DKK hvis kun én pris findes"",
  ""intl_prisinterval"": ""<laveste>–<højeste> USD eller ca. <pris> USD hvis kun én pris findes"",
  ""kilder"": [""<faktiske websites eller markedspladser hvor priser findes>""] 
}}

Vigtige instruktioner: 
- Medtag kun kilder, hvor du faktisk finder priser.
- Brug de reelle website-navne, f.eks. 'DBA.dk', 'eBay.com', 'Reverb.com' osv., i stedet for interne pladsholdere.
- Hvis du ikke finder danske priser, skal dk_prisinterval være tomt: """"
- Hvis du ikke finder internationale priser, skal intl_prisinterval være tomt: """"
- Returnér priser som et interval (laveste–højeste) baseret på de fundne brugtpriser, men **KUN** hvis du finder mere end én pris. Ellers angiv 'ca. <pris>'.
- Medtag ikke interne søgenavne eller kodeord som kilder.
";

        var nanoBody = new
        {
            model = "gpt-5-nano",
            input = new object[]
            {
                new { role = "system", content = "Du er en assistent, der kun henter fakta og priser." },
                new { role = "user", content = nanoPrompt }
            },
            tools = new object[]
            {
                new { type = "web_search" }
            },
            reasoning = new { effort = "low" }
        };

        var nanoReq = new HttpRequestMessage(HttpMethod.Post, "https://api.openai.com/v1/responses")
        {
            Content = new StringContent(System.Text.Json.JsonSerializer.Serialize(nanoBody), System.Text.Encoding.UTF8, "application/json")
        };

        var nanoResp = await client.SendAsync(nanoReq);
        var nanoRaw = await nanoResp.Content.ReadAsStringAsync();

        if (!nanoResp.IsSuccessStatusCode)
            return Problem($"OpenAI error {nanoResp.StatusCode}: {nanoRaw}", statusCode: (int)nanoResp.StatusCode);

        // hent JSON indhold fra nano-5
        string nanoJson = nanoRaw;
        using (var doc = System.Text.Json.JsonDocument.Parse(nanoRaw))
        {
            if (doc.RootElement.TryGetProperty("output", out var outputElement))
            {
                foreach (var item in outputElement.EnumerateArray())
                {
                    if (item.TryGetProperty("type", out var typeProp) && typeProp.GetString() == "message")
                    {
                        foreach (var c in item.GetProperty("content").EnumerateArray())
                        {
                            if (c.TryGetProperty("text", out var textEl))
                                nanoJson = textEl.GetString() ?? nanoJson;
                        }
                    }
                }
            }
        }

        // ---------- TRIN 2: gpt-4o-mini skriver vurdering ----------
        var writerPrompt = $@"
Du hjælper med at vurdere brugt musikudstyr. 
Lav altid en kort markedsanalyse på dansk baseret på følgende data:

{nanoJson}

Start med at fastlægge det realistiske markedsinterval **udelukkende baseret på faktiske brugtsalg for samme model og stand**.  

Prisvurdering: Lav pris, Fair pris eller Høj pris skal bestemmes ud fra hvor prisen ligger i forhold til dette brugtprisinterval:
- Lav pris: prisen ligger under intervallets nederste grænse  
- Fair pris: prisen ligger inden for intervallet  
- Høj pris: prisen ligger over intervallets øverste grænse   

Angiv evt. også, om prisen ligger i nederste, midterste eller øverste del af intervallet.

Derefter skriver du tre afsnit med tydelige overskrifter og to linjeskift mellem afsnittene. Drop alle '###'.  
Formatér afsnittene sådan her:

Prisvurdering: <Lav/Fair/Høj pris> (uddyb evt. med 'øverste/midterste/nederste del af intervallet')

Vurdering: 2–3 sætninger med realistisk prisinterval i DKK og stand. Sammenlign kun med faktiske brugtsalg.  

Begrundelse: 2–3 sætninger om hvorfor prisintervallet er realistisk, med henvisning til udstyrsegenskaber, stand, originalitet og eventuelle særlige detaljer.  

Kilder: kun navn på de brugte kilder, ikke URL.  

Hold sproget naturligt, flydende og objektivt.  

Produktdata:
- Brand: {brand}
- Model: {model}
- Pris: {price} DKK
- Lokation: {location}
- Stand/beskrivelse: {description}
";

        var writerBody = new
        {
            model = "gpt-4o-mini",
            input = new object[]
            {
                new { role = "system", content = "Du er en vurderingsekspert i brugt musikudstyr." },
                new { role = "user", content = writerPrompt }
            }
        };

        var writerReq = new HttpRequestMessage(HttpMethod.Post, "https://api.openai.com/v1/responses")
        {
            Content = new StringContent(System.Text.Json.JsonSerializer.Serialize(writerBody), System.Text.Encoding.UTF8, "application/json")
        };

        var writerResp = await client.SendAsync(writerReq);
        var writerRaw = await writerResp.Content.ReadAsStringAsync();

        if (!writerResp.IsSuccessStatusCode)
            return Problem($"OpenAI error {writerResp.StatusCode}: {writerRaw}", statusCode: (int)writerResp.StatusCode);

        string content = "Ingen gyldig tekst returneret.";
        using (var doc = System.Text.Json.JsonDocument.Parse(writerRaw))
        {
            if (doc.RootElement.TryGetProperty("output", out var outputElement))
            {
                foreach (var item in outputElement.EnumerateArray())
                {
                    if (item.TryGetProperty("type", out var typeProp) && typeProp.GetString() == "message")
                    {
                        foreach (var c in item.GetProperty("content").EnumerateArray())
                        {
                            if (c.TryGetProperty("text", out var textEl))
                                content = textEl.GetString() ?? content;
                        }
                    }
                }
            }
        }
        
        return Ok(new { nanoRaw, writerRaw, content });
    }
}