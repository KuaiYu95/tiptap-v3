import React from 'react';
import AceEditor from 'react-ace';

export const useAceComposition = (aceEditorRef: React.RefObject<AceEditor | null>) => {
  const [isComposing, setIsComposing] = React.useState(false);

  React.useEffect(() => {
    if (!aceEditorRef.current) return;

    const aceEditor = aceEditorRef.current.editor;
    const textarea = aceEditor.textInput?.getElement();
    if (!textarea) return;

    const handleCompositionStart = () => {
      setTimeout(() => setIsComposing(true), 0);
    };

    const handleCompositionEnd = () => {
      setTimeout(() => setIsComposing(false), 0);
    };

    textarea.addEventListener('compositionstart', handleCompositionStart);
    textarea.addEventListener('compositionend', handleCompositionEnd);

    return () => {
      textarea.removeEventListener('compositionstart', handleCompositionStart);
      textarea.removeEventListener('compositionend', handleCompositionEnd);
    };
  }, [aceEditorRef]);

  return {
    isComposing,
  };
};
