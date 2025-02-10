export function plateIdToName(plateId: string) {
  if (!plateId) {
    return '';
  }

  const ignoreList = ['ivl', 'v1'];
  const replaceList = [
    { from: 'template', to: 'PCR' },
    { from: 'onCooler', to: 'PCR' },
  ];

  return plateId
    .split('_')
    .filter((part) => !ignoreList.includes(part))
    .map((part) => replaceList.find((r) => r.from === part)?.to || part)
    .join('_');
}
