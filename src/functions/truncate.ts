export const truncateDescription = (description: string, maxLength: number) => {
  //first removes any HTML tags from the description, then truncates it to the specified length. It also
  const strippedDescription = description.replace(/<[^>]+>/g, "");

  // Truncate the description to maxLength characters
  const truncatedDescription = strippedDescription.substring(0, maxLength);

  //ensures that the truncation does not split words by finding the last space before the limit and
  const lastSpaceIndex = truncatedDescription.lastIndexOf(" ");
  // Return the truncated description
  return lastSpaceIndex === -1
    ? truncatedDescription
    : truncatedDescription.substring(0, lastSpaceIndex);
};
