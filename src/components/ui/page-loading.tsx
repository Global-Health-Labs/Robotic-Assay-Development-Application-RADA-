import { DNA } from 'react-loader-spinner';

export function PageLoading() {
  return (
    <div className="flex h-full flex-1 w-full items-center justify-center">
      <DNA
        visible={true}
        height="80"
        width="80"
        ariaLabel="dna-loading"
        wrapperClass="dna-wrapper"
      />
    </div>
  );
}
