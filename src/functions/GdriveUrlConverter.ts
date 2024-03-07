export function GdriveUrlConverter(originalURL: string) {
  // Extracting the file ID from the original URL
  const match = originalURL.match(/\/file\/d\/(.+?)\//);
  if (!match) {
    throw new Error("Invalid URL: File ID could not be extracted.");
  }
  const fileId = match[1];

  // Constructing the thumbnail URL
  const thumbnailURL = `https://drive.google.com/thumbnail?id=${fileId}`;

  return thumbnailURL;
}
