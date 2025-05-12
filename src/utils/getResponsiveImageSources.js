export function getResponsiveImageSources(filepath, baseUrl = "https://quiote-api.dztestserver.de/") {
    if (!filepath) return {};

    // Support .jpg and .jpeg
    const match = filepath.match(/\.(jpe?g)$/i);
    const ext = match ? match[0] : ".jpg";
    const baseName = filepath.replace(/\.(jpe?g)$/i, "");

    const small = `${baseName}-480w${ext}`;
    const medium = `${baseName}-800w${ext}`;
    const large = `${baseName}-1200w${ext}`;

    return {
        src: `${baseUrl}${small}`,
        srcSet: `${baseUrl}${small} 480w, ${baseUrl}${medium} 800w, ${baseUrl}${large} 1200w`,
        sizes: "(max-width: 600px) 480px, (max-width: 900px) 800px, 1200px"
    };
}