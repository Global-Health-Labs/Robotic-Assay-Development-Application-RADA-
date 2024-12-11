import { ApplicationDocument } from "@/types/application";
import { useResizeObserver } from "@wojtekmaj/react-hooks";
import { DocumentCallback } from "node_modules/react-pdf/dist/esm/shared/types";
import * as React from "react";
import { Document, Page } from "react-pdf";
import "react-pdf/dist/esm/Page/AnnotationLayer.css";
import "react-pdf/dist/esm/Page/TextLayer.css";
import SimpleBar from "simplebar-react";
import "simplebar-react/dist/simplebar.min.css";

interface IPDFPreviewProps {
  file: File | ApplicationDocument;
  containerRef: HTMLElement | null;
}

const PDFPreview: React.FunctionComponent<IPDFPreviewProps> = ({
  file,
  containerRef,
}) => {
  const [numPages, setNumPages] = React.useState<number>();
  const [containerWidth, setContainerWidth] = React.useState<number>();
  const maxWidth = 800;

  const onResize = React.useCallback<ResizeObserverCallback>((entries) => {
    const [entry] = entries;

    if (entry) {
      setContainerWidth(entry.contentRect.width);
    }
  }, []);

  useResizeObserver(containerRef, {}, onResize);

  function onDocumentLoadSuccess(doc: DocumentCallback) {
    setNumPages(doc.numPages);
  }

  const fileUrl = file instanceof File ? file : file.documentPublicURL;

  return (
    <SimpleBar className="flex-1 relative">
      <Document file={fileUrl} onLoadSuccess={onDocumentLoadSuccess}>
        {Array.from(new Array(numPages), (_, index) => (
          <Page
            key={`page_${index + 1}`}
            pageNumber={index + 1}
            width={
              containerWidth ? Math.min(containerWidth, maxWidth) : maxWidth
            }
            renderTextLayer={false}
          />
        ))}
      </Document>
    </SimpleBar>
  );
};

export default PDFPreview;
