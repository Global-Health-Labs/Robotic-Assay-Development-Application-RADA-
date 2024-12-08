/** 
 * Calculate the value for asp_mixing column 
 * @param tipWashing - Retrieved from user input (Yes or No)
 * @returns The asp_mixing value: 3 if tipWashing starts with "Yes", 0 otherwise
 */
export const getAspMixing = (tipWashing: string): number => {
  return tipWashing.trim().startsWith('Yes') ? 3 : 0;
};
