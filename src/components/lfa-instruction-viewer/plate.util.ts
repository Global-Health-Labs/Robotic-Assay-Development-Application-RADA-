export function plateIdToName(plateId: string) {
  if (!plateId) {
    return '';
  }

  const ignoreList = ['ivl', 'v1'];
  return plateId
    .split('_')
    .filter((part) => !ignoreList.includes(part))
    .join('_');
}
