// MyEnum => My Enum
// my_enum => My Enum
// TTSMode => TTS Mode
export const labelize = (input: string): string => {
  // Replace underscores with spaces and capitalize the first letter of each word
  if (input.includes('_')) {
    return input
      .split('_')
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  }

  // Insert a space before all caps and capitalize the first letter
  return input.replaceAll(/([A-Z])/g, ' $1').replace(/^./, (str) => str.toUpperCase());
};
