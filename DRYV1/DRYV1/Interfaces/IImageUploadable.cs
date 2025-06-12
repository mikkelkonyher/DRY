namespace DRYV1.Interfaces;

// Interface til modeller, der kan have uploadede billeder tilknyttet
public interface IImageUploadable
{
    // Liste over stier til uploadede billeder
    List<string> ImagePaths { get; set; }
}